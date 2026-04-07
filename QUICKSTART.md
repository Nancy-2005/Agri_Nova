# 🚀 Quick Start Guide

## Step-by-Step Instructions to Run the Application

### 1️⃣ Backend Setup (Flask)

```bash
# Navigate to backend directory
cd /home/infant/Farmer_Behaviour_App/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python models.py

# Run Flask server
python app.py
```

Backend will run on: **http://localhost:5000**

---

### 2️⃣ Web Frontend Setup (React)

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd /home/infant/Farmer_Behaviour_App/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Web app will run on: **http://localhost:3000**

---

### 3️⃣ Mobile App Setup (React Native - Optional)

Open a **new terminal** and run:

```bash
# Navigate to mobile directory
cd /home/infant/Farmer_Behaviour_App/mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

Then:
- Press **'a'** for Android emulator
- Or scan QR code with **Expo Go** app on your phone

**Important**: If testing on physical device, update the API URL in `mobile/src/utils/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

---

## 🎯 Testing the Application

### Test Flow:

1. **Open Web App**: http://localhost:3000
2. **Register**: Create a new farmer account
   - Name: Test Farmer
   - Email: test@farmer.com
   - District: Select any Tamil Nadu district
   - Password: test123

3. **Fill Form**: Complete the 6-step farmer form
   - Step 1: Basic profile
   - Step 2: Land & crop details
   - Step 3: Technology usage (check some boxes)
   - Step 4: Scheme awareness (check some boxes)
   - Step 5: Financial behaviour
   - Step 6: Tech attitude (move sliders)

4. **View Dashboard**: See your adoption score, recommendations, and schemes

5. **Download PDF**: Click "Download Report" button

6. **Toggle Language**: Click language button (top-right) to switch Tamil/English

---

## 🔧 Troubleshooting

### Backend Issues
- **Port 5000 in use**: Change port in `backend/app.py` (line: `app.run(port=5000)`)
- **Module not found**: Make sure virtual environment is activated
- **Database error**: Run `python models.py` to initialize

### Frontend Issues
- **npm install fails**: Try `npm install --legacy-peer-deps`
- **Port 3000 in use**: Vite will automatically use next available port
- **API connection failed**: Ensure backend is running on port 5000

### Mobile Issues
- **Expo won't start**: Run `npx expo start -c` to clear cache
- **Cannot connect to API**: Update IP address in `mobile/src/utils/api.js`

---

## 📱 Quick Commands Summary

```bash
# Terminal 1 - Backend
cd /home/infant/Farmer_Behaviour_App/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python models.py
python app.py

# Terminal 2 - Web Frontend
cd /home/infant/Farmer_Behaviour_App/frontend
npm install
npm run dev

# Terminal 3 - Mobile (Optional)
cd /home/infant/Farmer_Behaviour_App/mobile
npm install
npx expo start
```

---

## ✅ What to Expect

- **Backend**: Console will show "Running on http://0.0.0.0:5000"
- **Frontend**: Browser will auto-open to http://localhost:3000
- **Mobile**: QR code will appear in terminal

---

## 🎨 Features to Test

✅ Login/Register with Tamil/English toggle  
✅ Multi-step form with progress bar  
✅ Dashboard with adoption meter  
✅ Technology recommendations  
✅ Government schemes display  
✅ PDF report download  
✅ Mobile app (same features)  

---

**Need Help?** Check the main [README.md](file:///home/infant/Farmer_Behaviour_App/README.md) for detailed documentation.
