"""
Recommendation Engine for AgriNova
===================================
Uses rule-based / scoring-based logic so that every output is
directly derived from what the farmer has typed in the form.

No ML model is used for crop or adoption prediction here, so
results vary meaningfully as inputs change.
"""
import ast
import os

# ──────────────────────────────────────────────────────────────────────────────
# 1. CROP RECOMMENDATION  (rule-based on Tamil Nadu agronomy)
# ──────────────────────────────────────────────────────────────────────────────

# Primary crop table keyed by (soil_type, water_availability, agro_zone, season)
# Each entry is an ordered list of recommended crops (most to least suitable)
_CROP_RULES = [
    # ── Delta zone ────────────────────────────────────────────────────────────
    {"soil": "Clay",     "water": "High",   "zone": "Delta",   "season": "Kharif",  "crops": ["Paddy", "Sugarcane", "Banana",    "Jute"]},
    {"soil": "Clay",     "water": "High",   "zone": "Delta",   "season": "Rabi",    "crops": ["Paddy", "Pulses",    "Vegetables","Maize"]},
    {"soil": "Clay",     "water": "Medium", "zone": "Delta",   "season": "Kharif",  "crops": ["Paddy", "Maize",     "Groundnut", "Cotton"]},
    {"soil": "Alluvial", "water": "High",   "zone": "Delta",   "season": "Kharif",  "crops": ["Paddy", "Sugarcane", "Banana",    "Jute"]},
    {"soil": "Alluvial", "water": "Medium", "zone": "Delta",   "season": "Rabi",    "crops": ["Wheat", "Pulses",    "Mustard",   "Groundnut"]},
    {"soil": "Black",    "water": "High",   "zone": "Delta",   "season": "Kharif",  "crops": ["Sugarcane","Paddy",  "Cotton",    "Soybean"]},
    {"soil": "Black",    "water": "Medium", "zone": "Delta",   "season": "Rabi",    "crops": ["Cotton", "Sorghum",  "Sunflower", "Groundnut"]},

    # ── Dry zone ──────────────────────────────────────────────────────────────
    {"soil": "Red",      "water": "Low",    "zone": "Dry",     "season": "Kharif",  "crops": ["Groundnut","Millets","Sorghum",   "Cotton"]},
    {"soil": "Red",      "water": "Low",    "zone": "Dry",     "season": "Rabi",    "crops": ["Millets", "Pulses",  "Castor",    "Groundnut"]},
    {"soil": "Red",      "water": "Medium", "zone": "Dry",     "season": "Kharif",  "crops": ["Cotton",  "Groundnut","Sunflower","Sorghum"]},
    {"soil": "Black",    "water": "Low",    "zone": "Dry",     "season": "Kharif",  "crops": ["Sorghum", "Cotton",  "Castor",    "Millets"]},
    {"soil": "Black",    "water": "Medium", "zone": "Dry",     "season": "Kharif",  "crops": ["Cotton",  "Soybean",  "Sorghum",  "Sunflower"]},
    {"soil": "Sandy",    "water": "Low",    "zone": "Dry",     "season": "Kharif",  "crops": ["Groundnut","Millets","Horsegram", "Castor"]},
    {"soil": "Sandy",    "water": "Low",    "zone": "Dry",     "season": "Rabi",    "crops": ["Horsegram","Millets","Pulses",    "Castor"]},
    {"soil": "Loam",     "water": "Medium", "zone": "Dry",     "season": "Kharif",  "crops": ["Groundnut","Cotton", "Maize",    "Sorghum"]},

    # ── Hilly zone ────────────────────────────────────────────────────────────
    {"soil": "Red",      "water": "High",   "zone": "Hilly",   "season": "Kharif",  "crops": ["Tea",     "Coffee",  "Cardamom",  "Turmeric"]},
    {"soil": "Red",      "water": "High",   "zone": "Hilly",   "season": "Rabi",    "crops": ["Coffee",  "Turmeric","Ginger",    "Pepper"]},
    {"soil": "Loam",     "water": "High",   "zone": "Hilly",   "season": "Kharif",  "crops": ["Tea",     "Coffee",  "Turmeric",  "Cardamom"]},
    {"soil": "Clay",     "water": "High",   "zone": "Hilly",   "season": "Kharif",  "crops": ["Turmeric","Ginger",  "Banana",    "Taro"]},

    # ── Coastal zone ──────────────────────────────────────────────────────────
    {"soil": "Sandy",    "water": "Medium", "zone": "Coastal", "season": "Kharif",  "crops": ["Coconut", "Cashew",  "Banana",    "Groundnut"]},
    {"soil": "Sandy",    "water": "Low",    "zone": "Coastal", "season": "Kharif",  "crops": ["Coconut", "Cashew",  "Groundnut", "Millets"]},
    {"soil": "Clay",     "water": "High",   "zone": "Coastal", "season": "Kharif",  "crops": ["Paddy",   "Banana",  "Coconut",   "Sugarcane"]},
    {"soil": "Alluvial", "water": "High",   "zone": "Coastal", "season": "Kharif",  "crops": ["Paddy",   "Banana",  "Coconut",   "Sugarcane"]},
    {"soil": "Loam",     "water": "Medium", "zone": "Coastal", "season": "Kharif",  "crops": ["Coconut", "Mango",   "Cashew",    "Groundnut"]},
]

# Season synonym normalization
_SEASON_MAP = {
    "Kharif": "Kharif", "kharif": "Kharif", "Kuruvai": "Kharif", "Samba": "Kharif",
    "Rabi": "Rabi",     "rabi": "Rabi",     "Thaladi": "Rabi",
    "Summer": "Summer", "summer": "Summer", "Navarai": "Summer",
}

# Water synonym normalization
_WATER_MAP = {
    "High": "High", "Abundant": "High", "Canal": "High", "River": "High",
    "Medium": "Medium", "Moderate": "Medium", "Borewell": "Medium",
    "Low": "Low", "Rainfed": "Low", "Scarce": "Low",
}

# Zone-specific fallback crops when no specific rule matches
_ZONE_FALLBACK = {
    "Delta":   ["Paddy", "Groundnut", "Maize"],
    "Dry":     ["Millets", "Groundnut", "Sorghum"],
    "Hilly":   ["Coffee", "Turmeric", "Ginger"],
    "Coastal": ["Coconut", "Cashew", "Banana"],
}


def _recommend_crops(farmer_data):
    soil  = (farmer_data.get("soil_type") or "").strip().title()
    water_raw = (farmer_data.get("water_availability") or
                 farmer_data.get("irrig_availability") or "Medium").strip()
    water = _WATER_MAP.get(water_raw, "Medium")
    zone  = (farmer_data.get("agro_climatic_zone") or "Delta").strip()
    season_raw = (farmer_data.get("season") or "Kharif").strip()
    season = _SEASON_MAP.get(season_raw, "Kharif")

    # Find the best matching rule (most specific → least)
    scoreboard = {}
    for rule in _CROP_RULES:
        match = 0
        if rule["soil"]   == soil:   match += 4
        if rule["water"]  == water:  match += 3
        if rule["zone"]   == zone:   match += 2
        if rule["season"] == season: match += 1
        if match > 0:
            for rank, crop in enumerate(rule["crops"]):
                scoreboard[crop] = scoreboard.get(crop, 0) + (match * (4 - rank))

    if scoreboard:
        top_crops = sorted(scoreboard, key=scoreboard.get, reverse=True)[:3]
        return top_crops

    # Fallback: use zone default
    return _ZONE_FALLBACK.get(zone, ["Paddy", "Millets", "Groundnut"])


# ──────────────────────────────────────────────────────────────────────────────
# 2. ADOPTION LEVEL  (scoring-based, reflects actual inputs)
# ──────────────────────────────────────────────────────────────────────────────

def _safe_int(val, default=0):
    if val is None or str(val).strip() == "":
        return int(default)
    try:
        return int(float(str(val).strip()))
    except:
        return int(default)

def _safe_income(val, default=200000):
    if not val:
        return float(default)
    s = str(val).strip()
    
    # Handle "Above 500000" or "Below 50000"
    import re
    nums = re.findall(r'\d+', s.replace(',', ''))
    if nums:
        if "Above" in s:
            return float(nums[0]) + 1  # Ensure it falls into the >= range
        if "Below" in s:
            return float(nums[0]) - 1  # Ensure it falls into the < range
        if "-" in s:
            try:
                lo = float(nums[0])
                hi = float(nums[1])
                return (lo + hi) / 2
            except:
                pass
        return float(nums[0])
        
    try:
        return float(s.replace(",", ""))
    except:
        return float(default)

def _parse_list(val):
    if not val:
        return []
    if isinstance(val, list):
        return val
    try:
        return ast.literal_eval(str(val))
    except:
        return []

from data.schemes import filter_schemes_by_eligibility

def _calculate_adoption(farmer_data):
    """
    Returns (level, score) where level ∈ {High, Medium, Low}
    Score is deterministic and directly reflects form inputs.
    Total Raw Score Max = 135 (normalized to 100)
    """
    raw_score = 0

    # 1. Technology usage (max 40 pts) ─────────────────────────────────────────
    # Each technology = 8 points, capped at 5 technologies (5 * 8 = 40)
    techs_raw = _parse_list(farmer_data.get("technologies_used"))
    # Filter out "None" or "Others"
    techs = [t for t in techs_raw if str(t).lower() not in ["none", "others", "none - எதுவும் இல்லை", "எதுவும் இல்லை"]]
    tech_count = len(techs)
    raw_score += min(tech_count * 8, 40)

    # 2. Digital literacy flags (max 30 pts) ───────────────────────────────────
    if farmer_data.get("using_uzhavan_app"):   raw_score += 10
    if farmer_data.get("watch_agri_youtube"):  raw_score += 10
    if farmer_data.get("in_whatsapp_groups"):  raw_score += 10

    # 3. Education (max 15 pts) ────────────────────────────────────────────────
    edu = (farmer_data.get("education") or "").strip()
    edu_score = {"No Formal": 0, "Primary": 3, "Middle": 5, "High": 7,
                 "Higher Secondary": 9, "HSC": 9, "12th": 9,
                 "Diploma": 11, "ITI": 11, "Degree": 13, "UG": 13,
                 "Postgraduate": 15, "PG": 15}.get(edu, 5)
    raw_score += edu_score

    # 4. Income (max 10 pts) ────────────────────────────────────────────────────
    income = _safe_income(farmer_data.get("income") or farmer_data.get("annual_income"))
    if   income >= 1000000: raw_score += 10
    elif income >= 500000:  raw_score += 8
    elif income >= 300000:  raw_score += 5
    elif income >= 150000:  raw_score += 3
    else:                   raw_score += 1

    # 5. Scheme awareness (max 10 pts) ───────────────────────────────────────────
    # 2 points per scheme, max 5 schemes (for 10 pts)
    schemes = _parse_list(farmer_data.get("schemes_aware"))
    raw_score += min(len(schemes) * 2, 10)

    # 6. Market participation & Training (max 15 pts) ──────────────────────────
    if farmer_data.get("selling_uzhavar_sandhai"): raw_score += 3
    if farmer_data.get("attended_training"):        raw_score += 3
    if farmer_data.get("check_market_price"):       raw_score += 3
    if farmer_data.get("met_vao_aeo"):              raw_score += 3
    if farmer_data.get("visited_tnau_farm"):        raw_score += 3
    
    # 7. Financial Safety (max 15 pts) ─────────────────────────────────────────
    if farmer_data.get("has_insurance") or farmer_data.get("enrolled_pmfby"): 
        raw_score += 5
    if farmer_data.get("save_after_harvest"):
        raw_score += 5
    if farmer_data.get("invested_equipment"):
        raw_score += 5

    # ── Normalization (score / 135) * 100 ─────────────────────────────────────
    score = int(round((raw_score / 135) * 100))
    score = min(score, 100)

    # ── Category (Synchronized with frontend) ─────────────────────────────────
    if   score >= 68: level = "High"
    elif score >= 38: level = "Medium"
    else:             level = "Low"

    return level, score


# ──────────────────────────────────────────────────────────────────────────────
# 3. TECHNOLOGY RECOMMENDATIONS  (reflects what farmer already uses)
# ──────────────────────────────────────────────────────────────────────────────

TECH_MASTER = {
    "Soil Testing Kit": {
        "tech_en": "Soil Testing Kit", "tech_ta": "மண் பரிசோதனை கிட்",
        "description_en": "Helps analyze nutrient levels to optimize fertilizer use.",
        "description_ta": "உரப் பயன்பாட்டை மேம்படுத்த ஊட்டச்சத்து அளவை பகுப்பாய்வு செய்ய உதவுகிறது.",
        "cost_en": "Low", "cost_ta": "குறைவு",
        "scheme_en": "Soil Health Card Scheme", "scheme_ta": "மண் சுகாதார அட்டை திட்டம்"
    },
    "Weather Forecast Mobile App": {
        "tech_en": "Weather Forecast Mobile App", "tech_ta": "வானிலை முன்னறிவிப்பு செயலி",
        "description_en": "Receive real-time weather alerts and rain predictions.",
        "description_ta": "உண்மையான நேரத்தில் வானிலை எச்சரிக்கைகள் மற்றும் மழை கணிப்புகளைப் பெறுங்கள்.",
        "cost_en": "Free / Low", "cost_ta": "இலவசம்/குறைவு",
        "scheme_en": "Digital Agriculture Mission", "scheme_ta": "டிஜிட்டல் வேளாண்மை இயக்கம்"
    },
    "Uzhavan Mobile App": {
        "tech_en": "Uzhavan Mobile App", "tech_ta": "உழவன் மொபைல் செயலி",
        "description_en": "Official TN Govt app for market prices, subsidies, and crop advisory.",
        "description_ta": "சந்தை விலைகள், மானியங்கள் மற்றும் பயிர் ஆலோசனைக்கான அதிகாரப்பூர்வ தமிழக அரசு செயலி.",
        "cost_en": "Free", "cost_ta": "இலவசம்",
        "scheme_en": "TNAU Digital Extension", "scheme_ta": "TNAU டிஜிட்டல் விரிவாக்கம்"
    },
    "Mulching Sheets": {
        "tech_en": "Mulching Sheets", "tech_ta": "மல்சிங் தாள்கள்",
        "description_en": "Conserves soil moisture and prevents weed growth.",
        "description_ta": "மண் ஈரப்பதத்தைப் பாதுகாக்கிறது மற்றும் களை வளர்ச்சியைத் தடுக்கிறது.",
        "cost_en": "Medium", "cost_ta": "நடுத்தரம்",
        "scheme_en": "Horticulture Development Scheme", "scheme_ta": "தோட்டக்கலை மேம்பாட்டுத் திட்டம்"
    },
    "Drip Irrigation": {
        "tech_en": "Drip Irrigation", "tech_ta": "சொட்டு நீர் பாசனம்",
        "description_en": "Precision water delivery to plant roots, saving up to 50% water.",
        "description_ta": "செடியின் வேர்களுக்குத் துல்லியமாகத் தண்ணீர் வழங்குகிறது, 50% நீரை மிச்சப்படுத்துகிறது.",
        "cost_en": "High", "cost_ta": "அதிகம்",
        "scheme_en": "PMKSY (Micro-Irrigation)", "scheme_ta": "மைக்ரோ பாசனத் திட்டம் (PMKSY)"
    },
    "Sprinkler Irrigation": {
        "tech_en": "Sprinkler Irrigation", "tech_ta": "தெளிப்பு நீர் பாசனம்",
        "description_en": "Provides rain-like irrigation for field crops.",
        "description_ta": "வயல் பயிர்களுக்கு மழை போன்ற பாசனத்தை வழங்குகிறது.",
        "cost_en": "Medium", "cost_ta": "நடுத்தரம்",
        "scheme_en": "National Mission on Sustainable Agriculture", "scheme_ta": "நிலையான வேளாண்மைக்கான தேசிய இயக்கம்"
    },
    "Farm Mechanization Tools": {
        "tech_en": "Farm Mechanization Tools", "tech_ta": "விவசாய கருவிகள்",
        "description_en": "Modern machinery like power tillers for efficient labor.",
        "description_ta": "திறமையான உழைப்பிற்காக பவர் டில்லர் போன்ற நவீன இயந்திரங்கள்.",
        "cost_en": "High", "cost_ta": "அதிகம்",
        "scheme_en": "Agricultural Mechanization Mission", "scheme_ta": "விவசாய இயந்திரமயமாக்கல் இயக்கம்"
    },
    "Soil Moisture Sensor": {
        "tech_en": "Soil Moisture Sensor", "tech_ta": "மண் ஈரப்பதம் சென்சார்",
        "description_en": "Monitors soil water levels via smartphone for precise irrigation.",
        "description_ta": "ஸ்மார்ட்போன் மூலம் மண் நீர்மட்டத்தை கண்காணித்து துல்லியமான பாசனம் செய்யுங்கள்.",
        "cost_en": "Medium", "cost_ta": "நடுத்தரம்",
        "scheme_en": "Precision Farming Scheme", "scheme_ta": "துல்லியப் பண்ணையத் திட்டம்"
    },
    "Greenhouse / Polyhouse": {
        "tech_en": "Greenhouse / Polyhouse", "tech_ta": "பசுமை இல்லம்",
        "description_en": "Controlled environment for growing high-value crops year-round.",
        "description_ta": "ஆண்டு முழுவதும் உயர்மதிப்புப் பயிர்களை வளர்க்க கட்டுப்படுத்தப்பட்ட சூழல்.",
        "cost_en": "High", "cost_ta": "அதிகம்",
        "scheme_en": "National Horticulture Board", "scheme_ta": "தேசிய தோட்டக்கலை வாரியம்"
    },
    "Drone Spraying": {
        "tech_en": "Drone Spraying", "tech_ta": "ட்ரோன் தெளித்தல்",
        "description_en": "Automated pesticide and fertilizer application using drones.",
        "description_ta": "ட்ரோன்களைப் பயன்படுத்தித் தானியங்கி பூச்சிக்கொல்லி மற்றும் உர தெளித்தல்.",
        "cost_en": "High", "cost_ta": "அதிகம்",
        "scheme_en": "SMAM (Sub-Mission on Agri Mechanization)", "scheme_ta": "SMAM (வேளாண் இயந்திரமயமாக்கல் துணைத் திட்டம்)"
    }
}

# baseline recommendations per adoption level
_TECH_BASELINE = {
    "Low":    ["Soil Testing Kit", "Uzhavan Mobile App", "Weather Forecast Mobile App", "Mulching Sheets"],
    "Medium": ["Drip Irrigation", "Sprinkler Irrigation", "Soil Moisture Sensor", "Mulching Sheets"],
    "High":   ["Greenhouse / Polyhouse", "Drone Spraying", "Soil Moisture Sensor", "Farm Mechanization Tools"]
}

def _tech_recommendations(farmer_data, adoption_level):
    user_selected = _parse_list(farmer_data.get("technologies_used"))

    # Add Uzhavan App to "already used" if flag is set
    if farmer_data.get("using_uzhavan_app") and "Uzhavan Mobile App" not in user_selected:
        user_selected.append("Uzhavan Mobile App")

    base = _TECH_BASELINE.get(adoption_level, _TECH_BASELINE["Low"])
    to_adopt = [t for t in base if t not in user_selected]

    # Ensure at least 4 items to adopt by pulling from other lists
    all_techs = list(TECH_MASTER.keys())
    for t in all_techs:
        if len(to_adopt) >= 4:
            break
        if t not in to_adopt and t not in user_selected:
            to_adopt.append(t)

    already_using = [TECH_MASTER[t] | {"already_using": True}  for t in user_selected if t in TECH_MASTER]
    recommend     = [TECH_MASTER[t] | {"already_using": False} for t in to_adopt[:4]]
    return recommend + already_using


# ──────────────────────────────────────────────────────────────────────────────
# 4. INSURANCE RECOMMENDATIONS  (personalised per farmer inputs)
# ──────────────────────────────────────────────────────────────────────────────

_ALL_INSURANCE_SCHEMES = [
    {
        "scheme_en": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "scheme_ta": "பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (PMFBY)",
        "description_en": "Central Govt scheme covering crop loss due to drought, flood, and natural calamities. Premium as low as 2% for Kharif and 1.5% for Rabi.",
        "description_ta": "வறட்சி, வெள்ளம் மற்றும் இயற்கை சேதங்களால் ஏற்படும் பயிர் இழப்பை ஈடுசெய்யும் மத்திய திட்டம்.",
        "link": "https://pmfby.gov.in",
        "eligible": lambda fd, crops: True,
    },
    {
        "scheme_en": "Tamil Nadu Farmers Insurance Scheme (TNFIS)",
        "scheme_ta": "தமிழ்நாடு விவசாயிகள் காப்பீட்டுத் திட்டம்",
        "description_en": "Free personal accident insurance of ₹2 Lakh for TN farmers with Patta/Adangal documents.",
        "description_ta": "பட்டா/அடங்கல் ஆவணங்கள் கொண்ட தமிழ்நாடு விவசாயிகளுக்கு ₹2 லட்சம் இலவச தனிப்பட்ட விபத்து காப்பீடு.",
        "eligible": lambda fd, crops: True,
    },
    {
        "scheme_en": "RWBCIS – Weather Based Crop Insurance",
        "scheme_ta": "வானிலை அடிப்படையிலான பயிர் காப்பீடு (RWBCIS)",
        "description_en": "Insurance paid based on rainfall/temperature index – ideal for horticulture crops like Banana, Mango, Turmeric, and Coconut.",
        "description_ta": "மழை/வெப்பநிலை குறியீட்டால் தூண்டப்படும் காப்பீடு – வாழை, மாம்பழம், மஞ்சள், தேங்காய் விவசாயிகளுக்கு ஏற்றது.",
        "link": "https://pmfby.gov.in/farmerCorner/statusCheck",
        "eligible": lambda fd, crops: any(c.lower() in ["banana", "mango", "turmeric", "coconut", "chillies", "papaya", "cashew", "coffee", "tea", "cardamom", "grapes"] for c in crops),
    },
    {
        "scheme_en": "Coconut Palm Insurance Scheme (CPIS)",
        "scheme_ta": "தேங்காய் மரம் காப்பீட்டுத் திட்டம் (CPIS)",
        "description_en": "Covers coconut palms against cyclone, lightning, fire, and natural calamities.",
        "description_ta": "சூறாவளி, மின்னல், தீ மற்றும் இயற்கை சேதங்களுக்கு எதிராக தேங்காய் மரங்களை காக்கும் திட்டம்.",
        "link": "https://coconutboard.gov.in",
        "eligible": lambda fd, crops: any(c.lower() == "coconut" for c in crops),
    },
    {
        "scheme_en": "TN Sugarcane Farmers Insurance",
        "scheme_ta": "தமிழ்நாடு கரும்பு விவசாயிகள் காப்பீடு",
        "description_en": "State scheme providing insurance against crop damage for registered sugarcane growers.",
        "description_ta": "பதிவு பெற்ற கரும்பு விவசாயிகளுக்கு பயிர் சேதத்திற்கு எதிரான மாநில காப்பீட்டுத் திட்டம்.",
        "link": "https://tnagriculture.in",
        "eligible": lambda fd, crops: any(c.lower() == "sugarcane" for c in crops),
    },
    {
        "scheme_en": "Pradhan Mantri Kisan Maan-Dhan Yojana (PM-KMY)",
        "scheme_ta": "பிரதம மந்திரி கிசான் மான்-தன் யோஜனா (PM-KMY)",
        "description_en": "Pension scheme providing ₹3,000/month after age 60. For small/marginal farmers with up to 2 acres.",
        "description_ta": "60 வயதிற்கு பிறகு மாதம் ₹3,000 வழங்கும் ஓய்வூதியத் திட்டம். 2 ஏக்கர் வரை உள்ள சிறு விவசாயிகளுக்கு.",
        "link": "https://pmkmy.gov.in",
        "eligible": lambda fd, crops: float(fd.get("land_area") or 5) <= 2,
    },
    {
        "scheme_en": "TN CM Comprehensive Health Insurance (CMCHIS)",
        "scheme_ta": "தமிழக முதல்வர் விரிவான மருத்துவ காப்பீடு (CMCHIS)",
        "description_en": "Health insurance coverage for farmers and their families for high-end surgeries and treatments.",
        "description_ta": "விவசாயிகள் மற்றும் அவர்களின் குடும்பத்தினருக்கு உயர்தர அறுவை சிகிச்சைகள் மற்றும் சிகிச்சைகளுக்கான மருத்துவ காப்பீடு.",
        "link": "https://www.cmchistn.com/",
        "eligible": lambda fd, crops: True,
    },
    {
        "scheme_en": "Agriculture Infrastructure Fund (AIF) Insurance",
        "scheme_ta": "வேளாண்மை உள்கட்டமைப்பு நிதி காப்பீடு (AIF)",
        "description_en": "For farmers with >5 acres investing in farm storage/processing. Covers asset loss against fire, theft, and natural disasters.",
        "description_ta": "5 ஏக்கருக்கு மேல் பண்ணை சேமிப்பு/பதப்படுத்தலில் முதலீடு செய்யும் விவசாயிகளுக்கு.",
        "link": "https://agriinfra.dac.gov.in",
        "eligible": lambda fd, crops: float(fd.get("land_area") or 0) >= 5,
    },
    {
        "scheme_en": "Dry Land Farming Assistance (DLFA) – TN",
        "scheme_ta": "வறண்ட நில விவசாய உதவி – தமிழ்நாடு",
        "description_en": "Special compensation scheme for Dry Zone farmers whose crops fail due to drought (< 75% of normal rainfall).",
        "description_ta": "இயல்புக்கும் குறைந்த மழையால் (75% கீழ்) பயிர் இழந்த வறண்ட வலய விவசாயிகளுக்கு சிறப்பு இழப்பீடு.",
        "link": "https://tnagriculture.in",
        "eligible": lambda fd, crops: (fd.get("agro_climatic_zone") or "").strip() == "Dry",
    },
    {
        "scheme_en": "TNAU Crop Insurance Guide",
        "scheme_ta": "TNAU பயிர் காப்பீட்டு வழிகாட்டி",
        "description_en": "Comprehensive guide from Tamil Nadu Agricultural University covering all aspects of crop insurance in TN.",
        "description_ta": "தமிழ்நாட்டில் உள்ள அனைத்து வகையான பயிர் காப்பீடுகள் குறித்த விரிவான வழிகாட்டி - தமிழ்நாடு வேளாண்மைப் பல்கலைக்கழகம்.",
        "link": "https://agritech.tnau.ac.in/crop_insurance/crop_insurance_nias.html",
        "eligible": lambda fd, crops: True,
    },
]


def _insurance_recommendations(farmer_data):
    enrolled = farmer_data.get("insuranceEnrolled") or farmer_data.get("has_insurance")
    scheme   = farmer_data.get("insuranceScheme") or ""
    risk     = (farmer_data.get("farmingRisk") or "").lower()

    crops_raw = _parse_list(farmer_data.get("crops"))
    crops = [str(c).lower() for c in crops_raw]

    schemes = [s for s in _ALL_INSURANCE_SCHEMES if s["eligible"](farmer_data, crops)]

    if str(enrolled or "").lower().startswith("yes"):
        status = "enrolled"
        status_en = f"Currently enrolled in: {scheme}" if scheme and scheme != "N/A" else "✅ You are enrolled in crop insurance."
        status_ta = f"தற்போது இதில் பதிவாகியுள்ளீர்கள்: {scheme}" if scheme and scheme != "N/A" else "✅ நீங்கள் பயிர் காப்பீட்டில் பதிவாகியுள்ளீர்கள்."
    else:
        status = "not_enrolled"
        status_en = "⚠️ Not enrolled in any crop insurance scheme."
        status_ta = "⚠️ எந்த பயிர் காப்பீட்டு திட்டத்திலும் பதிவில்லை."

    # Return serialisable list (strip lambda)
    clean = [{"scheme_en": s["scheme_en"], "scheme_ta": s["scheme_ta"],
              "description_en": s["description_en"], "description_ta": s["description_ta"],
              "link": s.get("link", "")}
             for s in schemes]


    return {"status": status, "status_en": status_en, "status_ta": status_ta,
            "recommendations": clean}


# ──────────────────────────────────────────────────────────────────────────────
# 5. TAMIL NAMES
# ──────────────────────────────────────────────────────────────────────────────

_TAMIL = {
    "Paddy": "நெல்", "Rice": "அரிசி", "Cotton": "பருத்தி",
    "Groundnut": "நிலக்கடலை", "Millets": "சிறு தானியங்கள்",
    "Sugarcane": "கரும்பு", "Pulses": "பயறு வகைகள்", "Maize": "சோளம்",
    "Chillies": "மிளகாய்", "Banana": "வாழை", "Turmeric": "மஞ்சள்",
    "Coconut": "தேங்காய்", "Jute": "சணல்", "Coffee": "காபி",
    "Tea": "தேயிலை", "Rubber": "இறப்பை", "Mango": "மாம்பழம்",
    "Grapes": "திராட்சை", "Apple": "ஆப்பிள்", "Papaya": "பப்பாளி",
    "Pomegranate": "மாதுளை", "Cashew": "முந்திரி", "Sorghum": "சோழம்",
    "Sunflower": "சூரியகாந்தி", "Castor": "ஆமணக்கு", "Soybean": "சோயாபீன்",
    "Cardamom": "ஏலக்காய்", "Pepper": "மிளகு", "Ginger": "இஞ்சி",
    "Taro": "சேப்பங்கிழங்கு", "Horsegram": "கொள்ளு", "Mustard": "கடுகு",
    "Wheat": "கோதுமை", "Vegetables": "காய்கறிகள்",
}


# ──────────────────────────────────────────────────────────────────────────────
# 6. PUBLIC API CLASS
# ──────────────────────────────────────────────────────────────────────────────

class RecommendationEngine:
    """
    Public facade used by routes/results.py and routes/farmer.py.
    All logic is rule-based / scoring-based for full traceability.
    """

    # ── kept for backward-compat; Flask auto-reload loads this module ──
    def __init__(self):
        # Try loading ML models as optional helpers (not used for core logic)
        self.has_crop_ml = False
        self.has_adopt_ml = False
        try:
            import joblib
            d = os.path.dirname(os.path.abspath(__file__))
            self.crop_model = joblib.load(os.path.join(d, "crop_model.pkl"))
            self.crop_target_encoder = joblib.load(os.path.join(d, "crop_target_encoder.pkl"))
            self.has_crop_ml = True
        except Exception:
            pass
        print("🌾 AgriNova ML Models loaded successfully.")

    # ── Crop ──────────────────────────────────────────────────────────────────
    def get_top_3_crops(self, farmer_data):
        return _recommend_crops(farmer_data)

    # ── Adoption ──────────────────────────────────────────────────────────────
    def get_adoption_level(self, farmer_data):
        return _calculate_adoption(farmer_data)

    # ── Technologies ─────────────────────────────────────────────────────────
    def get_technologies(self, farmer_data, adoption_level):
        return _tech_recommendations(farmer_data, adoption_level)

    # ── Insurance ─────────────────────────────────────────────────────────────
    def get_insurance_recommendations(self, farmer_data):
        return _insurance_recommendations(farmer_data)

    # ── Combined ─────────────────────────────────────────────────────────────
    def get_schemes(self, farmer_data):
        return filter_schemes_by_eligibility(farmer_data)

    def get_all_recommendations(self, farmer_data):
        top_crops = self.get_top_3_crops(farmer_data)
        level, score = self.get_adoption_level(farmer_data)
        technologies = self.get_technologies(farmer_data, level)
        insurance = self.get_insurance_recommendations(farmer_data)
        schemes = self.get_schemes(farmer_data)

        return {
            "recommended_crops": top_crops,
            "adoption_level": level,
            "adoption_score": score,
            "technologies": technologies,
            "insurance": insurance,
            "schemes": schemes,
            "crops": [{"crop_en": c, "crop_ta": _TAMIL.get(c, c)} for c in top_crops],
        }

    def _get_tamil_name(self, crop_en):
        return _TAMIL.get(crop_en, crop_en)


recommendation_engine = RecommendationEngine()
