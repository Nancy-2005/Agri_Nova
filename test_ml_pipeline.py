import sys
import os
import pandas as pd

# Add backend and backend/ml to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, 'backend'))
sys.path.append(os.path.join(current_dir, 'backend', 'ml'))

from ml.recommendation import recommendation_engine
from ml.prediction import predictor

def test_pipeline():
    print("🚀 Verifying AgriNova ML Pipeline...")
    
    # Sample Farmer Data (Delta Zone, with soil test)
    farmer_delta = {
        'age': 35,
        'education': 'Degree',
        'annual_income': 600000,
        'land_area': 5.5,
        'experience': 12,
        'agro_climatic_zone': 'Delta',
        'using_uzhavan_app': True,
        'watch_agri_youtube': True,
        'in_whatsapp_groups': True,
        'n_ratio': 90,
        'p_ratio': 42,
        'k_ratio': 43,
        'ph_level': 6.5
    }
    
    # Sample Farmer Data (Dry Zone, no soil test)
    farmer_dry = {
        'age': 55,
        'education': 'Primary',
        'annual_income': 150000,
        'land_area': 2.0,
        'experience': 30,
        'agro_climatic_zone': 'Dry',
        'using_uzhavan_app': False,
        'watch_agri_youtube': False,
        'in_whatsapp_groups': False,
        # No N,P,K provided
    }

    test_cases = [
        ("Case 1: Modern Farmer (Delta, Soil Tested)", farmer_delta),
        ("Case 2: Traditional Farmer (Dry, No Soil Test)", farmer_dry)
    ]

    for desc, data in test_cases:
        print(f"--- {desc} ---")
        
        # 1. Adoption Prediction
        adopt_res = predictor.predict(data)
        print(f"Adoption Level: {adopt_res['adoption_category']} (Score: {adopt_res['adoption_score']}%)")
        
        # 2. Crop Recommendation (Top 1)
        top_crop = predictor.predict_crop(data)
        print(f"Predicted Best Crop: {top_crop}")
        
        # 3. Top 3 Crops from Engine
        top_3 = recommendation_engine.get_top_3_crops(data)
        print(f"Top 3 Recommendations: {', '.join(top_3)}")
        
        # 4. Technologies
        techs = recommendation_engine.get_technologies(data, adopt_res['adoption_category'])
        tech_names = [t.get('tech_en', 'N/A') for t in techs]
        print(f"Recommended Technologies: {', '.join(tech_names[:3])}...")
        print("\n")

if __name__ == "__main__":
    test_pipeline()
