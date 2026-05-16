def analyze_body(bust: float, waist: float, hips: float) -> dict:
    bust_hip_diff = abs(bust - hips)
    w_bust = waist / bust if bust > 0 else 0.0
    w_hip  = waist / hips if hips > 0 else 0.0

    if bust_hip_diff < 5 and w_bust < 0.75:
        body_type = 'hourglass'
    elif hips > bust + 3.5 and w_hip < 0.75:
        body_type = 'pear'
    elif bust > hips + 3.5:
        body_type = 'inverted-triangle'
    elif w_bust > 0.88 or w_hip > 0.88:
        body_type = 'apple'
    else:
        body_type = 'rectangle'

    return {
        'bodyType': body_type,
        'bust':     bust,
        'waist':    waist,
        'hips':     hips,
        'w_bust':   round(w_bust, 2),
        'w_hip':    round(w_hip,  2),
    }
