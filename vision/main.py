import cv2
import requests
import re
import time
from paddleocr import PaddleOCR
from dotenv import load_dotenv
import os

load_dotenv()

# ── Config ──────────────────────────────────────────
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000/api/plate")
CONFIDENCE_THRESHOLD = 0.80
FRAME_CHECK_COUNT = 3
COOLDOWN_SECONDS = 4
# ────────────────────────────────────────────────────

# Initialize PaddleOCR
print("⏳ Loading OCR model...")
ocr = PaddleOCR(use_textline_orientation=True, lang='en')
print("✅ OCR Ready!")

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Cannot open camera!")
    exit()

print("✅ SmartGate Vision Engine Started!")
print("👉 Press Q to quit\n")

plate_buffer = []
last_sent_time = 0

def clean_plate(text):
    text = re.sub(r'[^A-Z0-9]', '', text.upper())
    return text

def send_to_backend(plate, confidence):
    try:
        payload = {"plate": plate, "confidence": round(confidence, 2)}
        response = requests.post(BACKEND_URL, json=payload, timeout=3)
        print(f"📤 Sent: {plate} | Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend error: {e}")

while True:
    ret, frame = cap.read()

    if not ret:
        print("❌ Failed to read frame")
        break

    # Run OCR
    results = ocr.ocr(frame, cls=True)

    current_time = time.time()

    if results and results[0]:
        for line in results[0]:
            text = line[1][0]
            confidence = line[1][1]
            cleaned = clean_plate(text)

            # Only process if confidence is high enough and plate looks valid
            if len(cleaned) >= 4 and confidence >= CONFIDENCE_THRESHOLD:
                print(f"🔍 Seen: {cleaned} ({confidence:.2f})")
                plate_buffer.append(cleaned)

                # Multi-frame check
                if len(plate_buffer) >= FRAME_CHECK_COUNT:
                    most_common = max(set(plate_buffer), key=plate_buffer.count)
                    count = plate_buffer.count(most_common)

                    if count >= FRAME_CHECK_COUNT:
                        # Cooldown check - avoid sending same plate repeatedly
                        if current_time - last_sent_time > COOLDOWN_SECONDS:
                            print(f"\n✅ Confirmed Plate: {most_common}")
                            send_to_backend(most_common, confidence)
                            last_sent_time = current_time

                        plate_buffer = []

    # Keep buffer small
    if len(plate_buffer) > 10:
        plate_buffer = []

    # Show feed
    cv2.putText(frame, "SmartGate ANPR", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.imshow("SmartGate Vision - Press Q to quit", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("\n👋 Vision Engine Stopped.")