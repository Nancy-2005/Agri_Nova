import pandas as pd
import numpy as np
import os
import sys
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# Add parent directory to sys.path to allow importing from 'data'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from recommendation import recommendation_engine

def train_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # --- 1. Crop Recommendation Model (Real Dataset) ---
    crop_dataset_path = os.path.join(current_dir, 'crop_recommendation.csv')
    if not os.path.exists(crop_dataset_path):
        print(f"❌ Error: {crop_dataset_path} not found!")
        return

    df_crop = pd.read_csv(crop_dataset_path)
    print("\n--------------------------------------------------")
    print("Starting Crop Recommendation Model Training (Real Dataset)...\n")
    print(f"Dataset Loaded ({len(df_crop)} records)")
    
    crop_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X_crop = df_crop[crop_features]
    y_crop = df_crop['label']
    
    crop_target_encoder = LabelEncoder()
    y_crop_encoded = crop_target_encoder.fit_transform(y_crop)
    
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_crop, y_crop_encoded, test_size=0.2, random_state=42)
    
    crop_model = RandomForestClassifier(n_estimators=100, random_state=42)
    crop_model.fit(X_train_c, y_train_c)
    crop_acc = accuracy_score(y_test_c, crop_model.predict(X_test_c))
    print(f"✅ Crop Model Accuracy: {crop_acc*100:.1f}%")
    
    joblib.dump(crop_model, os.path.join(current_dir, 'crop_model.pkl'))
    joblib.dump(crop_target_encoder, os.path.join(current_dir, 'crop_target_encoder.pkl'))
    # No feature encoders needed as all are numeric
    joblib.dump({}, os.path.join(current_dir, 'crop_encoders.pkl')) 
    
    # --- 2. Adoption Level Model (Synthetic Dataset) ---
    adopt_dataset_path = os.path.join(current_dir, 'dataset.csv')
    df_adopt = pd.read_csv(adopt_dataset_path)
    
    print("\n--------------------------------------------------")
    print("Starting Adoption Model Training (Synthetic Dataset)...\n")
    print(f"Dataset Loaded ({len(df_adopt)} records)")
    
    adopt_features = [
        'age', 'education', 'annual_income', 'land_area', 'farming_experience', 
        'agro_climatic_zone', 'using_uzhavan_app', 'watch_agri_youtube', 'in_whatsapp_groups'
    ]
    
    X_adopt = df_adopt[adopt_features].copy()
    y_adopt = df_adopt['adoption_level']
    
    adopt_categorical = ['education', 'agro_climatic_zone']
    adopt_encoders = {}
    for col in adopt_categorical:
        le = LabelEncoder()
        X_adopt[col] = le.fit_transform(X_adopt[col])
        adopt_encoders[col] = le
    
    adopt_target_encoder = LabelEncoder()
    y_adopt_encoded = adopt_target_encoder.fit_transform(y_adopt)
    
    X_train_a, X_test_a, y_train_a, y_test_a = train_test_split(X_adopt, y_adopt_encoded, test_size=0.2, random_state=42)
    
    adopt_model = RandomForestClassifier(n_estimators=100, random_state=42)
    adopt_model.fit(X_train_a, y_train_a)
    adopt_acc = accuracy_score(y_test_a, adopt_model.predict(X_test_a))
    print(f"✅ Adoption Model Accuracy: {adopt_acc*100:.1f}%")
    
    joblib.dump(adopt_model, os.path.join(current_dir, 'adoption_model.pkl'))
    joblib.dump({'feature_encoders': adopt_encoders, 'target_encoder': adopt_target_encoder}, os.path.join(current_dir, 'adoption_encoder.pkl'))
    
    print("\n--------------------------------------------------")
    print("All Models Trained and Saved Successfully!")

if __name__ == "__main__":
    train_model()
