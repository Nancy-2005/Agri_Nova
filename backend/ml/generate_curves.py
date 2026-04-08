import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

def generate_learning_curves():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Crop Model
    crop_dataset_path = os.path.join(current_dir, 'crop_recommendation.csv')
    df_crop = pd.read_csv(crop_dataset_path)
    crop_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X_crop = df_crop[crop_features]
    y_crop = df_crop['label']
    y_crop_encoded = LabelEncoder().fit_transform(y_crop)
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_crop, y_crop_encoded, test_size=0.2, random_state=42)
    
    # 2. Adoption Model
    adopt_dataset_path = os.path.join(current_dir, 'dataset.csv')
    df_adopt = pd.read_csv(adopt_dataset_path)
    adopt_features = [
        'age', 'education', 'annual_income', 'land_area', 'farming_experience', 
        'agro_climatic_zone', 'using_uzhavan_app', 'watch_agri_youtube', 'in_whatsapp_groups'
    ]
    X_adopt = df_adopt[adopt_features].copy()
    for col in ['education', 'agro_climatic_zone']:
        X_adopt[col] = LabelEncoder().fit_transform(X_adopt[col])
    y_adopt_encoded = LabelEncoder().fit_transform(df_adopt['adoption_level'])
    X_train_a, X_test_a, y_train_a, y_test_a = train_test_split(X_adopt, y_adopt_encoded, test_size=0.2, random_state=42)
    
    estimators = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    
    print("=== Crop Recommendation Model (Over 'Epochs' / N Estimators) ===")
    crop_train_acc = []
    crop_val_acc = []
    for n in estimators:
        clf = RandomForestClassifier(n_estimators=n, random_state=42)
        clf.fit(X_train_c, y_train_c)
        crop_train_acc.append(round(accuracy_score(y_train_c, clf.predict(X_train_c)), 4))
        crop_val_acc.append(round(accuracy_score(y_test_c, clf.predict(X_test_c)), 4))
    
    print(f"train_acc_crop = {crop_train_acc}")
    print(f"val_acc_crop   = {crop_val_acc}\n")
    
    print("=== Adoption Prediction Model (Over 'Epochs' / N Estimators) ===")
    adopt_train_acc = []
    adopt_val_acc = []
    for n in estimators:
        clf = RandomForestClassifier(n_estimators=n, random_state=42)
        clf.fit(X_train_a, y_train_a)
        adopt_train_acc.append(round(accuracy_score(y_train_a, clf.predict(X_train_a)), 4))
        adopt_val_acc.append(round(accuracy_score(y_test_a, clf.predict(X_test_a)), 4))
        
    print(f"train_acc_adopt = {adopt_train_acc}")
    print(f"val_acc_adopt   = {adopt_val_acc}\n")

if __name__ == "__main__":
    generate_learning_curves()
