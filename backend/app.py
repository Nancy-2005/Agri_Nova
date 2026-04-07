from flask import Flask, session
from flask_cors import CORS
from datetime import timedelta
import os

# Import routes
from routes.auth import auth_bp
from routes.farmer import farmer_bp
from routes.results import results_bp
from routes.chatbot import chatbot_bp
# from routes.predict_bp import predict_bp
from routes.simulation import simulation_bp

# Import models
from models import init_db

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# Enable CORS for web and mobile apps
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:19006'])

# Initialize database
init_db()

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(farmer_bp, url_prefix='/api')
app.register_blueprint(results_bp, url_prefix='/api')
app.register_blueprint(chatbot_bp, url_prefix='/api')
# app.register_blueprint(predict_bp, url_prefix='/api')
app.register_blueprint(simulation_bp, url_prefix='/api')

@app.route('/')
def index():
    return {
        'message': 'Farmer Behaviour Prediction API',
        'version': '1.0',
        'endpoints': {
            'auth': ['/api/register', '/api/login', '/api/logout', '/api/check-session'],
            'farmer': ['/api/farmer-data', '/api/farmer-profile/<user_id>'],
            'results': [
                '/api/adoption-result/<user_id>',
                '/api/recommendations/<user_id>',
                '/api/schemes/<user_id>',
                '/api/report/<user_id>'
            ]
        }
    }

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('reports', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    
    import logging
    # Set up logging to show in console as well
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger('werkzeug')
    logger.setLevel(logging.INFO)
    
    # Run app
    app.run(debug=True, host='0.0.0.0', port=5000)
