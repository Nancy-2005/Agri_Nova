from flask import Blueprint, request, jsonify, session
from models import User, OTPModel
from utils.sms import send_otp_sms
import random

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """Generate and send OTP for registration"""
    try:
        data = request.json
        name = data.get('name')
        phone_number = data.get('phone_number')
        district = data.get('district')
        
        # print(f"OTP-LOG: Request for {phone_number}", flush=True)
        
        if not name or not phone_number or not district:
            return jsonify({'error': 'Name, phone_number, and district are required'}), 400
            
        # Generate 6 digit OTP
        otp_code = random.randint(100000, 999999)
        
        # Save OTP in database (5 minutes validity)
        OTPModel.create(phone_number, otp_code, name=name, district=district, ttl_minutes=5)
        
        # Send OTP SMS
        send_success = send_otp_sms(phone_number, otp_code)
        
        if send_success:
            return jsonify({'message': 'OTP sent successfully'}), 200
        else:
            return jsonify({'error': 'Failed to send OTP SMS'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify the received OTP"""
    try:
        data = request.json
        phone_number = data.get('phone_number')
        otp_code = data.get('otp')
        
        if not phone_number or not otp_code:
            return jsonify({'error': 'phone_number and otp are required'}), 400
            
        is_valid = OTPModel.verify(phone_number, otp_code)
        
        if is_valid:
            return jsonify({'message': 'OTP verified successfully'}), 200
        else:
            return jsonify({'error': 'Invalid or expired OTP'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Complete registration with password"""
    try:
        data = request.json
        name = data.get('name')
        phone_number = data.get('phone_number')
        password = data.get('password')
        district = data.get('district')
        
        if not all([name, phone_number, password, district]):
            return jsonify({'error': 'Name, phone_number, password, and district are required'}), 400
            
        # Create user
        user_id = User.create(name, phone_number, password, district)
        
        if user_id is None:
            return jsonify({'error': 'Phone number already registered'}), 400
            
        # Create login session
        session['user_id'] = user_id
        session['user_name'] = name
        
        return jsonify({
            'message': 'Registration successful',
            'user_id': user_id,
            'name': name,
            'district': district
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login farmer with mobile number and password"""
    try:
        data = request.json
        phone_number = data.get('phone_number')
        password = data.get('password')
        
        if not phone_number or not password:
            return jsonify({'error': 'Phone number and password are required'}), 400
            
        # Authenticate
        user = User.authenticate(phone_number, password)
        
        if user is None:
            return jsonify({'error': 'Invalid phone number or password'}), 401
            
        # Set session
        session['user_id'] = user['user_id']
        session['user_name'] = user['name']
        
        return jsonify({
            'message': 'Login successful',
            'user_id': user['user_id'],
            'name': user['name'],
            'district': user['district']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout farmer"""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/check-session', methods=['GET'])
def check_session():
    """Check if user is logged in"""
    if 'user_id' in session:
        user = User.get_by_id(session['user_id'])
        if user:
            return jsonify({
                'logged_in': True,
                'user_id': user['user_id'],
                'name': user['name'],
                'district': user['district']
            }), 200
            
    return jsonify({'logged_in': False}), 200
