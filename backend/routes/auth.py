from flask import Blueprint, request, jsonify, session
from models import User, OTPModel
from utils.sms import send_otp_sms
from utils.email_util import send_otp_email
import random
import re

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_phone(phone):
    return re.match(r"^\d{10}$", phone)

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """Generate and send OTP for registration"""
    try:
        data = request.json
        name = data.get('name')
        phone_number = data.get('phone_number')
        email = data.get('email')
        district = data.get('district')
        
        if not name or not district:
            return jsonify({'error': 'Name and district are required / பெயர் மற்றும் மாவட்டம் தேவை'}), 400
            
        if not phone_number and not email:
            return jsonify({'error': 'Email or Phone is required / மின்னஞ்சல் அல்லது தொலைபேசி எண் தேவை'}), 400

        # Duplicate check
        conn = User.authenticate(phone_number if phone_number else email, "dummy")
        # Wait, authenticate checks password. I need a "exists" check.
        # Let's use get_by_id or similar? No, I'll add a check function.
        
        # Quick check for existing user
        from models import get_db
        db = get_db()
        cursor = db.cursor()
        if phone_number:
            cursor.execute('SELECT 1 FROM users WHERE phone_number = ?', (phone_number,))
            if cursor.fetchone():
                return jsonify({'error': 'User already exists / பயனர் ஏற்கனவே உள்ளார்'}), 400
        if email:
            cursor.execute('SELECT 1 FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                return jsonify({'error': 'User already exists / பயனர் ஏற்கனவே உள்ளார்'}), 400
        db.close()

        # Generate 6 digit OTP
        otp_code = random.randint(100000, 999999)
        
        # Save OTP in database (5 minutes validity)
        OTPModel.create(otp_code, phone_number=phone_number, email=email, name=name, district=district, ttl_minutes=5)
        
        send_success = False
        if email:
            if not is_valid_email(email):
                return jsonify({'error': 'Invalid email format / தவறான மின்னஞ்சல் வடிவம்'}), 400
            send_success = send_otp_email(email, otp_code)
        else:
            if not is_valid_phone(phone_number):
                return jsonify({'error': 'Invalid phone format (10 digits) / தவறான தொலைபேசி வடிவம் (10 இலக்கங்கள்)'}), 400
            send_success = send_otp_sms(phone_number, otp_code)
        
        if send_success:
            return jsonify({'message': 'OTP sent successfully / OTP வெற்றிகரமாக அனுப்பப்பட்டது'}), 200
        else:
            return jsonify({'error': 'Failed to send OTP / OTP அனுப்ப முடியவில்லை'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify the received OTP"""
    try:
        data = request.json
        phone_number = data.get('phone_number')
        email = data.get('email')
        otp_code = data.get('otp')
        
        if (not phone_number and not email) or not otp_code:
            return jsonify({'error': 'Identifier and otp are required / அடையாளம் மற்றும் OTP தேவை'}), 400
            
        is_valid = OTPModel.verify(otp_code, phone_number=phone_number, email=email)
        
        if is_valid:
            return jsonify({'message': 'OTP verified successfully / OTP வெற்றிகரமாக சரிபார்க்கப்பட்டது'}), 200
        else:
            return jsonify({'error': 'Invalid or expired OTP / தவறான அல்லது காலாவதியான OTP'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Complete registration with password"""
    try:
        data = request.json
        name = data.get('name')
        phone_number = data.get('phone_number')
        email = data.get('email')
        password = data.get('password')
        district = data.get('district')
        
        if not all([name, password, district]) or (not phone_number and not email):
            return jsonify({'error': 'All fields are required / அனைத்து புலகளும் தேவை'}), 400
            
        # Create user
        user_id = User.create(name, password, district, phone_number=phone_number, email=email, is_verified=1)
        
        if user_id is None:
            return jsonify({'error': 'User already exists / பயனர் ஏற்கனவே உள்ளார்'}), 400
            
        # Create login session
        session.permanent = True
        session['user_id'] = user_id
        session['user_name'] = name
        
        return jsonify({
            'message': 'Registration successful / பதிவு வெற்றிகரமாக முடிந்தது',
            'user_id': user_id,
            'name': name,
            'district': district
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login farmer with Email/Phone and password"""
    try:
        data = request.json
        # Accept phone_number as the generic identifier from frontend
        identifier = data.get('phone_number') or data.get('email') or data.get('identifier')
        password = data.get('password')
        
        if not identifier or not password:
            return jsonify({'error': 'Identifier and password are required / அடையாளம் மற்றும் கடவுச்சொல் தேவை'}), 400
            
        # Authenticate (works for both email or phone)
        user = User.authenticate(identifier, password)
        
        if user is None:
            return jsonify({'error': 'Invalid credentials / தவறான சான்றுகள்'}), 401
            
        # Set session
        session.permanent = True
        session['user_id'] = user['user_id']
        session['user_name'] = user['name']
        
        return jsonify({
            'message': 'Login successful / உள்நுழைவு வெற்றிகரமாக முடிந்தது',
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
    return jsonify({'message': 'Logout successful / வெற்றிகரமாக வெளியேறினீர்கள்'}), 200

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

@auth_bp.route('/guidance', methods=['GET'])
def get_guidance():
    """Check if guidance popup should be shown and get level"""
    if 'user_id' not in session:
        return jsonify({'show': False}), 401
    
    user_id = session['user_id']
    from datetime import date
    today = date.today().isoformat()
    
    from models import get_db
    db = get_db()
    cursor = db.cursor()
    
    # Check if already shown today (DISABLED to show every time)
    # cursor.execute('SELECT last_guidance_shown FROM users WHERE user_id = ?', (user_id,))
    # row = cursor.fetchone()
    # if row and row['last_guidance_shown'] == today:
    #     db.close()
    #     return jsonify({'show': False}), 200
        
    # Get adoption category (fetch existing - no recalculation)
    cursor.execute('SELECT adoption_category FROM farmer_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', (user_id,))
    data = cursor.fetchone()
    
    if not data:
        db.close()
        return jsonify({'show': False}), 200 # No data yet, no popup
        
    level = data['adoption_category'] or 'Low'
    
    db.close()
    return jsonify({
        'show': True,
        'level': level
    }), 200

@auth_bp.route('/mark-guidance-shown', methods=['POST'])
def mark_guidance_shown():
    """Mark guidance as shown for today"""
    if 'user_id' not in session:
        return jsonify({'success': False}), 401
    
    user_id = session['user_id']
    from datetime import date
    today = date.today().isoformat()
    
    from models import get_db
    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE users SET last_guidance_shown = ? WHERE user_id = ?', (today, user_id))
    db.commit()
    db.close()
    
    return jsonify({'success': True}), 200
