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
ocr = PaddleOCR(use_angle_cls=True, lang='en')
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

def correct_plate_characters(plate_str):
    if not plate_str:
        return ""
    
    length = len(plate_str)
    types = []
    
    # Identify expected character types based on Indian format templates
    if length == 10:
        types = ['L', 'L', 'D', 'D', 'L', 'L', 'D', 'D', 'D', 'D']
    elif length == 9:
        types = ['L', 'L', 'D', 'D', 'L', 'D', 'D', 'D', 'D']
    elif length == 8:
        # Check if index 3 is digit or letter to choose template: LLDLDDDD (Delhi old) or LLDDDDDD
        if length > 3 and plate_str[3] in '0123456789' and plate_str[3] not in ('D', 'Q', 'O'):
            types = ['L', 'L', 'D', 'D', 'D', 'D', 'D', 'D']
        else:
            types = ['L', 'L', 'D', 'L', 'D', 'D', 'D', 'D']
    else:
        # Generic fallback for partial plates
        for i in range(length):
            if i < 2:
                types.append('L')
            elif i >= length - 4:
                types.append('D')
            elif i in (2, 3):
                types.append('D')
            else:
                types.append('L')
                
    corrected_chars = []
    corrections_logged = []
    
    for i, char in enumerate(plate_str):
        expected = types[i]
        corrected_char = char
        
        if expected == 'L':
            if char == '0':
                # Convert '0' (zero) to letter D, Q, or O
                if i == 0:
                    corrected_char = 'O' # State code starts with O (OD)
                elif i == 1:
                    corrected_char = 'D' # State code ends with D (OD, DD, LD)
                else:
                    corrected_char = 'D' # Default to D in series positions (very common)
                corrections_logged.append(f"pos {i}: '0'->'{corrected_char}'")
        elif expected == 'D':
            if char in ('D', 'Q', 'O'):
                # Convert letters D, Q, O to digit '0'
                corrected_char = '0'
                corrections_logged.append(f"pos {i}: '{char}'->'0'")
                
        corrected_chars.append(corrected_char)
        
    corrected_plate = "".join(corrected_chars)
    
    if corrections_logged:
        print(f"[ANPR Post-Process] {plate_str} -> {corrected_plate} | {', '.join(corrections_logged)}")
        
    return corrected_plate

def validate_plate(plate_str):
    # Regex for Indian plate format: State(2 letters) District(2 digits) Series(1-2 letters) Unique(4 digits)
    pattern = r'^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$'
    return bool(re.match(pattern, plate_str))

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

    # Flip the frame horizontally to un-reflect/mirror it
    frame = cv2.flip(frame, 1)

    # Run OCR
    results = ocr.ocr(frame, cls=True)

    current_time = time.time()

    if results and results[0]:
        for line in results[0]:
            text = line[1][0]
            confidence = line[1][1]
            cleaned = clean_plate(text)
            
            # Post-process and check confidence
            if len(cleaned) >= 4 and confidence >= CONFIDENCE_THRESHOLD:
                corrected = correct_plate_characters(cleaned)
                is_valid = validate_plate(corrected)
                
                validity_str = "VALID" if is_valid else "INVALID"
                print(f"[Seen] {cleaned} -> {corrected} ({confidence:.2f}) [{validity_str}]")
                
                if is_valid:
                    plate_buffer.append(corrected)
                else:
                    print(f"[Discarded] Invalid plate format: {corrected}")

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