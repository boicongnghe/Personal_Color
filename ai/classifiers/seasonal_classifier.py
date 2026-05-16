import math

# (L_center, a_center, b_center, undertone) for nearest-centroid fallback
CENTROIDS = {
    'autumn-warm':   (52,  12, 16, 'warm'),
    'autumn-deep':   (35,   8, 12, 'warm'),
    'autumn-rich':   (49,  10, 18, 'warm'),
    'autumn-muted':  (54,   5,  9, 'neutral'),
    'winter-cool':   (40,   1,  2, 'cool'),
    'winter-dark':   (33,   2,  4, 'cool'),
    'winter-bright': (60,   0,  1, 'cool'),
    'winter-clear':  (65,   2,  3, 'cool'),
    'spring-warm':   (71,  10, 20, 'warm'),
    'spring-light':  (74,   6, 14, 'warm'),
    'spring-bright': (77,   8, 18, 'warm'),
    'spring-clear':  (79,   6, 15, 'neutral'),
    'summer-cool':   (60,   2,  4, 'cool'),
    'summer-light':  (70,   3,  6, 'cool'),
    'summer-soft':   (55,   5,  8, 'cool'),
    'summer-muted':  (52,   3,  6, 'cool'),
}

# Explicit rules for all 16 seasonal types
# Each rule: (name, undertone, a_check, b_check, L_lo, L_hi)
# a_check / b_check: ('min', v) | ('max', v) | ('range', lo, hi)
RULES = [
    # Autumn
    ('autumn-warm',  'warm',    ('min', 8),        ('min', 10),        38, 65),
    ('autumn-deep',  'warm',    ('min', 5),        ('min', 8),         25, 45),
    ('autumn-rich',  'warm',    ('min', 6),        ('min', 12),        40, 58),
    ('autumn-muted', 'neutral', ('range', 3, 8),   ('range', 6, 12),   45, 62),
    # Winter
    ('winter-cool',  'cool',    ('max', 3),        ('max', 5),         25, 55),
    ('winter-dark',  'cool',    ('max', 4),        ('max', 8),         20, 45),
    ('winter-bright','cool',    ('max', 2),        ('max', 3),         50, 70),
    ('winter-clear', 'cool',    ('max', 5),        ('max', 6),         55, 75),
    # Spring
    ('spring-warm',  'warm',    ('min', 7),        ('min', 15),        62, 80),
    ('spring-light', 'warm',    ('range', 4, 9),   ('range', 10, 18),  65, 82),
    ('spring-bright','warm',    ('min', 5),        ('min', 14),        68, 85),
    ('spring-clear', 'neutral', ('min', 4),        ('min', 12),        70, 88),
    # Summer (cool, muted/soft — lower a and b than spring/autumn)
    ('summer-cool',  'cool',    ('range', 1, 4),   ('range', 2, 7),    52, 68),
    ('summer-light', 'cool',    ('range', 1, 5),   ('range', 3, 9),    62, 78),
    ('summer-soft',  'cool',    ('range', 2, 7),   ('range', 4, 10),   46, 62),
    ('summer-muted', 'cool',    ('range', 1, 5),   ('range', 3, 8),    44, 60),
]


def _passes(val, check):
    if check[0] == 'min':   return val >= check[1]
    if check[0] == 'max':   return val <= check[1]
    if check[0] == 'range': return check[1] <= val <= check[2]
    return True


def _score(val, check, lo, hi):
    center = (lo + hi) / 2
    half   = max((hi - lo) / 2, 1)
    l_score = max(0.0, 1 - abs(val - center) / half)

    if check[0] == 'min':
        ab_score = min(1.0, (val - check[1]) / max(check[1], 1))
    elif check[0] == 'max':
        ab_score = min(1.0, (check[1] - val) / max(check[1], 1))
    else:
        c2 = (check[1] + check[2]) / 2
        h2 = max((check[2] - check[1]) / 2, 1)
        ab_score = max(0.0, 1 - abs(val - c2) / h2)
    return l_score, ab_score


def classify_season(L: float, a: float, b: float) -> dict:
    candidates = []
    for name, undertone, a_check, b_check, L_lo, L_hi in RULES:
        if _passes(a, a_check) and _passes(b, b_check) and L_lo <= L <= L_hi:
            l_sc, _  = _score(L, ('range', L_lo, L_hi), L_lo, L_hi)
            _, a_sc  = _score(a, a_check, L_lo, L_hi)
            _, b_sc  = _score(b, b_check, L_lo, L_hi)
            composite = l_sc * 0.4 + a_sc * 0.3 + b_sc * 0.3
            candidates.append((name, undertone, composite))

    if candidates:
        best = max(candidates, key=lambda x: x[2])
        confidence = min(95, max(60, int(best[2] * 100)))
        return {'season': best[0], 'undertone': best[1], 'confidence': confidence}

    # Nearest centroid fallback — includes summer types
    best_name, best_dist = None, float('inf')
    for name, (cL, ca, cb, _) in CENTROIDS.items():
        dist = math.sqrt((L - cL) ** 2 + (a - ca) ** 2 + (b - cb) ** 2)
        if dist < best_dist:
            best_dist, best_name = dist, name

    undertone = CENTROIDS[best_name][3]
    confidence = max(30, min(58, int(100 - best_dist)))
    return {'season': best_name, 'undertone': undertone, 'confidence': confidence}
