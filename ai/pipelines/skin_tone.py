import numpy as np


def analyze_skin_tone(image_bytes: bytes) -> dict:
    """
    TODO Phase 1:
    1. Decode image bytes with cv2.imdecode
    2. MediaPipe FaceMesh to get face ROI
    3. CLAHE white balance on the ROI
    4. Convert BGR -> LAB, sample cheek/forehead patches
    5. Pass mean LAB to seasonal_classifier
    """
    from classifiers.seasonal_classifier import classify_season
    # Stub: return warm autumn until pipeline is implemented
    return {
        'season': 'autumn-warm',
        'undertone': 'warm',
        'accuracy': 0,
        'rawMetrics': {},
    }
