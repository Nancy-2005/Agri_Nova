from flask import Blueprint, request, jsonify, session
from models import FarmerData, User
from ml.recommendation import recommendation_engine
from ml.segmentation import segmentation

farmer_bp = Blueprint('farmer', __name__)

def require_login(f):
    """Decorator to require login"""
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@farmer_bp.route('/farmer-data', methods=['POST'])
@require_login
def submit_farmer_data():
    """Submit farmer data from multi-step form"""
    try:
        data = request.json
        user_id = session['user_id']
        
        # Create farmer data entry
        farmer_id = FarmerData.create(user_id, data)
        
        # Get the created farmer data
        farmer_data = FarmerData.get_by_user_id(user_id)
        
        # Run ML predictions
        level, score = recommendation_engine.get_adoption_level(farmer_data)
        segmentation_result = segmentation.predict(farmer_data)
        
        # Update farmer data with ML results
        FarmerData.update_ml_results(
            farmer_id,
            score,
            level,
            segmentation_result['segment']
        )
        
        return jsonify({
            'message': 'Farmer data submitted successfully',
            'farmer_id': farmer_id,
            'adoption_score': score,
            'adoption_category': level,
            'segment': segmentation_result['segment']
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@farmer_bp.route('/farmer-profile/<int:user_id>', methods=['GET'])
@require_login
def get_farmer_profile(user_id):
    """Get farmer profile"""
    try:
        # Check if requesting own profile
        if session['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        farmer_data = FarmerData.get_by_user_id(user_id)
        user_data = User.get_by_id(user_id)
        
        if not farmer_data:
            return jsonify({'error': 'Farmer data not found'}), 404
        
        return jsonify({
            'user': user_data,
            'farmer_data': farmer_data
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@farmer_bp.route('/farmer-data/<int:user_id>', methods=['PUT'])
@require_login
def update_farmer_data(user_id):
    """Update farmer data"""
    try:
        # Check if updating own data
        if session['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        
        # Get existing farmer data
        existing_data = FarmerData.get_by_user_id(user_id)
        
        if not existing_data:
            return jsonify({'error': 'Farmer data not found'}), 404
        
        # Create new entry (we keep history by creating new entries)
        farmer_id = FarmerData.create(user_id, data)
        
        # Get the updated farmer data
        farmer_data = FarmerData.get_by_user_id(user_id)
        
        # Run ML predictions
        level, score = recommendation_engine.get_adoption_level(farmer_data)
        segmentation_result = segmentation.predict(farmer_data)
        
        # Update with ML results
        FarmerData.update_ml_results(
            farmer_id,
            score,
            level,
            segmentation_result['segment']
        )
        
        return jsonify({
            'message': 'Farmer data updated successfully',
            'farmer_id': farmer_id,
            'adoption_score': score,
            'adoption_category': level
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
