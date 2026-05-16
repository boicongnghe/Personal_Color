import json


def analyze_body_type(measurements_json: str | None) -> dict:
    """
    MVP: accept JSON measurements string {bust, waist, hip} (in cm).
    No image scanning in Phase 1.
    Rule-based classify -> 5 body types.
    """
    if not measurements_json:
        return {'bodyType': 'rectangle'}

    try:
        m = json.loads(measurements_json)
        bust = float(m.get('bust', 0))
        waist = float(m.get('waist', 0))
        hip = float(m.get('hip', 0))
    except (ValueError, TypeError):
        return {'bodyType': 'rectangle'}

    if bust == 0 or waist == 0 or hip == 0:
        return {'bodyType': 'rectangle'}

    diff_bh = abs(bust - hip)
    waist_ratio = waist / max(bust, hip)

    if diff_bh <= 5 and waist_ratio <= 0.75:
        body_type = 'hourglass'
    elif hip - bust >= 5:
        body_type = 'pear'
    elif bust - hip >= 5:
        body_type = 'inverted-triangle'
    elif waist_ratio >= 0.85 and bust < hip:
        body_type = 'apple'
    else:
        body_type = 'rectangle'

    return {'bodyType': body_type}
