import sys
from datetime import datetime

def send_otp_sms(phone_number, otp):
    """
    Placeholder function for sending SMS.
    """
    output = f"\n\n\n**************************************************\n          OTP FOR {phone_number}: {otp}\n**************************************************\n\n\n"
    
    # Print to terminal once
    print(output, flush=True)
    
    # Also log to file for history
    with open("otp_debug.txt", "a") as f:
        f.write(f"{output}\nSent at: {datetime.now()}\n")
        
    return True




