import os
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

from classifiers.seasonal_classifier import classify_season

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'face_landmarker.task')

# MediaPipe FaceMesh landmark index groups.
FACE_OVAL = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
]
LEFT_EYE = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
RIGHT_EYE = [362, 466, 388, 387, 386, 385, 384, 398, 263, 249, 390, 373, 374, 380, 381, 382]
LEFT_EYEBROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
RIGHT_EYEBROW = [296, 334, 293, 300, 285, 295, 282, 283, 276, 336]
LIPS = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]

_detector = None


def _get_detector():
    global _detector
    if _detector is None:
        base_options = mp_python.BaseOptions(model_asset_path=os.path.abspath(MODEL_PATH))
        options = mp_vision.FaceLandmarkerOptions(
            base_options=base_options,
            running_mode=mp_vision.RunningMode.IMAGE,
            num_faces=1,
            min_face_detection_confidence=0.55,
            min_face_presence_confidence=0.55,
            min_tracking_confidence=0.5,
        )
        _detector = mp_vision.FaceLandmarker.create_from_options(options)
    return _detector


def _gray_world_balance_bgr(img_bgr):
    img = img_bgr.astype(np.float32)
    means = img.reshape(-1, 3).mean(axis=0)
    gray = means.mean()
    scale = gray / np.maximum(means, 1.0)
    return np.clip(img * scale, 0, 255).astype(np.uint8)


def _robust_lab_average(lab_pixels):
    if len(lab_pixels) == 0:
        raise ValueError("No skin pixels")

    pixels = lab_pixels.astype(np.float32)

    # Remove exposure extremes. Highlights and deep shadows are the most common
    # cause of unstable warm/cool results in phone camera photos.
    L_vals = pixels[:, 0]
    lo, hi = np.percentile(L_vals, [12, 88])
    trimmed = pixels[(L_vals >= lo) & (L_vals <= hi)]
    if len(trimmed) >= 80:
        pixels = trimmed

    # Median absolute deviation filter for L/a/b outliers.
    med = np.median(pixels, axis=0)
    mad = np.median(np.abs(pixels - med), axis=0)
    mad = np.maximum(mad, 2.5)
    keep = np.all(np.abs(pixels - med) <= (2.8 * mad), axis=1)
    filtered = pixels[keep]
    if len(filtered) >= 80:
        pixels = filtered

    return np.median(pixels, axis=0), int(len(pixels))


def analyze_skin(image_bytes: bytes) -> dict:
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Khong the doc anh")

    img_bgr = _gray_world_balance_bgr(img_bgr)
    h, w = img_bgr.shape[:2]
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
    result = _get_detector().detect(mp_image)

    if not result.face_landmarks:
        raise ValueError("Khong tim thay khuon mat trong anh")

    lm = result.face_landmarks[0]

    def px(idx):
        return (int(lm[idx].x * w), int(lm[idx].y * h))

    oval_pts = np.array([px(i) for i in FACE_OVAL], dtype=np.int32)
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask, [oval_pts], 255)

    for group in [LEFT_EYE, RIGHT_EYE, LEFT_EYEBROW, RIGHT_EYEBROW, LIPS]:
        region_pts = np.array([px(i) for i in group], dtype=np.int32)
        cv2.fillConvexPoly(mask, region_pts, 0)

    xs = [px(i)[0] for i in FACE_OVAL]
    ys = [px(i)[1] for i in FACE_OVAL]
    pad_x = int((max(xs) - min(xs)) * 0.08)
    pad_y = int((max(ys) - min(ys)) * 0.08)
    x1 = max(0, min(xs) - pad_x)
    x2 = min(w, max(xs) + pad_x)
    y1 = max(0, min(ys) - pad_y)
    y2 = min(h, max(ys) + pad_y)

    face_bgr = img_bgr[y1:y2, x1:x2]
    face_mask = mask[y1:y2, x1:x2]

    kernel_size = max(3, int(min(face_mask.shape[:2]) * 0.025))
    if kernel_size % 2 == 0:
        kernel_size += 1
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    face_mask = cv2.erode(face_mask, kernel, iterations=1)

    lab = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2LAB)
    hsv = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2HSV)
    _, s_ch, v_ch = cv2.split(hsv)

    skin_like = (
        (face_mask > 0)
        & (s_ch >= 18)
        & (s_ch <= 165)
        & (v_ch >= 45)
        & (v_ch <= 245)
    )

    skin_pixels = lab[skin_like]
    if len(skin_pixels) < 80:
        skin_pixels = lab[face_mask > 0]
    if len(skin_pixels) == 0:
        raise ValueError("Khong tim thay vung da trong anh")

    mean_lab, sample_count = _robust_lab_average(skin_pixels)

    # OpenCV LAB: L 0-255, a/b 0-255 centered at 128 -> standard LAB.
    L = float(mean_lab[0]) * 100.0 / 255.0
    a = float(mean_lab[1]) - 128.0
    b = float(mean_lab[2]) - 128.0

    classification = classify_season(L, a, b)

    return {
        'L': round(L, 2),
        'a': round(a, 2),
        'b': round(b, 2),
        'sampleCount': sample_count,
        **classification,
    }
