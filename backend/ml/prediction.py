import numpy as np
import pandas as pd
import joblib
import os

class AdoptionPredictor:
    def __init__(self):
        # Paths
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.adopt_model_path = os.path.join(self.current_dir, 'adoption_model.pkl')
        self.crop_model_path = os.path.join(self.current_dir, 'crop_model.pkl')
        self.adopt_encoder_path = os.path.join(self.current_dir, 'adoption_encoder.pkl')
        self.crop_target_encoder_path = os.path.join(self.current_dir, 'crop_target_encoder.pkl')
        
        # Load models
        try:
            self.adopt_model = joblib.load(self.adopt_model_path)
            self.crop_model = joblib.load(self.crop_model_path)
            
            adopt_data = joblib.load(self.adopt_encoder_path)
            self.adopt_feature_encoders = adopt_data['feature_encoders']
            self.adopt_target_encoder = adopt_data['target_encoder']
            
            self.crop_target_encoder = joblib.load(self.crop_target_encoder_path)
            self.is_trained = True
            print("🌾 AgriNova ML Models loaded successfully.")
        except Exception as e:
            self.is_trained = False
            print(f"❌ Failed to load ML models: {e}")
            
        self.adopt_features = [
            'age', 'education', 'annual_income', 'land_area', 'farming_experience', 
            'agro_climatic_zone', 'using_uzhavan_app', 'watch_agri_youtube', 'in_whatsapp_groups'
        ]

        self.crop_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

    def _get_env_defaults(self, agro_zone):
        """Mock Environmental mapping for TN Agro-Climatic Zones"""
        zones = {
            'Delta': {'temperature': 28.0, 'humidity': 80.0, 'rainfall': 200.0},
            'Dry': {'temperature': 33.0, 'humidity': 45.0, 'rainfall': 80.0},
            'Hilly': {'temperature': 18.0, 'humidity': 85.0, 'rainfall': 250.0},
            'Coastal': {'temperature': 30.0, 'humidity': 90.0, 'rainfall': 150.0}
        }
        return zones.get(agro_zone, zones['Delta'])

    def preprocess_input(self, farmer_data):
        # A. Prepare Adoption Features
        a_data = {
            'age': int(farmer_data.get('age', 40)),
            'education': farmer_data.get('education', 'Primary'),
            'annual_income': float(farmer_data.get('income') or farmer_data.get('annual_income') or 300000),
            'land_area': float(farmer_data.get('land_area', 2.0)),
            'farming_experience': int(farmer_data.get('experience', 10)),
            'agro_climatic_zone': farmer_data.get('agro_climatic_zone', 'Delta'),
            'using_uzhavan_app': 1 if farmer_data.get('using_uzhavan_app') else 0,
            'watch_agri_youtube': 1 if farmer_data.get('watch_agri_youtube') else 0,
            'in_whatsapp_groups': 1 if farmer_data.get('in_whatsapp_groups') else 0
        }
        
        X_adopt = pd.DataFrame([a_data])
        for col, le in self.adopt_feature_encoders.items():
            if a_data[col] not in le.classes_:
                a_data[col] = le.classes_[0]
            X_adopt[col] = le.transform([a_data[col]])

        # B. Prepare Crop Features
        env = self._get_env_defaults(a_data['agro_climatic_zone'])
        c_data = {
            'N': float(farmer_data.get('n_ratio') or 50),
            'P': float(farmer_data.get('p_ratio') or 50),
            'K': float(farmer_data.get('k_ratio') or 50),
            'temperature': float(farmer_data.get('avg_temp') or env['temperature']),
            'humidity': float(farmer_data.get('avg_humidity') or env['humidity']),
            'ph': float(farmer_data.get('ph_level') or 6.5),
            'rainfall': float(farmer_data.get('avg_rainfall') or env['rainfall'])
        }
        X_crop = pd.DataFrame([c_data])

        return X_adopt, X_crop

    def predict(self, farmer_data):
        if not self.is_trained:
            return {'adoption_score': 50, 'adoption_category': 'Medium', 'predicted_label': 'Medium'}
        
        X_adopt, _ = self.preprocess_input(farmer_data)
        
        # Predict Adoption
        probs = self.adopt_model.predict_proba(X_adopt)[0]
        score = int(max(probs) * 100)
        
        pred_enc = self.adopt_model.predict(X_adopt)[0]
        category = self.adopt_target_encoder.inverse_transform([pred_enc])[0]
        
        return {
            'adoption_score': score,
            'adoption_category': category,
            'predicted_label': category
        }

    def predict_crop(self, farmer_data):
        if not self.is_trained:
            return "Rice"
        
        _, X_crop = self.preprocess_input(farmer_data)
        
        pred_enc = self.crop_model.predict(X_crop)[0]
        crop_name = self.crop_target_encoder.inverse_transform([pred_enc])[0]
        return crop_name.capitalize()

# Global predictor instance
predictor = AdoptionPredictor()

# Global predictor instance
predictor = AdoptionPredictor()
