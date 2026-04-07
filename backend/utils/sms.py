import sys

def send_otp_sms(phone_number, otp):
    """
    Placeholder function for sending SMS.
    """
    output = f"\n=== SMS SENT ===\nTo: {phone_number}\nMessage: Your AgriNova verification code is {otp}. Valid for 5 minutes.\n====================\n"
    
    # Print to terminal once
    print(output, flush=True)
    
    # Also log to file
    with open("otp_debug.txt", "a") as f:
        f.write(output)
        
    return True




