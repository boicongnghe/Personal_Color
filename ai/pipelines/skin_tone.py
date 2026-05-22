import os
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

from classifiers.seasonal_classifier import classify_season

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'face_landmarker.task')

# MediaPipe FaceMesh landmark index groups (same indices as legacy API)
FACE_OVAL = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
]
LEFT_EYE      = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
RIGHT_EYE     = [362, 466, 388, 387, 386, 385, 384, 398, 263, 249, 390, 373, 374, 380, 381, 382]
LEFT_EYEBROW  = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
RIGHT_EYEBROW = [296, 334, 293, 300, 285, 295, 282, 283, 276, 336]
LIPS          = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]

_detector = None

def _get_detector():
    global _detector
    if _detector is None:
        base_options = mp_python.BaseOptions(model_asset_path=os.path.abspath(MODEL_PATH))
        options = mp_vision.FaceLandmarkerOptions(
            base_options=base_options,
            running_mode=mp_vision.RunningMode.IMAGE,
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        _detector = mp_vision.FaceLandmarker.create_from_options(options)
    return _detector


def analyze_skin(image_bytes: bytes) -> dict:
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Không thể đọc ảnh")

    h, w = img_bgr.shape[:2]
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
    result = _get_detector().detect(mp_image)

    if not result.face_landmarks:
        raise ValueError("Không tìm thấy khuôn mặt trong ảnh")

    lm = result.face_landmarks[0]

    def px(idx):
        return (int(lm[idx].x * w), int(lm[idx].y * h))

    # Face oval mask
    oval_pts = np.array([px(i) for i in FACE_OVAL], dtype=np.int32)
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask, [oval_pts], 255)

    # Exclude eyes, eyebrows, lips
    for group in [LEFT_EYE, RIGHT_EYE, LEFT_EYEBROW, RIGHT_EYEBROW, LIPS]:
        region_pts = np.array([px(i) for i in group], dtype=np.int32)
        cv2.fillConvexPoly(mask, region_pts, 0)

    # Face bounding box with 10% padding
    xs = [px(i)[0] for i in FACE_OVAL]
    ys = [px(i)[1] for i in FACE_OVAL]
    pad_x = int((max(xs) - min(xs)) * 0.10)
    pad_y = int((max(ys) - min(ys)) * 0.10)
    x1 = max(0, min(xs) - pad_x)
    x2 = min(w, max(xs) + pad_x)
    y1 = max(0, min(ys) - pad_y)
    y2 = min(h, max(ys) + pad_y)

    face_bgr  = img_bgr[y1:y2, x1:x2]
    face_mask = mask[y1:y2, x1:x2]

    # CLAHE on L channel for white balance
    lab = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])

    # Sample skin pixels within the mask
    skin_pixels = lab[face_mask > 0]
    if len(skin_pixels) == 0:
        raise ValueError("Không tìm thấy vùng da trong ảnh")

    mean_lab = np.mean(skin_pixels, axis=0)

    # OpenCV LAB: L 0-255, a/b 0-255 centered at 128 → convert to standard LAB
    L = float(mean_lab[0]) * 100.0 / 255.0
    a = float(mean_lab[1]) - 128.0
    b = float(mean_lab[2]) - 128.0

    classification = classify_season(L, a, b)

    return {
        'L':  round(L, 2),
        'a':  round(a, 2),
        'b':  round(b, 2),
        **classification,
    }
