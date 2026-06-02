import os
import cv2
import numpy as np
import requests
import re
import time
from collections import Counter
import easyocr
from dotenv import load_dotenv
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000/api/plate")
VISION_API_KEY = os.getenv("VISION_API_KEY", "")
CAMERA_SOURCE = os.getenv("CAMERA_SOURCE", "0")
FLIP_FRAME = os.getenv("FLIP_FRAME", "true").lower() == "true"
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.65"))
FRAME_CHECK_COUNT = int(os.getenv("FRAME_CHECK_COUNT", "3"))
COOLDOWN_SECONDS = int(os.getenv("COOLDOWN_SECONDS", "30"))
OCR_EVERY_N_FRAMES = int(os.getenv("OCR_EVERY_N_FRAMES", "2"))
MIN_PLATE_LEN = 6

print("⏳ Loading OCR model (EasyOCR)...")
reader = easyocr.Reader(['en'], gpu=False)
print("✅ OCR Ready!")

last_detection = {
    "vehicle_type": "Unknown",
    "vehicle_color": "Unknown",
    "plate_type": "Standard",
}
plate_buffer = []
last_sent_plates = {}
frame_index = 0

# Global frame buffer for streaming
streaming_frame = None
streaming_frame_lock = threading.Lock()

class VideoStreamHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global streaming_frame
        if self.path == '/video_feed':
            self.send_response(200)
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=frame')
            self.end_headers()
            try:
                while True:
                    with streaming_frame_lock:
                        if streaming_frame is None:
                            img_data = np.zeros((480, 640, 3), dtype=np.uint8)
                            cv2.putText(img_data, "No camera feed", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
                            ret, jpeg = cv2.imencode('.jpg', img_data)
                            frame_bytes = jpeg.tobytes()
                        else:
                            ret, jpeg = cv2.imencode('.jpg', streaming_frame)
                            if not ret:
                                time.sleep(0.04)
                                continue
                            frame_bytes = jpeg.tobytes()
                    
                    self.wfile.write(b'--frame\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame_bytes))
                    self.end_headers()
                    self.wfile.write(frame_bytes)
                    self.wfile.write(b'\r\n')
                    time.sleep(0.04)  # ~25 FPS
            except Exception as e:
                # Client disconnected
                pass
        else:
            self.send_response(404)
            self.end_headers()

def start_streaming_server():
    try:
        server = HTTPServer(('0.0.0.0', 5050), VideoStreamHandler)
        print("📺 MJPEG Video Stream Server running on http://localhost:5050/video_feed")
        server.serve_forever()
    except Exception as e:
        print(f"❌ Video stream server failed to start: {e}")

# Start streaming server in a separate background thread
stream_thread = threading.Thread(target=start_streaming_server, daemon=True)
stream_thread.start()


def open_camera():
    source = CAMERA_SOURCE.strip()
    if source.isdigit():
        return cv2.VideoCapture(int(source))
    return cv2.VideoCapture(source)


def clean_plate(text):
    return re.sub(r"[^A-Z0-9]", "", text.upper())


def validate_plate_strict(plate_str):
    patterns = [
        r"^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$",
        r"^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$",
        r"^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{4}$",
    ]
    return any(re.match(p, plate_str) for p in patterns)


def validate_plate_loose(plate_str):
    if len(plate_str) < MIN_PLATE_LEN or len(plate_str) > 12:
        return False
    if not re.match(r"^[A-Z]{2}", plate_str):
        return False
    letters = sum(c.isalpha() for c in plate_str)
    digits = sum(c.isdigit() for c in plate_str)
    return letters >= 2 and digits >= 2


def correct_plate_characters(plate_str):
    if not plate_str:
        return ""
    length = len(plate_str)
    if length == 10:
        types = ["L", "L", "D", "D", "L", "L", "D", "D", "D", "D"]
    elif length == 9:
        types = ["L", "L", "D", "D", "L", "D", "D", "D", "D"]
    elif length == 8:
        if plate_str[3].isdigit():
            types = ["L", "L", "D", "D", "D", "D", "D", "D"]
        else:
            types = ["L", "L", "D", "L", "D", "D", "D", "D"]
    else:
        types = []
        for i in range(length):
            if i < 2:
                types.append("L")
            elif i >= length - 4:
                types.append("D")
            elif i in (2, 3):
                types.append("D")
            else:
                types.append("L")
    corrected = []
    for i, char in enumerate(plate_str):
        expected = types[i] if i < len(types) else "D"
        c = char
        if expected == "L" and char == "0":
            c = "O" if i == 0 else "D"
        elif expected == "D" and char in ("D", "Q", "O"):
            c = "0"
        corrected.append(c)
    return "".join(corrected)


def dominant_color_name(bgr_image):
    if bgr_image is None or bgr_image.size == 0:
        return "Unknown"
    hsv = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2HSV)
    h = hsv[:, :, 0].flatten()
    s = hsv[:, :, 1].flatten()
    v = hsv[:, :, 2].flatten()
    mask = (s > 40) & (v > 50)
    if mask.sum() < 50:
        return "White" if v.mean() > 120 else "Gray"
    h_mean = h[mask].mean()
    if h_mean < 12 or h_mean > 165:
        return "Red"
    if 12 <= h_mean < 28:
        return "Yellow"
    if 28 <= h_mean < 42:
        return "Green"
    if 42 <= h_mean < 85:
        return "Blue"
    if 85 <= h_mean < 105:
        return "Purple"
    return "Black"


def detect_plate_type(plate_crop):
    if plate_crop is None or plate_crop.size == 0:
        return "Standard"
    hsv = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    yellow = ((h >= 15) & (h <= 35) & (s > 80)).mean()
    green = ((h >= 35) & (h <= 85) & (s > 60)).mean()
    blue = ((h >= 85) & (h <= 130) & (s > 60)).mean()
    if yellow > 0.12:
        return "Commercial"
    if green > 0.10:
        return "Electric"
    if blue > 0.10:
        return "Embassy"
    return "Standard"


def detect_vehicle_type(frame, x1, y1, x2, y2):
    h, w = frame.shape[:2]
    ph, pw = y2 - y1, x2 - x1
    vy1 = max(0, y1 - int(ph * 5))
    vy2 = y1
    vx1 = max(0, x1 - int(pw * 0.8))
    vx2 = min(w, x2 + int(pw * 0.8))
    roi = frame[vy1:vy2, vx1:vx2]
    if roi.size == 0:
        return "Unknown"
    vh, vw = roi.shape[:2]
    aspect = vw / float(vh) if vh > 0 else 1
    area_ratio = (vw * vh) / float(w * h)
    if ph < 40 and pw < 120 and aspect < 1.3:
        return "Motorcycle"
    if area_ratio > 0.40 and aspect > 1.5:
        return "Bus"
    if area_ratio > 0.28 and aspect > 1.7:
        return "Truck"
    if area_ratio > 0.18 and aspect > 1.35:
        return "Car"
    if aspect > 1.1:
        return "SUV"
    return "Auto"


def analyze_frame_context(frame, regions):
    global last_detection
    if not regions:
        return last_detection
    x1, y1, x2, y2 = regions[0]
    plate_crop = frame[y1:y2, x1:x2]
    vy1 = max(0, y1 - int((y2 - y1) * 5))
    vehicle_crop = frame[vy1:y1, x1:x2]
    last_detection = {
        "vehicle_type": detect_vehicle_type(frame, x1, y1, x2, y2),
        "vehicle_color": dominant_color_name(vehicle_crop),
        "plate_type": detect_plate_type(plate_crop),
    }
    return last_detection


def preprocess_plate_crop(crop):
    if crop is None or crop.size == 0:
        return None
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 11, 17, 17)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)


def find_plate_regions(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 11, 17, 17)
    edged = cv2.Canny(gray, 30, 200)
    contours, _ = cv2.findContours(edged, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:30]
    h, w = frame.shape[:2]
    regions = []
    for cnt in contours:
        x, y, bw, bh = cv2.boundingRect(cnt)
        area = bw * bh
        aspect = bw / float(bh) if bh > 0 else 0
        if area < 1500 or area > (w * h * 0.25):
            continue
        if aspect < 1.5 or aspect > 6.5:
            continue
        if bw < 80 or bh < 20:
            continue
        pad = 6
        regions.append((max(0, x - pad), max(0, y - pad), min(w, x + bw + pad), min(h, y + bh + pad)))
        if len(regions) >= 4:
            break
    if not regions:
        regions.append((int(w * 0.15), int(h * 0.55), int(w * 0.85), int(h * 0.92)))
    return regions


def run_ocr_on_image(image):
    readings = []
    try:
        results = reader.readtext(image)
        for (bbox, text, confidence) in results:
            cleaned = clean_plate(text)
            if len(cleaned) >= MIN_PLATE_LEN and confidence >= CONFIDENCE_THRESHOLD:
                readings.append((correct_plate_characters(cleaned), confidence))
    except Exception as e:
        print(f"[OCR Warning] {type(e).__name__}: {e}")
    return readings


def send_to_backend(plate, confidence, verification, detection):
    try:
        headers = {"Content-Type": "application/json"}
        if VISION_API_KEY:
            headers["x-api-key"] = VISION_API_KEY
        payload = {
            "plate": plate,
            "confidence": round(confidence, 2),
            "verification": verification,
            "vehicle_type": detection.get("vehicle_type", "Unknown"),
            "vehicle_color": detection.get("vehicle_color", "Unknown"),
            "plate_type": detection.get("plate_type", "Standard"),
        }
        response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=3)
        print(
            f"📤 {plate} | {payload['vehicle_type']} | {payload['vehicle_color']} | "
            f"{payload['plate_type']} | HTTP {response.status_code}"
        )
    except Exception as e:
        print(f"❌ Backend error: {e}")


def confirm_and_send(plate, confidence, verification, detection, current_time):
    global plate_buffer, last_sent_plates
    plate_buffer.append(plate)
    if len(plate_buffer) > 12:
        plate_buffer = plate_buffer[-12:]
    if len(plate_buffer) < FRAME_CHECK_COUNT:
        return
    most_common, count = Counter(plate_buffer).most_common(1)[0]
    if count < FRAME_CHECK_COUNT:
        return
    if current_time - last_sent_plates.get(most_common, 0) <= COOLDOWN_SECONDS:
        plate_buffer = []
        return
    print(f"\n✅ Confirmed: {most_common} | {detection}")
    send_to_backend(most_common, confidence, verification, detection)
    last_sent_plates[most_common] = current_time
    plate_buffer = []


def draw_overlay(display, detection, plate_text=None):
    y = 28
    cv2.putText(display, "SmartGate ANPR", (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    y += 28
    if plate_text:
        cv2.putText(display, f"plate: {plate_text}", (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)


cap = open_camera()
if not cap.isOpened():
    print("❌ Cannot open camera:", CAMERA_SOURCE)
    exit(1)

print("✅ SmartGate Vision Engine Started!")
print("📺 Camera feed is streaming to your web dashboard at http://localhost:3000/dashboard")
print("👉 Press Ctrl+C in this terminal to stop\n")

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_index += 1
        if FLIP_FRAME:
            frame = cv2.flip(frame, 1)

        current_time = time.time()
        display = frame.copy()
        seen_plate = None

        if frame_index % OCR_EVERY_N_FRAMES == 0:
            regions = find_plate_regions(frame)
            detection = analyze_frame_context(frame, regions)
            all_readings = []

            for (x1, y1, x2, y2) in regions:
                crop = frame[y1:y2, x1:x2]
                processed = preprocess_plate_crop(crop)
                target = processed if processed is not None else crop
                all_readings.extend(run_ocr_on_image(target))
                cv2.rectangle(display, (x1, y1), (x2, y2), (0, 200, 255), 2)

            if not all_readings:
                all_readings = run_ocr_on_image(frame)

            for corrected, confidence in all_readings:
                strict = validate_plate_strict(corrected)
                loose = validate_plate_loose(corrected)
                verification = "VERIFIED" if strict else ("UNVERIFIED" if loose else None)
                if not verification:
                    continue
                seen_plate = corrected
                print(f"[Seen] {corrected} ({confidence:.2f}) {detection}")
                confirm_and_send(corrected, confidence, verification, detection, current_time)

        draw_overlay(display, last_detection, seen_plate)

        # Update streaming frame for web dashboard
        with streaming_frame_lock:
            streaming_frame = display.copy()

        # Small delay to control frame rate
        time.sleep(0.03)

except KeyboardInterrupt:
    pass

cap.release()
print("\n👋 Vision Engine Stopped.")
