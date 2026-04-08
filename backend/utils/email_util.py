import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# For development, you can use these settings or an environment variable
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '') # Add your email
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '') # Add your app password

def send_otp_email(email, otp):
    """
    Send OTP via email.
    """
    subject = "AgriNova - Your Verification Code / உங்கள் சரிபார்ப்பு குறியீடு"
    body = f"""
    Hello / வணக்கம்,
    
    Your verification code for AgriNova registration is: {otp}
    AgriNova பதிவிற்கான உங்கள் சரிபார்ப்பு குறியீடு: {otp}
    
    This code is valid for 5 minutes.
    இந்த குறியீடு 5 நிமிடங்களுக்கு மட்டுமே செல்லுபடியாகும்.
    
    Thank you / நன்றி,
    Team AgriNova
    """
    
    print(f"\n\n\n**************************************************\n          EMAIL OTP FOR {email}: {otp}\n**************************************************\n\n\n", flush=True)
    
    # Also log to file for history (Development only)
    from datetime import datetime
    output = f"\n\n\n**************************************************\n          EMAIL OTP FOR {email}: {otp}\n**************************************************\n\n\n"
    with open("otp_debug.txt", "a", encoding='utf-8') as f:
        f.write(f"{output}\nSent at: {datetime.now()}\n")

    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("SMTP credentials not configured. Email not actually sent.")
        return True # Return True for development even if not sent
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
