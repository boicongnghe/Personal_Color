import math

# The React app currently supports these 12 result ids:
# warm-autumn, deep-autumn, soft-autumn, true-autumn,
# cool-summer, light-summer, soft-summer,
# warm-spring, light-spring, true-spring,
# cool-winter, deep-winter.
#
# Backend returns "season-subtype" (for example autumn-warm), and the
# frontend reverses it to find the matching id.

PROFILES = {
    "autumn-warm":  {"L": 55, "a": 10, "b": 17, "chroma": 20, "warmth": 12, "undertone": "warm"},
    "autumn-deep":  {"L": 38, "a": 8,  "b": 13, "chroma": 16, "warmth": 9,  "undertone": "warm"},
    "autumn-soft":  {"L": 54, "a": 6,  "b": 10, "chroma": 11, "warmth": 7,  "undertone": "neutral"},
    "autumn-true":  {"L": 49, "a": 10, "b": 18, "chroma": 20, "warmth": 13, "undertone": "warm"},
    "summer-cool":  {"L": 59, "a": 4,  "b": 5,  "chroma": 7,  "warmth": 2,  "undertone": "cool"},
    "summer-light": {"L": 70, "a": 4,  "b": 7,  "chroma": 9,  "warmth": 4,  "undertone": "cool"},
    "summer-soft":  {"L": 55, "a": 5,  "b": 8,  "chroma": 10, "warmth": 5,  "undertone": "neutral"},
    "spring-warm":  {"L": 66, "a": 9,  "b": 17, "chroma": 20, "warmth": 13, "undertone": "warm"},
    "spring-light": {"L": 74, "a": 6,  "b": 13, "chroma": 15, "warmth": 10, "undertone": "warm"},
    "spring-true":  {"L": 70, "a": 10, "b": 20, "chroma": 23, "warmth": 15, "undertone": "warm"},
    "winter-cool":  {"L": 50, "a": 3,  "b": 2,  "chroma": 8,  "warmth": 0,  "undertone": "cool"},
    "winter-deep":  {"L": 35, "a": 4,  "b": 5,  "chroma": 10, "warmth": 2,  "undertone": "cool"},
}


def _clamp(value, lo, hi):
    return max(lo, min(hi, value))


def _features(L: float, a: float, b: float) -> dict:
    chroma = math.sqrt((a * a) + (b * b))
    warmth = b - (0.55 * a)
    return {
        "L": L,
        "a": a,
        "b": b,
        "chroma": chroma,
        "warmth": warmth,
    }


def _distance(f: dict, profile: dict) -> float:
    # Weights are tuned for face-scan photos where lighting shifts L more than
    # a/b. Warmth and chroma stabilize the result under indoor light.
    return math.sqrt(
        ((f["L"] - profile["L"]) / 13.0) ** 2 * 1.2
        + ((f["a"] - profile["a"]) / 6.5) ** 2 * 0.8
        + ((f["b"] - profile["b"]) / 8.0) ** 2 * 0.8
        + ((f["chroma"] - profile["chroma"]) / 8.0) ** 2 * 1.0
        + ((f["warmth"] - profile["warmth"]) / 6.0) ** 2 * 1.4
    )


def _temperature_bucket(f: dict) -> str:
    if f["warmth"] >= 8.0 and f["b"] >= 9.0:
        return "warm"
    if f["warmth"] <= 3.0 or (f["b"] <= 6.0 and f["a"] <= 6.0):
        return "cool"
    return "neutral"


def _allowed_profiles(f: dict) -> list:
    temp = _temperature_bucket(f)
    light = f["L"] >= 66
    deep = f["L"] <= 43
    soft = f["chroma"] <= 12

    if temp == "warm":
        allowed = ["autumn-warm", "autumn-true", "spring-warm", "spring-true"]
        if light:
            allowed.extend(["spring-light", "summer-light"])
        if deep:
            allowed.extend(["autumn-deep", "winter-deep"])
        if soft:
            allowed.extend(["autumn-soft", "summer-soft"])
        return allowed

    if temp == "cool":
        allowed = ["summer-cool", "winter-cool"]
        if light:
            allowed.extend(["summer-light", "spring-light"])
        if deep:
            allowed.extend(["winter-deep", "autumn-deep"])
        if soft:
            allowed.extend(["summer-soft", "autumn-soft"])
        return allowed

    allowed = ["autumn-soft", "summer-soft", "summer-cool"]
    if light:
        allowed.extend(["summer-light", "spring-light"])
    if deep:
        allowed.extend(["winter-deep", "autumn-deep"])
    if f["warmth"] >= 5.5:
        allowed.extend(["autumn-warm", "spring-warm"])
    else:
        allowed.extend(["winter-cool"])
    return allowed


def classify_season(L: float, a: float, b: float) -> dict:
    f = _features(L, a, b)
    allowed = list(dict.fromkeys(_allowed_profiles(f)))

    ranked = sorted(
        ((name, _distance(f, PROFILES[name])) for name in allowed),
        key=lambda item: item[1],
    )
    best_name, best_dist = ranked[0]
    second_dist = ranked[1][1] if len(ranked) > 1 else best_dist + 1.0

    # Deep/light guardrails prevent indoor exposure from pushing a very dark or
    # very light complexion into the wrong seasonal family.
    if f["L"] <= 34 and "winter-deep" in allowed and f["warmth"] < 5:
        best_name = "winter-deep"
        best_dist = _distance(f, PROFILES[best_name])
    elif f["L"] <= 38 and f["warmth"] >= 6:
        best_name = "autumn-deep"
        best_dist = _distance(f, PROFILES[best_name])
    elif f["L"] >= 74 and f["warmth"] >= 7:
        best_name = "spring-light"
        best_dist = _distance(f, PROFILES[best_name])
    elif f["L"] >= 70 and f["warmth"] < 6:
        best_name = "summer-light"
        best_dist = _distance(f, PROFILES[best_name])

    profile = PROFILES[best_name]
    margin = max(0.0, second_dist - best_dist)
    confidence = int(_clamp(92 - best_dist * 18 + margin * 8, 56, 96))

    return {
        "season": best_name,
        "undertone": profile["undertone"],
        "confidence": confidence,
        "temperature": _temperature_bucket(f),
        "chroma": round(f["chroma"], 2),
        "warmth": round(f["warmth"], 2),
    }
