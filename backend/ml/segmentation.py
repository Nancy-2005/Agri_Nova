import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os

class FarmerSegmentation:
    def __init__(self, n_clusters=3):
        self.n_clusters = n_clusters
        self.model = KMeans(n_clusters=n_clusters, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.cluster_labels = {
            0: 'Low Adopted',
            1: 'Moderately Adopted',
            2: 'Highly Adopted'
        }
    
    def prepare_features(self, farmer_data):
        """Convert farmer data to feature vector for clustering"""
        # This is kept for compatibility if we want to train KMeans later
        features = []
        
        # Helper function to safely get numeric value
        def safe_float(value, default):
            if value is None: return default
            try: return float(value)
            except: return default

        # Adoption score
        features.append(safe_float(farmer_data.get('adoption_score'), 50))
        
        return np.array(features).reshape(1, -1)
    
    def train(self, X):
        """Train clustering model"""
        # Placeholder training or implementation for future data
        pass
    
    def predict(self, farmer_data):
        """Predict farmer segment based on STRICT adoption score thresholds"""
        # We rely strictly on the `adoption_score` calculated in prediction.py
        # High: > 75
        # Moderate: 40 - 75
        # Low: < 40
        
        adoption_score = farmer_data.get('adoption_score')
        
        if adoption_score is None:
            adoption_score = 50 # Default fallback
            
        try:
            adoption_score = float(adoption_score)
        except:
            adoption_score = 50
            
        if adoption_score >= 75:
            cluster = 2
            segment = 'Highly Adopted'
        elif adoption_score >= 40:
            cluster = 1
            segment = 'Moderately Adopted'
        else:
            cluster = 0
            segment = 'Low Adopted'
        
        return {
            'cluster': cluster,
            'segment': segment
        }
    
    def save_model(self, path='models'):
        pass
    
    def load_model(self, path='models'):
        return True

# Global segmentation instance
segmentation = FarmerSegmentation()
