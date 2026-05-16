import math
import cv2
import numpy as np
import mediapipe as mp


def _dist(p1, p2):
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)


def analyze_face_shape(image_bytes: bytes) -> dict:
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Không thể đọc ảnh")

    h, w = img.shape[:2]
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    mp_fm = mp.solutions.face_mesh
    with mp_fm.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
    ) as fm:
        results = fm.process(rgb)

    if not results.multi_face_landmarks:
        raise ValueError("Không tìm thấy khuôn mặt trong ảnh")

    lm = results.multi_face_landmarks[0].landmark

    def pt(idx):
        return (lm[idx].x * w, lm[idx].y * h)

    face_width      = _dist(pt(234), pt(454))   # left cheekbone → right cheekbone
    face_height     = _dist(pt(10),  pt(152))   # forehead top → chin tip
    jaw_width       = _dist(pt(172), pt(397))   # left jaw → right jaw

    if face_height == 0 or face_width == 0:
        raise ValueError("Không thể tính tỷ lệ khuôn mặt")

    wh_ratio        = face_width  / face_height
    jaw_cheek_ratio = jaw_width   / face_width

    if wh_ratio < 0.62:
        shape = 'oblong'
    elif wh_ratio > 0.82 and jaw_cheek_ratio > 0.82:
        shape = 'round'
    elif 0.78 <= wh_ratio <= 0.92 and jaw_cheek_ratio > 0.88:
        shape = 'square'
    elif 0.68 <= wh_ratio <= 0.80 and jaw_cheek_ratio < 0.74:
        shape = 'heart'
    elif 0.68 <= wh_ratio <= 0.80 and 0.68 <= jaw_cheek_ratio <= 0.80:
        shape = 'diamond'
    elif 0.62 <= wh_ratio <= 0.75:
        shape = 'oval'
    else:
        shape = 'oval'

    return {
        'faceShape':       shape,
        'wh_ratio':        round(wh_ratio, 3),
        'jaw_cheek_ratio': round(jaw_cheek_ratio, 3),
    }
