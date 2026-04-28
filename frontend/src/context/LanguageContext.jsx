import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const translations = {
    // Common
    welcome: { en: 'Welcome', ta: 'வணக்கம்' },
    kumar: { en: 'Kumar', ta: 'குமார்' },
    submit: { en: 'Submit', ta: 'சமர்ப்பிக்கவும்' },
    next: { en: 'Next', ta: 'அடுத்து' },
    previous: { en: 'Previous', ta: 'முந்தைய' },
    save: { en: 'Save', ta: 'சேமி' },
    cancel: { en: 'Cancel', ta: 'ரத்து' },
    download: { en: 'Download', ta: 'பதிவிறக்கம்' },
    yes: { en: 'Yes', ta: 'ஆம்' },
    no: { en: 'No', ta: 'இல்லை' },
    selectOption: { en: 'Select', ta: 'தேர்வு செய்யவும்' },
    years: { en: 'Years', ta: 'ஆண்டுகள்' },

    // Months
    jan: { en: 'Jan', ta: 'ஜனவரி' },
    feb: { en: 'Feb', ta: 'பிப்ரவரி' },
    mar: { en: 'Mar', ta: 'மார்ச்' },
    apr: { en: 'Apr', ta: 'ஏப்ரல்' },
    may: { en: 'May', ta: 'மே' },
    jun: { en: 'Jun', ta: 'ஜூன்' },
    jul: { en: 'Jul', ta: 'ஜூலை' },
    aug: { en: 'Aug', ta: 'ஆகஸ்ட்' },
    sep: { en: 'Sep', ta: 'செப்டம்பர்' },
    oct: { en: 'Oct', ta: 'அக்டோபர்' },
    nov: { en: 'Nov', ta: 'நவம்பர்' },
    dec: { en: 'Dec', ta: 'டிசம்பர்' },

    // Auth
    login: { en: 'Login', ta: 'உள்நுழை' },
    register: { en: 'Register', ta: 'பதிவு செய்யவும்' },
    logout: { en: 'Logout', ta: 'வெளியேறு' },
    name: { en: 'Name', ta: 'பெயர்' },
    email: { en: 'Email', ta: 'மின்னஞ்சல்' },
    phone: { en: 'Phone', ta: 'தொலைபேசி' },
    mobileNumber: { en: 'Mobile Number', ta: 'மொபைல் எண்' },
    password: { en: 'Password', ta: 'கடவுச்சொல்' },
    district: { en: 'District', ta: 'மாவட்டம்' },
    sendOtp: { en: 'Send OTP', ta: 'OTP அனுப்பு' },
    enterOtp: { en: 'Enter OTP', ta: 'OTP உள்ளிடவும்' },
    verifyOtp: { en: 'Verify OTP', ta: 'OTP சரிபார்' },
    setPassword: { en: 'Set Password', ta: 'கடவுச்சொல் அமைக்கவும்' },
    confirmPassword: { en: 'Confirm Password', ta: 'கடவுச்சொல் உறுதிப்படுத்தவும்' },
    loginEmailMobile: { en: 'Email / Mobile Number', ta: 'மின்னஞ்சல் / மொபைல் எண்' },
    userAlreadyExists: { en: 'User already exists', ta: 'பயனர் ஏற்கனவே உள்ளார்' },
    invalidOtp: { en: 'Invalid OTP', ta: 'தவறான OTP' },
    registerWithEmail: { en: 'Register with Email', ta: 'மின்னஞ்சல் மூலம் பதிவு செய்யவும்' },
    registerWithPhone: { en: 'Register with Phone', ta: 'தொலைபேசி மூலம் பதிவு செய்யவும்' },
    loginWithEmailPhone: { en: 'Login with Email / Phone', ta: 'மின்னஞ்சல் / தொலைபேசி மூலம் உள்நுழைக' },
    step1of3: { en: 'Step 1 of 3', ta: 'படி 1 (3-இல்)' },
    step2of3: { en: 'Step 2 of 3', ta: 'படி 2 (3-இல்)' },
    step3of3: { en: 'Step 3 of 3', ta: 'படி 3 (3-இல்)' },

    // Guidance Popup
    guidanceTitle: { en: 'Guidance & Encouragement', ta: 'வழிகாட்டுதல் மற்றும் ஊக்கம்' },
    currentLevel: { en: 'Your current adoption level is:', ta: 'உங்கள் தற்போதைய நிலை:' },
    low: { en: 'Low', ta: 'குறைவு' },
    medium: { en: 'Medium', ta: 'நடுத்தரம்' },
    high: { en: 'High', ta: 'அதிகம்' },
    guidanceMessage: {
        en: 'To improve your level, try the recommended actions and update your profile.',
        ta: 'உங்கள் நிலையை மேம்படுத்த, பரிந்துரைகளை முயற்சி செய்து பின்னர் உங்கள் விவரங்களை புதுப்பிக்கவும்'
    },
    suggestedActions: { en: 'Suggested Actions:', ta: 'பரிந்துரைக்கப்பட்ட செயல்கள்:' },
    cropRec: { en: 'Crop recommendations', ta: 'பயிர் பரிந்துரைகள்' },
    govScheme: { en: 'Government scheme registration', ta: 'அரசு திட்ட பதிவு' },
    techUsage: { en: 'Technology usage', ta: 'தொழில்நுட்ப பயன்பாடு' },
    viewRec: { en: 'View Recommendations', ta: 'பரிந்துரைகள் பார்க்க' },
    later: { en: 'Later', ta: 'பின்னர்' },

    // Dashboard
    dashboard: { en: 'Dashboard', ta: 'முகப்பு' },
    adoptionScore: { en: 'Adoption Score', ta: 'ஏற்பு மதிப்பெண்' },
    recommendations: { en: 'Recommendations', ta: 'பரிந்துரைகள்' },
    schemes: { en: 'Government Schemes', ta: 'அரசு திட்டங்கள்' },
    report: { en: 'Download Report', ta: 'அறிக்கை பதிவிறக்கம்' },
    farmerProfile: { en: 'Farmer Profile', ta: 'விவசாயி விவரம்' },
    crops: { en: 'Crops', ta: 'பயிர்கள்' },
    irrigation: { en: 'Irrigation', ta: 'பாசனம்' },

    // Form Steps
    step1: { en: 'Basic Profile', ta: 'அடிப்படை விவரம்' },
    step2: { en: 'Land & Crop Details', ta: 'நிலம் மற்றும் பயிர் விவரங்கள்' },
    step3: { en: 'Technology Usage', ta: 'தொழில்நுட்ப பயன்பாடு' },
    step4: { en: 'Scheme Awareness', ta: 'திட்ட விழிப்புணர்வு' },
    step5: { en: 'Attitude & Risk', ta: 'மனப்பாங்கு மற்றும் அபாயம்' },
    step6: { en: 'Irrigation', ta: 'பாசனம்' },
    step7: { en: 'Market & Linkage', ta: 'சந்தை மற்றும் இணைப்பு' },
    step10: { en: 'Water Irrigation Module', ta: 'பாசன நீர் மேலாண்மை' },

    // Profile Fields
    age: { en: 'Age (Years)', ta: 'வயது (ஆண்டுகள்)' },
    agePlaceholder: { en: 'Enter age (e.g., 35)', ta: 'வயது உள்ளிடவும் (உதா: 35)' },
    gender: { en: 'Gender', ta: 'பாலினம்' },
    male: { en: 'Male', ta: 'ஆண்' },
    female: { en: 'Female', ta: 'பெண்' },
    otherGender: { en: 'Other', ta: 'பிற' },
    education: { en: 'Education Level', ta: 'கல்வி நிலை' },
    season: { en: 'Season', ta: 'பருவம்' },
    kharif: { en: 'Kharif / குறுவை (Jun - Sep)', ta: 'காரிஃப் / குறுவை (ஜூன் - செப்)' },
    rabi: { en: 'Rabi / சம்பா (Oct - Jan)', ta: 'ரபி / சம்பா (அக் - ஜன)' },
    summerOption: { en: 'Summer / நவரை (Feb - May)', ta: 'கோடை / நவரை (பிப் - மே)' },
    eduNoFormal: { en: 'No formal education', ta: 'படிப்பு இல்லை' },
    eduPrimary: { en: 'Primary school', ta: 'தொடக்கப் பள்ளி' },
    eduMiddle: { en: 'Middle school', ta: 'நடுநிலைப் பள்ளி' },
    eduHigh: { en: 'High school', ta: 'மேல்நிலைப் பள்ளி' },
    eduHigherSecondary: { en: 'Higher secondary', ta: 'பிளஸ் இரண்டு' },
    eduDiploma: { en: 'Diploma', ta: 'டிப்ளமோ' },
    eduDegree: { en: 'Degree', ta: 'பட்டம்' },
    eduPostgraduate: { en: 'Postgraduate', ta: 'முதுநிலை பட்டம்' },
    experience: { en: 'Farming Experience (years)', ta: 'விவசாய அனுபவம் (ஆண்டுகள்)' },
    income: { en: 'Annual Income Range', ta: 'ஆண்டு வருமான வரம்பு' },
    incomeBelow50k: { en: 'Below ₹50,000', ta: '₹50,000 க்குக் குறைவாக' },
    income50k_100k: { en: '₹50,000 – ₹1,00,000', ta: '₹50,000 – ₹1,00,000' },
    income100k_200k: { en: '₹1,00,000 – ₹2,00,000', ta: '₹1,00,000 – ₹2,00,000' },
    income200k_500k: { en: '₹2,00,000 – ₹5,00,000', ta: '₹2,00,000 – ₹5,00,000' },
    incomeAbove500k: { en: 'Above ₹5,00,000', ta: '₹5,00,000 க்கும் மேல்' },
    householdSize: { en: 'Household Size', ta: 'குடும்ப அளவு' },
    physicallyChallenged: { en: 'Physically Challenged?', ta: 'மாற்றுத்திறனாளியா?' },
    landOwnership: { en: 'Type of land you are cultivating', ta: 'நீங்கள் சாகுபடி செய்யும் நிலத்தின் வகை' },
    landOwned: { en: 'Owned land (Patta land)', ta: 'சொந்த நிலம் (பட்டா நிலம்)' },
    landLeased: { en: 'Leased land (Kuthagai)', ta: 'குத்தகை நிலம் (குத்தகை)' },
    landRented: { en: 'Rented land (Annual rent / share basis)', ta: 'வாடகை நிலம் (ஆண்டு வாடகை / பங்கு உரிமை)' },
    landSharecropping: { en: 'Sharecropping (Varam system)', ta: 'பங்கு விவசாயம் (வாரம் முறை)' },
    landFamily: { en: 'Family inherited land (Joint patta / ancestral)', ta: 'குடும்ப வாரிசு நிலம் (கூட்டு பட்டா / முன்னோர்கள் வழி)' },
    landGovt: { en: 'Government assigned land (Assigned land / Panchami land)', ta: 'அரசு ஒதுக்கீடு நிலம் (பஞ்சமி நிலம்)' },
    landTemple: { en: 'Temple land lease', ta: 'கோயில் நில குத்தகை' },
    landInformal: { en: 'Cultivating others land without formal agreement', ta: 'ஒப்பந்தம் இல்லாமல் மற்றவர் நிலத்தில் சாகுபடி' },

    // Region Details
    block: { en: 'Block / Taluk', ta: 'ஒன்றியம் / தாலுகா' },
    village: { en: 'Village Panchayat', ta: 'கிராம ஊராட்சி' },
    agroZone: { en: 'Agro-climatic Zone', ta: 'மண் மற்றும் தட்பவெப்ப மண்டலம்' },
    zoneDelta: { en: 'Delta', ta: 'டெல்டா' },
    zoneDry: { en: 'Dry', ta: 'வறண்ட நிலம்' },
    zoneHilly: { en: 'Hilly', ta: 'மலைப் பகுதி' },
    zoneCoastal: { en: 'Coastal', ta: 'கடலோரப் பகுதி' },
    soilType: { en: 'Soil type in your land', ta: 'உங்கள் நிலத்தின் மண் வகை' },
    soilRed: { en: 'Red Soil (Semmann)', ta: 'செம்மண்' },
    soilBlack: { en: 'Black Cotton Soil (Karisal)', ta: 'கரிசல் மண்' },
    soilAlluvial: { en: 'Alluvial Soil (Vandal mann / River soil)', ta: 'வண்டல் மண் (ஆற்று மண்)' },
    soilClay: { en: 'Clay Soil (Kaliman)', ta: 'களிமண்' },
    soilSandy: { en: 'Sandy Soil (Manal mann)', ta: 'மணல் மண்' },
    soilLoamy: { en: 'Loamy Soil (Kalappu mann / Mixed soil)', ta: 'வண்டல் மண் (கலப்பு மண்)' },
    soilLaterite: { en: 'Laterite Soil (Semman karisal mix)', ta: 'சரளை மண் (செம்மண் கரிசல் கலவை)' },
    soilSaline: { en: 'Saline Soil (Uppu mann)', ta: 'உப்பு மண்' },
    soilAlkaline: { en: 'Alkaline Soil (Kaar mann)', ta: 'கார் மண்' },
    soilGravelly: { en: 'Gravelly Soil (Kall mann)', ta: 'கல் மண்' },
    soilMarshy: { en: 'Marshy / Wetland Soil', ta: 'சதுப்பு நில மண்' },
    soilPeaty: { en: 'Peaty / Organic rich soil', ta: 'கரிம மண் / தென்னை வாழை நிலங்கள்' },
    soilMixed: { en: 'Mixed Soil (Dont know exact type)', ta: 'கலப்பு மண் (சரியான வகை தெரியவில்லை)' },
    landArea: { en: 'Land Area (Acres)', ta: 'நிலத்தின் அளவு (ஏக்கர்)' },
    landAreaPlaceholder: { en: 'Enter land area (e.g., 2.5 acres)', ta: 'நில அளவு உள்ளிடவும் (உதா: 2.5 ஏக்கர்)' },
    landSliderHelper: { en: 'Slide to select your land size easily (0.5 – 20 acres)', ta: 'உங்கள் நிலத்தின் அளவை எளிதாக தேர்வு செய்ய ஸ்லைடு செய்யவும் (0.5 – 20 ஏக்கர்)' },
    marketLinkage: { en: 'Market Linkage', ta: 'சந்தை இணைப்பு' },
    marketLocal: { en: 'Local Market', ta: 'உள்ளூர் சந்தை' },
    marketWholesale: { en: 'Wholesale Market', ta: 'மொத்த சந்தை' },
    marketDirect: { en: 'Direct to Consumers', ta: 'நுகர்வோருக்கு நேரடி விற்பனை' },
    marketOnline: { en: 'Online Platforms', ta: 'ஆன்லைன் தளங்கள்' },

    // Water & Energy / Irrigation
    borewellDepth: { en: 'Borewell Depth (Feet)', ta: 'ஆழ்துளை கிணறு ஆழம் (அடி)' },
    borewellDepthPlaceholder: { en: 'Enter depth (e.g., 200 ft)', ta: 'ஆழம் உள்ளிடவும் (உதா: 200 அடி)' },
    scarcityMonths: { en: 'Water Scarcity Months / Year', ta: 'தண்ணீர் பற்றாக்குறை மாதங்கள் / ஆண்டு' },
    scarcity0: { en: '0 months', ta: 'இல்லை' },
    scarcity1_3: { en: '1–3 months', ta: '1–3 மாதங்கள்' },
    scarcity4_6: { en: '4–6 months', ta: '4–6 மாதங்கள்' },
    scarcity7_9: { en: '7–9 months', ta: '7–9 மாதங்கள்' },
    scarcity10_12: { en: '10–12 months', ta: '10–12 மாதங்கள்' },
    irrigationType: { en: 'Irrigation Type', ta: 'பாசன வகை' },
    methodFlood: { en: 'Flood Irrigation', ta: 'வெள்ளப் பாசனம்' },
    methodDrip: { en: 'Drip Irrigation', ta: 'டிரிப் பாசனம்' },
    methodSprinkler: { en: 'Sprinkler Irrigation', ta: 'ஸ்பிரிங்கிளர் பாசனம்' },
    methodManual: { en: 'Manual Irrigation', ta: 'கைமுறை பாசனம்' },
    methodCanal: { en: 'Canal Irrigation', ta: 'கால்வாய் பாசனம்' },
    methodRainfed: { en: 'Rain-fed Farming', ta: 'மழை சார்ந்த விவசாயம்' },
    methodSubsurface: { en: 'Subsurface Irrigation', ta: 'தரைவழி பாசனம்' },
    methodMicro: { en: 'Micro Irrigation', ta: 'நுண்ணீர் பாசனம்' },
    methodFurrow: { en: 'Furrow Irrigation', ta: 'பார் பாசனம் (Furrow)' },
    methodMixed: { en: 'Mixed Method', ta: 'கலப்பு முறை' },
    threePhase: { en: '3-Phase Power Available?', ta: '3-பேஸ் மின்சாரம் உள்ளதா?' },
    powerHours: { en: 'Hours of Power per Day', ta: 'ஒரு நாளைக்கு மின்சாரம் கிடைக்கும் நேரம்' },
    irrigationSource: { en: 'Irrigation Source', ta: 'பாசன ஆதாரம்' },
    irriOpenWell: { en: 'Open Well (Kinaru)', ta: 'கிணறு' },
    irriCanal: { en: 'Canal', ta: 'கால்வாய் பாசனம்' },
    irriBorewell: { en: 'Borewell / Well', ta: 'போர்வெல் / கிணறு' },
    irriRainfed: { en: 'Rainfed', ta: 'மழை சார்ந்தது' },
    irriFarmPond: { en: 'Farm Pond', ta: 'பண்ணை குளம்' },
    irriLake: { en: 'Lake / Tank Irrigation (Eri pasanam)', ta: 'ஏரி பாசனம்' },
    irriCheckDam: { en: 'Check Dam Water', ta: 'செக் டேம் நீர்' },
    riskTolerance: { en: 'Risk Tolerance', ta: 'இடர் சகிப்புத்தன்மை' },
    sourceCanal: { en: 'Canal', ta: 'கால்வாய்' },
    irriSpring: { en: 'Spring water (hill areas)', ta: 'நீரூற்று நீர்' },
    irriDrip: { en: 'Drip Irrigation system', ta: 'சொட்டு நீர் பாசனம்' },
    irriSprinkler: { en: 'Sprinkler Irrigation system', ta: 'தெளிப்பு நீர் பாசனம்' },
    irriFlood: { en: 'Flood Irrigation (traditional method)', ta: 'வாய்மடை பாசனம்' },
    irriPipeline: { en: 'Pipeline irrigation from common source', ta: 'குழாய் பாசனம்' },
    irriPanchayat: { en: 'Water supplied by Panchayat / Community borewell', ta: 'ஊராட்சி / சமூக ஆழ்துளை கிணற்று நீர்' },
    irriTanker: { en: 'Water purchased from tanker lorry', ta: 'தண்ணீர் லாரி மூலம் வாங்கிய நீர்' },
    irriSolar: { en: 'Solar pump irrigation', ta: 'சூரிய சக்தியில் இயங்கும் பம்ப் பாசனம்' },
    irriDiesel: { en: 'Diesel pump set', ta: 'டீசல் பம்ப் செட்' },
    irriElectric: { en: 'Electric motor pump', ta: 'மின்சார மோட்டார் பம்ப்' },
    irriSubmersible: { en: 'Submersible pump', ta: 'மூழ்கும் பம்ப்' },
    irriHandPump: { en: 'Hand pump / manual lifting', ta: 'கை பம்ப் / கைமுறை நீர் இறைத்தல்' },
    irriMicro: { en: 'Micro irrigation (drip + sprinkler combined)', ta: 'நுண்ணீர் பாசனம்' },
    irriRecycled: { en: 'Recycled wastewater / greywater', ta: 'மறுசுழற்சி செய்யப்பட்ட கழிவுநீர்' },
    irriMixed: { en: 'Not sure / mixed sources', ta: 'தெரியவில்லை / கலப்பு ஆதாரங்கள்' },
    waterYearRound: { en: 'Water available throughout the year', ta: 'ஆண்டு முழுவதும் தண்ணீர் கிடைக்கும்' },
    water8_10: { en: 'Water available for 8–10 months', ta: '8–10 மாதங்களுக்கு தண்ணீர் கிடைக்கும்' },
    water5_7: { en: 'Water available for 5–7 months', ta: '5–7 மாதங்களுக்கு தண்ணீர் கிடைக்கும்' },
    waterRainy: { en: 'Water available only during rainy season', ta: 'மழைக்காலத்தில் மட்டுமே தண்ணீர் கிடைக்கும்' },
    waterOneCrop: { en: 'Very limited water – only for one crop', ta: 'மிகக் குறைந்த தண்ணீர் - ஒரு பயிருக்கு மட்டுமே' },
    waterRainfall: { en: 'Depends fully on rainfall', ta: 'முழுமையாக மழையை சார்ந்தது' },
    waterBorewellDecrease: { en: 'Borewell water decreasing every year', ta: 'ஆழ்துளை கிணற்று நீர் ஆண்டுதோறும் குறைகிறது' },
    waterCanalRelease: { en: 'Water available only on canal release days', ta: 'வாய்க்கால் தண்ணீர் திறக்கும் நாட்களில் மட்டுமே கிடைக்கும்' },
    waterTanker: { en: 'Need to buy water from tanker', ta: 'லாரியில் தண்ணீர் வாங்க வேண்டும்' },
    waterShortageSummer: { en: 'Water shortage during summer months', ta: 'கோடை மாதங்களில் தண்ணீர் பற்றாக்குறை' },
    waterLogging: { en: 'Water logging / excess water problem', ta: 'தண்ணீர் தேக்கம் / அதிகப்படியான நீர் பிரச்சனை' },
    waterNotSure: { en: 'Not sure / varies every year', ta: 'தெரியவில்லை / ஆண்டுதோறும் மாறுபடும்' },

    // Crop Pattern
    cropPaddy: { en: 'Paddy', ta: 'நெல்' },
    cropSugarcane: { en: 'Sugarcane', ta: 'கரும்பு' },
    cropBanana: { en: 'Banana', ta: 'வாழை' },
    cropCoconut: { en: 'Coconut', ta: 'தென்னை' },
    cropCotton: { en: 'Cotton', ta: 'பருத்தி' },
    cropGroundnut: { en: 'Groundnut', ta: 'நிலக்கடலை' },
    cropMillets: { en: 'Millets', ta: 'சிறுதானியங்கள்' },
    cropVegetables: { en: 'Vegetables', ta: 'காய்கறிகள்' },
    cropFlowers: { en: 'Flowers', ta: 'பூக்கள்' },
    cropPattern: { en: 'Crop Pattern', ta: 'பயிர் முறை' },
    cropPatternInstruction: { en: 'Select all that apply', ta: 'பொருந்தும் அனைத்தையும் தேர்ந்தெடுக்கவும்' },
    yieldHistory: { en: 'Yield History', ta: 'மகசூல் வரலாறு' },
    yieldIncreasing: { en: 'Increasing every year', ta: 'ஆண்டுதோறும் அதிகரித்து வருகிறது' },
    yieldStable: { en: 'Stable / same as previous years', ta: 'நிலையானது / முந்தைய ஆண்டுகளைப் போன்றது' },
    yieldSlightDecrease: { en: 'Slightly decreasing', ta: 'சிறிது குறைகிறது' },
    yieldDecreasing: { en: 'Decreasing every year', ta: 'ஆண்டுதோறும் குறைகிறது' },
    yieldVeryLow: { en: 'Very low yield', ta: 'மிகக் குறைந்த மகசூல்' },
    yieldRainfall: { en: 'Yield depends on rainfall', ta: 'மகசூல் மழையைச் சார்ந்தது' },
    yieldPests: { en: 'Yield affected by pests/diseases', ta: 'பூச்சிகள்/நோய்களால் மகசூல் பாதிக்கப்பட்டது' },
    yieldWaterShortage: { en: 'Yield affected by water shortage', ta: 'தண்ணீர் பற்றாக்குறையால் மகசூல் பாதிக்கப்பட்டது' },
    yieldSoilProblems: { en: 'Yield affected by soil problems', ta: 'மண் பிரச்சனைகளால் மகசூல் பாதிக்கப்பட்டது' },
    yieldFirstYear: { en: 'First year farming / no past data', ta: 'முதல் ஆண்டு விவசாயம் / கடந்த கால தரவு இல்லை' },
    yieldVaries: { en: 'Varies a lot every year', ta: 'ஆண்டுதோறும் நிறைய மாறுபடும்' },
    yieldNotSure: { en: 'Not sure', ta: 'தெரியவில்லை' },

    // Scheme Awareness
    governmentSchemeAwareness: { en: 'Government Scheme Awareness', ta: 'அரசுத் திட்ட விழிப்புணர்வு' },
    centralGovtSchemeAwareness: { en: 'Central Government Schemes Awareness', ta: 'மத்திய அரசுத் திட்டங்கள் பற்றிய விழிப்புணர்வு' },
    tnGovtSchemeAwareness: { en: 'Tamil Nadu Government Schemes Awareness', ta: 'தமிழ்நாடு அரசுத் திட்டங்கள் பற்றிய விழிப்புணர்வு' },

    schemePMKisan: { en: 'PM-KISAN', ta: 'பிஎம் கிசான் திட்டம்' },
    schemePMFBY: { en: 'PMFBY', ta: 'பிரதான் மந்திரி பயிர் காப்பீடு திட்டம்' },
    schemeMSP: { en: 'MSP', ta: 'குறைந்தபட்ச ஆதரவு விலை' },
    schemeIrrigationSubsidy: { en: 'Irrigation Subsidy', ta: 'பாசன உதவி தொகை' },
    schemeSoilHealthCard: { en: 'Soil Health Card', ta: 'மண் ஆரோக்கிய அட்டை' },
    schemeKCC: { en: 'KCC', ta: 'கிசான் கிரெடிட் கார்டு' },
    schemeENAM: { en: 'eNAM', ta: 'தேசிய வேளாண் சந்தை' },
    schemeFasalBima: { en: 'Fasal Bima', ta: 'பயிர் காப்பீடு திட்டம்' },

    // TN Schemes
    uzhavanApp: { en: 'Uzhavan App', ta: 'உழவன் செயலி' },
    uzhavarSandhai: { en: 'Uzhavar Sandhai (Farmer Direct Market)', ta: 'உழவர் சந்தை' },
    microIrrigation: { en: 'TN Micro Irrigation Subsidy', ta: 'நுண்ணீர்ப்பாசன மானியம் (Micro Irrigation)' },
    freeElectricity: { en: 'Free Electricity for Agriculture Pumps', ta: 'விவசாய மின்சாரம் இலவசம்' },
    soilHealth: { en: 'Soil Health Management Scheme', ta: 'மண் ஆரோக்கிய மேலாண்மை திட்டம்' },
    farmMech: { en: 'Farm Mechanization Subsidy Scheme', ta: 'வேளாண் இயந்திர மானியம்' },
    integratedFarming: { en: 'Integrated Farming System Scheme', ta: 'ஒருங்கிணைந்த விவசாய முறை திட்டம்' },
    techDrip: { en: 'Drip irrigation', ta: 'சொட்டு நீர் பாசனம்' },
    techSprinkler: { en: 'Sprinkler irrigation', ta: 'தெளிப்பு நீர் பாசனம்' },
    techMulching: { en: 'Mulching sheets', ta: 'மூடாக்கு தாள்கள்' },
    techGreenhouse: { en: 'Greenhouse / Polyhouse', ta: 'பசுமை வீடு / பாலிஹவுஸ்' },
    techShadenet: { en: 'Shade net cultivation', ta: 'நிழல் வலை சாகுபடி' },
    techTractor: { en: 'Tractor / Power tiller', ta: 'டிராக்டர் / பவர் டில்லர்' },
    techHarvester: { en: 'Harvesting machine', ta: 'அறுவடை இயந்திரம்' },
    techDrone: { en: 'Drone spraying', ta: 'ட்ரோன் மூலம் தெளித்தல்' },
    techSoilKit: { en: 'Soil testing kit / Soil Health Card', ta: 'மண் பரிசோதனை கிட் / மண் சுகாதார அட்டை' },
    techMoistureSensor: { en: 'Soil moisture sensor', ta: 'மண் ஈரப்பதம் சென்சார்' },
    techWeatherApp: { en: 'Weather forecast mobile app', ta: 'வானிலை முன்னறிவிப்பு மொபைல் செயலி' },
    techDigitalPayment: { en: 'Digital payment (UPI / QR) for selling crops', ta: 'பயிர்களை விற்க டிஜிட்டல் கட்டணம் (UPI / QR)' },
    techCropInsurance: { en: 'Crop insurance (PMFBY)', ta: 'பயிர் காப்பீடு (PMFBY)' },
    techSolarPump: { en: 'Solar pump set', ta: 'சூரிய சக்தியில் இயங்கும் பம்ப் செட்' },
    techMechanizationTools: { en: 'Farm mechanization tools (seed drill, weeder, transplanter)', ta: 'பண்ணை இயந்திரமயமாக்கல் கருவிகள் (விதை துளையிடும் இயந்திரம், களை எடுக்கும் இயந்திரம்)' },
    techNone: { en: 'None of the above', ta: 'மேலே உள்ள எதுவும் இல்லை' },

    // Market & Training
    sellingUzhavarSandhai: { en: 'Selling at Uzhavar Sandhai?', ta: 'உழவர் சந்தையில் விற்பனை செய்கிறீர்களா?' },
    usingEnam: { en: 'Using eNAM?', ta: 'eNAM பயன்படுத்துகிறீர்களா?' },
    marketDirectLocal: { en: 'Direct Market', ta: 'நேரடி சந்தை' },
    marketMiddleman: { en: 'Middleman', ta: 'இடைத்தரகர்' },
    deptTraining: { en: 'Attended Agri Dept Training?', ta: 'வேளாண்மை துறை பயிற்சி பெற்றுள்ளீர்களா?' },
    metVAO: { en: 'Met VAO / AEO?', ta: 'VAO / AEO சந்தித்தீர்களா?' },
    visitedTNAU: { en: 'Visited TNAU Demo Farm?', ta: 'TNAU மாதிரி பண்ணை பார்வையிட்டுள்ளீர்களா?' },

    // Literacy & Smartphone
    readTamil: { en: 'Can read Tamil?', ta: 'தமிழ் படிக்க தெரியுமா?' },
    readEnglish: { en: 'Can read English?', ta: 'ஆங்கிலம் படிக்க தெரியுமா?' },
    voiceGuidance: { en: 'Prefer Voice Guidance?', ta: 'ஒலி வழிகாட்டுதல் தேவையா?' },
    smartphoneUsage: { en: 'Smartphone Usage', ta: 'ஸ்மார்ட்போன் பயன்பாடு' },
    agriYoutube: { en: 'Watch Agri YouTube Channels?', ta: 'விவசாய யூடியூப் சேனல்களைப் பார்க்கிறீர்களா?' },
    whatsappGroups: { en: 'In WhatsApp Farmer Groups?', ta: 'விவசாய வாட்ஸ்அப் குழுக்களில் உள்ளீர்களா?' },

    // Farmer Category
    farmerCategory: { en: 'Farmer Category', ta: 'விவசாயி வகை' },
    smallMarginal: { en: 'Small / Marginal', ta: 'சிறு / குறு விவசாயி' },
    mediumLarge: { en: 'Medium / Large', ta: 'நடுத்தர / பெரிய விவசாயி' },
    smartCard: { en: 'Farmer Smart Card available?', ta: 'விவசாயி ஸ்மார்ட் கார்டு உள்ளதா?' },


    // Savings Habit
    saveRegularly: { en: 'Regularly', ta: 'தொடர்ந்து சேமிக்கிறேன்' },
    saveOccasionally: { en: 'Occasionally', ta: 'சில நேரங்களில் சேமிக்கிறேன்' },
    saveRarely: { en: 'Rarely', ta: 'அரிதாக சேமிக்கிறேன்' },
    saveNoSavings: { en: 'No savings', ta: 'சேமிப்பு இல்லை' },

    // Risk Level
    riskVeryHigh: { en: 'Very High', ta: 'மிக அதிகம்' },
    riskHigh: { en: 'High', ta: 'அதிகம்' },
    riskMedium: { en: 'Medium', ta: 'மிதமான' },
    riskLow: { en: 'Low', ta: 'குறைவு' },
    riskVeryLow: { en: 'Very Low', ta: 'மிக குறைவு' },

    // Financial Behaviour Questions
    loanTaken: { en: 'Have you taken any agricultural loan?', ta: 'விவசாய கடன் எடுத்துள்ளீர்களா?' },
    loanSource: { en: 'Loan source', ta: 'கடன் ஆதாரம்' },
    loanBank: { en: 'Bank', ta: 'வங்கி' },
    loanCooperative: { en: 'Cooperative', ta: 'கூட்டுறவு' },
    loanPrivate: { en: 'Private lender', ta: 'தனியார்' },
    loanNone: { en: 'None', ta: 'இல்லை' },
    repayOnTime: { en: 'Do you repay loans on time?', ta: 'கடனை நேரத்தில் செலுத்துகிறீர்களா?' },
    enrolledPMFBY: { en: 'Have you enrolled in crop insurance (PMFBY)?', ta: 'பயிர் காப்பீடு செய்துள்ளீர்களா?' },
    cropLossEarlier: { en: 'Have you faced crop loss earlier?', ta: 'முன்பு பயிர் இழப்பு ஏற்பட்டதா?' },
    farmingOnlyIncome: { en: 'Is farming your only income source?', ta: 'விவசாயம் மட்டுமே வருமானமா?' },
    hasOtherIncome: { en: 'Do you have other income (dairy, poultry, job, business)?', ta: 'வேறு வருமானம் உள்ளதா?' },
    saveAfterHarvest: { en: 'Do you save money after harvest?', ta: 'அறுவடை பிறகு சேமிப்பீர்களா?' },
    whereSave: { en: 'Where do you save?', ta: 'எங்கு சேமிக்கிறீர்கள்?' },
    saveBank: { en: 'Bank', ta: 'வங்கி' },
    saveHome: { en: 'Home', ta: 'வீடு' },
    saveChit: { en: 'Chit fund', ta: 'சீட்டு' },
    saveSHG: { en: 'SHG (Self Help Group)', ta: 'மகளிர் குழு' },
    investedEquipment: { en: 'Have you invested in any farm equipment in last 3 years?', ta: 'கடந்த 3 ஆண்டுகளில் வேளாண் உபகரணம் வாங்கியுள்ளீர்களா?' },
    digitalPaymentUsage: { en: 'Do you use digital payment (UPI/ATM)?', ta: 'டிஜிட்டல் பணப்பரிவர்த்தனை பயன்படுத்துகிறீர்களா?' },
    checkMarketPrice: { en: 'Do you check market price before selling crops?', ta: 'விற்கும் முன் சந்தை விலையை பார்க்கிறீர்களா?' },
    insuranceDetails: { en: 'Insurance Details', ta: 'காப்பீட்டு விவரங்கள்' },
    enrolledAnyScheme: { en: 'Are you enrolled in any crop insurance scheme?', ta: 'நீங்கள் எந்த பயிர் காப்பீட்டு திட்டத்தில் சேர்ந்துள்ளீர்களா?' },
    whichScheme: { en: 'Which insurance scheme are you enrolled in?', ta: 'நீங்கள் எந்த காப்பீட்டு திட்டத்தில் சேர்ந்துள்ளீர்கள்?' },
    haveClaimed: { en: 'Have you ever claimed crop insurance?', ta: 'நீங்கள் முன்பு பயிர் காப்பீட்டு தொகை கோரியுள்ளீர்களா?' },
    howMuchInsured: { en: 'How much of your farmland is insured?', ta: 'உங்கள் நிலத்தின் எத்தனை பகுதி காப்பீட்டில் உள்ளது?' },
    biggestRisk: { en: 'What is your biggest farming risk?', ta: 'விவசாயத்தில் உங்களுக்கு அதிகமாக கவலை தரும் ஆபத்து எது?' },

    // Insurance Options
    claimReceived: { en: 'Claim Received', ta: 'ஆம், தொகை கிடைத்தது' },
    claimRejected: { en: 'Claim Rejected', ta: 'ஆம், மறுக்கப்பட்டது' },
    noClaim: { en: 'No Claim', ta: 'இல்லை' },
    pmfbyFull: { en: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', ta: 'பிரதான் மந்திரி பாசல் பீமா யோஜனா (PMFBY)' },
    tnStateScheme: { en: 'Tamil Nadu State Crop Insurance Scheme', ta: 'தமிழ்நாடு மாநில பயிர் காப்பீட்டு திட்டம்' },
    privateInsurance: { en: 'Private Insurance', ta: 'தனியார் காப்பீடு' },
    none: { en: 'None', ta: 'எதுவும் இல்லை' },
    drought: { en: 'Drought', ta: 'வறட்சி' },
    flood: { en: 'Flood', ta: 'வெள்ளம்' },
    pestDisease: { en: 'Pest & Disease', ta: 'பூச்சி மற்றும் நோய்' },
    marketPriceDrop: { en: 'Market Price Drop', ta: 'சந்தை விலை குறைவு' },
    notSure: { en: 'Not Sure', ta: 'தெரியவில்லை' },

    // Risk & Decision Behaviour
    attitudeRisk: { en: 'Attitude & Risk', ta: 'மனப்பாங்கும் ஆபத்தும்' },
    riskTryNewMethods: { en: 'I am willing to try new farming methods', ta: 'நான் புதிய வேளாண்மை முறைகளை முயற்சிக்க தயாராக இருக்கிறேன்' },
    riskAfraidLoss: { en: 'I am afraid of financial loss if I try new technology', ta: 'புதிய தொழில்நுட்பத்தை முயற்சித்தால் நிதி இழப்பு ஏற்படும் என நான் பயப்படுகிறேன்' },
    riskFollowNeighbors: { en: 'I follow what neighboring farmers do', ta: 'அருகிலுள்ள விவசாயிகள் செய்வதை நான் பின்பற்றுகிறேன்' },
    opennessToNewTech: { en: 'Openness to New Tech', ta: 'புதிய தொழில்நுட்பத்தை ஏற்கும் மனப்பாங்கு' },
    trustInTech: { en: 'Trust in Technology', ta: 'தொழில்நுட்பத்தின் மீது நம்பிக்கை' },
    scaleStronglyDisagree: { en: 'Strongly Disagree', ta: 'முற்றிலும் ஒப்புக்கொள்ளவில்லை' },
    scaleStronglyAgree: { en: 'Strongly Agree', ta: 'முற்றிலும் ஒப்புக்கொள்கிறேன்' },
    scaleRange: { en: '(1) to (5)', ta: '(1) முதல் (5) வரை' },
    readiness: { en: 'Readiness', ta: 'தயார்நிலை' },
    confidence: { en: 'Confidence', ta: 'நம்பிக்கை' },
    inferredMetrics: { en: 'Inferred Behaviour Metrics', ta: 'கணிப்பு நடத்தை அளவீடுகள்' },
    tooltipWillingness: { en: 'Determines your readiness to experiment with modern tools.', ta: 'நவீன கருவிகளைப் பயன்படுத்துவதற்கான உங்கள் தயார்நிலையைத் தீர்மானிக்கிறது.' },
    tooltipFear: { en: 'A measure of financial caution regarding new tech.', ta: 'புதிய தொழில்நுட்பம் குறித்த நிதி எச்சரிக்கையின் அளவீடு.' },
    tooltipNeighbors: { en: 'Indicates how much you rely on communal experience.', ta: 'சமூக அனுபவத்தை நீங்கள் எவ்வளவு சார்ந்து இருக்கிறீர்கள் என்பதைக் குறிக்கிறது.' },

    // Messages
    others: { en: 'Others', ta: 'பிற' },
    specifyOther: { en: 'Specify other', ta: 'பிற விவரத்தை குறிப்பிடவும்' },
    loginSuccess: { en: 'Login successful!', ta: 'உள்நுழைவு வெற்றி!' },
    registerSuccess: { en: 'Registration successful!', ta: 'பதிவு வெற்றி!' },
    dataSubmitted: { en: 'Data submitted successfully!', ta: 'தரவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' },
    otpSentSuccessfully: { en: 'OTP sent successfully!', ta: 'OTP வெற்றிகரமாக அனுப்பப்பட்டது!' },
    technologyUsage: { en: 'Select technologies and practices you use', ta: 'நீங்கள் பயன்படுத்தும் தொழில்நுட்பங்கள் மற்றும் முறைகளை தேர்வு செய்யவும்' },

    // Branding
    trainingDigitalUsage: { en: 'Training & Digital Usage', ta: 'பயிற்சி மற்றும் டிஜிட்டல் பயன்பாடு' },
    appName: { en: 'AgriNova', ta: 'அக்ரிநோவா' },
    appSubtitle: { en: 'AI-Powered Smart Farming Support', ta: 'நுண்ணறிவு விவசாய தளம்' },

    // Auth Additional
    selectDistrict: { en: 'Select District', ta: 'மாவட்டத்தை தேர்ந்தெடுக்கவும்' },
    alreadyHaveAccount: { en: 'Already have an account?', ta: 'ஏற்கனவே கணக்கு உள்ளதா?' },
    dontHaveAccount: { en: "Don't have an account?", ta: 'கணக்கு இல்லையா?' },

    // Dashboard Additional
    quickActions: { en: 'Quick Actions', ta: 'விரைவான அணுகல்' },
    updateProfile: { en: 'Update Profile', ta: 'சுயவிவரத்தை மாற்ற' },
    viewRecommendations: { en: 'View Recommendations', ta: 'பரிந்துரைகளை பார்க்க' },
    centralGovt: { en: 'Central Govt', ta: 'மத்திய அரசு' },
    tnState: { en: 'TN State', ta: 'தமிழக அரசு' },
    women: { en: 'Women', ta: 'பெண்கள்' },
    digital: { en: 'Digital', ta: 'டிஜிட்டல்' },
    noSchemesFound: { en: 'No schemes found in this category for your profile.', ta: 'உங்கள் சுயவிவரத்திற்கு இந்த பிரிவில் திட்டங்கள் எதுவும் இல்லை.' },
    yourProgress: { en: 'Your Progress', ta: 'உங்கள் வளர்ச்சி' },
    alternativeCrops: { en: 'Crop Recommendations', ta: 'பயிர் பரிந்துரைகள்' },
    recommendedTech: { en: 'Recommended Technologies', ta: 'பரிந்துரைக்கப்பட்ட தொழில்நுட்பங்கள்' },
    benefits: { en: 'Benefits', ta: 'நன்மைகள்' },
    cost: { en: 'Cost', ta: 'செலவு' },
    schemeLabel: { en: 'Scheme', ta: 'திட்டம்' },
    adoptionMsgStart: { en: 'Tailored for your', ta: 'உங்கள்' },
    adoptionMsgEnd: { en: 'adoption level.', ta: 'ஏற்பு நிலைக்கு சிறப்பாக வடிவமைக்கப்பட்டது.' },
    technologies: { en: 'Technologies', ta: 'தொழில்நுட்பங்கள்' },
    learnMore: { en: 'Learn More →', ta: 'மேலும் அறிய →' },
    schemesDesc: { en: 'Highly relevant schemes based on your profile and adoption readiness.', ta: 'உங்கள் சுயவிவரம் மற்றும் ஏற்பு திட்டங்களுக்கு ஏற்ப மிகவும் பொருத்தமான திட்டங்கள்.' },
    aiInsights: { en: 'AI Insights', ta: 'செயற்கை நுண்ணறிவு கணிப்புகள்' },
    insights: { en: 'Insights', ta: 'கணிப்புகள்' },
    insightLowTech: { en: 'Low use of modern technologies', ta: 'நவீன தொழில்நுட்பங்களின் குறைந்த பயன்பாடு' },
    insightGoodTech: { en: 'Good adoption of modern farming tools', ta: 'நவீன விவசாய கருவிகளின் நல்ல ஏற்பு' },
    insightLowAwareness: { en: 'Limited awareness of schemes', ta: 'திட்டங்கள் குறித்த குறைந்த விழிப்புணர்வு' },
    insightGoodAwareness: { en: 'Good awareness of government schemes', ta: 'அரசு திட்டங்கள் குறித்த நல்ல விழிப்புணர்வு' },
    insightOppDrip: { en: 'Opportunity to adopt drip irrigation', ta: 'சொட்டுநீர் பாசனத்தை பின்பற்றுவதற்கான வாய்ப்பு' },
    insightGeneric: { en: 'Optimize resources for better yield', ta: 'சிறந்த மகசூலுக்கு வளங்களை உகந்த முறையில் பயன்படுத்தவும்' },
    soil: { en: 'SOIL', ta: 'மண்' },
    assessment: { en: 'Assessment', ta: 'மதிப்பீடு' },
    acres: { en: 'Acres', ta: 'ஏக்கர்' },
    cents: { en: 'Cents', ta: 'சென்ட்' },
    marginalFarmer: { en: 'Marginal Farmer', ta: 'குறைந்த நிலம்' },
    smallFarmer: { en: 'Small Farmer', ta: 'சிறு விவசாயி' },
    mediumFarmer: { en: 'Medium Farmer', ta: 'நடுத்தர விவசாயி' },
    largeFarmer: { en: 'Large Farmer', ta: 'பெரிய விவசாயி' },

    // Virtual Farm Simulation
    simulation: { en: 'Farm Simulation', ta: 'பண்ணை உருவகப்படுத்துதல்' },
    farmSimulation: { en: '🌾 Virtual Farm Simulation', ta: '🌾 மெய்நிகர் பண்ணை உருவகம்' },
    simSubtitle: { en: 'AI-Powered Before vs After Technology Comparison', ta: 'AI மூலம் தொழில்நுட்ப ஏற்பு ஒப்பீடு' },
    beforeMethod: { en: 'Current Farming Method', ta: 'தற்போதைய விவசாய முறை' },
    afterMethod: { en: 'Improved Farming Method', ta: 'மேம்பட்ட விவசாய முறை' },
    yieldIncrease: { en: 'Yield Increase', ta: 'மகசூல் அதிகரிப்பு' },
    waterSavings: { en: 'Water Savings', ta: 'நீர் சேமிப்பு' },
    incomeIncrease: { en: 'Income Increase', ta: 'வருமான அதிகரிப்பு' },
    cropHealthScore: { en: 'Crop Health Score', ta: 'பயிர் ஆரோக்கிய மதிப்பெண்' },
    yieldKg: { en: 'Total Yield', ta: 'மொத்த மகசூல்' },
    waterUsage: { en: 'Water Usage', ta: 'நீர் பயன்பாடு' },
    profit: { en: 'Estimated Profit', ta: 'மதிப்பிடப்பட்ட லாபம்' },
    chiLabel: { en: 'Crop Health Index', ta: 'பயிர் ஆரோக்கிய குறியீடு' },
    recommendedTechs: { en: 'Recommended Technologies to Add', ta: 'சேர்க்க பரிந்துரைக்கப்பட்ட தொழில்நுட்பங்கள்' },
    simFieldInfo: { en: 'Field Overview', ta: 'வயல் தகவல்' },
    simModelInfo: { en: 'ML Models Used', ta: 'பயன்படுத்தப்பட்ட ML மாதிரிகள்' },
    backToDashboard: { en: '← Back to Dashboard', ta: '← முகப்பிற்கு திரும்பு' },
    loadingSimulation: { en: 'Loading simulation...', ta: 'உருவகம் ஏற்றுகிறது...' },
    perAcre: { en: 'per acre', ta: 'ஒரு ஏக்கருக்கு' },
    totalField: { en: 'Total Field', ta: 'மொத்த வயல்' },
    simMLYield: { en: 'Yield Model: Linear Regression', ta: 'மகசூல் மாதிரி: நேரியல் பின்னமடைவு' },
    simMLWater: { en: 'Water Model: Random Forest Regressor', ta: 'நீர் மாதிரி: சீரற்ற வன வழிமுறை' },

    // Simulation explanation
    simExplainTitle: {
        en: 'How we calculate these numbers',
        ta: 'இந்த கணிப்புகள் எப்படிக் கணக்கிடப்படுகின்றன?'
    },
    simExplainYield: {
        en: 'Predicted yield combines your land area, a typical yield per acre for the chosen crop, a soil quality multiplier and the boost from modern technologies like drip, mulching or sensors. The model first computes a “before” yield using your current method, then adds the extra benefit from the new technologies to get the “after” yield.',
        ta: 'முன்கூட்டிய மகசூல் (Predicted Yield) = அடிப்படை மகசூல் × மண் தரம் × நில அளவு × (1 + தொழில்நுட்ப தாக்கம்). அடிப்படை மகசூல் என்பது அந்த பயிருக்கு பொதுவாக கிடைக்கும் kg/ஏக்கர் மதிப்பு. மண் வகைக்கு (கரிசல், செம்மண்...) ஒரு மடக்கெண் (soil multiplier) தரப்படுகிறது. நீங்கள் சேர்த்திருக்கும் டிரிப், மல்சிங் போன்ற தொழில்நுட்பங்களின் தாக்கம் (yield delta) கூட்டி, “முன்” மற்றும் “பின்” கால மகசூல் கணக்கிடப்படுகிறது.',
    },
    simExplainWater: {
        en: 'Water savings compare how much water the crop normally uses per acre in a season with your chosen irrigation method (flood, manual, sprinkler, drip…) and the effect of water‑saving technologies. The simulation estimates total litres of water before and after improvements, then shows by what percentage the “after” farm uses less water.',
        ta: 'நீர் சேமிப்பு (Water Savings) கணக்கில், முதலில் அந்த பயிருக்கு ஒரு பருவத்திற்கு தேவைப்படும் சராசரி நீர் (litres/acre) எடுக்கப்படுகிறது. அதன் மீது நீங்கள் தேர்ந்தெடுத்த பாசன முறை (Flood, Manual, Sprinkler, Drip...) அடிப்படையில் நீர் பல்தொகை சேர்க்கப்படுகிறது. பின்னர், நீர் சேமிக்கும் தொழில்நுட்பங்கள் எவ்வளவு சதவீதம் நீர் குறைக்க முடியும் என்று மாதிரி கணக்கிடுகிறது. “முன்” மற்றும் “பின்” நீர் பயன்படுத்தலை ஒப்பிட்டு எவ்வளவு % சேமிப்பு என்று காட்டப்படுகிறது.',
    },
    simExplainClimate: {
        en: 'Climate risk and the Crop Health Index (0–100) are driven by soil quality, irrigation method, government scheme awareness and the technologies you use. Better soil and efficient irrigation increase the base score; each added technology further improves it. From this score, the model decides whether your climate risk is “High” or “Low”.',
        ta: 'Climate Risk மற்றும் Crop Health Index 0–100 மதிப்பெண்களில் அமைக்கப்பட்டுள்ளது. மண் தரம் அதிகமாக இருக்கும்போது, சிறந்த பாசன முறையை (Drip/Sprinkler) பயன்படுத்தும்போது, மேலும் அதிக அரசு திட்டங்களை பற்றி அறிந்திருக்கும்போது அடிப்படை ஆரோக்கிய மதிப்பெண் உயர்கிறது. நீங்கள் சேர்த்திருக்கும் தொழில்நுட்பங்கள் (soil test, moisture sensor, crop insurance போன்றவை) இந்த மதிப்பெண்ணை மேலும் உயர்த்துகின்றன. இந்த CHI அடிப்படையில் அபாய நிலை (High / Low) நிர்ணயிக்கப்படுகிறது.',
    },

    // Water Irrigation Module Detailed Inputs
    irrigMethod: { en: 'Irrigation Method', ta: 'பாசன முறை' },


    waterSource: { en: 'Water Source', ta: 'நீர் மூலாதாரம்' },
    sourceOpenWell: { en: 'Open Well', ta: 'திறந்த கிணறு' },
    sourceRiver: { en: 'River Water', ta: 'ஆறு' },
    sourceRainwater: { en: 'Rainwater Harvesting', ta: 'மழைநீர் சேகரிப்பு' },
    sourceLake: { en: 'Lake', ta: 'ஏரி' },
    sourceTank: { en: 'Tank Water', ta: 'தொட்டி நீர்' },
    sourceGovt: { en: 'Government Irrigation Supply', ta: 'அரசு பாசன விநியோகம்' },

    waterAvailability: { en: 'Water Availability', ta: 'நீர் கிடைக்கும் அளவு' },
    availVeryHigh: { en: 'Very High', ta: 'மிகவும் அதிகம்' },
    availHigh: { en: 'High', ta: 'அதிகம்' },
    availMedium: { en: 'Medium', ta: 'மிதமான' },
    availLow: { en: 'Low', ta: 'குறைவு' },
    availVeryLow: { en: 'Very Low', ta: 'மிகவும் குறைவு' },
    availSeasonal: { en: 'Seasonal Water Only', ta: 'பருவகால நீர் மட்டும்' },

    irrigFrequency: { en: 'Irrigation Frequency', ta: 'நீர் விடும் இடைவெளி' },
    freqDaily: { en: 'Daily', ta: 'தினமும்' },
    freqEvery2Days: { en: 'Every 2 days', ta: '2 நாட்களுக்கு ஒருமுறை' },
    freqEvery3Days: { en: 'Every 3 days', ta: '3 நாட்களுக்கு ஒருமுறை' },
    freqEvery4_5Days: { en: 'Every 4–5 days', ta: '4-5 நாட்களுக்கு ஒருமுறை' },
    freqWeekly: { en: 'Weekly', ta: 'வாரம் ஒருமுறை' },
    freqOnce10Days: { en: 'Once in 10 days', ta: '10 நாட்களுக்கு ஒருமுறை' },
    freqRainfall: { en: 'Based on rainfall', ta: 'மழையைப் பொறுத்து' },

    fieldDrainage: { en: 'Field Drainage Condition', ta: 'நீர் வடிகால் நிலை' },
    drainVeryGood: { en: 'Very Good', ta: 'மிகவும் நன்று' },
    drainGood: { en: 'Good', ta: 'நன்று' },
    drainAverage: { en: 'Average', ta: 'சராசரி' },
    drainPoor: { en: 'Poor', ta: 'மோசம்' },
    drainVeryPoor: { en: 'Very Poor', ta: 'மிகவும் மோசம்' },
    drainWaterlogging: { en: 'Waterlogging occurs', ta: 'தண்ணீர் தேக்கம் ஏற்படுகிறது' },

    landLevel: { en: 'Land Level', ta: 'நில சமநிலை' },
    levelLevel: { en: 'Level Field', ta: 'சம நிலம்' },
    levelSlightlyUneven: { en: 'Slightly Uneven', ta: 'சற்று சமமில்லாத' },
    levelUneven: { en: 'Uneven Field', ta: 'சமமில்லாத வயல்' },
    levelTerraced: { en: 'Terraced Field', ta: 'அடுக்கு வயல்' },
    levelSloped: { en: 'Sloped Land', ta: 'சாய்வான நிலம்' },

    currentMoisture: { en: 'Current Soil Moisture', ta: 'தற்போதைய மண் ஈரப்பதம்' },
    moistVeryWet: { en: 'Very Wet', ta: 'மிகவும் ஈரமான' },
    moistMoist: { en: 'Moist', ta: 'ஈரப்பதம்' },
    moistNormal: { en: 'Normal', ta: 'சாதாரண' },
    moistDry: { en: 'Dry', ta: 'உலர்ந்த' },
    moistVeryDry: { en: 'Very Dry', ta: 'மிகவும் உலர்ந்த' },

    systemCondition: { en: 'Irrigation System Condition', ta: 'பாசன அமைப்பு நிலை' },
    condNew: { en: 'New System', ta: 'புதிய அமைப்பு' },
    condWorking: { en: 'Working Properly', ta: 'சரியாக வேலை செய்கிறது' },
    condMinorLeak: { en: 'Minor Leakage', ta: 'சிறிய கசிவு' },
    condMajorLeak: { en: 'Major Leakage', ta: 'பெரிய கசிவு' },
    condDamaged: { en: 'Damaged System', ta: 'பழுதடைந்த அமைப்பு' },
    condNotSure: { en: 'Not Sure', ta: 'தெரியவில்லை' },

    waterStorage: { en: 'Water Storage Available', ta: 'தண்ணீர் சேமிப்பு வசதி' },
    storageFarmPond: { en: 'Farm Pond', ta: 'பண்ணை குளம்' },
    storageTank: { en: 'Storage Tank', ta: 'சேமிப்பு தொட்டி' },
    storageReservoir: { en: 'Water Reservoir', ta: 'நீர்த்தேக்கம்' },
    storageCheckDam: { en: 'Check Dam', ta: 'தடுப்பணை' },
    storageNone: { en: 'No Storage Facility', ta: 'சேமிப்பு வசதி இல்லை' },

    irrigTiming: { en: 'Time of Irrigation', ta: 'பாசனம் செய்யும் நேரம்' },
    timeMorning: { en: 'Early Morning', ta: 'அதிகாலை' },
    timeAfternoon: { en: 'Afternoon', ta: 'மதியம்' },
    timeEvening: { en: 'Evening', ta: 'மாலை' },
    timeNight: { en: 'Night', ta: 'இரவு' },
    timeAvailability: { en: 'Depends on availability', ta: 'கிடைப்பதைப் பொறுத்தது' },

    rainfallDependency: { en: 'Rainfall Dependency', ta: 'மழை சார்ந்திருத்தல்' },
    depFully: { en: 'Fully Rain-fed', ta: 'முழுமையாக மழையை சார்ந்தது' },
    depMostly: { en: 'Mostly Rain-fed', ta: 'பெரும்பாலும் மழையை சார்ந்தது' },
    depPartially: { en: 'Partially Rain-fed', ta: 'ஓரளவு மழையை சார்ந்தது' },
    depNot: { en: 'Not Rain-fed', ta: 'மழையை சார்ந்தது அல்ல' },

    cropAge: { en: 'Days After Planting', ta: 'பயிரிட்ட பின் நாட்கள்' },

    // Simulation Comparisons
    waterUsedBefore: { en: 'Water Used Before Simulation', ta: 'உருவகப்படுத்துதலுக்கு முன் பயன்படுத்தப்பட்ட நீர்' },
    waterUsedAfter: { en: 'Water Used After Simulation', ta: 'உருவகப்படுத்துதலுக்கு பின் பயன்படுத்தப்பட்ட நீர்' },
    litersPerAcre: { en: 'liters per acre', ta: 'லிட்டர்/ஏக்கர்' },
    improvementsApplied: { en: 'Improvements Applied from Water Irrigation Module', ta: 'பாசன நீர் மேலாண்மையிலிருந்து செயல்படுத்தப்பட்ட மேம்பாடுகள்' },
    improvementDrip: { en: 'Changed irrigation method from Flood to Drip', ta: 'சாதாரண பாசனத்திலிருந்து சொட்டுநீர் பாசனத்திற்கு மாற்றப்பட்டது' },
    improvementDistribution: { en: 'Improved water distribution', ta: 'நீர் விநியோகம் மேம்படுத்தப்பட்டது' },
    improvementWastage: { en: 'Reduced water wastage', ta: 'நீர் வீணாவது குறைக்கப்பட்டது' },
    improvementSchedule: { en: 'Optimized irrigation schedule', ta: 'பாசன அட்டவணை உகந்தாக்கப்பட்டது' },
    resultSoil: { en: 'Better soil moisture', ta: 'சிறந்த மண் ஈரப்பதம்' },
    resultPlants: { en: 'Healthier plants', ta: 'ஆரோக்கியமான செடிகள்' },
    resultYield: { en: 'Higher yield', ta: 'அதிக மகசூல்' },
    simInputsTitle: {
        en: 'What inputs this simulation considers',
        ta: 'இந்த உருவகம் எந்த பண்ணை விவரங்களைப் பயன்படுத்துகிறது'
    },
    simInputsCropsHeading: {
        en: 'Crop types supported',
        ta: 'ஆதரிக்கப்படும் பயிர் வகைகள்'
    },
    simInputsCropsText: {
        en: 'You can simulate common Tamil Nadu crops such as Paddy (Rice), Tomato, Maize, Groundnut, Cotton and Sugarcane. The model uses typical yield and water requirements for each crop as a starting point.',
        ta: 'நீங்கள் நெல், தக்காளி, மக்காச்சோளம், நிலக்கடலை, பருத்தி, கரும்பு போன்ற தமிழகத்தில் பொதுவாக பயிரிடப்படும் பயிர்களை உருவகப்படுத்தலாம். ஒவ்வொரு பயிருக்கும் வழக்கமாக கிடைக்கும் மகசூல் மற்றும் நீர் தேவையை மாதிரி அடிப்படையாக எடுத்துக் கொள்கிறது.'
    },
    simInputsFertilizerHeading: {
        en: 'Fertilizer usage',
        ta: 'உரம் பயன்பாடு'
    },
    simInputsFertilizerText: {
        en: 'Fertilizer options include “None”, organic sources like farmyard manure, vermicompost and green manure, and chemical fertilizers such as urea, DAP, SSP, MOP, ammonium sulphate, CAN and NPK mixes (17:17:17, 20:20:0). Higher and more balanced fertilizer levels gradually increase predicted yield and crop health.',
        ta: 'உரம் விருப்பங்களில் “உரம் பயன்படுத்தவில்லை”, மாட்டு சாண உரம், வெர்மி கம்போஸ்ட், பச்சை உரம் போன்ற இயற்கை உரங்கள் மற்றும் யூரியா, DAP, SSP, MOP, அமோனியம் சல்பேட், CAN, NPK 17:17:17, NPK 20:20:0 போன்ற இரசாயன உரங்கள் அடங்கும். சரியான அளவில் மற்றும் சமநிலையுடன் உரம் கொடுக்கப்படும்போது உருவக மாதிரியில் மகசூலும், பயிர் ஆரோக்கியமும் கட்டுக்கோப்பாக அதிகரிக்கிறது.'
    },
    simInputsPestHeading: {
        en: 'Pest and weed pressure',
        ta: 'பூச்சி மற்றும் களைகள் தாக்கம்'
    },
    simInputsPestText: {
        en: 'The simulation also uses weed level (low / medium / high) and pest presence (yes / no / not sure). High weeds or untreated pests reduce crop health and expected yield in the “Before Farm”, while good control in the “After Farm” leads to greener leaves and higher yield.',
        ta: 'உருவகத்தில் களைகள் அளவு (குறைவு / மிதமான / அதிகம்) மற்றும் பூச்சி தாக்கம் (உள்ளது / இல்லை / தெரியவில்லை) ஆகியவையும் எடுத்துக் கொள்ளப்படுகின்றன. அதிக களைகள் அல்லது கட்டுப்படுத்தப்படாத பூச்சிகள் “முன்னர்” பண்ணையில் பயிர் ஆரோக்கியத்தையும் எதிர்பார்க்கப்படும் மகசூலையும் குறைக்கின்றன; “மேம்படுத்திய பிறகு” சரியான கட்டுப்பாடு வைத்தால் இலைகள் பச்சையாகவும், மகசூல் உயர்ந்ததாகவும் காட்டப்படும்.'
    },

    // Districts
    districts: {
        en: [
            'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
            'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur',
            'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris',
            'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga',
            'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
            'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
            'Viluppuram', 'Virudhunagar'
        ],
        ta: [
            'அரியலூர்', 'செங்கல்பட்டு', 'சென்னை', 'கோயம்புத்தூர்', 'கடலூர்', 'தர்மபுரி',
            'திண்டுக்கல்', 'ஈரோடு', 'கள்ளக்குறிச்சி', 'காஞ்சிபுரம்', 'கன்னியாகுமரி', 'கரூர்',
            'கிருஷ்ணகிரி', 'மதுரை', 'மயிலாடுதுறை', 'நாகப்பட்டினம்', 'நாமக்கல்', 'நீலகிரி',
            'பெரம்பலூர்', 'புதுக்கோட்டை', 'ராமநாதபுரம்', 'ராணிப்பேட்டை', 'சேலம்', 'சிவகங்கை',
            'தென்காசி', 'தஞ்சாவூர்', 'தேனி', 'தூத்துக்குடி', 'திருச்சி', 'திருநெல்வேலி',
            'திருப்பத்தூர்', 'திருப்பூர்', 'திருவள்ளூர்', 'திருவண்ணாமலை', 'திருவாரூர்', 'வேலூர்',
            'விழுப்புரம்', 'விருதுநகர்'
        ]
    },
    next_step_title: {
        en: 'Ready for the Next Step?',
        ta: 'அடுத்த கட்டத்திற்கு தயாரா?'
    },
    next_step_desc: {
        en: 'You can start over to simulate another crop or go to your dashboard to see your personalized recommendations and government schemes.',
        ta: 'நீங்கள் மற்றொரு பயிரை உருவகப்படுத்த மீண்டும் தொடங்கலாம் அல்லது உங்களின் தனிப்பயனாக்கப்பட்ட பரிந்துரைகள் மற்றும் அரசு திட்டங்களைப் பார்க்க உங்கள் முகப்பிற்குச் செல்லலாம்.'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ta'); // Default to Tamil

    const t = (key) => {
        return translations[key]?.[language] || key;
    };

    const tDistrict = (districtName) => {
        if (!districtName) return districtName;
        const enDistricts = translations.districts.en;
        const taDistricts = translations.districts.ta;

        // Try to find index in English list
        const indexEn = enDistricts.indexOf(districtName);
        if (indexEn !== -1) {
            return language === 'ta' ? taDistricts[indexEn] : enDistricts[indexEn];
        }

        // Try to find index in Tamil list
        const indexTa = taDistricts.indexOf(districtName);
        if (indexTa !== -1) {
            return language === 'en' ? enDistricts[indexTa] : taDistricts[indexTa];
        }

        return districtName;
    };

    const tValue = (category, value) => {
        if (!value) return value;
        if (language === 'en') return value;

        let key = '';
        if (category === 'soil') key = `soil${value}`;
        else if (category === 'irrigation') key = `irri${value}`;
        else if (category === 'crop') key = `crop${value}`;
        else if (category === 'category') key = value.toLowerCase();

        return translations[key]?.[language] || value;
    };

    const tName = (name) => {
        if (!name) return name;
        if (language === 'en') return name;
        const lowered = name.toLowerCase();
        return translations[lowered]?.ta || name;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ta' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tDistrict, tValue, tName, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
