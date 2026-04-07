import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from ml.prediction import predictor
from ml.segmentation import segmentation
from ml.recommendation import recommendation_engine
from data.schemes import filter_schemes_by_eligibility

def test_pipeline():
    print("--- Starting Pipeline Verification ---")
    
    # Scenario A: Low Adoption (Small land, no tech)
    farmer_a = {
        'age': 55, 'education': 'Primary', 'land_area': 1.5, 'income': 50000,
        'technologies_used': [], 'schemes_aware': [], 'water_availability': 'Scarce',
        'soil_type': 'Red Soil', 'gender': 'Male', 'savings_habit': 'Never',
        'adoption_category': 'Low' # Expected
    }
    
    # Scenario B: High Adoption (Large land, drones)
    farmer_b = {
        'age': 30, 'education': 'Graduate', 'land_area': 10, 'income': 500000,
        'technologies_used': ['Drip Irrigation', 'Solar Pump'], 'schemes_aware': ['PM-KISAN'],
        'water_availability': 'Abundant', 'soil_type': 'Clay', 'gender': 'Male',
        'using_uzhavan_app': 1, 'savings_habit': 'Regularly',
        'adoption_category': 'High' # Expected can vary, but score should be high
    }
    
    # Scenario C: Woman Farmer (Checking gender filter)
    farmer_c = {
        'age': 40, 'education': 'Secondary', 'land_area': 2, 'income': 100000,
        'gender': 'Female', 'adoption_category': 'Moderate' # Mocked for scheme check
    }

    # 1. Prediction & Segmentation Test
    print("\n[Test 1] Prediction & Segmentation")
    
    # Farmer A
    res_a = predictor.predict(farmer_a)
    print(f"Farmer A Score: {res_a['adoption_score']} -> {res_a['adoption_category']}")
    
    # Farmer B
    res_b = predictor.predict(farmer_b)
    print(f"Farmer B Score: {res_b['adoption_score']} -> {res_b['adoption_category']}")
    
    # 2. Recommendation Test
    print("\n[Test 2] Recommendations")
    
    # Farmer A (Low + Red Soil + Scarce Water)
    # predictor might return Low, but let's pass the result
    farmer_a.update(res_a)
    recs_a = recommendation_engine.get_all_recommendations(farmer_a)
    print("Farmer A Recs (Should be Basic + Drought Crops):")
    print(f"  Tech: {[t.get('tech_en') for t in recs_a['technologies']]}")
    print(f"  Crops: {[c.get('crop_en') for c in recs_a['crops']]}")
    
    # Farmer B (High + Clay + Abundant Water)
    farmer_b.update(res_b)
    recs_b = recommendation_engine.get_all_recommendations(farmer_b)
    print("Farmer B Recs (Should be Advanced + Water Intensive Crops):")
    print(f"  Tech: {[t.get('tech_en') for t in recs_b['technologies']]}")
    print(f"  Crops: {[c.get('crop_en') for c in recs_b['crops']]}")
    
    # 3. Scheme Filtering Test
    print("\n[Test 3] Scheme Filtering")
    
    # Farmer C (Woman)
    schemes_c = filter_schemes_by_eligibility(farmer_c)
    women_scheme_found = any('Women' in s['type'] or 'women' in s['id'] for s in schemes_c)
    print(f"Farmer C (Female) - Women Schemes Found: {women_scheme_found}")
    print(f"  Scheme Types: {set(s['type'] for s in schemes_c)}")
    
    # Farmer A (Male, Low Adoption)
    schemes_a = filter_schemes_by_eligibility(farmer_a)
    women_scheme_found_a = any('Women' in s['type'] for s in schemes_a)
    print(f"Farmer A (Male) - Women Schemes Found: {women_scheme_found_a}")

if __name__ == "__main__":
    test_pipeline()
