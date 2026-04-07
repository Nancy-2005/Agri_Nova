from ml.recommendation import recommendation_engine
from data.schemes import filter_schemes_by_eligibility
import json

def test_recommendations():
    # Profile 1: High Adopter, Large Land, Abundant Water
    high_adopter = {
        'age': 40,
        'land_area': 10,
        'irrigation_source': 'Electric Pump',
        'water_availability': 'Water available throughout the year',
        'soil_type': 'Black Soil',
        'crops': ['Paddy', 'Sugarcane'],
        'adoption_category': 'High',
        'technologies_used': ['Drip Irrigation', 'Tractor'],
        'income': 800000
    }

    # Profile 2: Low Adopter, Small Land, Scarce Water
    low_adopter = {
        'age': 55,
        'land_area': 1.5,
        'irrigation_source': 'Rainfed',
        'water_availability': 'Dependent on rainfall/others',
        'soil_type': 'Red Soil',
        'crops': ['Millets'],
        'adoption_category': 'Low',
        'technologies_used': [],
        'income': 50000
    }

    print("--- HIGH ADOPTER TEST ---")
    high_tech = recommendation_engine.get_technology_recommendations(high_adopter)
    high_crops = recommendation_engine.get_crop_recommendations(high_adopter)
    high_schemes = filter_schemes_by_eligibility(high_adopter)
    
    print(f"Tech Recs: {[t['name'] for t in high_tech]}")
    print(f"Crop Recs: {[c['crop'] for c in high_crops]}")
    print(f"Scheme Recs: {[s['name'] for s in high_schemes]}")

    print("\n--- LOW ADOPTER TEST ---")
    low_tech = recommendation_engine.get_technology_recommendations(low_adopter)
    low_crops = recommendation_engine.get_crop_recommendations(low_adopter)
    low_schemes = filter_schemes_by_eligibility(low_adopter)
    
    print(f"Tech Recs: {[t['name'] for t in low_tech]}")
    print(f"Crop Recs: {[c['crop'] for c in low_crops]}")
    print(f"Scheme Recs: {[s['name'] for s in low_schemes]}")

if __name__ == '__main__':
    test_recommendations()
