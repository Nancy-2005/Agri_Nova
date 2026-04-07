# 🚜 AI-Based Farmer Behaviour Prediction and Technology Adoption Support System

**Tamil Nadu Focus** - A comprehensive full-stack application for farmers with Tamil-first UI, ML-powered predictions, and government scheme recommendations.

## 📋 Project Overview

This system helps Tamil Nadu farmers by:
- **Predicting** technology adoption behavior using Machine Learning
- **Recommending** suitable technologies and crops based on farmer profiles
- **Listing** all eligible Indian and Tamil Nadu government schemes
- **Generating** personalized PDF reports
- **Supporting** both Web and Mobile platforms with the same Flask backend

## 🎯 Key Features

✅ **Multi-Platform**: React Web App + React Native Mobile App  
✅ **Tamil-First UI**: Default Tamil language with English toggle  
✅ **ML Predictions**: Logistic Regression + Random Forest for adoption scoring  
✅ **Farmer Segmentation**: K-Means clustering (High/Moderate/Low adoption)  
✅ **Smart Recommendations**: Rule-based + Decision Tree engine  
✅ **Government Schemes**: 17+ Central & Tamil Nadu schemes with eligibility filtering  
✅ **PDF Reports**: Comprehensive farmer reports with ReportLab  
✅ **Large Buttons & Icons**: Designed for low digital literacy  
✅ **Session-Based Auth**: Secure login/register system  

## 🧰 Tech Stack

### Backend
- **Python Flask** - REST API server
- **SQLite** - Database
- **Scikit-learn** - ML models (Logistic Regression, Random Forest, K-Means)
- **Pandas & NumPy** - Data processing
- **ReportLab** - PDF generation
- **Flask-CORS** - Cross-origin support

### Web Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Axios** - API calls
- **React Router** - Navigation

### Mobile App
- **React Native** - Mobile framework
- **Expo** - Development platform
- **NativeWind** - Tailwind for React Native
- **AsyncStorage** - Local storage
- **React Navigation** - Screen navigation

## 📁 Project Structure

```
Farmer_Behaviour_App/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── models.py                 # Database models
│   ├── requirements.txt          # Python dependencies
│   ├── routes/
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── farmer.py            # Farmer data endpoints
│   │   └── results.py           # Results & report endpoints
│   ├── ml/
│   │   ├── prediction.py        # Adoption prediction models
│   │   ├── segmentation.py      # K-Means clustering
│   │   └── recommendation.py    # Recommendation engine
│   ├── data/
│   │   └── schemes.py           # Government schemes database
│   └── utils/
│       └── report_generator.py  # PDF report generation
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── FarmerForm.jsx   # Multi-step form (6 steps)
│   │   │   └── Dashboard.jsx    # Farmer dashboard
│   │   ├── context/
│   │   │   └── LanguageContext.jsx  # Tamil/English toggle
│   │   └── utils/
│   │       └── api.js           # API utilities
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── mobile/
    ├── App.js                   # Main mobile app
    ├── src/
    │   ├── screens/
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── DashboardScreen.js
    │   │   └── FarmerFormScreen.js
    │   └── utils/
    │       ├── api.js           # API utilities
    │       └── storage.js       # AsyncStorage wrapper
    ├── package.json
    └── app.json
```

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python models.py
#run train_model
python ml/train_model.py

# Run Flask server
python app.py
```

Backend will run on `http://localhost:5000`

### Web Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Web app will run on `http://localhost:3000`

### Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start

# Options:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go app on physical device
```

**Important**: Update the API URL in `mobile/src/utils/api.js` to your computer's IP address when testing on a physical device:
```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
```

## 📱 User Flow

### 1. Registration
- Enter name, email/phone, district, password
- Tamil Nadu district dropdown

### 2. Multi-Step Farmer Form (6 Steps)
- **Step 1**: Basic Profile (age, gender, education, experience, income, household size)
- **Step 2**: Land & Crop (land area, ownership, crops, soil type, irrigation, water availability)
- **Step 3**: Technology Usage (checkboxes for current technologies + "Other" field)
- **Step 4**: Scheme Awareness (checkboxes for known government schemes)
- **Step 5**: Financial Behaviour (loan, insurance, savings habit, risk level)
- **Step 6**: Tech Attitude (sliders 1-5 for openness, trust, peer influence, govt influence)

### 3. Dashboard
- **Adoption Meter**: Circular progress showing adoption score (0-100%)
- **Category Badge**: High / Moderate / Low
- **Segmentation Badge**: Highly Adopted / Moderately Adopted / Not Adopted
- **Charts**: Technology usage and scheme awareness visualization
- **Recommendations**: Personalized technology and crop suggestions
- **Government Schemes**: Eligible schemes with Tamil translations
- **PDF Download**: Generate comprehensive farmer report

## 🤖 Machine Learning Models

### 1. Adoption Prediction
- **Models**: Logistic Regression + Random Forest Classifier
- **Features**: 19 features including age, education, income, land area, tech usage, attitudes
- **Output**: Adoption score (0-100%) and category (High/Moderate/Low)
- **Fallback**: Rule-based prediction if models not trained

### 2. Farmer Segmentation
- **Model**: K-Means Clustering (3 clusters)
- **Features**: Tech count, adoption score, education, income, attitudes, scheme awareness
- **Output**: Segment label (Highly Adopted / Moderately Adopted / Not Adopted)

### 3. Recommendation Engine
- **Technology Recommendations**: Rule-based filtering based on adoption category, water availability, land size, income
- **Crop Recommendations**: Decision tree logic based on soil type, water availability, current crop
- **Output**: Top 6 technologies with costs and subsidies, top 3 alternative crops

## 🏛️ Government Schemes

### Central Schemes (11)
- PM-KISAN
- PMFBY (Pradhan Mantri Fasal Bima Yojana)
- Kisan Credit Card (KCC)
- Soil Health Card Scheme
- PMKSY (Irrigation)
- eNAM (National Agriculture Market)
- National Food Security Mission
- Paramparagat Krishi Vikas Yojana (Organic)
- Sub-Mission on Agricultural Mechanization
- ATMA (Extension Services)
- Agriculture Infrastructure Fund

### Tamil Nadu Schemes (6)
- Uzhavar Sandhai (Farmer Markets)
- TN Drip Irrigation Subsidy
- Free Electricity for Agriculture
- TN Crop Insurance Scheme
- Farm Pond Scheme
- Quality Seed Distribution

## 🌐 API Endpoints

### Authentication
- `POST /api/register` - Register new farmer
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/check-session` - Check session status

### Farmer Data
- `POST /api/farmer-data` - Submit farmer form
- `GET /api/farmer-profile/<user_id>` - Get farmer profile
- `PUT /api/farmer-data/<user_id>` - Update farmer data

### Results
- `GET /api/adoption-result/<user_id>` - Get ML prediction results
- `GET /api/recommendations/<user_id>` - Get personalized recommendations
- `GET /api/schemes/<user_id>` - Get eligible government schemes
- `GET /api/report/<user_id>` - Download PDF report

## 🎨 UI Design Principles

1. **Large Buttons**: Minimum 48px height for easy tapping
2. **Icons**: Visual indicators for every section
3. **Colors**: Green (agriculture), Brown (earth), Sky Blue (water)
4. **Tamil-First**: Default language is Tamil with simple words
5. **Minimal Text**: Icon-based navigation
6. **Progress Indicators**: Clear multi-step form progress
7. **Mobile Responsive**: Works on all screen sizes

## 📄 PDF Report Contents

- Farmer details (name, district, age, education, land area, crop)
- Adoption score and category
- Segmentation cluster
- Strengths analysis
- Areas for improvement
- Top 5 technology recommendations with costs
- Top 8 eligible government schemes
- Bilingual (Tamil/English)

## 🔒 Security

- Password hashing using Werkzeug
- Session-based authentication
- CORS enabled for specific origins
- SQL injection protection via parameterized queries

## 🌍 Language Support

- **Default**: Tamil (தமிழ்)
- **Toggle**: English
- **Translations**: All labels, buttons, and messages
- **Font**: Noto Sans Tamil for proper Tamil rendering

## 📊 Sample Data

The system includes a sample data generator for training ML models. Run:

```bash
cd backend/ml
python sample_data.py
```

This creates 500+ synthetic farmer records for model training.

## 🐛 Troubleshooting

### Backend Issues
- **Database not found**: Run `python models.py` to initialize
- **Module not found**: Ensure virtual environment is activated and dependencies installed
- **Port 5000 in use**: Change port in `app.py`

### Frontend Issues
- **API connection failed**: Check backend is running on port 5000
- **Tailwind styles not working**: Run `npm install` again
- **Charts not displaying**: Ensure Chart.js is properly installed

### Mobile Issues
- **Cannot connect to API**: Update API_BASE_URL to your computer's IP
- **Expo won't start**: Clear cache with `npx expo start -c`
- **AsyncStorage errors**: Ensure @react-native-async-storage/async-storage is installed

## 🚀 Deployment

### Backend (Flask)
- Use Gunicorn for production: `gunicorn -w 4 app:app`
- Deploy on Heroku, AWS, or DigitalOcean
- Use PostgreSQL instead of SQLite for production

### Frontend (React)
- Build: `npm run build`
- Deploy on Vercel, Netlify, or AWS S3

### Mobile (React Native)
- Build APK: `eas build --platform android`
- Publish to Google Play Store

## 📝 Future Enhancements

- [ ] Real-time weather integration
- [ ] Crop disease detection using image recognition
- [ ] Market price predictions
- [ ] Multi-language support (Hindi, Telugu, Kannada)
- [ ] Voice input for low-literacy farmers
- [ ] Offline mode for mobile app
- [ ] SMS notifications for scheme updates
- [ ] Community forum for farmers

## 👨‍💻 Development

### Adding New Schemes
Edit `backend/data/schemes.py` and add to `CENTRAL_SCHEMES` or `TAMIL_NADU_SCHEMES` arrays.

### Adding New Languages
Edit `frontend/src/context/LanguageContext.jsx` and add translations to the `translations` object.

### Customizing ML Models
Edit `backend/ml/prediction.py` to adjust features or add new models.

## 📜 License

This project is for educational and agricultural development purposes.

## 🙏 Acknowledgments

- Tamil Nadu farmers for inspiration
- Government of India for scheme information
- Open source community for tools and libraries

---

**Built with ❤️ for Tamil Nadu Farmers**

வாழ்க விவசாயம்! (Long live agriculture!)
# Farmer_Behaviour_Prediction
# AgriNova
