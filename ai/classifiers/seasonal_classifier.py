def classify_season(lab_values: dict) -> dict:
    """
    Rule-based LAB -> 12 seasonal tones.
    lab_values: {L: float, a: float, b: float}
    Returns: {season: str, undertone: str, accuracy: int}

    TODO Phase 1: implement real LAB thresholds per season.
    Phase 2: replace with trained TF model.
    """
    L = lab_values.get('L', 50)
    a = lab_values.get('a', 0)
    b = lab_values.get('b', 0)

    # Simplified rule: warm undertone if b > 5 (yellow bias)
    is_warm = b > 5
    is_light = L > 65
    is_saturated = abs(a) > 10 or abs(b) > 15

    if is_warm and is_light and is_saturated:
        return {'season': 'spring-bright', 'undertone': 'warm', 'accuracy': 60}
    elif is_warm and is_light:
        return {'season': 'spring-light', 'undertone': 'warm', 'accuracy': 60}
    elif is_warm and is_saturated:
        return {'season': 'autumn-rich', 'undertone': 'warm', 'accuracy': 60}
    elif is_warm:
        return {'season': 'autumn-warm', 'undertone': 'warm', 'accuracy': 60}
    elif not is_warm and is_light and is_saturated:
        return {'season': 'winter-bright', 'undertone': 'cool', 'accuracy': 60}
    elif not is_warm and is_light:
        return {'season': 'summer-light', 'undertone': 'cool', 'accuracy': 60}
    elif not is_warm and is_saturated:
        return {'season': 'winter-cool', 'undertone': 'cool', 'accuracy': 60}
    else:
        return {'season': 'summer-muted', 'undertone': 'cool', 'accuracy': 60}
