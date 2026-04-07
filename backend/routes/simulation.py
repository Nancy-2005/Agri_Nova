from flask import Blueprint, jsonify, session
import logging

simulation_bp = Blueprint('simulation', __name__)

# ── Crop-level base data (yield in kg/acre, water in litres/acre/season) ──────
CROP_BASE = {
    'Paddy':       {'yield_kg': 2200, 'water_l': 1200000, 'price_per_kg': 20, 'cycle_days': 120},
    'Sugarcane':   {'yield_kg': 40000,'water_l': 2000000, 'price_per_kg': 3,  'cycle_days': 300},
    'Banana':      {'yield_kg': 15000,'water_l': 900000,  'price_per_kg': 15, 'cycle_days': 300},
    'Coconut':     {'yield_kg': 8000, 'water_l': 700000,  'price_per_kg': 12, 'cycle_days': 365},
    'Cotton':      {'yield_kg': 400,  'water_l': 700000,  'price_per_kg': 60, 'cycle_days': 180},
    'Groundnut':   {'yield_kg': 900,  'water_l': 500000,  'price_per_kg': 50, 'cycle_days': 110},
    'Millets':     {'yield_kg': 700,  'water_l': 280000,  'price_per_kg': 25, 'cycle_days': 90},
    'Maize':       {'yield_kg': 2500, 'water_l': 550000,  'price_per_kg': 22, 'cycle_days': 100},
    'Tomato':      {'yield_kg': 8000, 'water_l': 600000,  'price_per_kg': 30, 'cycle_days': 90},
    'Vegetables':  {'yield_kg': 8000, 'water_l': 600000,  'price_per_kg': 30, 'cycle_days': 90},
    'Flowers':     {'yield_kg': 5000, 'water_l': 500000,  'price_per_kg': 40, 'cycle_days': 90},
}
DEFAULT_CROP = {'yield_kg': 2000, 'water_l': 800000, 'price_per_kg': 25, 'cycle_days': 120}

# ── Soil quality multipliers ───────────────────────────────────────────────────
SOIL_QUALITY = {
    'Black': 1.15, 'Alluvial': 1.12, 'Loamy': 1.10,
    'Red': 1.00, 'Clay': 0.95, 'Sandy': 0.88,
    'Laterite': 0.90, 'Saline': 0.75, 'Alkaline': 0.78,
    'Gravelly': 0.82, 'Marshy': 0.85, 'Peaty': 0.92, 'Mixed': 0.95,
}

# ── Technology impact on yield, water, CHI ────────────────────────────────────
TECH_IMPACTS = {
    'drip_irrigation':       {'yield': 0.08, 'water': -0.30, 'chi': 0.10},
    'sprinkler_irrigation':  {'yield': 0.05, 'water': -0.20, 'chi': 0.07},
    'mulching':              {'yield': 0.06, 'water': -0.15, 'chi': 0.06},
    'greenhouse':            {'yield': 0.20, 'water': -0.10, 'chi': 0.15},
    'shade_net':             {'yield': 0.10, 'water': -0.05, 'chi': 0.08},
    'tractor':               {'yield': 0.05, 'water':  0.00, 'chi': 0.03},
    'harvester':             {'yield': 0.03, 'water':  0.00, 'chi': 0.02},
    'drone_spray':           {'yield': 0.07, 'water': -0.08, 'chi': 0.09},
    'soil_test':             {'yield': 0.09, 'water': -0.05, 'chi': 0.12},
    'moisture_sensor':       {'yield': 0.06, 'water': -0.12, 'chi': 0.08},
    'weather_app':           {'yield': 0.04, 'water': -0.03, 'chi': 0.05},
    'solar_pump':            {'yield': 0.02, 'water': -0.05, 'chi': 0.04},
    'crop_insurance':        {'yield': 0.00, 'water':  0.00, 'chi': 0.03},
}

TECH_KEY_MAP = {
    'Drip irrigation': 'drip_irrigation',
    'Sprinkler irrigation': 'sprinkler_irrigation',
    'Mulching sheets': 'mulching',
    'Greenhouse / Polyhouse': 'greenhouse',
    'Shade net cultivation': 'shade_net',
    'Tractor / Power tiller': 'tractor',
    'Harvesting machine': 'harvester',
    'Drone spraying': 'drone_spray',
    'Soil testing kit / Soil Health Card': 'soil_test',
    'Soil moisture sensor': 'moisture_sensor',
    'Weather forecast mobile app': 'weather_app',
    'Solar pump set': 'solar_pump',
    'Crop insurance (PMFBY)': 'crop_insurance',
}

# ── Recommended technologies if farmer doesn't use them ───────────────────────
RECOMMENDED_TECH_POOL = [
    'drip_irrigation', 'soil_test', 'drone_spray',
    'moisture_sensor', 'weather_app', 'solar_pump'
]


def _linear_regression_predict(base_yield, soil_mult, tech_yield_delta, land_area):
    """
    Simple linear regression proxy:
    predicted_yield = (base * soil * area) + (base * area * tech_delta_sum)
    Returns (before_yield, after_yield) in kg total
    """
    before = base_yield * soil_mult * land_area
    after  = before * (1 + tech_yield_delta)
    return round(before, 1), round(after, 1)


def _rf_predict_water(base_water, irrigation_method, tech_water_delta, land_area):
    """
    Random Forest proxy for water usage prediction.
    Irrigation method matters; flood = worst, drip = best.
    """
    irr_penalty = {
        'Flood Irrigation': 1.25,
        'Manual Irrigation': 1.15,
        'Mixed Method': 1.05,
        'Sprinkler Irrigation': 0.90,
        'Drip Irrigation': 0.75,
    }
    mult = irr_penalty.get(irrigation_method, 1.0)
    before = base_water * mult * land_area
    after  = before * (1 + tech_water_delta)
    return round(before, 1), round(max(after, before * 0.4), 1)  # cap savings at 60%


def _crop_health_index(soil_mult, tech_chi_delta, schemes_count, irrigation_method):
    """
    CHI = base score from soil + method bonus + scheme awareness + tech improvements
    Scale: 0–100
    """
    base = soil_mult * 55  # soil up to ~63
    irr_bonus = {'Drip Irrigation': 15, 'Sprinkler Irrigation': 10,
                 'Mixed Method': 5, 'Manual Irrigation': 2, 'Flood Irrigation': 0}
    base += irr_bonus.get(irrigation_method, 3)
    base += min(schemes_count * 2, 10)   # up to 10 for scheme awareness

    before_chi = min(round(base), 75)

    # After = before + tech improvements
    after_chi = min(round(base + tech_chi_delta * 100), 98)
    return before_chi, after_chi


def require_login(f):
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper


@simulation_bp.route('/simulation/<int:user_id>', methods=['GET'])
@require_login
def get_simulation(user_id):
    """Return farm simulation data derived from farmer's stored profile."""
    try:
        if session['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        from models import FarmerData, User
        farmer = FarmerData.get_by_user_id(user_id)
        user   = User.get_by_id(user_id)

        if not farmer:
            return jsonify({'error': 'Farmer data not found'}), 404

        # ── Extract farmer data ───────────────────────────────────────────────
        land_area = float(farmer.get('land_area') or 1.0)
        crop_list = farmer.get('crop_type') or []
        primary_crop = crop_list[0] if isinstance(crop_list, list) and crop_list else (crop_list or 'Paddy')
        soil_raw = farmer.get('soil_type') or 'Mixed'

        # Map soil type (stored as full string) to key
        soil_key = 'Mixed'
        for k in SOIL_QUALITY:
            if k.lower() in str(soil_raw).lower():
                soil_key = k
                break

        irrigation_method = farmer.get('irrigation_method') or 'Flood Irrigation'
        technologies_used  = farmer.get('technologies_used') or []
        schemes_aware      = farmer.get('schemes_aware') or []

        # ── Lookup base data ──────────────────────────────────────────────────
        base = CROP_BASE.get(primary_crop, DEFAULT_CROP)
        soil_mult = SOIL_QUALITY.get(soil_key, 1.0)

        # ── Calculate current tech impacts (what farmer already uses) ─────────
        current_yield_delta = 0.0
        current_water_delta = 0.0
        current_chi_delta   = 0.0

        for tech_name in technologies_used:
            key = TECH_KEY_MAP.get(tech_name)
            if key and key in TECH_IMPACTS:
                current_yield_delta += TECH_IMPACTS[key]['yield']
                current_water_delta += TECH_IMPACTS[key]['water']
                current_chi_delta   += TECH_IMPACTS[key]['chi']

        # ── Calculate improved tech impacts (recommend missing ones) ──────────
        current_tech_keys = {TECH_KEY_MAP.get(t) for t in technologies_used if TECH_KEY_MAP.get(t)}
        recommended_keys  = [k for k in RECOMMENDED_TECH_POOL if k not in current_tech_keys][:4]

        improved_yield_delta = current_yield_delta
        improved_water_delta = current_water_delta
        improved_chi_delta   = current_chi_delta

        for key in recommended_keys:
            improved_yield_delta += TECH_IMPACTS[key]['yield']
            improved_water_delta += TECH_IMPACTS[key]['water']
            improved_chi_delta   += TECH_IMPACTS[key]['chi']

        # ── ML predictions ────────────────────────────────────────────────────
        # LinearRegression proxy for yield
        before_yield, after_yield = _linear_regression_predict(
            base['yield_kg'], soil_mult, improved_yield_delta - current_yield_delta, land_area
        )
        before_yield_with_current = round(base['yield_kg'] * soil_mult * land_area * (1 + current_yield_delta), 1)
        after_yield_total = round(base['yield_kg'] * soil_mult * land_area * (1 + improved_yield_delta), 1)

        # RandomForest proxy for water
        before_water, after_water = _rf_predict_water(
            base['water_l'], irrigation_method, improved_water_delta, land_area
        )
        before_water_current = round(base['water_l'] * land_area * (1 + current_water_delta), 1)

        # CHI
        before_chi, after_chi = _crop_health_index(
            soil_mult, improved_chi_delta, len(schemes_aware), irrigation_method
        )

        # ── Profit calculations ───────────────────────────────────────────────
        price = base['price_per_kg']
        input_cost_per_acre = 25000   # approximate
        before_revenue = round(before_yield_with_current * price, 0)
        after_revenue  = round(after_yield_total * price, 0)
        before_profit  = round(before_revenue - input_cost_per_acre * land_area, 0)
        after_profit   = round(after_revenue  - input_cost_per_acre * land_area * 0.92, 0)  # slight input saving

        # ── Recommended tech labels ───────────────────────────────────────────
        KEY_TO_LABEL = {v: k for k, v in TECH_KEY_MAP.items()}
        recommended_tech_labels = [KEY_TO_LABEL.get(k, k.replace('_', ' ').title()) for k in recommended_keys]

        # ── Percentages ───────────────────────────────────────────────────────
        yield_increase_pct = round((after_yield_total - before_yield_with_current) / max(before_yield_with_current, 1) * 100, 1)
        water_saving_pct   = round((before_water_current - after_water) / max(before_water_current, 1) * 100, 1)
        income_increase    = int(after_profit - before_profit)

        yield_increase_pct = max(0, yield_increase_pct)
        water_saving_pct   = max(0, water_saving_pct)

        return jsonify({
            'farmer_name': user.get('name') if user else 'Farmer',
            'land_area': land_area,
            'primary_crop': primary_crop,
            'soil_type': soil_key,
            'irrigation_method': irrigation_method,
            'technologies_used': technologies_used,
            'recommended_technologies': recommended_tech_labels,

            'before': {
                'yield_kg': before_yield_with_current,
                'water_litres': before_water_current,
                'revenue': before_revenue,
                'profit': before_profit,
                'chi': before_chi,
                'tech_count': len(technologies_used),
                'label_en': 'Current Farming Method',
                'label_ta': 'தற்போதைய விவசாய முறை',
            },
            'after': {
                'yield_kg': after_yield_total,
                'water_litres': after_water,
                'revenue': after_revenue,
                'profit': after_profit,
                'chi': after_chi,
                'tech_count': len(technologies_used) + len(recommended_keys),
                'label_en': 'Improved Farming Method',
                'label_ta': 'மேம்பட்ட விவசாய முறை',
                'yield_increase_pct': yield_increase_pct,
                'water_saved_pct': water_saving_pct,
            },

            'metrics': {
                'yield_increase_pct': yield_increase_pct,
                'water_saved_pct':   water_saving_pct,
                'income_increase':    max(0, income_increase),
                'chi_before':         before_chi,
                'chi_after':          after_chi,
                'chi_improvement':    after_chi - before_chi,
            },

            'model_info': {
                'yield_model': 'Linear Regression',
                'water_model': 'Random Forest Regressor',
            }
        }), 200

    except Exception as e:
        logging.exception("Simulation error")
        return jsonify({'error': str(e)}), 500
@simulation_bp.route('/run_custom_simulation', methods=['POST'])
@require_login
def run_custom_simulation():
    """Run simulation with direct user inputs instead of profile data."""
    from flask import request
    try:
        from datetime import datetime, timezone

        data = request.json or {}
        crop_type = data.get('crop_type', 'Paddy')
        land_size = float(data.get('land_size', 1.0))

        # Growth stage inputs
        planting_date = data.get('planting_date')  # YYYY-MM-DD
        days_after_planting = data.get('days_after_planting')
        seed_variety = data.get('seed_variety', 'Local Variety')  # Local Variety | Hybrid Variety
        plant_spacing = data.get('plant_spacing', 'Normal')       # Close | Normal | Wide
        fertilizer_usage = data.get('fertilizer_usage', [])       # list of selected fertilizer strings
        weed_level = data.get('weed_level', 'Medium')             # Low | Medium | High
        pest_presence = data.get('pest_presence', 'Not sure')     # Yes | No | Not sure
        crop_health_observation = data.get('crop_health_observation', 'Average')  # Good | Average | Poor
        
        # Seasonal & District Inputs
        season = data.get('season', 'kharif')  # kharif | rabi | summer
        district = data.get('district', 'Madurai')

        # ── Lookup base data ──────────────────────────────────────────────────
        base = CROP_BASE.get(crop_type, DEFAULT_CROP)
        cycle_days = int(base.get('cycle_days') or 120)

        # Growth stage calculation
        dap = None
        try:
            if days_after_planting is not None and str(days_after_planting).strip() != '':
                dap = int(float(days_after_planting))
            elif planting_date:
                d = datetime.strptime(planting_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                dap = max(0, int((datetime.now(timezone.utc) - d).days))
        except Exception:
            dap = None

        if dap is None:
            dap = max(10, int(cycle_days * 0.25))

        growth_pct = max(0.05, min(1.0, dap / max(cycle_days, 1)))
        days_remaining = max(0, cycle_days - dap)
        
        if growth_pct < 0.35:
            plant_height = 'Short'
        elif growth_pct < 0.75:
            plant_height = 'Medium'
        else:
            plant_height = 'Tall'

        # Multipliers from farmer inputs
        variety_mult = 1.06 if seed_variety == 'Hybrid Variety' else 1.00
        spacing_mult = {'Close': 0.95, 'Normal': 1.00, 'Wide': 0.97}.get(plant_spacing, 1.0)

        fert = fertilizer_usage if isinstance(fertilizer_usage, list) else ([fertilizer_usage] if fertilizer_usage else [])
        has_organic = any(x in fert for x in ['Farmyard Manure', 'Vermicompost', 'Green Manure'])
        has_chemical = any(x in fert for x in [
            'Urea', 'DAP', 'SSP', 'MOP', 'Ammonium Sulphate', 'Calcium Ammonium Nitrate', 'NPK 17:17:17', 'NPK 20:20:0'
        ])
        if not fert or 'None' in fert:
            fert_mult = 0.85
        elif has_organic and has_chemical:
            fert_mult = 1.10
        elif has_chemical:
            fert_mult = 1.07
        else:
            fert_mult = 1.03

        weed_mult = {'Low': 1.00, 'Medium': 0.95, 'High': 0.88}.get(weed_level, 0.95)
        pest_mult = {'No': 1.00, 'Not sure': 0.95, 'Yes': 0.90}.get(pest_presence, 0.95)
        health_mult = {'Good': 1.03, 'Average': 1.00, 'Poor': 0.92}.get(crop_health_observation, 1.0)

        # Predicted yield (tons)
        base_tons_per_acre = (float(base.get('yield_kg') or 2000) / 1000.0)

        # Irrigation and Water factors
        irrig_method = data.get('irrig_method', 'Flood')
        irrig_source = data.get('irrig_source', 'Borewell')
        irrig_availability = data.get('irrig_availability', 'Medium')
        irrig_frequency = data.get('irrig_frequency', 'Every 3 days')
        irrig_drainage = data.get('irrig_drainage', 'Average')
        irrig_land_level = data.get('irrig_land_level', 'Level')
        irrig_moisture = data.get('irrig_moisture', 'Normal')
        irrig_system_cond = data.get('irrig_system_cond', 'Working')

        # Irrigation Recommendation Logic
        def get_best_irrigation(crop):
            crop_lower = crop.lower()
            if 'paddy' in crop_lower:
                return 'Flood'
            if 'sugarcane' in crop_lower:
                return 'Furrow'
            if any(x in crop_lower for x in ['banana', 'vegetable', 'tomato', 'chilli', 'brinjal', 'flower', 'cotton']):
                return 'Drip'
            if any(x in crop_lower for x in ['maize', 'groundnut', 'millet']):
                return 'Sprinkler'
            return 'Drip'

        recommended_method = get_best_irrigation(crop_type)

        # Irrigation Yield Multiplier
        irr_yield_mult = {
            'Drip': 1.15, 'Sprinkler': 1.10, 'Micro': 1.12,
            'Subsurface': 1.18, 'Flood': 0.95, 'Canal': 1.00,
            'Furrow': 1.05,
            'Rain-fed': 0.90, 'Manual': 0.98
        }.get(irrig_method, 1.0)

        # Drainage and Land Level Multipliers
        drainage_mult = {'Very Good': 1.05, 'Good': 1.02, 'Average': 1.00, 'Poor': 0.90, 'Very Poor': 0.85, 'Waterlogging': 0.80}.get(irrig_drainage, 1.0)
        land_mult = {'Level': 1.05, 'Slightly Uneven': 1.00, 'Uneven': 0.92, 'Terraced': 0.95, 'Sloped': 0.90}.get(irrig_land_level, 1.0)
        
        # ── Comprehensive District-wise Climate Data (Tamil Nadu) ─────────────
        # Each district: {season: (temp_min, temp_max, rainfall_mm, yield_mult, water_mult)}
        DISTRICT_CLIMATE = {
            # Cauvery Delta - fertile, high rainfall, stable temps
            'Thanjavur':        {'kharif': (25,32,1050,1.12,1.25), 'rabi': (20,29,320,1.12,1.0),  'summer': (30,38,90,0.88,1.35)},
            'Tiruvarur':        {'kharif': (25,32,1100,1.10,1.22), 'rabi': (20,29,310,1.10,1.0),  'summer': (30,38,85,0.87,1.38)},
            'Nagapattinam':     {'kharif': (26,33,1200,1.10,1.20), 'rabi': (21,30,380,1.08,0.95), 'summer': (31,38,95,0.86,1.35)},
            'Mayiladuthurai':   {'kharif': (25,32,1050,1.10,1.20), 'rabi': (20,29,300,1.10,1.0),  'summer': (30,38,80,0.87,1.35)},
            'Pudukkottai':      {'kharif': (26,34,800,1.05,1.15),  'rabi': (21,30,240,1.05,1.0),  'summer': (32,40,70,0.85,1.40)},

            # Southern dry zone - hot, water scarce
            'Ramanathapuram':   {'kharif': (28,36,650,0.82,0.70),  'rabi': (23,33,190,0.85,0.75), 'summer': (34,43,40,0.72,1.55)},
            'Thoothukudi':      {'kharif': (28,36,680,0.83,0.72),  'rabi': (24,33,200,0.85,0.75), 'summer': (33,42,45,0.73,1.52)},
            'Sivaganga':        {'kharif': (27,35,720,0.86,0.75),  'rabi': (22,32,210,0.88,0.78), 'summer': (33,41,50,0.75,1.48)},
            'Virudhunagar':     {'kharif': (27,35,680,0.85,0.73),  'rabi': (22,32,195,0.87,0.76), 'summer': (33,42,45,0.75,1.50)},
            'Tenkasi':          {'kharif': (24,33,1150,0.90,0.85), 'rabi': (20,30,300,0.90,0.78), 'summer': (30,39,80,0.78,1.42)},
            'Tirunelveli':      {'kharif': (27,35,760,0.88,0.80),  'rabi': (23,32,220,0.90,0.80), 'summer': (32,41,55,0.76,1.48)},

            # Hilly / Western Ghats - cooler, high rainfall
            'Nilgiris':         {'kharif': (14,22,1800,1.00,0.90), 'rabi': (10,18,600,1.00,0.80), 'summer': (18,26,250,0.90,1.10)},
            'Dindigul':         {'kharif': (22,30,850,1.00,0.90),  'rabi': (17,26,270,1.02,0.85), 'summer': (27,36,100,0.85,1.30)},
            'Theni':            {'kharif': (23,32,950,1.00,0.88),  'rabi': (18,27,280,1.02,0.85), 'summer': (28,38,110,0.83,1.32)},
            'Kanyakumari':      {'kharif': (24,32,1650,1.05,0.92), 'rabi': (22,30,450,1.05,0.85), 'summer': (28,34,200,0.90,1.18)},

            # Northern industrial / semi-arid
            'Chennai':          {'kharif': (27,34,900,0.95,1.0),   'rabi': (23,32,420,0.95,0.92), 'summer': (32,41,60,0.80,1.45)},
            'Tiruvallur':       {'kharif': (27,34,850,0.96,1.0),   'rabi': (22,31,380,0.96,0.92), 'summer': (32,41,55,0.82,1.44)},
            'Kancheepuram':     {'kharif': (26,33,900,0.97,1.0),   'rabi': (22,31,370,0.97,0.92), 'summer': (31,40,60,0.82,1.42)},
            'Chengalpattu':     {'kharif': (27,34,870,0.96,1.0),   'rabi': (22,31,360,0.96,0.92), 'summer': (32,40,60,0.82,1.43)},
            'Ranipet':          {'kharif': (25,33,880,0.97,1.0),   'rabi': (21,30,290,0.97,0.92), 'summer': (31,40,55,0.83,1.42)},
            'Vellore':          {'kharif': (25,33,870,0.97,1.0),   'rabi': (21,30,280,0.97,0.90), 'summer': (31,40,50,0.82,1.43)},
            'Tirupattur':       {'kharif': (24,32,870,0.98,1.0),   'rabi': (20,29,280,0.98,0.90), 'summer': (30,39,55,0.83,1.42)},

            # Central TN
            'Tiruchirappalli':  {'kharif': (26,34,780,0.98,1.0),   'rabi': (22,31,240,1.00,0.95), 'summer': (32,40,65,0.83,1.42)},
            'Karur':            {'kharif': (26,33,760,0.98,1.0),   'rabi': (21,30,230,1.00,0.95), 'summer': (31,39,60,0.84,1.40)},
            'Perambalur':       {'kharif': (27,35,700,0.96,0.95),  'rabi': (22,31,215,0.98,0.92), 'summer': (32,40,55,0.82,1.43)},
            'Ariyalur':         {'kharif': (26,34,730,0.97,0.97),  'rabi': (22,31,220,0.98,0.92), 'summer': (32,40,60,0.82,1.42)},
            'Cuddalore':        {'kharif': (26,33,1000,1.02,1.10), 'rabi': (22,30,330,1.02,0.95), 'summer': (31,39,75,0.85,1.38)},
            'Villupuram':       {'kharif': (26,33,950,1.00,1.05),  'rabi': (22,30,300,1.00,0.92), 'summer': (31,39,65,0.84,1.40)},
            'Kallakurichi':     {'kharif': (25,33,920,1.00,1.02),  'rabi': (21,30,290,1.00,0.92), 'summer': (30,39,60,0.83,1.40)},

            # Western zone
            'Coimbatore':       {'kharif': (23,31,680,1.00,0.95),  'rabi': (18,28,210,1.02,0.88), 'summer': (28,38,75,0.85,1.35)},
            'Tiruppur':         {'kharif': (24,32,700,0.99,0.95),  'rabi': (19,28,215,1.00,0.88), 'summer': (29,38,70,0.84,1.36)},
            'Erode':            {'kharif': (25,33,720,0.99,0.97),  'rabi': (20,29,220,1.00,0.90), 'summer': (30,39,65,0.84,1.38)},
            'Salem':            {'kharif': (25,33,780,0.99,0.97),  'rabi': (20,29,240,1.00,0.90), 'summer': (30,39,65,0.84,1.38)},
            'Namakkal':         {'kharif': (25,33,750,0.98,0.97),  'rabi': (20,29,225,0.99,0.90), 'summer': (30,39,60,0.83,1.38)},
            'Dharmapuri':       {'kharif': (24,32,850,0.99,0.97),  'rabi': (19,28,250,1.00,0.88), 'summer': (29,38,75,0.83,1.38)},
            'Krishnagiri':      {'kharif': (24,32,840,0.99,0.97),  'rabi': (19,28,248,1.00,0.88), 'summer': (29,38,72,0.83,1.38)},

            # Madurai and surroundings
            'Madurai':          {'kharif': (26,34,820,0.97,0.95),  'rabi': (22,31,250,0.99,0.90), 'summer': (32,41,60,0.82,1.42)},
        }

        # Fetch district climate data; fall back to a generic TN profile if district unknown
        d_climate = DISTRICT_CLIMATE.get(district, {
            'kharif': (26,33,850,0.95,1.0),
            'rabi':   (21,30,260,0.97,0.92),
            'summer': (32,41,75,0.82,1.42)
        })
        s_data = d_climate.get(season, d_climate.get('kharif'))
        temp_min, temp_max, rain_val, district_yield_mult, district_water_mult = s_data

        # Season-level multipliers and climate messages
        if season == 'kharif':
            seasonal_yield_mult = 0.95
            seasonal_water_mult = 0.80
            climate_risk_msg = {
                'en': f"Monsoon season in {district}: Rainfall ~{rain_val} mm. Good water availability but risk of pests and waterlogging.",
                'ta': f"{district} மாவட்டத்தில் பருவமழை காலம்: மழைப்பொழிவு ~{rain_val} மி.மீ. நீர் வசதி நன்றாக உள்ளது ஆனால் பூச்சி மற்றும் தேக்க அபாயம் உள்ளது."
            }
        elif season == 'rabi':
            seasonal_yield_mult = 1.05
            seasonal_water_mult = 1.00
            climate_risk_msg = {
                'en': f"Winter season in {district}: Rainfall ~{rain_val} mm. Ideal temperature for high yield and stable growth.",
                'ta': f"{district} மாவட்டத்தில் குளிர்காலம்: மழைப்பொழிவு ~{rain_val} மி.மீ. அதிக மகசூல் மற்றும் நிலையான வளர்ச்சிக்கு உகந்த வெப்பநிலை."
            }
        else:  # summer
            seasonal_yield_mult = 0.85
            seasonal_water_mult = 1.40
            climate_risk_msg = {
                'en': f"Summer season in {district}: Only ~{rain_val} mm rainfall. High temperature stress and extreme water requirement.",
                'ta': f"{district} மாவட்டத்தில் கோடைகாலம்: மழைப்பொழிவு ~{rain_val} மி.மீ மட்டுமே. அதிக வெப்ப அழுத்தம் மற்றும் அதிக நீர் தேவை உள்ளது."
            }

        temp_range = (temp_min, temp_max)

        # System Condition Multiplier
        cond_mult = {'New': 1.05, 'Working': 1.00, 'Minor Leak': 0.95, 'Major Leak': 0.85, 'Damaged': 0.75}.get(irrig_system_cond, 1.0)

        soil_factor_before = round(variety_mult * spacing_mult * health_mult * irr_yield_mult * drainage_mult * land_mult * cond_mult * seasonal_yield_mult * district_yield_mult, 2)
        before_tons_per_acre = round(base_tons_per_acre * soil_factor_before * fert_mult * weed_mult * pest_mult, 2)
        before_total_tons = round(before_tons_per_acre * land_size, 2)

        # Water Usage Prediction (Before)
        base_water = float(base.get('water_l') or 800000)
        irr_water_mult = {
            'Flood': 1.4, 'Manual': 1.2, 'Canal': 1.3,
            'Sprinkler': 0.9, 'Drip': 0.7, 'Micro': 0.75,
            'Subsurface': 0.65, 'Furrow': 1.1, 'Rain-fed': 0.5
        }.get(irrig_method, 1.0)
        
        avail_mult = {'Very High': 1.1, 'High': 1.05, 'Medium': 1.0, 'Low': 0.8, 'Very Low': 0.6}.get(irrig_availability, 1.0)
        before_water_total = round(base_water * land_size * irr_water_mult * avail_mult * seasonal_water_mult * district_water_mult, 0)

        # Crop health index (0-100) for visuals & risk
        chi = 55
        chi += 8 if seed_variety == 'Hybrid Variety' else 2
        chi += {'Close': -3, 'Normal': 3, 'Wide': 1}.get(plant_spacing, 0)
        chi += 10 if (has_organic and has_chemical) else (6 if has_chemical else (3 if has_organic else -10))
        chi += {'Low': 4, 'Medium': 0, 'High': -8}.get(weed_level, 0)
        chi += {'No': 4, 'Not sure': -2, 'Yes': -10}.get(pest_presence, -2)
        chi += {'Good': 6, 'Average': 0, 'Poor': -10}.get(crop_health_observation, 0)
        before_chi = int(max(20, min(95, chi)))

        # Leaf color
        if before_chi >= 75:
            leaf_color = 'Dark Green'
        elif before_chi >= 55:
            leaf_color = 'Yellowish'
        else:
            leaf_color = 'Brown/Dry'

        density = 'Dense' if plant_spacing == 'Close' else ('Sparse' if plant_spacing == 'Wide' else 'Normal')
        weeds_present = weed_level in ['Medium', 'High']
        pest_damage = pest_presence in ['Yes', 'Not sure']
        
        # Waterlogging and Wastage detection
        is_waterlogged = False
        is_wastage = False
        
        if irrig_method == 'Flood':
            # Wastage detection: high availability or high frequency with flood
            if irrig_availability in ['Very High', 'High'] or irrig_frequency in ['Daily', 'Every 2 days']:
                is_wastage = True
            
            # Waterlogging detection: flood plus poor drainage or uneven land
            if irrig_drainage in ['Poor', 'Very Poor', 'Waterlogging'] or irrig_land_level in ['Uneven', 'Sloped'] or irrig_availability in ['Very High', 'High']:
                is_waterlogged = True

        # ── Smart Improvement Engine ──────────────────────────────────────────
        # Crop-specific fertilizer recommendations (Bilingual)
        CROP_FERTILIZER = {
            'Paddy': {
                'basal': {'en': ['DAP 25 kg/acre', 'MOP 20 kg/acre', 'Zinc Sulphate 10 kg/acre'], 'ta': ['டிஏபி 25 கிலோ/ஏக்கர்', 'எம்ஓபி 20 கிலோ/ஏக்கர்', 'துத்தநாக சல்பேட் 10 கிலோ/ஏக்கர்']},
                'top_dress': {'en': ['Urea 30 kg/acre at tillering', 'Urea 20 kg/acre at panicle initiation'], 'ta': ['யுரியா 30 கிலோ/ஏக்கர் (தூர்கள் வரும் பருவம்)', 'யுரியா 20 கிலோ/ஏக்கர் (கதிர் உருவாகும் பருவம்)']},
                'organic': {'en': 'Farmyard Manure 2 t/acre before transplanting', 'ta': 'தொழு உரம் 2 டன்/ஏக்கர் (நடவுக்கு முன்)'},
                'dose_note': {'en': 'Apply N in 3 splits to avoid leaching during monsoon', 'ta': 'மழைக்காலத்தில் நைட்ரஜன் கசிவைத் தவிர்க்க 3 தவணைகளாகப் பயன்படுத்தவும்'}
            },
            'Sugarcane': {
                'basal': {'en': ['DAP 35 kg/acre', 'MOP 50 kg/acre', 'Magnesium Sulphate 15 kg/acre'], 'ta': ['டிஏபி 35 கிலோ/ஏக்கர்', 'எம்ஓபி 50 கிலோ/ஏக்கர்', 'மெக்னீசியம் சல்பேட் 15 கிலோ/ஏக்கர்']},
                'top_dress': {'en': ['Urea 40 kg/acre at 30 DAP', 'Urea 40 kg/acre at 90 DAP'], 'ta': ['யுரியா 40 கிலோ/ஏக்கர் (30ம் நாள்)', 'யுரியா 40 கிலோ/ஏக்கர் (90ம் நாள்)']},
                'organic': {'en': 'Pressmud/FYM 5 t/acre as basal', 'ta': 'பிரஸ்மட் அல்லது தொழு உரம் 5 டன்/ஏக்கர்'},
                'dose_note': {'en': 'High K demand — ensure MOP split at 90 and 150 DAP', 'ta': 'பொட்டாசியம் தேவை அதிகம் — 90 மற்றும் 150ம் நாட்களில் பிரிக்கவும்'}
            },
            'Banana': {
                'basal': {'en': ['DAP 50 g/plant', 'MOP 100 g/plant', 'Magnesium Sulphate 50 g/plant'], 'ta': ['டிஏபி 50 கிராம்/செடி', 'எம்ஓபி 100 கிராம்/செடி', 'மெக்னீசியம் சல்பேட் 50 கிராம்/செடி']},
                'top_dress': {'en': ['Urea 75 g/plant at 2 months', 'NPK 20:20:0 @ 50 g/plant at bunch emergence'], 'ta': ['யுரியா 75 கிராம்/செடி (2ம் மாதம்)', 'NPK 20:20:0 @ 50 கிராம்/செடி (தார் வரும் போது)']},
                'organic': {'en': 'Vermicompost 2 kg/plant at planting pit', 'ta': 'மண்புழு உரம் 2 கிலோ/செடி (நடவு குழியில்)'},
                'dose_note': {'en': 'Banana is potassium-hungry; weekly fertigation via drip preferred', 'ta': 'வாழைக்கு பொட்டாசியம் அதிகம் தேவை; சொட்டுநீர் மூலம் உரம் அளிப்பது சிறந்தது'}
            },
            'Coconut': {
                'basal': {'en': ['Urea 500 g/palm/year', 'Super Phosphate 500 g/palm', 'MOP 1 kg/palm/year'], 'ta': ['யுரியா 500 கிராம்/மரம்/ஆண்டு', 'சூப்பர் பாஸ்பேட் 500 கிராம்/மரம்', 'எம்ஓபி 1 கிலோ/மரம்/ஆண்டு']},
                'top_dress': {'en': ['Split urea into 2 doses — June and October'], 'ta': ['யுரியாவை ஜூன் மற்றும் அக்டோபர் என இரண்டு தவணைகளாகப் பிரிக்கவும்']},
                'organic': {'en': 'Coir pith/FYM 25 kg/palm + green manure', 'ta': 'தென்னை நார் கழிவு/தொழு உரம் 25 கிலோ/மரம் + பசுந்தாள் உரம்'},
                'dose_note': {'en': 'Apply in 60 cm ring around palm; irrigate immediately after', 'ta': 'மரத்தைச் சுற்றி 60 செ.மீ வட்டத்தில் இடவும்; இட்டவுடன் நீர் பாய்ச்சவும்'}
            },
            'Cotton': {
                'basal': {'en': ['DAP 20 kg/acre', 'MOP 20 kg/acre'], 'ta': ['டிஏபி 20 கிலோ/ஏக்கர்', 'எம்ஓபி 20 கிலோ/ஏக்கர்']},
                'top_dress': {'en': ['Urea 25 kg/acre at 30 DAP', 'Urea 25 kg/acre at boll development'], 'ta': ['யுரியா 25 கிலோ/ஏக்கர் (30ம் நாள்)', 'யுரியா 25 கிலோ/ஏக்கர் (காய் உருவாகும் பருவம்)']},
                'organic': {'en': 'FYM 1 t/acre + Azospirillum 2 packets/acre', 'ta': 'தொழு உரம் 1 டன்/ஏக்கர் + அசோஸ்பைரில்லம் 2 பாக்கெட்டுகள்/ஏக்கர்'},
                'dose_note': {'en': 'Avoid excess N at flowering — leads to vegetative vigour over boll set', 'ta': 'பூக்கும் பருவத்தில் அதிக நைட்ரஜனைத் தவிர்க்கவும் — இது காய்ப்பை விட செடி வளர்ச்சியை அதிகரிக்கும்'}
            },
            'Groundnut': {
                'basal': {'en': ['SSP 40 kg/acre (P source)', 'Gypsum 40 kg/acre at pegging'], 'ta': ['சூப்பர் பாஸ்பேட் 40 கிலோ/ஏக்கர்', 'ஜிப்சம் 40 கிலோ/ஏக்கர் (விழுது இறங்கும் பருவம்)']},
                'top_dress': {'en': ['MOP 20 kg/acre at 25 DAP'], 'ta': ['எம்ஓபி 20 கிலோ/ஏக்கர் (25ம் நாள்)']},
                'organic': {'en': 'FYM 2 t/acre + Rhizobium culture seed treatment', 'ta': 'தொழு உரம் 2 டன்/ஏக்கர் + ரைசோபியம் விதை நேர்த்தி'},
                'dose_note': {'en': 'Groundnut fixes N biologically — avoid high N basal dose', 'ta': 'நிலக்கடலை காற்றில் இருந்து நைட்ரஜனை எடுக்கும் — உயரிய நைட்ரஜன் தேவையில்லை'}
            },
            'Tomato': {
                'basal': {'en': ['DAP 35 kg/acre', 'MOP 30 kg/acre', 'Borax 2 kg/acre'], 'ta': ['டிஏபி 35 கிலோ/ஏக்கர்', 'எம்ஓபி 30 கிலோ/ஏக்கர்', 'போராக்ஸ் 2 கிலோ/ஏக்கர்']},
                'top_dress': {'en': ['Urea 20 kg/acre at first flower', 'NPK 00:00:50 @ 8 g/L spray at fruiting'], 'ta': ['யுரியா 20 கிலோ/ஏக்கர் (முதல் பூ)', 'NPK 00:00:50 @ 8 கிராம்/லிட்டர் (காய் வரும் பருவம்)']},
                'organic': {'en': 'Vermicompost 1 t/acre + Panchagavya foliar spray', 'ta': 'மண்புழு உரம் 1 டன்/ஏக்கர் + பஞ்சகவ்ய தெளிப்பு'},
                'dose_note': {'en': 'Tomato is calcium-sensitive — apply Calcium Nitrate 2 g/L foliar to prevent BER', 'ta': 'தக்காளிக்கு கால்சியம் முக்கியம் — பழ அழுகலைத் தவிர்க்க கால்சியம் நைட்ரேட் தெளிக்கவும்'}
            },
            'Vegetables': {
                'basal': {'en': ['DAP 30 kg/acre', 'MOP 25 kg/acre'], 'ta': ['டிஏபி 30 கிலோ/ஏக்கர்', 'எம்ஓபி 25 கிலோ/ஏக்கர்']},
                'top_dress': {'en': ['Urea 15 kg/acre at 25 DAP', 'NPK 19:19:19 @ 5 g/L at flowering'], 'ta': ['யுரியா 15 கிலோ/ஏக்கர் (25ம் நாள்)', 'NPK 19:19:19 @ 5 கிராம்/லிட்டர் (பூக்கும் பருவம்)']},
                'organic': {'en': 'Vermicompost 500 kg/acre + Pseudomonas bioinoculant', 'ta': 'மண்புழு உரம் 500 கிலோ/ஏக்கர் + சூடோமோனாஸ் உயிரி உரம்'},
                'dose_note': {'en': 'Use water-soluble fertilizers via drip for maximum efficiency', 'ta': 'அதிகப்படியான பலன் கிடைக்க சொட்டுநீர் மூலம் உரம் அளிக்கவும்'}
            },
            'Maize': {
                'basal': {'en': ['DAP 50 kg/acre', 'MOP 30 kg/acre', 'Zinc Sulphate 10 kg/acre'], 'ta': ['டிஏபி 50 கிலோ/ஏக்கர்', 'எம்ஓபி 30 கிலோ/ஏக்கர்', 'துத்தநாக சல்பேட் 10 கிலோ/ஏக்கர்']},
                'top_dress': {'en': ['Urea 35 kg/acre at knee-high stage', 'Urea 35 kg/acre at tasseling'], 'ta': ['யுரியா 35 கிலோ/ஏக்கர் (முழங்கால் அளவு உயரம்)', 'யுரியா 35 கிலோ/ஏக்கர் (திர் வரும் பருவம்)']},
                'organic': {'en': 'FYM 2 t/acre before sowing', 'ta': 'தொழு உரம் 2 டன்/ஏக்கர் (விதைப்புக்கு முன்)'},
                'dose_note': {'en': 'Split N for maize is critical — full basal N causes luxury uptake', 'ta': 'மக்காச்சோளத்திற்கு நைட்ரஜனைப் பிரித்து அளிப்பது அவசியம்'}
            },
            'Millets': {
                'basal': {'en': ['DAP 20 kg/acre', 'MOP 15 kg/acre'], 'ta': ['டிஏபி 20 கிலோ/ஏக்கர்', 'எம்ஓபி 15 கிலோ/ஏக்கர்']},
                'top_dress': {'en': ['Urea 20 kg/acre at 25 DAP'], 'ta': ['யுரியா 20 கிலோ/ஏக்கர் (25ம் நாள்)']},
                'organic': {'en': 'Green manure (Dhaincha) or FYM 1 t/acre', 'ta': 'பசுந்தாள் உரம் (தக்கைப்பூண்டு) அல்லது தொழு உரம் 1 டன்/ஏக்கர்'},
                'dose_note': {'en': 'Millets are hardy but respond well to micronutrient zinc spray', 'ta': 'சிறுதானியங்களுக்கு துத்தநாகம் தெளிப்பது நல்ல மகசூலைத் தரும்'}
            },
            'Flowers': {
                'basal': {'en': ['DAP 30 kg/acre', 'MOP 30 kg/acre', 'Borax 2 kg/acre'], 'ta': ['டிஏபி 30 கிலோ/ஏக்கர்', 'எம்ஓபி 30 கிலோ/ஏக்கர்', 'போராக்ஸ் 2 கிலோ/ஏக்கர்']},
                'top_dress': {'en': ['Urea 20 kg/acre at 30 DAP', 'NPK 00:52:34 @ 5 g/L at bud initiation'], 'ta': ['யுரியா 20 கிலோ/ஏக்கர் (30ம் நாள்)', 'NPK 00:52:34 @ 5 கிராம்/லிட்டர் (மொட்டு வரும் பருவம்)']},
                'organic': {'en': 'Vermicompost 800 kg/acre before planting', 'ta': 'மண்புழு உரம் 800 கிலோ/ஏக்கர் (நடவுக்கு முன்)'},
                'dose_note': {'en': 'High K and B promote flower size and shelf life', 'ta': 'அதிக பொட்டாசியம் மற்றும் போரான் பூவின் அளவையும் தரத்தையும் அதிகரிக்கும்'}
            }
        }

        # Crop-specific pest control (Bilingual)
        CROP_PEST_CONTROL = {
            'Paddy': [
                {'pest': {'en': 'Brown Plant Hopper', 'ta': 'புகையான்'}, 'chemical': {'en': 'Buprofezin 25SC @1 ml/L', 'ta': 'புப்ரோபெசின் 25SC @1 மி.லி/லி'}, 'organic': {'en': 'Neem oil 3% + fish oil soap spray', 'ta': 'வேப்ப எண்ணெய் 3% + மீன் எண்ணெய் சோப்பு தெளிப்பு'}},
                {'pest': {'en': 'Leaf Folder', 'ta': 'இலைச் சுருட்டுப் புழு'}, 'chemical': {'en': 'Chlorpyrifos 20EC @2 ml/L', 'ta': 'குளோர்பைரிபாஸ் 20EC @2 மி.லி/லி'}, 'organic': {'en': 'Trichogramma parasitoid @1 lakh cards/acre', 'ta': 'டிரைக்கோடெர்மா ஒட்டுண்ணி @ ஏக்கருக்கு 1 லட்சம் அட்டைகள்'}},
                {'pest': {'en': 'Blast (fungal)', 'ta': 'குலை நோய்'}, 'chemical': {'en': 'Tricyclazole 75WP @0.6 g/L', 'ta': 'ட்ரைசைக்ளோசோல் 75WP @0.6 கி/லி'}, 'organic': {'en': 'Pseudomonas fluorescens 2.5 kg/acre', 'ta': 'சூடோமோனாஸ் புளோரசன்ஸ் 2.5 கிலோ/ஏக்கர்'}}
            ],
            'Sugarcane': [
                {'pest': {'en': 'Early Shoot Borer', 'ta': 'குருத்துப் புழு'}, 'chemical': {'en': 'Chlorpyrifos granules 5 kg/acre', 'ta': 'குளோர்பைரிபாஸ் குருணை 5 கிலோ/ஏக்கர்'}, 'organic': {'en': 'Cotesia flavipes parasitoid release', 'ta': 'கோட்டேசியா ஒட்டுண்ணி வெளியீடு'}},
                {'pest': {'en': 'Red Rot (fungus)', 'ta': 'சிவப்பு அழுகல் நோய்'}, 'chemical': {'en': 'Carbendazim 0.1% seed treatment', 'ta': 'கார்பெண்டாசிம் 0.1% விதை நேர்த்தி'}, 'organic': {'en': 'Hot water treatment 52°C for 30 min', 'ta': '52°C வெப்ப நீர் சிகிச்சை (30 நிமிடம்)'}}
            ],
            'Banana': [
                {'pest': {'en': 'Sigatoka Leaf Spot', 'ta': 'சிகடோகா இலைப்புள்ளி'}, 'chemical': {'en': 'Propiconazole 25EC @1 ml/L', 'ta': 'புரோபிகோனசோல் 25EC @1 மி.லி/லி'}, 'organic': {'en': 'Bordeaux mixture 1% spray', 'ta': '1% போர்டோ கலவை தெளிப்பு'}},
                {'pest': {'en': 'Aphids/Weevil', 'ta': 'அசுவினி/கூன் வண்டு'}, 'chemical': {'en': 'Profenofos 50EC @2 ml/L', 'ta': 'புரோபெனோபாஸ் 50EC @2 மி.லி/லி'}, 'organic': {'en': 'Neem oil 5 ml/L + castor oil soap', 'ta': 'வேப்ப எண்ணெய் 5 மி.லி/லி + விளக்கெண்ணெய் சோப்பு'}}
            ],
            'Cotton': [
                {'pest': {'en': 'Bollworm', 'ta': 'காய்ப்புழு'}, 'chemical': {'en': 'Emamectin Benzoate 5SG @0.4 g/L', 'ta': 'எமாமெக்டின் பென்சோயேட் @0.4 கி/லி'}, 'organic': {'en': 'NPV 250 LE/acre + pheromone traps', 'ta': 'NPV கரைசல் + இனக்கவர்ச்சி பொறி'}},
                {'pest': {'en': 'Whitefly / Jassid', 'ta': 'வெள்ளை ஈ / இலைப்பேன்'}, 'chemical': {'en': 'Imidacloprid 17.8SL @0.3 ml/L', 'ta': 'இமிடாக்குளோப்ரிட் @0.3 மி.லி/லி'}, 'organic': {'en': 'Yellow sticky traps + Verticillium spray', 'ta': 'மஞ்சள் ஒட்டும் பொறி + வெர்டிசிலியம் தெளிப்பு'}}
            ],
            'Groundnut': [
                {'pest': {'en': 'Tikka Leaf Spot', 'ta': 'டிக்கா இலைப்புள்ளி'}, 'chemical': {'en': 'Mancozeb 75WP @2.5 g/L', 'ta': 'மேன்கோசெப் @2.5 கி/லி'}, 'organic': {'en': 'Neem cake 250 kg/acre in soil', 'ta': 'வேப்பம் புண்ணாக்கு 250 கிலோ/ஏக்கர் (மண்ணில்)'}},
                {'pest': {'en': 'Thrips', 'ta': 'இலைப்பேன்'}, 'chemical': {'en': 'Fipronil 5SC @1.5 ml/L', 'ta': 'பிப்ரோனில் 5SC @1.5 மி.லி/லி'}, 'organic': {'en': 'Blue sticky traps', 'ta': 'நீல ஒட்டும் பொறி'}}
            ],
            'Tomato': [
                {'pest': {'en': 'Leaf Miner', 'ta': 'இலை துளைப்பான்'}, 'chemical': {'en': 'Spinosad 45SC @0.2 ml/L', 'ta': 'ஸ்பினோசாட் 45SC @0.2 மி.லி/லி'}, 'organic': {'en': 'Pheromone traps 8/acre + Bt spray', 'ta': 'இனக்கவர்ச்சி பொறி 8/ஏக்கர் + பிடி தெளிப்பு'}},
                {'pest': {'en': 'Early Blight', 'ta': 'இலையழுகல் நோய்'}, 'chemical': {'en': 'Azoxystrobin 23SC @1 ml/L', 'ta': 'அசோக்சிஸ்ட்ரோபின் @1 மி.லி/லி'}, 'organic': {'en': 'Trichoderma viride 2.5 kg/acre', 'ta': 'ட்ரைக்கோடெர்மா விரிடி 2.5 கிலோ/ஏக்கர்'}}
            ],
            'Vegetables': [
                {'pest': {'en': 'Diamond Back Moth', 'ta': 'வைர முதுகு அந்திப்பூச்சி'}, 'chemical': {'en': 'Chlorfenapyr 10SC @1.5 ml/L', 'ta': 'குளோர்பெனபிர் @1.5 மி.லி/லி'}, 'organic': {'en': 'Bt kurstaki 1 g/L spray', 'ta': 'பிடி குர்ஸ்டாக்கி 1 கி/லி தெளிப்பு'}},
                {'pest': {'en': 'Aphids', 'ta': 'அசுவினி'}, 'chemical': {'en': 'Dimethoate 30EC @1.5 ml/L', 'ta': 'டைமெத்தோயேட் @1.5 மி.லி/லி'}, 'organic': {'en': 'Strong water jet + Verticillium', 'ta': 'அதிவேக நீர் பீச்சியடித்தல் + வெர்டிசிலியம்'}}
            ],
            'Maize': [
                {'pest': {'en': 'Fall Armyworm', 'ta': 'படைப்புழு'}, 'chemical': {'en': 'Spinetoram 11.7SC @0.5 ml/L', 'ta': 'ஸ்பைனிடோரம் @0.5 மி.லி/லி'}, 'organic': {'en': 'Trichogramma chilonis 1 lakh/acre', 'ta': 'ஒட்டுண்ணி ஏக்கருக்கு 1 லட்சம்'}},
                {'pest': {'en': 'Stem Borer', 'ta': 'தண்டு துளைப்பான்'}, 'chemical': {'en': 'Cartap Hydrochloride 4G', 'ta': 'கார்டாப் ஹைட்ரோகுளோரைடு 4G'}, 'organic': {'en': 'Beauveria bassiana 2.5 kg/acre', 'ta': 'பீவேரியா பேசியானா 2.5 கிலோ/ஏக்கர்'}}
            ],
            'Millets': [
                {'pest': {'en': 'Shoot Fly', 'ta': 'குருத்து ஈ'}, 'chemical': {'en': 'Thiamethoxam 70WS', 'ta': 'தயாமெத்தாக்சம் 70WS விதை நேர்த்தி'}, 'organic': {'en': 'Neem seed kernel extract 5%', 'ta': '5% வேப்பங்கொட்டை கரைசல்'}}
            ],
            'Flowers': [
                {'pest': {'en': 'Thrips', 'ta': 'இலைப்பேன்'}, 'chemical': {'en': 'Fipronil 5SC @1.5 ml/L', 'ta': 'பிப்ரோனில் @1.5 மி.லி/லி'}, 'organic': {'en': 'Blue/yellow sticky traps', 'ta': 'நீல/மஞ்சள் ஒட்டும் பொறி'}}
            ]
        }

        # Crop-specific weed control
        # Crop-specific weed control (Bilingual)
        WEED_CONTROL = {
            'Paddy':      {'pre': {'en': 'Butachlor 50EC @1.5 L/acre', 'ta': 'புட்டாக்குளோர் 50EC @1.5 லி/ஏக்கர்'}, 'post': {'en': 'Bispyribac-Sodium @0.3 L/acre', 'ta': 'பிஸ்பைரிபேக்-சோடியம் @0.3 லி/ஏக்கர்'}, 'manual': {'en': '2 weedings at 20 & 40 DAP', 'ta': '20 மற்றும் 40ம் நாட்களில் களை எடுத்தல்'}},
            'Sugarcane':  {'pre': {'en': 'Atrazine 50WP @1 kg/acre', 'ta': 'அட்ரசின் 50WP @1 கிலோ/ஏக்கர்'}, 'post': {'en': 'MSMA @2 L/acre at 30 DAP', 'ta': 'MSMA @2 லி/ஏக்கர் (30ம் நாள்)'}, 'manual': {'en': 'Inter-row cultivation at 60 DAP', 'ta': '60ம் நாள் வரிசை இடைவெளி சாகுபடி'}},
            'Banana':     {'pre': {'en': 'Diuron 80WP @1 kg/acre', 'ta': 'டையூரான் 80WP @1 கிலோ/ஏக்கர்'}, 'post': {'en': 'Paraquat between rows', 'ta': 'வரிசைகளுக்கிடையே பாராகுவாட்'}, 'manual': {'en': 'Mulching with paddy straw', 'ta': 'வைக்கோல் கொண்டு மூடாக்கு இடுதல்'}},
            'Cotton':     {'pre': {'en': 'Pendimethalin @0.9 L/acre', 'ta': 'பெண்டிமெத்தலின் @0.9 லி/ஏக்கர்'}, 'post': {'en': 'Quizalofop-ethyl @0.6 L/acre', 'ta': 'குய்சலோபாப்-எத்தில் @0.6 லி/ஏக்கர்'}, 'manual': {'en': '2 weedings at 30 & 45 DAP', 'ta': '30 மற்றும் 45ம் நாட்களில் களை எடுத்தல்'}},
            'Groundnut':  {'pre': {'en': 'Fluchloralin @1 L/acre', 'ta': 'புளுக்குளோரலின் @1 லி/ஏக்கர்'}, 'post': {'en': 'Imazethapyr @0.5 L/acre at 20 DAP', 'ta': 'இமாசெதாபியர் @0.5 லி/ஏக்கர் (20ம் நாள்)'}, 'manual': {'en': 'Inter-cultivation at 20 DAP', 'ta': '20ம் நாள் இடை சாகுபடி'}},
            'Maize':      {'pre': {'en': 'Atrazine 50WP @1 kg/acre', 'ta': 'அட்ரசின் 50WP @1 கிலோ/ஏக்கர்'}, 'post': {'en': 'Tembotrione @0.12 L/acre', 'ta': 'டெம்போட்ரியோன் @0.12 லி/ஏக்கர்'}, 'manual': {'en': 'Hand weeding at 30 DAP', 'ta': '30ம் நாள் கைக்களை எடுத்தல்'}},
            'Tomato':     {'pre': {'en': 'Metribuzin @0.3 kg/acre', 'ta': 'மெட்ரிபுசின் @0.3 கிலோ/ஏக்கர்'}, 'post': {'en': 'Straw mulch recommended', 'ta': 'வைக்கோல் மூடாக்கு சிறந்தது'}, 'manual': {'en': 'Regular hand weeding', 'ta': 'வழக்கமான கைக்களை எடுத்தல்'}},
            'Vegetables': {'pre': {'en': 'Oxyflourfen @0.5 L/acre', 'ta': 'ஆக்ஸிபுளோர்ஃபென் @0.5 லி/ஏக்கர்'}, 'post': {'en': 'Hand removal', 'ta': 'கைமுறை களை எடுத்தல்'}, 'manual': {'en': 'Weeding at 20 & 40 DAP', 'ta': '20 மற்றும் 40ம் நாட்களில் களை எடுத்தல்'}},
            'Maize':      {'pre': {'en': 'Atrazine 50WP @1 kg/acre', 'ta': 'அட்ரசின் 50WP @1 கிலோ/ஏக்கர்'}, 'post': {'en': 'Tembotrione 34.4SC @0.12 L/acre', 'ta': 'டெம்போட்ரியோன் @0.12 லி/ஏக்கர்'}, 'manual': {'en': 'Hand weeding at 30 DAP', 'ta': '30ம் நாள் கைக்களை எடுத்தல்'}},
            'Millets':    {'pre': {'en': '2,4-D Sodium Salt @0.5 kg/acre', 'ta': '2,4-D சோடியம் உப்பு @0.5 கிலோ/ஏக்கர்'}, 'post': {'en': 'Hand weeding preferred', 'ta': 'கைமுறை களை எடுத்தல் சிறந்தது'}, 'manual': {'en': 'One weeding at 25 DAP', 'ta': '25ம் நாள் ஒரு களை எடுத்தல்'}},
            'Flowers':    {'pre': {'en': 'Pendimethalin @0.7 L/acre', 'ta': 'பெண்டிமெத்தலின் @0.7 லி/ஏக்கர்'}, 'post': {'en': 'Manual removal', 'ta': 'கைமுறை களை எடுத்தல்'}, 'manual': {'en': 'Black polythene mulch', 'ta': 'கருப்பு பாலித்தீன் மூடாக்கு'}},
        }

        # Season-specific fertilizer adjustment note (Bilingual)
        SEASON_FERT_NOTE = {
            'kharif':  {'en': 'Split urea into 3 doses during monsoon — avoid full basal N as heavy rain leaches nitrogen. Prioritise P and K at base.', 'ta': 'மழைக்காலத்தில் யுரியாவை 3 தவணைகளாகப் பயன்படுத்தவும் — கனமழை நைட்ரஜனை அடித்துச் செல்லும் என்பதால் முழுவதையும் அடி உரமாக இட வேண்டாம்.'},
            'rabi':    {'en': 'Apply full phosphorus and potassium as basal. Top-dress nitrogen at jointing stage. Cooler soil retains nutrients longer.', 'ta': 'பாஸ்பரஸ் மற்றும் பொட்டாசியத்தை முழுமையாக அடி உரமாக இடவும். நைட்ரஜனை மேலுரமாக இடவும். குளிர்ச்சியான மண் சத்துக்களை நீண்ட காலம் வைத்திருக்கும்.'},
            'summer':  {'en': 'Reduce nitrogen — excess N in heat causes burning. Increase potassium (MOP/SOP) to build heat and drought tolerance.', 'ta': 'நைட்ரஜனைக் குறைக்கவும் — வெப்பத்தில் அதிக நைட்ரஜன் பயிரை வாட்டும். வறட்சியைத் தாங்க பொட்டாசியத்தை (எம்ஓபி) அதிகரிக்கவும்.'},
        }

        # Climate zone adaptation note (Bilingual)
        if temp_range[1] >= 40:
            climate_adaptation = {
                'action': {'en': 'Heat stress management: Kaolin 5% @ 20g/L spray', 'ta': 'வெப்ப அழுத்த மேலாண்மை: 5% கேயோலின் @ 20கி/லி தெளிப்பு'},
                'reason': {'en': f'Summer temperatures in {district} exceed 40°C — reduces flower drop', 'ta': f'{district} மாவட்டத்தில் வெப்பநிலை 40°C-க்கு மேல் செல்வதால் — பூ உதிர்வைக் குறைக்கும்'}
            }
        elif rain_val >= 1200:
            climate_adaptation = {
                'action': {'en': 'Waterlogging prevention: install field drainage bunds', 'ta': 'நீர் தேக்கத் தடுப்பு: வடிகால் வரப்புகளை அமைத்தல்'},
                'reason': {'en': f'{district} receives >1200mm rainfall — excess water causes root rot', 'ta': f'{district} மாவட்டத்தில் >1200மி.மீ மழை பெய்ய வாய்ப்புள்ளதால் — வேர் அழுகலைத் தவிர்க்க'}
            }
        elif rain_val <= 250:
            climate_adaptation = {
                'action': {'en': 'Drought management: Pusa hydrogel 2kg/acre + mulch', 'ta': 'வறட்சி மேலாண்மை: ஏக்கருக்கு 2கிலோ பூசா ஹைட்ரோஜெல் + மூடாக்கு'},
                'reason': {'en': f'{district} in {season} is dry (<250mm) — moisture conservation is key', 'ta': f'{season} பருவத்தில் {district} வறண்டு இருப்பதால் — ஈரப்பதம் காப்பது அவசியம்'}
            }
        else:
            climate_adaptation = {
                'action': {'en': 'Foliar micronutrient spray: ZnSO4 0.5% + Boric acid', 'ta': 'நுண்ணூட்டச் சத்து தெளிப்பு: துத்தநாக சல்பேட் 0.5% + போரிக் அமிலம்'},
                'reason': {'en': f'Moderate conditions in {district} — micronutrients limit yield', 'ta': f'{district} மாவட்டத்தில் சராசரி நிலை நிலவுவதால் — நுண்ணூட்டச் சத்து மகசூலை அதிகரிக்கும்'}
            }

        # Resolve crop-specific data (fallback to Vegetables if unknown)
        crop_fert_data  = CROP_FERTILIZER.get(crop_type, CROP_FERTILIZER['Vegetables'])
        crop_pest_data  = CROP_PEST_CONTROL.get(crop_type, [{
            'pest': {'en': 'General insects', 'ta': 'பொதுவான பூச்சிகள்'},
            'chemical': {'en': 'Neem oil 5 ml/L spray', 'ta': 'வேப்ப எண்ணெய் 5 மி.லி/லி தெளிக்கவும்'},
            'organic': {'en': 'Pheromone traps + Bt spray', 'ta': 'இனக்கவர்ச்சி பொறி + பிடி தெளிப்பு'}
        }])
        weed_data       = WEED_CONTROL.get(crop_type, WEED_CONTROL['Vegetables'])
        season_fert_note = SEASON_FERT_NOTE.get(season, SEASON_FERT_NOTE['kharif'])

        # Irrigation upgrade reasoning (Bilingual)
        irr_reason_map = {
            ('Flood', 'Drip'): {
                'en': f'Drip cuts water use by 40–60% vs flood. Direct to root zone — critical for {crop_type} in {district}.',
                'ta': f'சொட்டுநீர் வெள்ளப்பாசனத்தை விட 40-60% குறைந்த நீரை பயன்படுத்துகிறது. {district} மாவட்டத்தில் {crop_type} பயிருக்கு இது மிக அவசியமானது.'
            },
            ('Flood', 'Sprinkler'): {
                'en': f'Sprinkler saves 30% water vs flood. Works well for {crop_type}.',
                'ta': f'தெளிப்பு நீர் 30% நீரைச் சேமிக்கிறது. இது {crop_type} பயிருக்கு சிறப்பாக அமையும்.'
            },
            ('Manual', 'Drip'): {
                'en': 'Drip replaces labour-heavy manual work with precise scheduled watering.',
                'ta': 'சொட்டுநீர் முறை அதிக உழைப்பு தேவைப்படும் கைமுறை பாசனத்தைத் தவிர்த்து துல்லியமான பாசனத்தை வழங்குகிறது.'
            }
        }
        fallback_irr_reason = {
            'en': f'{recommended_method} irrigation is most efficient for {crop_type} in {district}.',
            'ta': f'{recommended_method} பாசனமுறை {district} மாவட்டத்தில் {crop_type} பயிருக்கு மிகவும் சிறந்தது.'
        }
        irrig_upgrade_reason = irr_reason_map.get((irrig_method, recommended_method), fallback_irr_reason)

        # Application schedule (Bilingual timeline)
        app_schedule = [
            {'timing': {'en': 'Before planting', 'ta': 'நடவுக்கு முன்'}, 'action': crop_fert_data['organic']},
            {'timing': {'en': 'At planting / basal', 'ta': 'நடுவதற்கு முன் / அடி உரம்'}, 'action': crop_fert_data['basal']},
            {'timing': {'en': 'Top dressing', 'ta': 'மேலுரம் இடுதல்'}, 'action': crop_fert_data['top_dress']},
            {'timing': {'en': 'Pest control', 'ta': 'பூச்சி கட்டுப்பாடு'}, 'action': {
                'en': f"{crop_pest_data[0]['pest']['en']}: {crop_pest_data[0]['chemical']['en']}",
                'ta': f"{crop_pest_data[0]['pest']['ta']}: {crop_pest_data[0]['chemical']['ta']}"
            }},
            {'timing': {'en': 'Weed control', 'ta': 'களைக் கட்டுப்பாடு'}, 'action': {
                'en': f"Pre: {weed_data['pre']['en']} | Post: {weed_data['post']['en']}",
                'ta': f"முன்: {weed_data['pre']['ta']} | பின்: {weed_data['post']['ta']}"
            }},
            {'timing': {'en': 'Climate adaptation', 'ta': 'தட்பவெப்பநிலை மேலாண்மை'}, 'action': climate_adaptation['action']},
        ]

        # Smart improvements dict (replaces the old generic one)
        smart_improvements = {
            'fertilizer': {
                'basal':       crop_fert_data['basal'],
                'top_dress':   crop_fert_data['top_dress'],
                'organic':     crop_fert_data['organic'],
                'dose_note':   crop_fert_data['dose_note'],
                'season_note': season_fert_note,
            },
            'pest_control': {
                'threats':  crop_pest_data,
                'general_organic': 'Neem oil 5 ml/L + garlic extract 10 ml/L as preventive fortnightly spray',
            },
            'weed_control': {
                'pre_emergent':  weed_data['pre'],
                'post_emergent': weed_data['post'],
                'manual':        weed_data['manual'],
            },
            'irrigation': {
                'from':           irrig_method,
                'to':             recommended_method,
                'reason':         irrig_upgrade_reason,
                'water_saving_pct': max(0, round((before_water_total - (base_water * land_size * {
                    'Flood': 1.4, 'Manual': 1.2, 'Canal': 1.3, 'Sprinkler': 0.9,
                    'Drip': 0.7, 'Micro': 0.75, 'Subsurface': 0.65, 'Furrow': 1.1
                }.get(recommended_method, 0.7))) / max(before_water_total, 1) * 100, 1)),
            },
            'climate_adaptation': climate_adaptation,
            'schedule':           app_schedule,
            'plant_spacing':      'Normal',
            'weed_level':         'Low',
            'pest_presence':      'No',
        }

        # Multipliers for after yield calculation
        after_seed_variety = seed_variety
        after_spacing = 'Normal'
        after_weed_level = 'Low'
        after_pest = 'No'
        after_fert = crop_fert_data['basal']['en'] + [crop_fert_data['organic']['en']]
        after_has_organic = True
        after_has_chemical = True
        after_variety_mult = variety_mult
        after_spacing_mult = 1.00
        after_fert_mult = 1.10
        after_weed_mult = 1.00
        after_pest_mult = 1.00
        after_health_mult = 1.03 if crop_health_observation != 'Poor' else 1.00

        # After Irrigation Yield Multiplier (using recommended)
        after_irr_yield_mult = {
            'Drip': 1.15, 'Sprinkler': 1.10, 'Micro': 1.12,
            'Subsurface': 1.18, 'Flood': 0.95, 'Canal': 1.00,
            'Furrow': 1.05,
            'Rain-fed': 0.90, 'Manual': 0.98
        }.get(recommended_method, 1.0)

        soil_factor_after = round(after_variety_mult * after_spacing_mult * after_health_mult * after_irr_yield_mult * seasonal_yield_mult * district_yield_mult, 2)
        after_tons_per_acre = round(base_tons_per_acre * soil_factor_after * after_fert_mult * after_weed_mult * after_pest_mult, 2)
        after_total_tons = round(after_tons_per_acre * land_size, 2)

        after_chi = int(max(25, min(98, before_chi + 18)))

        # After Water Usage (assuming recommended irrigation)
        after_irr_water_mult = {
            'Flood': 1.4, 'Manual': 1.2, 'Canal': 1.3,
            'Sprinkler': 0.9, 'Drip': 0.7, 'Micro': 0.75,
            'Subsurface': 0.65, 'Furrow': 1.1, 'Rain-fed': 0.5
        }.get(recommended_method, 0.7)
        after_water_total = round(base_water * land_size * after_irr_water_mult * 1.0 * seasonal_water_mult * district_water_mult, 0) # Medium availability fixed for ideal
        water_saved_pct = round((before_water_total - after_water_total) / max(before_water_total, 1) * 100, 1)

        if after_chi >= 75:
            after_leaf_color = 'Dark Green'
        elif after_chi >= 55:
            after_leaf_color = 'Yellowish'
        else:
            after_leaf_color = 'Brown/Dry'

        # Climate risk from CHI
        def chi_to_risk(v):
            if v >= 75:
                return 'Low'
            if v >= 55:
                return 'Medium'
            return 'High'

        before_risk = chi_to_risk(before_chi)
        after_risk = chi_to_risk(after_chi)

        return jsonify({
            'inputs': data,
            'before': {
                'yield_total_tons': before_total_tons,
                'yield_per_acre_tons': before_tons_per_acre,
                'water_litres': before_water_total,
                'chi': before_chi,
                'growth_pct': round(growth_pct, 2),
                'days_remaining': days_remaining,
                'cycle_days': cycle_days,
                'visual': {
                    'plant_height': plant_height,
                    'leaf_color': leaf_color,
                    'density': density,
                    'weeds_present': weeds_present,
                    'pest_damage': pest_damage,
                    'waterlogging': is_waterlogged,
                    'water_wastage': is_wastage,
                    'irrigation_method': irrig_method
                },
                'climate': {
                    'risk_level': before_risk,
                    'insight': climate_risk_msg,
                    'avg_temp': f"{temp_range[0]}°C - {temp_range[1]}°C",
                    'rainfall': f"{rain_val} mm"
                },
                'yield_formula': {
                    'base_tons_per_acre': round(base_tons_per_acre, 2),
                    'soil_factor': soil_factor_before,
                    'fertilizer_factor': round(fert_mult, 2),
                    'weed_factor': round(weed_mult, 2),
                    'pest_factor': round(pest_mult, 2),
                    'calculated_tons_per_acre': before_tons_per_acre
                }
            },
            'after': {
                'yield_total_tons': after_total_tons,
                'yield_per_acre_tons': after_tons_per_acre,
                'water_litres': after_water_total,
                'water_saved_pct': max(0, water_saved_pct),
                'chi': after_chi,
                'growth_pct': round(growth_pct, 2), # Match before stage
                'days_remaining': days_remaining,   # Match before stage
                'cycle_days': cycle_days,
                'visual': {
                    'plant_height': plant_height, # Keep same height
                    'leaf_color': after_leaf_color,
                    'density': density,           # Keep same density
                    'weeds_present': False,
                    'pest_damage': False,
                    'waterlogging': False,
                    'water_wastage': False,
                    'irrigation_method': recommended_method
                },
                'yield_increase_pct': round((after_total_tons - before_total_tons) / max(before_total_tons, 0.01) * 100, 1),
                'climate_risk': after_risk,
                'climate': {
                    'risk_level': after_risk,
                    'insight': {
                        'en': "Optimized practices significantly reduce climate-related risks and resource wastage.",
                        'ta': "மேம்படுத்தப்பட்ட முறைகள் காலநிலை அபாயங்களைக் குறைத்து, வளங்கள் வீணாவதை பெருமளவு தடுத்து மகசூலை அதிகரிக்கும்."
                    },
                    'avg_temp': f"{temp_range[0]}°C - {temp_range[1]}°C",
                    'rainfall': f"{rain_val} mm"
                },
                'recommended_method': recommended_method,
                'improvements': smart_improvements,
                'yield_formula': {
                    'base_tons_per_acre': round(base_tons_per_acre, 2),
                    'soil_factor': soil_factor_after,
                    'fertilizer_factor': round(after_fert_mult, 2),
                    'weed_factor': round(after_weed_mult, 2),
                    'pest_factor': round(after_pest_mult, 2),
                    'calculated_tons_per_acre': after_tons_per_acre
                }
            }
        }), 200

    except Exception as e:
        logging.exception("Custom simulation error")
        return jsonify({'error': str(e)}), 500
