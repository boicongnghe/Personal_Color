def analyze_face_shape(image_bytes: bytes) -> dict:
    """
    TODO Phase 1:
    1. Decode image with cv2.imdecode
    2. MediaPipe FaceMesh 468 landmarks
    3. Compute width/height ratio, jaw width, cheekbone width
    4. Rule-based classify -> 6 face shapes
    """
    # Stub: return oval until pipeline is implemented
    return {'faceShape': 'oval'}
