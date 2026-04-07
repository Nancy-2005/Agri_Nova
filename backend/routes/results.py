from flask import Blueprint, jsonify, session, send_file, request
import logging
from models import FarmerData, User
from ml.recommendation import recommendation_engine
from data.schemes import filter_schemes_by_eligibility
from utils.report_generator import pdf_generator
import os

results_bp = Blueprint('results', __name__)

def require_login(f):
    """Decorator to require login"""
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@results_bp.route('/adoption-result/<int:user_id>', methods=['GET'])
@require_login
def get_adoption_result(user_id):
    """Get adoption prediction results"""
    try:
        if session['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        farmer_data = FarmerData.get_by_user_id(user_id)
        if not farmer_data:
            return jsonify({'error': 'Farmer data not found'}), 404
        
        level, score = recommendation_engine.get_adoption_level(farmer_data)
        
        return jsonify({
            'adoption_score': score,
            'adoption_category': level,
            'adoption_level': level,
            'segmentation_cluster': farmer_data.get('segmentation_cluster', 'Standard')
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@results_bp.route('/recommendations/<int:user_id>', methods=['GET'])
@require_login
def get_recommendations(user_id):
    """Get personalized recommendations"""
    try:
        # Check authorization
        if session['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        farmer_data = FarmerData.get_by_user_id(user_id)
        
        if not farmer_data:
            return jsonify({'error': 'Farmer data not found'}), 404
        
        recommendations = recommendation_engine.get_all_recommendations(farmer_data)
        
        return jsonify(recommendations), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@results_bp.route('/schemes/<int:user_id>', methods=['GET'])
@require_login
def get_schemes(user_id):
    """Get eligible government schemes"""
    try:
        # Check authorization
        if session['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        farmer_data = FarmerData.get_by_user_id(user_id)
        
        if not farmer_data:
            return jsonify({'error': 'Farmer data not found'}), 404
        
        eligible_schemes = filter_schemes_by_eligibility(farmer_data)
        
        return jsonify({'schemes': eligible_schemes}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@results_bp.route('/report/<int:user_id>', methods=['GET'])
@require_login
def download_report(user_id):
    """Generate and download PDF report"""
    try:
        # Check authorization
        if session['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        farmer_data = FarmerData.get_by_user_id(user_id)
        user_data = User.get_by_id(user_id)
        
        if not farmer_data or not user_data:
            return jsonify({'error': 'Data not found'}), 404
        
        # Get adoption result
        level, score = recommendation_engine.get_adoption_level(farmer_data)
        adoption_result = {
            'adoption_score': score,
            'adoption_category': level,
            'adoption_level': level
        }
        
        # Get recommendations
        recommendations = recommendation_engine.get_all_recommendations(farmer_data)
        
        # Get eligible schemes
        eligible_schemes = filter_schemes_by_eligibility(farmer_data)
        
        # Generate PDF
        language = request.args.get('lang', 'en')
        filepath = pdf_generator.generate_report(
            farmer_data,
            user_data,
            adoption_result,
            recommendations,
            eligible_schemes,
            language
        )
        
        # Determine download name based on language
        if language == 'ta':
            download_name = f"AgriNova_உழவர்_அறிக்கை_{user_id}.pdf"
        else:
            download_name = f"AgriNova_Farmer_Report_{user_id}.pdf"
        
        # Send file
        return send_file(
            os.path.abspath(filepath),
            as_attachment=True,
            download_name=download_name,
            mimetype='application/pdf'
        )
    
    except Exception as e:
        logging.exception("Error generating report")
        return jsonify({'error': str(e)}), 500
