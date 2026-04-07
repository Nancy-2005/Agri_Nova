import pandas as pd
import numpy as np
import os

# --- 1. Master Configurations & Data ---
# These categories must match the drop-down options in the AgriNova frontend forms
soil_types = ['Red', 'Black', 'Clay', 'Sandy', 'Alluvial']
water_availabilities = ['Low', 'Medium', 'High']
irrigation_types = ['Canal', 'Borewell', 'Rainfed', 'Drip', 'Sprinkler']
seasons = ['Kharif', 'Rabi']

# List of all crops supported by the Crop Recommendation model
crops = [
    'Paddy', 'Cotton', 'Groundnut', 'Millets', 'Sugarcane', 
    'Pulses', 'Chillies', 'Banana', 'Turmeric', 'Coconut'
]

def generate_data(num_samples=5000):
    """
    Generates a synthetic dataset of 5,000 farmer profiles to train the AI models.
    This creates realistic relationships between inputs and adoption levels.
    """
    data = []
    educations = ['No Formal', 'Primary', 'Middle', 'High', 'Higher Secondary', 'Diploma', 'Degree', 'Postgraduate']
    risk_tolerances = ['Low', 'Medium', 'High']
    agro_zones = ['Delta', 'Dry', 'Hilly', 'Coastal']
    scarcity_options = ['0', '1-3', '4-6', '7-9', '10-12']
    
    # List of modern technologies
    all_possible_techs = [
        "Drip Irrigation", "Sprinkler Irrigation", "Mulching Sheets", "Greenhouse / Polyhouse", 
        "Soil Testing Kit", "Soil Moisture Sensor", "Weather Forecast Mobile App", 
        "Uzhavan Mobile App", "Farm Mechanization Tools", "Drone Spraying"
    ]
    
    # Start Generation
    for _ in range(num_samples):
        # --- A. Profile Features ---
        age = np.random.randint(18, 75)
        education = np.random.choice(educations)
        annual_income = np.random.randint(50000, 1000000)
        farming_experience = np.random.randint(1, 50)
        land_area = round(np.random.uniform(0.5, 20.0), 1)
        soil = np.random.choice(soil_types)
        water = np.random.choice(water_availabilities)
        irrigation = np.random.choice(irrigation_types)
        season = np.random.choice(seasons)
        
        # --- B. Soil Parameters (Synced with real crop dataset ranges) ---
        n_ratio = np.random.randint(0, 140)
        p_ratio = np.random.randint(5, 145)
        k_ratio = np.random.randint(5, 205)
        ph_level = round(np.random.uniform(3.5, 9.9), 1)
        
        # Environmental (Mocks for training data)
        avg_temp = round(np.random.uniform(15, 40), 1)
        avg_humidity = round(np.random.uniform(20, 95), 1)
        avg_rainfall = round(np.random.uniform(20, 300), 1)

        # --- C. Region & Digital Features ---
        agro_zone = np.random.choice(agro_zones)
        borewell_depth = np.random.randint(0, 1200) if irrigation == 'Borewell' else 0
        water_scarcity = np.random.choice(scarcity_options)
        
        # Digital Literacy & Usage
        read_tamil = np.random.choice([0, 1], p=[0.1, 0.9])
        read_english = np.random.choice([0, 1], p=[0.7, 0.3])
        using_uzhavan_app = np.random.choice([0, 1], p=[0.6, 0.4])
        watch_agri_youtube = np.random.choice([0, 1], p=[0.4, 0.6])
        in_whatsapp_groups = np.random.choice([0, 1], p=[0.5, 0.5])
        
        # --- D. Adoption Score logic (Enhanced) ---
        score = 0
        # Education points (max 20)
        edu_map = {'No Formal': 0, 'Primary': 5, 'Middle': 8, 'High': 12, 'Higher Secondary': 15, 'Diploma': 18, 'Degree': 20, 'Postgraduate': 20}
        score += edu_map.get(education, 0)
        
        # Digital Usage points (max 25)
        if using_uzhavan_app: score += 10
        if watch_agri_youtube: score += 8
        if in_whatsapp_groups: score += 7
        
        # Income/Land points (max 15)
        if annual_income > 500000: score += 10
        if land_area > 5: score += 5
        
        # Tech Exposure points (max 20)
        # We'll select technologies based on a "hidden" tech affinity
        tech_affinity = score / 50.0 + np.random.uniform(-0.1, 0.2)
        tech_count = int(tech_affinity * 8)
        tech_count = max(0, min(len(all_possible_techs), tech_count))
        technologies_selected = np.random.choice(all_possible_techs, size=tech_count, replace=False).tolist()
        score += tech_count * 2.5
        
        # Awareness points (max 10)
        scheme_aware = np.random.choice([0, 1], p=[0.4, 0.6])
        if scheme_aware: score += 10

        # Caps and Categorization
        score = max(0, min(100, score + np.random.randint(-5, 6)))
        if score > 70: adoption_level = 'High'
        elif score > 40: adoption_level = 'Medium'
        else: adoption_level = 'Low'

        # --- E. Crop Logic (Simplified as the real CSV will handle main crop prediction) ---
        if soil == 'Clay' and water == 'High': crop = 'Paddy'
        elif soil == 'Black' and water == 'High': crop = 'Sugarcane'
        else: crop = 'Millets' # Default for synthetic dataset

        # Add to Final dataset
        data.append({
            'soil_type': soil,
            'n_ratio': n_ratio,
            'p_ratio': p_ratio,
            'k_ratio': k_ratio,
            'ph_level': ph_level,
            'avg_temp': avg_temp,
            'avg_humidity': avg_humidity,
            'avg_rainfall': avg_rainfall,
            'water_availability': water,
            'irrigation_type': irrigation,
            'land_area': land_area,
            'season': season,
            'crop': crop,
            'age': age,
            'education': education,
            'annual_income': annual_income,
            'farming_experience': farming_experience,
            'agro_climatic_zone': agro_zone,
            'using_uzhavan_app': using_uzhavan_app,
            'watch_agri_youtube': watch_agri_youtube,
            'in_whatsapp_groups': in_whatsapp_groups,
            'adoption_level': adoption_level,
            'technologies_used': str(technologies_selected)
        })
    
    return pd.DataFrame(data)

# --- 2. Main Script Execution ---
if __name__ == "__main__":
    print("🚀 Generating synthetic farmer dataset...")
    df = generate_data(5000)
    
    # Save path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    df.to_csv(os.path.join(current_dir, 'dataset.csv'), index=False)
    
    print(f"✅ Dataset saved to {os.path.join(current_dir, 'dataset.csv')}")
    print(df.head())
    print("\nAdoption Level Distribution:")
    print(df['adoption_level'].value_counts())
    
    # 5. Display the defined Thresholds for terminal reference
    print("\nAdoption Level Rule Reference:")
    print("  [0-40]   -> Low (Beginner)")
    print("  [41-70]  -> Medium (Intermediate)")
    print("  [71-100] -> High (Advanced)")
    print("-" * 50)
