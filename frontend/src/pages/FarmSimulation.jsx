import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, translations } from '../context/LanguageContext';
import { simulationAPI } from '../utils/api';
import {
    FaLeaf, FaTint, FaRupeeSign, FaChartLine, FaSeedling,
    FaArrowLeft, FaArrowRight, FaCheckCircle, FaFlask, FaWater, FaCube, FaWalking, FaVrCardboard, FaMagic, FaStar,
    FaCalculator, FaCalendarCheck
} from 'react-icons/fa';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Stars, Environment, ContactShadows, Float, useHelper, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

class InlineErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        // Keep console signal for debugging without taking down whole app.
        console.error('FarmSimulation inline error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) return this.props.fallback || null;
        return this.props.children;
    }
}

// ─── Crop canvas drawing ──────────────────────────────────────────────────────

const CROP_MODELS = {
    'Paddy': { stalkColor: '#34d399', leafColor: '#6ee7b7', height: 0.6, spacing: 0.3, icon: '🌾' },
    'Sugarcane': { stalkColor: '#214e1d', leafColor: '#4ade80', height: 2.5, spacing: 0.6, icon: '🎋' },
    'Banana': { stalkColor: '#4d7c0f', leafColor: '#84cc16', height: 2.6, spacing: 2.2, icon: '🍌' },
    'Maize': { stalkColor: '#3f6212', leafColor: '#a3e635', height: 2.1, spacing: 0.7, icon: '🌽' },
    'Cotton': { stalkColor: '#4a5568', leafColor: '#f8fafc', height: 1.2, spacing: 1.0, icon: '☁️' },
    'Groundnut': { stalkColor: '#78350f', leafColor: '#16a34a', height: 0.4, spacing: 0.8, icon: '🥜' },
    'Millets': { stalkColor: '#854d0e', leafColor: '#fde047', height: 1.4, spacing: 0.5, icon: '🌾' },
    'Vegetables': { stalkColor: '#065f46', leafColor: '#10b981', height: 0.5, spacing: 0.4, icon: '🥦' },
    'Tomato': { stalkColor: '#064e3b', leafColor: '#ef4444', height: 0.6, spacing: 0.6, icon: '🍅' },
    'Onion': { stalkColor: '#047857', leafColor: '#6ee7b7', height: 0.3, spacing: 0.3, icon: '🧅' },
    'Potato': { stalkColor: '#78350f', leafColor: '#4ade80', height: 0.3, spacing: 0.4, icon: '🥔' },
    'Chili': { stalkColor: '#166534', leafColor: '#dc2626', height: 0.5, spacing: 0.5, icon: '🌶️' },
    'Brinjal': { stalkColor: '#166534', leafColor: '#7c3aed', height: 0.6, spacing: 0.6, icon: '🍆' },
    'Flowers': { stalkColor: '#166534', leafColor: '#f43f5e', height: 0.4, spacing: 0.5, icon: '🌸' },
    'Default': { stalkColor: '#166534', leafColor: '#22c55e', height: 1.0, spacing: 1.0, icon: '🌱' }
};

const TAMIL_SIM_STRINGS = {
    // Form
    'District': 'மாவட்டம்',
    'Crop Type': 'பயிர் வகை',
    'Land Size (Acres) Input': 'நில அளவு (ஏக்கர்)',
    'Soil Type': 'மண் வகை',
    'Irrigation Method': 'பாசன முறை',
    'Water Availability': 'நீர் கிடைப்புத்தன்மை',
    'Season': 'பருவம்',
    'Enter your farm details to see your virtual field': 'உங்கள் மெய்நிகர் வயலைப் பார்க்க பண்ணை விவரங்களை உள்ளிடவும்',
    'Generate Virtual Farm': 'மெய்நிகர் பண்ணையை உருவாக்கு',
    'Acres': 'ஏக்கர்',
    'Days to Harvest': 'அறுவடைக்கு இன்னும்',
    'Days': 'நாட்கள்',
    'Total Duration': 'மொத்த காலம்',
    'Virtual Farm Simulation': 'மெய்நிகர் பண்ணை உருவகம்',
    'Planting Date / Days After Planting': 'விதைத்த தேதி / கடந்த நாட்கள்',
    'Date': 'தேதி',
    'Seed Variety': 'விதை வகை',
    'Plant Spacing Input': 'செடிகளுக்கிடை இடைவெளி',
    'Weed Level Input': 'களைகள் அளவு',
    'Interactive 3D Simulation': 'மெய்நிகர் முப்பரிமாண உருவகம்',
    'Ground View': 'தரைவழி பார்வை',
    'Fly View': 'வான்வழி பார்வை',
    'Fullscreen': 'முழுத்திரை',
    'Click anywhere to lock • Use WASD / Arrows': 'கிளிக் செய்யவும் • WASD / அம்புக்குறிகளைப் பயன்படுத்தவும்',
    '3D Plant Analytics': 'பயிர் முப்பரிமாண பகுப்பாய்வு',
    'Health': 'ஆரோக்கியம்',
    'Moisture': 'ஈரப்பதம்',
    'Grid Position': 'கட்ட நிலை',
    'Close Details': 'விவரங்களை மூடு',
    'Optimal': 'சிறந்தது',

    // Option values
    'High': 'அதிகம்',
    'Medium': 'மிதமான',
    'Low': 'குறைவு',
    'Kharif': 'காரிஃப்',
    'Rabi': 'ரபி',
    'Summer': 'கோடை',
    'Paddy': 'நெல்',
    'Wheat': 'கோதுமை',
    'Maize': 'மக்காச்சோளம்',
    'Barley': 'பார்லி',
    'Sorghum': 'சோளம்',
    'Pearl Millet': 'கம்பு',
    'Finger Millet': 'கேழ்வரகு',
    'Foxtail Millet': 'தினை',
    'Little Millet': 'சாமை',
    'Kodo Millet': 'வரகு',
    'Barnyard Millet': 'குதிரைவாலி',
    'Red Gram': 'துவரை',
    'Green Gram': 'பாசிப்பயறு',
    'Black Gram': 'உளுந்து',
    'Bengal Gram': 'கொண்டைக்கடலை',
    'Horse Gram': 'கொள்ளு',
    'Cowpea': 'காராமணி',
    'Field Pea': 'பட்டாணி',
    'Lentil': 'பருப்பு',
    'Sesame': 'எள்',
    'Sunflower': 'சூரியகாந்தி',
    'Mustard': 'கடுகு',
    'Soybean': 'சோயாபீன்',
    'Castor': 'ஆமணக்கு',
    'Linseed': 'ஆளிவிதை',
    'Safflower': 'குசும்பா',
    'Tomato': 'தக்காளி',
    'Onion': 'வெங்காயம்',
    'Potato': 'உருளைக்கிழங்கு',
    'Brinjal': 'கத்தரிக்காய்',
    'Chilli': 'மிளகாய்',
    'Chili': 'மிளகாய்',
    'Capsicum': 'குடைமிளகாய்',
    'Okra': 'வெண்டைக்காய்',
    'Cabbage': 'முட்டைக்கோஸ்',
    'Cauliflower': 'காலிஃபிளவர்',
    'Carrot': 'கேரட்',
    'Beetroot': 'பீட்ரூட்',
    'Radish': 'முள்ளங்கி',
    'Pumpkin': 'பூசணிக்காய்',
    'Bitter Gourd': 'பாகற்காய்',
    'Bottle Gourd': 'சுரைக்காய்',
    'Ridge Gourd': 'பீர்க்கங்காய்',
    'Snake Gourd': 'புடலங்காய்',
    'Cucumber': 'வெள்ளரிக்காய்',
    'Beans': 'பீன்ஸ்',
    'Peas': 'பட்டாணி',
    'Banana': 'வாழை',
    'Mango': 'மாம்பழம்',
    'Papaya': 'பப்பாளி',
    'Guava': 'கொய்யா',
    'Pomegranate': 'மாதுளை',
    'Sapota': 'சப்போட்டா',
    'Pineapple': 'அன்னாசி',
    'Jackfruit': 'பலாப்பழம்',
    'Watermelon': 'தர்பூசணி',
    'Muskmelon': 'முலாம் பழம்',
    'Coconut': 'தென்னை',
    'Custard Apple': 'சீத்தாப்பழம்',
    'Amla': 'நெல்லிக்காய்',
    'Sugarcane': 'கரும்பு',
    'Cotton': 'பருத்தி',
    'Tobacco': 'புகையிலை',
    'Jute': 'சணல்',
    'Coffee': 'காபி',
    'Tea': 'தேநீர்',
    'Rubber': 'ரப்பர்',
    'Arecanut': 'பாக்கு',
    'Cocoa': 'கோகோ',
    'Turmeric': 'மஞ்சள்',
    'Ginger': 'இஞ்சி',
    'Coriander': 'கொத்தமல்லி',
    'Cumin': 'சீரகம்',
    'Fenugreek': 'வெந்தயம்',
    'Cardamom': 'ஏலக்காய்',
    'Black Pepper': 'மிளகு',
    'Clove': 'கிராம்பு',
    'Nutmeg': 'ஜாதிக்காய்',
    'Garlic': 'பூண்டு',
    'Napier Grass': 'நேப்பியர் புல்',
    'Sorghum Fodder': 'சோளத் தீவனம்',
    'Maize Fodder': 'மக்காச்சோளத் தீவனம்',
    'Cowpea Fodder': 'காராமணி தீவனம்',
    'Lucerne': 'குதிரை மசால்',
    'Groundnut': 'நிலக்கடலை',
    'Millets': 'சிறுதானியம்',
    'Vegetables': 'காய்கறிகள்',
    'Flowers': 'மலர்கள்',
    'Flood Irrigation': 'வெள்ளப் பாசனம்',
    'Manual Irrigation': 'கைமுறை பாசனம்',
    'Sprinkler Irrigation': 'ஸ்பிரிங்கிளர் பாசனம்',
    'Drip Irrigation': 'டிரிப் பாசனம்',
    'Furrow Irrigation': 'பள்ளம் பாசனம்',
    'Canal Irrigation': 'கால்வாய் பாசனம்',
    'Rainfed Farming': 'மழை சார்ந்த விவசாயம்',

    // Irrigation Module
    'Water Source': 'நீர் மூலாதாரம்',
    'Irrigation Frequency': 'நீர் விடும் இடைவெளி',
    'Field Drainage Condition': 'நீர் வடிகால் நிலை',
    'Land Level': 'நில சமநிலை',
    'Current Soil Moisture': 'தற்போதைய மண் ஈரப்பதம்',
    'Irrigation System Condition': 'பாசன அமைப்பு நிலை',
    'Water Storage Available': 'தண்ணீர் சேமிப்பு வசதி',
    'Time of Irrigation': 'பாசனம் செய்யும் நேரம்',
    'Rainfall Dependency': 'மழை சார்ந்திருத்தல்',
    'Days After Planting': 'பயிரிட்ட பின் நாட்கள்',
    'Planting Date': 'விதைத்த தேதி',
    'Local Variety': 'உள்ளூர் விதை',
    'Hybrid Variety': 'ஹைப்ரிட் விதை',
    'Plant Spacing Detail': 'செடிகளுக்கிடை இடைவெளி',
    'Close': 'மிக அருகில்',
    'Normal': 'சரியான இடைவெளி',
    'Wide': 'அதிக இடைவெளி',
    'Weed Level Detail': 'களைகள் அளவு',
    'Pest Presence': 'பூச்சி தாக்கம்',
    'Crop Health Observation': 'பயிர் ஆரோக்கியம்',
    'Good': 'நல்லது',
    'Average': 'சராசரி',
    'Poor': 'மோசம்',
    'Yes': 'உள்ளது',
    'No': 'இல்லை',
    'Not sure': 'தெரியவில்லை',
    'Fertilizer Usage': 'உரம் பயன்பாடு',
    'Organic Fertilizers': 'இயற்கை உரங்கள்',
    'Chemical Fertilizers': 'இரசாயன உரங்கள்',
    'None': 'இல்லை',
    'others': 'பிற',
    'other_fertilizer_placeholder': 'பிற உரங்கள் இருப்பின் இங்கே எழுதவும்',
    'other_crop_placeholder': 'பயிர் பெயரை உள்ளிடவும்',
    'other_seed_placeholder': 'விதை வகையை உள்ளிடவும்',
    'other_spacing_placeholder': 'இடைவெளி விவரத்தை உள்ளிடவும்',
    'other_weed_placeholder': 'களைகள் அளவை விவரிக்கவும்',
    'other_pest_placeholder': 'பூச்சி தாக்கத்தை விவரிக்கவும்',
    'other_health_placeholder': 'பயிர் நிலையை விவரிக்கவும்',
    'Plant Height': 'செடி உயரம்',
    'Leaf Color': 'இலை நிறம்',
    'Healthy, well-nourished crop': 'சத்து சரியாக கிடைக்கும் ஆரோக்கியமான பயிர்',
    'Possible nutrient deficiency or stress': 'சத்து குறைவு அல்லது அழுத்தம் இருப்பதற்கான சாத்தியம்',
    'Severe stress / dryness or damage': 'கடுமையான உலர்ச்சி / சேதம் கொண்ட நிலை',
    'Growth Stage Module': 'பயிர் வளர்ச்சி நிலை',
    'Very High': 'மிக அதிகம்',
    'Very Low': 'மிகக் குறைவு',
    'Seasonal': 'பருவகாலமானது',
    'Daily': 'தினமும்',
    'Every 2 days': '2 நாட்களுக்கு ஒருமுறை',
    'Every 3 days': '3 நாட்களுக்கு ஒருமுறை',
    'Every 4-5 days': '4-5 நாட்களுக்கு ஒருமுறை',
    'Weekly': 'வாரம் ஒருமுறை',
    'Once in 10 days': '10 நாட்களுக்கு ஒருமுறை',
    'Rainfall (Freq)': 'மழை காலத்தில் மட்டும்',
    'Very Good': 'மிகச் சிறப்பு',
    'Waterlogging': 'நீர் தேக்கம்',
    'Level': 'சமமானது',
    'Slightly Uneven': 'சிறிது சமமற்றது',
    'Uneven': 'சமமற்றது',
    'Terraced': 'படிமான அமைப்பு',
    'Sloped': 'சரிவானது',
    'Very Wet': 'மிகவும் ஈரமானது',
    'Moist': 'ஈரமானது',
    'Dry': 'வறண்டது',
    'Very Dry': 'மிகவும் வறண்டது',
    'New': 'புதியது',
    'Working': 'நல்ல நிலையில் உள்ளது',
    'Minor Leak': 'சிறிய கசிவு',
    'Major Leak': 'பெரிய கசிவு',
    'Damaged': 'சேதமடைந்தது',
    'Not Sure': 'தெரியவில்லை',
    'Farm Pond': 'பண்ணைக் குட்டை',
    'Tank': 'தொட்டி/குளம்',
    'Reservoir': 'தேக்ககம்',
    'Check Dam': 'தடுப்பணை',
    'Fully': 'முழுவதும்',
    'Mostly': 'பெரும்பாலும்',
    'Partially': 'ஓரளவு',
    'Not': 'இல்லை',
    'Borewell': 'ஆழ்துளை கிணறு',
    'Open Well': 'திறந்த வெளி கிணறு',
    'River': 'ஆறு',
    'Lake': 'ஏரி',
    'Government Irrigation Supply': 'அரசு பாசன விநியோகம்',
    'go_to_login': 'உள்நுழைய',
    'Hello': 'வணக்கம்',
    'Cereals (Food Grains)': 'தானியங்கள் (உணவு தானியங்கள்)',
    'Pulses': 'பருப்பு வகைகள்',
    'Oilseeds': 'எண்ணெய் வித்துக்கள்',
    'Fruits': 'பழங்கள்',
    'Cash Crops': 'பணப்பயிர்கள்',
    'Plantation Crops': 'தோட்டக்கலைப் பயிர்கள்',
    'Spices & Condiments': 'நறுமணப் பொருட்கள்',
    'Fodder Crops': 'தீவனப் பயிர்கள்',
    'Land Size (Acres) Summary': 'நில அளவு (ஏக்கர்)',
    'season': 'பருவம்',
    'kharif': 'காரிஃப் (சம்பா)',
    'rabi': 'ரபி (குறுவை)',
    'summerOption': 'கோடை',
    'selectOption': 'தேர்வு செய்யவும்',
    'sim_why_adopt_text': 'இந்த உருவகம், நீங்கள் அளித்த தகவல்களின் அடிப்படையில், தற்போதைய வயலில் இருக்கும் களைகள், பூச்சி தாக்கம், உரம் குறைவு போன்ற காரணங்கள் எப்படி மகசூலைக் குறைக்கின்றன என்று காட்டுகிறது. பரிந்துரைக்கப்பட்ட மேம்பாடுகள் (சமநிலை உரம், களைகள் அகற்றல், பூச்சி கட்டுப்பாடு, சரியான இடைவெளி) பயன்படுத்தப்படும் போது செடி வளர்ச்சி மற்றும் மண் ஆரோக்கியம் மேம்படுகிறது. கீழே உள்ள விரிவான கணக்கீடு மற்றும் கால அட்டவணை மூலம் உங்கள் மகசூல் எவ்வாறு அதிகரிக்கிறது என்பதை தெளிவாகக் காணலாம்.',
    'Plant Density': 'செடி அடர்த்தி',
    'Field Problems': 'புல பிரச்சினைகள்',
    'Expected Yield': 'எதிர்பார்க்கப்படும் மகசூல்',
    'Expected Yield (tons)': 'எதிர்பார்க்கப்படும் மகசூல் (டன்களில்)',
    'Yield in tons': 'மகசூல் (டன்களில்)',
    'ton/acre': 'டன்/ஏக்கர்',
    'tons (total)': 'டன்கள் (மொத்தம்)',
    'Growth stage': 'வளர்ச்சி நிலை',
    'Early growth': 'ஆரம்ப வளர்ச்சி நிலை',
    'Mid growth': 'நடுத்தர வளர்ச்சி நிலை',
    'Late / Maturity stage': 'இறுதி / முதிர்ச்சி நிலை',
    'analyzing_regional': 'பிராந்திய முறைகளை ஆய்வு செய்கிறது...',
    'PEST ATTACK DETECTED': 'பூச்சி தாக்கம் கண்டறியப்பட்டது!',
    'worms_visible': 'புழுக்கள் மற்றும் கம்பளிப்புழுக்கள் இலைகளில் காட்டப்படுகின்றன',
    'WEEDS': 'களைகள்',
    'dense_weeds': 'அடர்த்தியான களை படர்ச்சி காட்டப்படுகிறது',
    'moderate_weeds': 'மிதமான களை வளர்ச்சி காட்டப்படுகிறது',
    'scattered_weeds': 'சிறிய களை பரவல் காட்டப்படுகிறது',
    'FARM IMPROVED!': 'பண்ணை மேம்படுத்தப்பட்டது!',
    'pests_eliminated': 'பூச்சிகள் மற்றும் களைகள் அகற்றப்பட்டன',
    'Improvements Applied': 'செய்யப்பட்ட மேம்பாடுகள்',
    'Water usage reduced by 35%': 'நீர் பயன்பாடு 35% குறைக்கப்பட்டுள்ளது',
    'Crop health index increased': 'பயிர் ஆரோக்கிய குறியீடு அதிகரிக்கப்பட்டது',
    'Soil Moisture': 'மண் ஈரப்பதம்',
    'Frequency': 'இடைவெளி',
    'Temperature': 'வெப்பநிலை',
    'Rainfall (Climate)': 'மழைப்பொழிவு',
    'Before Farm': 'தற்போதைய நிலை',
    'After Farm': 'மேம்படுத்தப்பட்ட நிலை',
    'Water Usage': 'நீர் பயன்பாடு',
    'Water Savings': 'நீர் சேமிப்பு',
    'Climate Risk': 'தட்பவெப்ப அபாயம்',
    'From': 'இருந்து',
    'To': 'இற்கு',
    'Recommended': 'பரிந்துரைக்கப்படுபவை',
    'Fertilizer Management': 'உரம் மேலாண்மை',
    'Basal Dose': 'அடி உரம்',
    'Top Dressing': 'மேலுரம்',
    'Precise Pest Control': 'துல்லியமான பூச்சி கட்டுப்பாடு',
    'Climate & Weed Control': 'தட்பவெப்பநிலை & களை கட்டுப்பாடு',
    'Irrigation Upgrade': 'பாசன மேம்பாடு',
    'Application & Care Schedule': 'செயல்பாட்டு கால அட்டவணை',
    'Improvements Applied to Increase Yield': 'மகசூலை அதிகரிக்க செய்யப்பட்ட மேம்பாடுகள்',
    'Recommended Management Practices': 'பரிந்துரைக்கப்பட்ட மேலாண்மை முறைகள்',
    'Input Summary': 'பகிர்ந்த விவரங்கள்',
    'Farm Input Details': 'பண்ணை குறித்த விவரங்கள்',
    'Land Size': 'நில அளவு',
    'Fertilizers Used': 'பயன்படுத்தப்பட்ட உரங்கள்',
    'No fertilizer information': 'உரம் குறித்த தகவல் இல்லை',
    'Harvest Summary': 'அறுவடைச் சுருக்கம்',
    'Growth Days': 'வளர்ச்சி நாட்கள்',
    'not_set': 'குறிப்பிடப்படவில்லை',

    // Irrigation Options
    'methodFlood': 'வெள்ளப் பாசனம்',
    'methodDrip': 'சொட்டு நீர் பாசனம்',
    'methodSprinkler': 'தெளிப்பு நீர் பாசனம்',
    'methodCanal': 'கால்வாய் பாசனம்',
    'methodFurrow': 'பார் பாசனம் (Furrow)',
    'methodRainfed': 'மழை சார்ந்த விவசாயம்',
    'methodSubsurface': 'தரைவழி பாசனம்',
    'methodMicro': 'மைக்ரோ பாசனம்',
    'sourceOpenWell': 'திறந்த வெளி கிணறு',
    'sourceRiver': 'ஆறு',
    'sourceRainwater': 'மழைநீர்',
    'sourceLake': 'ஏரி',
    'sourceTank': 'குளம்/குட்டை',
    'sourceGovt': 'அரசு விநியோகம்',
    'availVeryHigh': 'மிக அதிகம்',
    'availHigh': 'அதிகம்',
    'availMedium': 'மிதமானது',
    'availLow': 'குறைவு',
    'availVeryLow': 'மிகக் குறைவு',
    'availSeasonal': 'பருவகாலமானது',
    'freqDaily': 'தினமும்',
    'freqEvery2Days': '2 நாட்களுக்கு ஒருமுறை',
    'freqEvery3Days': '3 நாட்களுக்கு ஒருமுறை',
    'freqEvery4_5Days': '4-5 நாட்களுக்கு ஒருமுறை',
    'freqWeekly': 'வாரம் ஒருமுறை',
    'freqOnce10Days': '10 நாட்களுக்கு ஒருமுறை',
    'freqRainfall': 'மழை காலத்தில் மட்டும்',
    'drainVeryGood': 'மிகச் சிறப்பு',
    'drainGood': 'நல்லது',
    'drainAverage': 'சராசரி',
    'drainPoor': 'மோசம்',
    'drainVeryPoor': 'மிகவும் மோசம்',
    'drainWaterlogging': 'நீர் தேக்கம்',
    'levelLevel': 'சமமானது',
    'levelSlightlyUneven': 'சிறிது சமமற்றது',
    'levelUneven': 'சமமற்றது',
    'levelTerraced': 'படிமான அமைப்பு',
    'levelSloped': 'சரிவானது',
    'moistVeryWet': 'மிகவும் ஈரமானது',
    'moistMoist': 'ஈரமானது',
    'moistNormal': 'சாதாரணமானது',
    'moistDry': 'வறண்டது',
    'moistVeryDry': 'மிகவும் வறண்டது',
    'condNew': 'புதியது',
    'condWorking': 'நல்ல நிலையில் உள்ளது',
    'condMinorLeak': 'சிறிய கசிவு',
    'condMajorLeak': 'பெரிய கசிவு',
    'condDamaged': 'சேதமடைந்தது',
    'condNotSure': 'தெரியவில்லை',
    'storageFarmPond': 'பண்ணைக் குட்டை',
    'storageTank': 'தொட்டி/குளம்',
    'storageReservoir': 'தேக்ககம்',
    'storageCheckDam': 'தடுப்பணை',
    'storageNone': 'இல்லை',
    'timeMorning': 'காலை',
    'timeAfternoon': 'மதியம்',
    'timeEvening': 'மாலை',
    'timeNight': 'இரவு',
    'timeAvailability': 'கிடைக்கும் பொழுது',
    'depFully': 'முழுவதும்',
    'depMostly': 'பெரும்பாலும்',
    'depPartially': 'ஓரளவு',
    'depNot': 'இல்லை',
    'specifyOther': 'விவரத்தைக் குறிப்பிடவும்',
    'Water & Irrigation Details': 'நீர் மற்றும் பாசன விவரங்கள்',

    // Steps
    'Generating Farm...': 'பண்ணை உருவாக்கப்படுகிறது...',
    'Analyzing soil and climate data...': 'மண் மற்றும் தட்பவெப்ப நிலை ஆய்வு செய்யப்படுகிறது...',
    'Before: Current Farm': 'தற்போதைய பண்ணை நிலை',
    'After: Improved Farm': 'மேம்படுத்தப்பட்ட பண்ணை நிலை',
    'Apply Improvements': 'மேம்பாடுகளைச் செய்க',
    'View Final Comparison': 'இறுதி ஒப்பீட்டைப் பார்',

    // Modules
    'Crop Growth Module': 'பயிர் வளர்ச்சி நிலை',
    'Growth Stage': 'வளர்ச்சி நிலை',
    'Predicted Yield': 'எதிர்பார்க்கப்படும் மகசூல்',
    'Water Irrigation Module': 'பாசன நீர் மேலாண்மை',
    'Method': 'முறை',
    'Usage Level': 'பயன்பாட்டு அளவு',
    'Water Needed': 'தேவைப்படும் நீர்',
    'Climate Analysis': 'தட்பவெப்ப நிலை ஆய்வு',
    'Risk Level': 'அபாய நிலை',
    'Low (Adapted)': 'குறைவு (திறன்படுத்தப்பட்டது)',
    'Low (Targeted)': 'குறைவு (குறிநோக்குடன்)',
    'Simulation Insights': 'உருவக நுண்ணறிவு',

    // Comparison
    'Farm Reality Check': 'பண்ணை உண்மை நிலை ஒப்பீடு',
    'Comparison: Current vs Improved Methods': 'ஒப்பீடு: தற்போதைய VS மேம்பட்ட முறைகள்',
    'Traditional Practices': 'பாரம்பரிய முறைகள்',
    'Modern Technology': 'நவீன தொழில்நுட்பம்',
    'High (Wastage)': 'அதிகம் (வீணாதல்)',
    'Low (Resilient)': 'குறைவு (எதிர்ப்புத்திறன்)',
    'INCREASE': 'அதிகரிப்பு',
    'SAVED': 'சேமிப்பு',
    'EFFICIENT DRIP': 'திறனுள்ள சொட்டுநீர்',
    'Why Adopt These Changes?': 'இந்த மாற்றங்களை ஏன் செய்ய வேண்டும்?',
    'Start Over': 'மீண்டும் தொடங்கு',
    'Go to Dashboard': 'முகப்பிற்குச் செல்',

    // Explanation card
    'How we calculate these numbers': 'இந்த கணிப்புகள் எப்படிக் கணக்கிடப்படுகின்றன?',
    'Yield explanation bullet': 'முன்கூட்டிய மகசூல் (Predicted Yield) = அடிப்படை மகசூல் × மண் தரம் × நில அளவு × (1 + தொழில்நுட்ப தாக்கம்). அடிப்படை மகசூல் என்பது அந்த பயிருக்கு பொதுவாக கிடைக்கும் kg/ஏக்கர் மதிப்பு. மண் வகைக்கு (கரிசல், செம்மண்...) ஒரு மடக்கெண் (soil multiplier) தரப்படுகிறது. நீங்கள் சேர்த்திருக்கும் டிரிப், மல்சிங் போன்ற தொழில்நுட்பங்களின் தாக்கம் (yield delta) கூட்டி, எளிய நேரியல் கணக்கீட்டால் “முன்” மற்றும் “பின்” கால மகசூல் kg-ஆக கணக்கிடப்படுகிறது, பின்னர் டன்களாக மாற்றப்படுகிறது.',
    'Water explanation bullet': 'நீர் சேமிப்பு (Water Savings) கணக்கில், முதலில் அந்த பயிருக்கு ஒரு பருவத்திற்கு தேவைப்படும் சராசரி நீர் (litres/acre) எடுக்கப்படுகிறது. அதன் மீது நீங்கள் தேர்ந்தெடுத்த பாசன முறை (Flood, Manual, Sprinkler, Drip...) அடிப்படையில் நீர் பல்தொகை (penalty / bonus) சேர்க்கப்படுகிறது. பிறகு, நீர் சேமிக்கும் தொழில்நுட்பங்கள் (டிரிப், மொய்ஸ்சர் சென்சார், вэதர் ஆப்) எவ்வளவு சதவீதம் நீர் குறைக்க முடியும் என்று மாதிரி கணக்கிடுகிறது. “முன்” நீர் பயன்படுத்தல் மற்றும் “பின்” நீர் பயன்படுத்தல் இரண்டையும் ஒப்பிட்டு, எவ்வளவு % நீர் சேமிப்பு என்று காட்டப்படுகிறது.',
    'Climate explanation bullet': 'Climate Risk மற்றும் Crop Health Index 0–100 மதிப்பெண்களில் அமைக்கப்பட்டுள்ளது. மண் தரம் அதிகமாக இருக்கும்போது, சிறந்த பாசன முறையை (Drip/Sprinkler) பயன்படுத்தும்போது, மேலும் அதிக அரசு திட்டங்களை பற்றி அறிந்திருக்கும்போது அடிப்படை ஆரோக்கிய மதிப்பெண் (base CHI) உயர்கிறது. பின்னர், நீங்கள் சேர்த்திருக்கும் தொழில்நுட்பங்கள் (soil test, moisture sensor, crop insurance போன்றவை) இந்த மதிப்பெண்ணை மேலும் உயர்த்துகின்றன. இந்த CHI அடிப்படையில் அபாய நிலை (High / Low) நிர்ணயிக்கப்படுகிறது மற்றும் “Before / After” climate risk கார்டுகளில் காட்டப்படுகிறது.'
};


// --- 3D Components ---

function Plant3D({ type, position, health, growth, improved, sandbox, onInspect }) {
    const config = CROP_MODELS[type] || CROP_MODELS.Default;
    // Slightly more uneven height in BEFORE view, more uniform in AFTER
    const randomFactor = useMemo(() => 0.8 + Math.random() * 0.4, []);
    // Moisture and Distribution stress (Before simulation)
    const stressFactor = useMemo(() => {
        if (improved) return 1.0;
        let stress = 1.0;
        if (sandbox?.moistureLevel === 'Very Dry') stress *= 0.7;
        else if (sandbox?.moistureLevel === 'Dry') stress *= 0.85;
        else if (sandbox?.moistureLevel === 'Very Wet') stress *= 0.8; // waterlogged stress

        if (sandbox?.distribution === 'Uneven') {
            // Some plants get more water, some less
            const posHash = Math.abs(Math.sin(position[0] * 123.4) * Math.cos(position[2] * 456.7));
            if (posHash < 0.3) stress *= 0.7; // too dry area
            else if (posHash > 0.8) stress *= 0.8; // too wet area
        }
        return stress;
    }, [improved, sandbox?.moistureLevel, sandbox?.distribution, position]);

    const height = config.height * growth * (improved ? 1 : randomFactor * stressFactor);

    // Leaf colour based on health and stress
    let color = config.leafColor;
    if (health < 45 || stressFactor < 0.75) {
        color = '#92400e'; // brown / dry
    } else if (health < 65 || stressFactor < 0.9) {
        color = '#ca8a04'; // yellowish
    }
    if (sandbox?.pests && !improved) {
        color = '#b45309'; // damaged / pest-bitten brownish tone
    }

    // Animated worm ref
    const wormRef = useRef();
    const catRef = useRef();

    useFrame(() => {
        // Only run animation logic if pests are actually present and it's the 'before' view
        if (!sandbox?.pests || improved) return;

        if (wormRef.current) {
            const t = performance.now() / 600;
            wormRef.current.position.x = Math.sin(t) * 0.08;
            wormRef.current.position.z = Math.cos(t * 0.7) * 0.06;
        }
        if (catRef.current) {
            const t = performance.now() / 900;
            catRef.current.position.x = Math.sin(t + 1.5) * 0.07;
            catRef.current.rotation.y = t * 0.5;
        }
    });

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onInspect(position); }}>
            {/* Stalk */}
            <mesh position={[0, height / 2, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.08, height, 8]} />
                <meshStandardMaterial color={config.stalkColor} />
            </mesh>

            {/* Leaves/Head */}
            {type === 'Sugarcane' || type === 'Maize' ? (
                <mesh position={[0, height, 0]} castShadow>
                    <coneGeometry args={[0.3, 0.8, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            ) : (
                <mesh position={[0, height, 0]} castShadow>
                    <sphereGeometry args={[height * 0.3, 8, 8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )}

            {/* Maize Cobs */}
            {type === 'Maize' && growth > 0.7 && (
                <mesh position={[0.1, height * 0.5, 0]} castShadow>
                    <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
                    <meshStandardMaterial color="#fde047" />
                </mesh>
            )}

            {/* ─── PEST VISUALS (Before simulation only) ─── */}
            {sandbox?.pests && !improved && (
                <>
                    {/* Leaf hole 1 – dark bite hole near top */}
                    <mesh position={[0.18, height * 0.82, 0.08]} castShadow>
                        <sphereGeometry args={[height * 0.10, 7, 7]} />
                        <meshStandardMaterial color="#0f172a" />
                    </mesh>
                    {/* Leaf hole 2 – second chewed area */}
                    <mesh position={[-0.14, height * 0.70, 0.05]} castShadow>
                        <sphereGeometry args={[height * 0.08, 6, 6]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>

                    {/* WORM – large, bright green, animated crawling on leaf */}
                    <group ref={wormRef} position={[0.0, height * 0.88, 0.1]}>
                        {/* Worm body segments */}
                        {[0, 0.08, 0.16, 0.24, 0.32].map((offset, i) => (
                            <mesh key={i} position={[offset - 0.16, 0, 0]}>
                                <sphereGeometry args={[0.055, 6, 6]} />
                                <meshStandardMaterial color={i % 2 === 0 ? '#16a34a' : '#15803d'} />
                            </mesh>
                        ))}
                        {/* Worm head – slightly bigger */}
                        <mesh position={[0.22, 0, 0]}>
                            <sphereGeometry args={[0.07, 7, 7]} />
                            <meshStandardMaterial color="#166534" />
                        </mesh>
                        {/* Worm eyes */}
                        <mesh position={[0.26, 0.04, 0.05]}>
                            <sphereGeometry args={[0.02, 4, 4]} />
                            <meshStandardMaterial color="#ffffff" />
                        </mesh>
                    </group>

                    {/* CATERPILLAR – orange/brown, animated on stem */}
                    <group ref={catRef} position={[0.05, height * 0.55, 0.08]}>
                        {[0, 0.07, 0.14, 0.21].map((offset, i) => (
                            <mesh key={i} position={[0, offset - 0.10, 0]}>
                                <sphereGeometry args={[0.05, 6, 6]} />
                                <meshStandardMaterial color={i % 2 === 0 ? '#d97706' : '#b45309'} />
                            </mesh>
                        ))}
                        {/* Caterpillar head */}
                        <mesh position={[0, 0.15, 0]}>
                            <sphereGeometry args={[0.065, 6, 6]} />
                            <meshStandardMaterial color="#92400e" />
                        </mesh>
                    </group>
                </>
            )}
        </group>
    );
}

function Sprinkler({ position }) {
    const group = useRef();
    const sprayRef = useRef();
    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y += 0.05;
        }
    });

    return (
        <group position={position}>
            {/* Base */}
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
                <meshStandardMaterial color="#475569" />
            </mesh>
            {/* Rotating Head */}
            <group ref={group} position={[0, 0.5, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>
                {/* Spray Visual - Translucent Cone */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                    <coneGeometry args={[0.4, 0.6, 8, 1, true]} />
                    <meshStandardMaterial color="#60a5fa" transparent opacity={0.35} />
                </mesh>
                {/* Water Particles */}
                {[0, 1, 2, 3].map((i) => (
                    <mesh key={i} position={[0.3 * Math.cos(i * Math.PI / 2), 0.1, 0.3 * Math.sin(i * Math.PI / 2)]}>
                        <sphereGeometry args={[0.03, 4, 4]} />
                        <meshStandardMaterial color="#93c5fd" transparent opacity={0.6} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

function Rain3D({ side }) {
    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i < 200; i++) {
            p.push([
                (Math.random() - 0.5) * side * 1.5,
                Math.random() * 10,
                (Math.random() - 0.5) * side * 1.5
            ]);
        }
        return p;
    }, [side]);

    return (
        <group>
            {points.map((pos, i) => (
                <RainDrop key={i} position={pos} />
            ))}
        </group>
    );
}

function RainDrop({ position }) {
    const ref = useRef();
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.position.y -= 15 * delta;
            if (ref.current.position.y < 0) ref.current.position.y = 10;
        }
    });
    return (
        <mesh ref={ref} position={position}>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
            <meshStandardMaterial color="#60a5fa" transparent opacity={0.5} />
        </mesh>
    );
}

function CanalEntry({ side }) {
    return (
        <group position={[-side / 2 - 1, 0, 0]}>
            {/* Source Box */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[1, 0.4, 2]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>
            {/* Flowing Water */}
            <mesh position={[0.5, 0.05, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[1, 0.1, 1]} />
                <meshStandardMaterial color="#3b82f6" />
            </mesh>
        </group>
    );
}

function Canal({ side, spacing, count }) {
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <group key={i} position={[0, -0.05, (i - count / 2) * spacing * 4]}>
                    {/* Canal Bed */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                        <planeGeometry args={[side, spacing * 0.6]} />
                        <meshStandardMaterial color="#1e3a8a" />
                    </mesh>
                    {/* Water Level */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                        <planeGeometry args={[side, spacing * 0.5]} />
                        <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function Furrow({ side, spacing, rows }) {
    return (
        <group>
            {Array.from({ length: rows }).map((_, i) => (
                <group key={i} position={[0, -0.02, (i - rows / 2) * spacing + spacing / 2]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[side, 0.15]} />
                        <meshStandardMaterial color="#1d4ed8" transparent opacity={0.5} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function MovementController() {
    const { camera } = useThree();
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const keys = useRef({});

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault(); // Stop blue highlight / scrolling
            }
            keys.current[e.code] = true;
        };
        const handleKeyUp = (e) => (keys.current[e.code] = false);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        velocity.current.x -= velocity.current.x * 10.0 * delta;
        velocity.current.z -= velocity.current.z * 10.0 * delta;

        direction.current.z = Number(keys.current['KeyW'] || keys.current['ArrowUp']) - Number(keys.current['KeyS'] || keys.current['ArrowDown']);
        direction.current.x = Number(keys.current['KeyD'] || keys.current['ArrowRight']) - Number(keys.current['KeyA'] || keys.current['ArrowLeft']);
        direction.current.normalize();

        if (keys.current['KeyW'] || keys.current['KeyS'] || keys.current['ArrowUp'] || keys.current['ArrowDown']) velocity.current.z -= direction.current.z * 40.0 * delta;
        if (keys.current['KeyA'] || keys.current['KeyD'] || keys.current['ArrowLeft'] || keys.current['ArrowRight']) velocity.current.x -= direction.current.x * 40.0 * delta;

        camera.translateX(-velocity.current.x * delta);
        camera.translateZ(-velocity.current.z * delta);
        camera.position.y = 1.6; // Keep eyes at 1.6m
    });

    return null;
}

function Field3D({ cropName, landArea, improved, chi, sandbox, onInspect }) {
    const normalized = normalizeCropName(cropName);
    const config = CROP_MODELS[normalized] || CROP_MODELS.Default;

    // Calculate grid based on landArea (simplified)
    const side = Math.sqrt(landArea) * 10;
    const spacing = config.spacing;
    const rows = Math.floor(side / spacing);
    const cols = Math.floor(side / spacing);

    const plants = useMemo(() => {
        const temp = [];
        const count = Math.min(rows * cols, 400); // Limit for performance
        for (let i = 0; i < count; i++) {
            const r = Math.floor(i / cols);
            const c = i % cols;
            temp.push({
                id: i,
                pos: [
                    (c - cols / 2) * spacing + (Math.random() * 0.1),
                    0,
                    (r - rows / 2) * spacing + (Math.random() * 0.1)
                ]
            });
        }
        return temp;
    }, [rows, cols, spacing]);

    return (
        <group>
            {plants.map(p => (
                <Plant3D
                    key={p.id}
                    type={normalized}
                    position={p.pos}
                    health={chi}
                    growth={sandbox.growth}
                    improved={improved}
                    sandbox={sandbox}
                    onInspect={onInspect}
                />
            ))}

            {/* Ground - Forced brown for consistency */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
                <planeGeometry args={[side + 5, side + 5]} />
                <meshStandardMaterial
                    color="#3f2b1d"
                    roughness={sandbox.waterLog ? 0.2 : 0.8}
                />
            </mesh>

            {/* Irrigation Visuals */}
            {sandbox.irrigation_method === 'Sprinkler' && (
                <group>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Sprinkler key={i} position={[((i % 2) - 0.5) * side * 0.6, 0, (Math.floor(i / 2) - 0.5) * side * 0.6]} />
                    ))}
                </group>
            )}

            {sandbox.irrigation_method === 'Furrow' && (
                <Furrow side={side} spacing={spacing} rows={rows} />
            )}

            {sandbox.irrigation_method === 'Drip' && (
                <group>
                    {Array.from({ length: rows }).map((_, i) => (
                        <group key={i} position={[0, 0.05, (i - rows / 2) * spacing + spacing / 2]}>
                            <mesh rotation={[0, 0, Math.PI / 2]}>
                                <cylinderGeometry args={[0.05, 0.05, side, 8]} />
                                <meshStandardMaterial color="#0f172a" />
                            </mesh>
                            {/* Drip droplets */}
                            {Array.from({ length: 8 }).map((_, j) => (
                                <mesh key={j} position={[(j / 8 - 0.5) * side, -0.01, 0]}>
                                    <sphereGeometry args={[0.04, 4, 4]} />
                                    <meshStandardMaterial color="#60a5fa" transparent opacity={0.8} />
                                </mesh>
                            ))}
                        </group>
                    ))}
                </group>
            )}

            {(sandbox.irrigation_method === 'Flood' || normalized === 'Paddy') && (
                <group>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                        <planeGeometry args={[side + 2, side + 2]} />
                        <meshStandardMaterial color="#3b82f6" transparent opacity={normalized === 'Paddy' ? 0.3 : 0.2} />
                    </mesh>
                    {/* Secondary layer for "shimmer" effect */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
                        <planeGeometry args={[side + 2, side + 2]} />
                        <meshStandardMaterial color="#93c5fd" transparent opacity={0.1} />
                    </mesh>
                </group>
            )}

            {sandbox.irrigation_method === 'Canal' && (
                <group>
                    <CanalEntry side={side} />
                    <Canal side={side} spacing={spacing} count={Math.floor(rows / 4)} />
                </group>
            )}

            {/* Water puddles for waterlogging - Updated to Dark Blue */}
            {sandbox.waterLog && !improved && (
                <group>
                    {[0, 1, 2, 3, 4].map(i => (
                        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[Math.sin(i * 10) * side / 3, 0.012, Math.cos(i * 12) * side / 3]}>
                            <circleGeometry args={[Math.random() * 2 + 1, 16]} />
                            <meshStandardMaterial color="#3b82f6" transparent opacity={0.5} />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Water Wastage markers - More intense blue and larger */}
            {sandbox.waterWastage && !improved && (
                <group>
                    {[0, 1, 2].map(i => (
                        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[Math.cos(i * 5) * side / 4, 0.015, Math.sin(i * 7) * side / 4]}>
                            <circleGeometry args={[Math.random() * 3 + 2, 16]} />
                            <meshStandardMaterial color="#1e3a8a" transparent opacity={0.7} />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Rain animation */}
            {sandbox.isRainy && <Rain3D side={side} />}

            {/* Dry patches for uneven distribution */}
            {sandbox.distribution === 'Uneven' && !improved && (
                <group>
                    {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[Math.cos(i * 8) * side / 2.5, 0.005, Math.sin(i * 9) * side / 2.5]}>
                            <circleGeometry args={[Math.random() * 1.5 + 0.5, 12]} />
                            <meshStandardMaterial color="#854d0e" transparent opacity={0.3} />
                        </mesh>
                    ))}
                </group>
            )}

            {/* Shallow water overlay for paddy fields */}
            {normalized === 'Paddy' && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                    <planeGeometry args={[side + 3, side + 3]} />
                    <meshStandardMaterial color="#0ea5e9" transparent opacity={0.35} />
                </mesh>
            )}

            {/* ─── WEEDS in BEFORE simulation ─── */}
            {!improved && sandbox.weedsLevel && (() => {
                // Density filter: how many crop slots get a weed cluster
                const weedFilter = sandbox.weedsLevel === 'Low'
                    ? (idx) => idx % 15 === 0
                    : sandbox.weedsLevel === 'Medium'
                        ? (idx) => idx % 7 === 0
                        : (idx) => idx % 3 === 0; // High – very dense

                const weedColor1 = '#15803d'; // dark grass green
                const weedColor2 = '#16a34a'; // mid grass green
                const weedColor3 = '#4ade80'; // lighter tip

                // Blade height multiplier based on level
                const bladeH = sandbox.weedsLevel === 'Low' ? 0.35
                    : sandbox.weedsLevel === 'Medium' ? 0.55
                        : 0.80;

                return (
                    <group>
                        {plants
                            .filter((_, idx) => weedFilter(idx))
                            .map(p => {
                                // Place weed cluster between plants (offset from plant centre)
                                const wx = p.pos[0] + (spacing * 0.4);
                                const wz = p.pos[2] + (spacing * 0.35);
                                // Vary height per cluster using plant id as seed
                                const hv = bladeH * (0.8 + (p.id % 7) * 0.06);
                                return (
                                    <group key={`weed-${p.id}`} position={[wx, 0, wz]}>
                                        {/* 5 grass blades per cluster, fanned out */}
                                        {[
                                            { ox: 0, oz: 0, h: hv, r: 0 },
                                            { ox: 0.08, oz: 0.04, h: hv * 0.85, r: 0.3 },
                                            { ox: -0.07, oz: 0.05, h: hv * 0.90, r: -0.25 },
                                            { ox: 0.04, oz: -0.08, h: hv * 0.80, r: 0.15 },
                                            { ox: -0.05, oz: -0.06, h: hv * 0.95, r: -0.1 },
                                        ].map((blade, bi) => (
                                            <group key={bi} position={[blade.ox, 0, blade.oz]} rotation={[blade.r, bi * 1.2, 0]}>
                                                {/* Lower half – darker */}
                                                <mesh position={[0, blade.h * 0.30, 0]}>
                                                    <cylinderGeometry args={[0.025, 0.035, blade.h * 0.6, 5]} />
                                                    <meshStandardMaterial color={weedColor1} />
                                                </mesh>
                                                {/* Upper half – slightly lighter */}
                                                <mesh position={[0, blade.h * 0.78, 0]}>
                                                    <cylinderGeometry args={[0.012, 0.025, blade.h * 0.45, 5]} />
                                                    <meshStandardMaterial color={weedColor2} />
                                                </mesh>
                                                {/* Leaf tip */}
                                                <mesh position={[0, blade.h, 0]}>
                                                    <coneGeometry args={[0.022, blade.h * 0.18, 5]} />
                                                    <meshStandardMaterial color={weedColor3} />
                                                </mesh>
                                            </group>
                                        ))}

                                        {/* Extra wide-leaf weed for High density */}
                                        {sandbox.weedsLevel === 'High' && (
                                            <mesh position={[0.1, hv * 0.4, 0.05]} rotation={[0.4, 0, 0.5]} castShadow>
                                                <boxGeometry args={[0.22, 0.04, 0.10]} />
                                                <meshStandardMaterial color="#166534" />
                                            </mesh>
                                        )}
                                    </group>
                                );
                            })}
                    </group>
                );
            })()}


        </group>
    );
}

function Farm3D({ data, improved, landArea, sandbox, onFullscreen }) {
    const chi = improved ? (data?.after?.chi || 0) : (data?.before?.chi || 0);
    const [viewMode, setViewMode] = useState('Orbit'); // 'Orbit' or 'Walk'
    const [inspectedPos, setInspectedPos] = useState(null);

    useEffect(() => {
        if (inspectedPos) {
            const timer = setTimeout(() => setInspectedPos(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [inspectedPos]);

    return (
        <div
            className="w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden relative group cursor-pointer"
            onClick={() => onFullscreen && onFullscreen()}
        >
            <Canvas shadows={true}>
                <PerspectiveCamera makeDefault position={viewMode === 'Walk' ? [0, 1.6, 5] : [15, 15, 15]} fov={viewMode === 'Walk' ? 75 : 50} />

                {viewMode === 'Orbit' ? (
                    <OrbitControls maxPolarAngle={Math.PI / 2.1} makeDefault />
                ) : (
                    <>
                        <PointerLockControls />
                        <MovementController />
                    </>
                )}

                {/* Environment */}
                <Sky
                    sunPosition={
                        sandbox.season === 'summer' ? [100, 50, 100] :
                            sandbox.season === 'kharif' ? [100, 5, 100] :
                                [100, 25, 100]
                    }
                    turbidity={sandbox.season === 'kharif' ? 8 : 0.1}
                    rayleigh={sandbox.season === 'summer' ? 2 : 1}
                    mieCoefficient={sandbox.season === 'kharif' ? 0.05 : 0.005}
                />
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.5}
                    castShadow
                    shadow-mapSize={[512, 512]}
                />

                <Suspense fallback={null}>
                    <Field3D
                        cropName={data.primary_crop}
                        landArea={landArea}
                        improved={improved}
                        chi={chi}
                        sandbox={sandbox}
                        onInspect={(pos) => setInspectedPos(pos)}
                    />
                    {sandbox.weather === 'Rain' && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
                </Suspense>

                <ContactShadows opacity={0.4} scale={20} blur={2.4} far={4.5} />
            </Canvas>

            {/* 3D UI Overlay */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                    <FaCube className="text-blue-400" />
                    Interactive 3D Simulation
                </div>


                {onFullscreen && (
                    <button
                        onClick={onFullscreen}
                        className="px-3 py-2 rounded-xl border border-blue-400 bg-blue-600/80 text-white text-[10px] font-black uppercase backdrop-blur-md pointer-events-auto hover:bg-blue-500 shadow-lg"
                    >
                        Fullscreen
                    </button>
                )}
            </div>

            {viewMode === 'Walk' && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse pointer-events-none">
                    {ls('Click anywhere to lock • Use WASD / Arrows')}
                </div>
            )}

            {inspectedPos && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 text-white p-4 rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 pointer-events-none">
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FaCube /> {ls('3D Plant Analytics')}
                    </div>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between gap-8"><span className="text-slate-400">{ls('Health')}</span><span className="text-emerald-400 font-bold">{chi}%</span></div>
                        <div className="flex justify-between gap-8"><span className="text-slate-400">{ls('Moisture')}</span><span className="text-blue-400 font-bold">{ls(improved ? 'Optimal' : 'Low')}</span></div>
                        <div className="flex justify-between gap-8"><span className="text-slate-400">{ls('Grid Position')}</span><span className="text-slate-300 font-mono">[{inspectedPos[0].toFixed(1)}, {inspectedPos[2].toFixed(1)}]</span></div>
                    </div>
                    <button
                        onClick={() => setInspectedPos(null)}
                        className="mt-3 w-full py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase pointer-events-auto"
                    >
                        {ls('Close Details')}
                    </button>
                </div>
            )}
        </div>
    );
}

function normalizeCropName(name) {
    if (!name) return 'Paddy';
    const n = name.toLowerCase();
    if (n.includes('paddy') || n.includes('நெல்')) return 'Paddy';
    if (n.includes('sugarcane') || n.includes('கரும்பு')) return 'Sugarcane';
    if (n.includes('banana') || n.includes('வாழை')) return 'Banana';
    if (n.includes('vegetable') || n.includes('காய்கறி')) return 'Vegetables';
    if (n.includes('coconut') || n.includes('தென்னை')) return 'Coconut';
    if (n.includes('cotton') || n.includes('பருத்தி')) return 'Cotton';
    if (n.includes('millet') || n.includes('சிறுதானியம்')) return 'Millets';
    if (n.includes('groundnut') || n.includes('நிலக்கடலை')) return 'Groundnut';
    if (n.includes('flower') || n.includes('பூக்கள்')) return 'Flowers';
    if (n.includes('maize') || n.includes('சோளம்')) return 'Maize';
    return 'Paddy';
}



// ─── Main component ───────────────────────────────────────────────────────────
const FarmSimulation = ({ user }) => {
    const { t, language, tDistrict } = useLanguage();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Before, 4: After, 5: Comparison
    const [inputForm, setInputForm] = useState({
        district: 'Madurai',
        crop_type: 'Paddy',
        crop_type_other: '',
        land_size: 1.0,

        planting_mode: 'days', // 'date' | 'days'
        planting_date: '',
        days_after_planting: 30,

        seed_variety: 'Local Variety',
        seed_variety_other: '',
        plant_spacing: 'Normal',
        plant_spacing_other: '',

        fertilizer_usage: [],
        fertilizer_other: '',
        weed_level: 'Medium',
        weed_level_other: '',
        pest_presence: 'Not sure',
        pest_presence_other: '',
        crop_health_observation: 'Average',
        crop_health_other: '',

        // Water Irrigation Module fields
        irrig_method: 'Flood',
        irrig_method_other: '',
        irrig_source: 'Borewell',
        irrig_source_other: '',
        irrig_availability: 'Medium',
        irrig_availability_other: '',
        irrig_frequency: 'Every 3 days',
        irrig_frequency_other: '',
        irrig_drainage: 'Average',
        irrig_drainage_other: '',
        irrig_land_level: 'Level',
        irrig_land_level_other: '',
        irrig_moisture: 'Normal',
        irrig_moisture_other: '',
        irrig_system_cond: 'Working',
        irrig_system_cond_other: '',
        irrig_storage: 'None',
        irrig_storage_other: '',
        irrig_rainfall_dep: 'Partially',
        irrig_rainfall_dep_other: '',
        season: 'kharif'
    });

    // Localized String Helper
    const ls = (key) => {
        if (language === 'ta') {
            return TAMIL_SIM_STRINGS[key] || t(key) || key;
        }
        return t(key) || key;
    };
    const [simData, setSimData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sandbox, setSandbox] = useState({
        growth: 0.1,
        drip: false,
        mulching: false,
        weather: 'Sunny',
        aerialMode: false,
        weedsLevel: null, // 'Low' | 'Medium' | 'High' | null
        pests: false,
        waterLog: false,
        moistureLevel: 'Normal',
        distribution: 'Even'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputForm(prev => ({ ...prev, [name]: value }));
    };

    const toggleFertilizer = (item) => {
        setInputForm(prev => {
            const current = Array.isArray(prev.fertilizer_usage) ? prev.fertilizer_usage : [];
            const exists = current.includes(item);
            // If "None" picked, clear others. If other picked, remove "None".
            if (item === 'None') {
                return { ...prev, fertilizer_usage: exists ? [] : ['None'] };
            }
            const next = exists ? current.filter(x => x !== item) : [...current.filter(x => x !== 'None'), item];
            return { ...prev, fertilizer_usage: next };
        });
    };

    const fertilizerLabel = (name) => {
        if (language !== 'ta') return name;
        switch (name) {
            case 'Farmyard Manure':
                return 'மாட்டு சாண உரம்';
            case 'Vermicompost':
                return 'வெர்மி கம்போஸ்ட்';
            case 'Green Manure':
                return 'பச்சை உரம்';
            case 'Urea':
                return 'யூரியா உரம்';
            case 'DAP':
                return 'DAP (டை அமோனியம் பாஸ்பேட்) உரம்';
            case 'SSP':
                return 'SSP (சிங்கிள் சுப் பாஸ்பேட்) உரம்';
            case 'MOP':
                return 'MOP (மியூரேட் ஆஃப் போட்டாஷ்) உரம்';
            case 'Ammonium Sulphate':
                return 'அமோனியம் சல்பேட் உரம்';
            case 'Calcium Ammonium Nitrate':
                return 'கால்சியம் அமோனியம் நைட்ரேட் உரம்';
            case 'NPK 17:17:17':
                return 'NPK 17:17:17 கலப்பு உரம்';
            case 'NPK 20:20:0':
                return 'NPK 20:20:0 கலப்பு உரம்';
            default:
                return name;
        }
    };

    const startSimulation = async () => {
        setError(null);
        setLoading(true);
        setStep(2);
        try {
            const payload = {
                ...inputForm,
                crop_type: inputForm.crop_type === 'Other' && inputForm.crop_type_other
                    ? inputForm.crop_type_other
                    : inputForm.crop_type,
                seed_variety: inputForm.seed_variety === 'Other' && inputForm.seed_variety_other
                    ? inputForm.seed_variety_other
                    : inputForm.seed_variety,
                plant_spacing: inputForm.plant_spacing === 'Other' && inputForm.plant_spacing_other
                    ? inputForm.plant_spacing_other
                    : inputForm.plant_spacing,
                weed_level: inputForm.weed_level === 'Other' && inputForm.weed_level_other
                    ? inputForm.weed_level_other
                    : inputForm.weed_level,
                // Handle irrigation "Other" inputs
                irrig_method: inputForm.irrig_method === 'Other' && inputForm.irrig_method_other ? inputForm.irrig_method_other : inputForm.irrig_method,
                irrig_source: inputForm.irrig_source === 'Other' && inputForm.irrig_source_other ? inputForm.irrig_source_other : inputForm.irrig_source,
                irrig_availability: inputForm.irrig_availability === 'Other' && inputForm.irrig_availability_other ? inputForm.irrig_availability_other : inputForm.irrig_availability,
                irrig_frequency: inputForm.irrig_frequency === 'Other' && inputForm.irrig_frequency_other ? inputForm.irrig_frequency_other : inputForm.irrig_frequency,
                irrig_drainage: inputForm.irrig_drainage === 'Other' && inputForm.irrig_drainage_other ? inputForm.irrig_drainage_other : inputForm.irrig_drainage,
                irrig_land_level: inputForm.irrig_land_level === 'Other' && inputForm.irrig_land_level_other ? inputForm.irrig_land_level_other : inputForm.irrig_land_level,
                irrig_moisture: inputForm.irrig_moisture === 'Other' && inputForm.irrig_moisture_other ? inputForm.irrig_moisture_other : inputForm.irrig_moisture,
                irrig_system_cond: inputForm.irrig_system_cond === 'Other' && inputForm.irrig_system_cond_other ? inputForm.irrig_system_cond_other : inputForm.irrig_system_cond,
                irrig_storage: inputForm.irrig_storage === 'Other' && inputForm.irrig_storage_other ? inputForm.irrig_storage_other : inputForm.irrig_storage,
                irrig_rainfall_dep: inputForm.irrig_rainfall_dep === 'Other' && inputForm.irrig_rainfall_dep_other ? inputForm.irrig_rainfall_dep_other : inputForm.irrig_rainfall_dep,
                pest_presence: inputForm.pest_presence === 'Other' && inputForm.pest_presence_other
                    ? inputForm.pest_presence_other
                    : inputForm.pest_presence,
                crop_health_observation: inputForm.crop_health_observation === 'Other' && inputForm.crop_health_other
                    ? inputForm.crop_health_other
                    : inputForm.crop_health_observation,
                season: inputForm.season,
                district: inputForm.district
            };

            const res = await simulationAPI.runCustomSimulation(payload);
            setSimData(res.data);
            // Simulate "Generation" time – pass res.data directly to avoid stale closure
            setTimeout(() => {
                setStep(3);
                // Start Before Simulation animation
                animateBefore(res.data, payload);
            }, 2000);
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to start simulation';
            setError(msg);
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    // animateBefore now accepts freshData and payloadForm to avoid stale closures
    const animateBefore = (freshData, payloadForm) => {
        const _form = payloadForm || inputForm;
        const before = freshData?.before;
        const risk = before?.climate?.risk_level;

        // Map input weed / pest selections to sandbox flags for visualization
        // Normalise weed level: treat 'Other' or any non-standard value as 'Medium'
        const rawWeed = _form.weed_level || 'Low';
        const weedLevelInput = ['Low', 'Medium', 'High'].includes(rawWeed) ? rawWeed : 'Medium';

        // Pests: show when farmer explicitly said 'Yes'
        const pestsInput = _form.pest_presence === 'Yes';

        setSandbox(prev => ({
            ...prev,
            growth: Math.max(0.1, before?.growth_pct ?? 0.1),
            drip: _form.irrig_method === 'Drip',
            irrigation_method: before?.visual?.irrigation_method || _form.irrig_method,
            mulching: false,
            weather: risk === 'High' ? 'Cloudy' : 'Sunny',
            weedsLevel: weedLevelInput,
            pests: pestsInput,
            waterLog: before?.visual?.waterlogging,
            waterWastage: before?.visual?.water_wastage,
            isRainy: (before?.visual?.irrigation_method || _form.irrig_method) === 'Rain-fed',
            moistureLevel: _form.irrig_moisture || 'Normal',
            distribution: _form.irrig_method === 'Flood' ? 'Uneven' : 'Even',
            season: _form.season
        }));
        let g = 0.1;
        const targetG = Math.max(0.1, before?.growth_pct ?? 0.1);
        const interval = setInterval(() => {
            g += 0.05;
            if (g >= targetG) {
                clearInterval(interval);
                setSandbox(prev => ({ ...prev, growth: targetG }));
            } else {
                setSandbox(prev => ({ ...prev, growth: g }));
            }
        }, 50);
    };

    const nextStep = () => {
        if (step === 3) {
            setStep(4);
            // Start After Simulation animation
            const afterData = simData?.after;
            setSandbox({
                growth: 0.1,
                drip: afterData?.visual?.irrigation_method === 'Drip',
                irrigation_method: afterData?.visual?.irrigation_method || 'Drip',
                mulching: true,
                weather: 'Sunny',
                weedsLevel: null,
                pests: false,
                aerialMode: false,
                waterLog: false,
                waterWastage: false,
                isRainy: (afterData?.visual?.irrigation_method) === 'Rain-fed',
                season: inputForm.season
            });
            const targetG = afterData?.growth_pct ?? 1.0;
            let g = 0.1;
            const interval = setInterval(() => {
                g += 0.05;
                if (g >= targetG) {
                    clearInterval(interval);
                    setSandbox(prev => ({ ...prev, growth: targetG }));
                } else {
                    setSandbox(prev => ({ ...prev, growth: g }));
                }
            }, 50);
        } else if (step === 4) {
            setStep(5);
        }
    };

    const reset = () => {
        setStep(1);
        setSimData(null);
    };

    // --- TOP NAVIGATION ---
    const TopNav = () => (
        <div className="absolute top-0 left-0 right-0 z-[100] p-6 flex justify-between items-center pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-2xl"
                >
                    <FaArrowLeft />
                </button>
            </div>
        </div>
    );

    // --- STEP 1: Input Screen ---
    if (step === 1) {
        const cropGroups = [
            {
                label: 'Cereals (Food Grains)',
                items: ['Paddy', 'Wheat', 'Maize', 'Barley', 'Sorghum', 'Pearl Millet', 'Finger Millet', 'Foxtail Millet', 'Little Millet', 'Kodo Millet', 'Barnyard Millet'],
            },
            {
                label: 'Pulses',
                items: ['Red Gram', 'Green Gram', 'Black Gram', 'Bengal Gram', 'Horse Gram', 'Cowpea', 'Field Pea', 'Lentil'],
            },
            {
                label: 'Oilseeds',
                items: ['Groundnut', 'Sesame', 'Sunflower', 'Mustard', 'Soybean', 'Castor', 'Linseed', 'Safflower'],
            },
            {
                label: 'Vegetables',
                items: ['Tomato', 'Onion', 'Potato', 'Brinjal', 'Chilli', 'Capsicum', 'Okra', 'Cabbage', 'Cauliflower', 'Carrot', 'Beetroot', 'Radish', 'Pumpkin', 'Bitter Gourd', 'Bottle Gourd', 'Ridge Gourd', 'Snake Gourd', 'Cucumber', 'Beans', 'Peas'],
            },
            {
                label: 'Fruits',
                items: ['Banana', 'Mango', 'Papaya', 'Guava', 'Pomegranate', 'Sapota', 'Pineapple', 'Jackfruit', 'Watermelon', 'Muskmelon', 'Coconut', 'Custard Apple', 'Amla'],
            },
            {
                label: 'Cash Crops',
                items: ['Sugarcane', 'Cotton', 'Tobacco', 'Jute', 'Coffee', 'Tea', 'Rubber'],
            },
            {
                label: 'Plantation Crops',
                items: ['Coconut', 'Arecanut', 'Coffee', 'Tea', 'Rubber', 'Cocoa'],
            },
            {
                label: 'Spices & Condiments',
                items: ['Turmeric', 'Ginger', 'Coriander', 'Cumin', 'Fenugreek', 'Cardamom', 'Black Pepper', 'Clove', 'Nutmeg', 'Garlic'],
            },
            {
                label: 'Fodder Crops',
                items: ['Napier Grass', 'Sorghum Fodder', 'Maize Fodder', 'Cowpea Fodder', 'Lucerne'],
            },
        ];
        const organicFerts = ['Farmyard Manure', 'Vermicompost', 'Green Manure'];
        const chemicalFerts = ['Urea', 'DAP', 'SSP', 'MOP', 'Ammonium Sulphate', 'Calcium Ammonium Nitrate', 'NPK 17:17:17', 'NPK 20:20:0'];
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 relative flex items-center justify-center">
                <TopNav />
                <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-farm-green-600 p-10 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <FaSeedling className="text-6xl mx-auto mb-4 animate-bounce" />
                        <h1 className="text-4xl font-bold uppercase tracking-tight">{ls('Virtual Farm Simulation')}</h1>
                        <p className="text-farm-green-50 font-medium mt-2 text-lg">
                            {ls('Enter your farm details to see your virtual field')}
                        </p>
                    </div>

                    {error && (
                        <div className="px-10 pt-8">
                            <div className="bg-red-50 border-2 border-red-100 text-red-800 rounded-3xl p-5 font-bold">
                                {error}
                                {String(error).toLowerCase().includes('login') && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="px-6 py-3 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all"
                                        >
                                            {ls('go_to_login')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="p-10 grid md:grid-cols-2 gap-8">
                        {/* District Selection */}
                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">{ls('District')}</label>
                            <select name="district" value={inputForm.district} onChange={handleInputChange} className="input-field">
                                {translations.districts.en.map((d, i) => (
                                    <option key={d} value={d}>{tDistrict(d)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Season Selection */}
                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">{ls('season')}</label>
                            <select name="season" value={inputForm.season} onChange={handleInputChange} className="input-field">
                                <option value="kharif">{ls('kharif')}</option>
                                <option value="rabi">{ls('rabi')}</option>
                                <option value="summer">{ls('summerOption')}</option>
                            </select>
                        </div>

                        {/* Crop Selection */}
                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">{ls('Crop Type')}</label>
                            <div className="space-y-2">
                                <select name="crop_type" value={inputForm.crop_type} onChange={handleInputChange} className="input-field">
                                    {cropGroups.map(group => (
                                        <optgroup key={group.label} label={ls(group.label)}>
                                            {group.items.map(c => (
                                                <option key={c} value={c}>{ls(c)}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                    <option value="Other">{ls('others')}</option>
                                </select>
                                {inputForm.crop_type === 'Other' && (
                                    <input
                                        name="crop_type_other"
                                        type="text"
                                        value={inputForm.crop_type_other}
                                        onChange={handleInputChange}
                                        placeholder={ls('other_crop_placeholder')}
                                        className="input-field border-dashed border-farm-green-300"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">{ls('Land Size (Acres)')}</label>
                            <input name="land_size" type="number" step="0.5" value={inputForm.land_size} onChange={handleInputChange} className="input-field" />
                        </div>

                        {/* Planting Date / Days After Planting */}
                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                {ls('Planting Date / Days After Planting')}
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setInputForm(p => ({ ...p, planting_mode: 'date' }))}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${inputForm.planting_mode === 'date' ? 'bg-farm-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {ls('Date')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInputForm(p => ({ ...p, planting_mode: 'days' }))}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${inputForm.planting_mode === 'days' ? 'bg-farm-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {ls('Days')}
                                </button>
                            </div>
                            {inputForm.planting_mode === 'date' ? (
                                <input
                                    name="planting_date"
                                    type="date"
                                    value={inputForm.planting_date}
                                    onChange={handleInputChange}
                                    className="input-field"
                                />
                            ) : (
                                <input
                                    name="days_after_planting"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={inputForm.days_after_planting}
                                    onChange={handleInputChange}
                                    className="input-field"
                                />
                            )}
                        </div>

                        {/* Seed variety */}
                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                {ls('Seed Variety')}
                            </label>
                            <div className="space-y-2">
                                <select name="seed_variety" value={inputForm.seed_variety} onChange={handleInputChange} className="input-field">
                                    <option value="Local Variety">{ls('Local Variety')}</option>
                                    <option value="Hybrid Variety">{ls('Hybrid Variety')}</option>
                                    <option value="Other">{ls('others')}</option>
                                </select>
                                {inputForm.seed_variety === 'Other' && (
                                    <input
                                        name="seed_variety_other"
                                        type="text"
                                        value={inputForm.seed_variety_other}
                                        onChange={handleInputChange}
                                        placeholder={ls('other_seed_placeholder')}
                                        className="input-field border-dashed border-farm-green-300"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Plant spacing */}
                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                {ls('Plant Spacing')}
                            </label>
                            <div className="space-y-2">
                                <select name="plant_spacing" value={inputForm.plant_spacing} onChange={handleInputChange} className="input-field">
                                    <option value="Close">{ls('Close')}</option>
                                    <option value="Normal">{ls('Normal')}</option>
                                    <option value="Wide">{ls('Wide')}</option>
                                    <option value="Other">{ls('others')}</option>
                                </select>
                                {inputForm.plant_spacing === 'Other' && (
                                    <input
                                        name="plant_spacing_other"
                                        type="text"
                                        value={inputForm.plant_spacing_other}
                                        onChange={handleInputChange}
                                        placeholder={ls('other_spacing_placeholder')}
                                        className="input-field border-dashed border-farm-green-300"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Weed level */}
                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                {ls('Weed Level')}
                            </label>
                            <div className="space-y-2">
                                <select name="weed_level" value={inputForm.weed_level} onChange={handleInputChange} className="input-field">
                                    <option value="Low">{ls('Low')}</option>
                                    <option value="Medium">{ls('Medium')}</option>
                                    <option value="High">{ls('High')}</option>
                                    <option value="Other">{ls('others')}</option>
                                </select>
                                {inputForm.weed_level === 'Other' && (
                                    <input
                                        name="weed_level_other"
                                        type="text"
                                        value={inputForm.weed_level_other}
                                        onChange={handleInputChange}
                                        placeholder={ls('other_weed_placeholder')}
                                        className="input-field border-dashed border-farm-green-300"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                {ls('Pest Presence')}
                            </label>
                            <div className="space-y-2">
                                <select name="pest_presence" value={inputForm.pest_presence} onChange={handleInputChange} className="input-field">
                                    <option value="Yes">{ls('Yes')}</option>
                                    <option value="No">{ls('No')}</option>
                                    <option value="Not sure">{ls('Not sure')}</option>
                                    <option value="Other">{ls('others')}</option>
                                </select>
                                {inputForm.pest_presence === 'Other' && (
                                    <input
                                        name="pest_presence_other"
                                        type="text"
                                        value={inputForm.pest_presence_other}
                                        onChange={handleInputChange}
                                        placeholder={ls('other_pest_placeholder')}
                                        className="input-field border-dashed border-farm-green-300"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                {ls('Crop Health Observation')}
                            </label>
                            <div className="space-y-2">
                                <select name="crop_health_observation" value={inputForm.crop_health_observation} onChange={handleInputChange} className="input-field">
                                    <option value="Good">{ls('Good')}</option>
                                    <option value="Average">{ls('Average')}</option>
                                    <option value="Poor">{ls('Poor')}</option>
                                    <option value="Other">{ls('others')}</option>
                                </select>
                                {inputForm.crop_health_observation === 'Other' && (
                                    <input
                                        name="crop_health_other"
                                        type="text"
                                        value={inputForm.crop_health_other}
                                        onChange={handleInputChange}
                                        placeholder={ls('other_health_placeholder')}
                                        className="input-field border-dashed border-farm-green-300"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                {ls('Fertilizer Usage')}
                            </label>
                            <div className="grid md:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => toggleFertilizer('None')}
                                    className={`px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${inputForm.fertilizer_usage.includes('None') ? 'bg-farm-green-600 text-white border-farm-green-600 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'}`}
                                >
                                    {ls('None')}
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                                        {ls('Organic Fertilizers')}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {organicFerts.map(f => (
                                            <button
                                                key={f}
                                                type="button"
                                                onClick={() => toggleFertilizer(f)}
                                                className={`px-4 py-3 rounded-xl border-2 font-semibold text-sm text-left transition-all ${inputForm.fertilizer_usage.includes(f) ? 'bg-farm-green-50 border-farm-green-300 text-farm-green-900 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                {fertilizerLabel(f)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                                        {ls('Chemical Fertilizers')}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {chemicalFerts.map(f => (
                                            <button
                                                key={f}
                                                type="button"
                                                onClick={() => toggleFertilizer(f)}
                                                className={`px-4 py-3 rounded-xl border-2 font-semibold text-sm text-left transition-all ${inputForm.fertilizer_usage.includes(f) ? 'bg-farm-green-50 border-farm-green-300 text-farm-green-900 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                {fertilizerLabel(f)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <input
                                    name="fertilizer_other"
                                    type="text"
                                    value={inputForm.fertilizer_other}
                                    onChange={handleInputChange}
                                    placeholder={ls('other_fertilizer_placeholder')}
                                    className="input-field border-dashed border-farm-green-300"
                                />
                            </div>
                        </div>

                        {/* Water & Irrigation Section */}
                        <div className="md:col-span-2 mt-8 pt-8 border-t-2 border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <FaTint size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                    {ls('Water & Irrigation Details')}
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                                {[
                                    {
                                        id: 'irrig_method', label: 'Irrigation Method', options: [
                                            { id: 'Flood', label: 'methodFlood' },
                                            { id: 'Drip', label: 'methodDrip' },
                                            { id: 'Sprinkler', label: 'methodSprinkler' },
                                            { id: 'Canal', label: 'methodCanal' },
                                            { id: 'Rain-fed', label: 'methodRainfed' },
                                            { id: 'Subsurface', label: 'methodSubsurface' },
                                            { id: 'Micro', label: 'methodMicro' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    },
                                    {
                                        id: 'irrig_source', label: 'Water Source', options: [
                                            { id: 'Borewell', label: 'irriBorewell' },
                                            { id: 'Open Well', label: 'sourceOpenWell' },
                                            { id: 'River', label: 'sourceRiver' },
                                            { id: 'Canal', label: 'irriCanal' },
                                            { id: 'Rainwater', label: 'sourceRainwater' },
                                            { id: 'Lake', label: 'sourceLake' },
                                            { id: 'Tank', label: 'sourceTank' },
                                            { id: 'Govt', label: 'sourceGovt' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    },
                                    {
                                        id: 'irrig_availability', label: 'Water Availability', options: [
                                            { id: 'Very High', label: 'availVeryHigh' },
                                            { id: 'High', label: 'availHigh' },
                                            { id: 'Medium', label: 'availMedium' },
                                            { id: 'Low', label: 'availLow' },
                                            { id: 'Very Low', label: 'availVeryLow' },
                                            { id: 'Seasonal', label: 'availSeasonal' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    },
                                    {
                                        id: 'irrig_frequency', label: 'Irrigation Frequency', options: [
                                            { id: 'Daily', label: 'freqDaily' },
                                            { id: 'Every 2 days', label: 'freqEvery2Days' },
                                            { id: 'Every 3 days', label: 'freqEvery3Days' },
                                            { id: 'Every 4-5 days', label: 'freqEvery4_5Days' },
                                            { id: 'Weekly', label: 'freqWeekly' },
                                            { id: 'Once in 10 days', label: 'freqOnce10Days' },
                                            { id: 'Rainfall', label: 'freqRainfall' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    },
                                    {
                                        id: 'irrig_drainage', label: 'Field Drainage Condition', options: [
                                            { id: 'Very Good', label: 'drainVeryGood' },
                                            { id: 'Good', label: 'drainGood' },
                                            { id: 'Average', label: 'drainAverage' },
                                            { id: 'Poor', label: 'drainPoor' },
                                            { id: 'Very Poor', label: 'drainVeryPoor' },
                                            { id: 'Waterlogging', label: 'drainWaterlogging' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    },
                                    {
                                        id: 'irrig_land_level', label: 'Land Level', options: [
                                            { id: 'Level', label: 'levelLevel' },
                                            { id: 'Slightly Uneven', label: 'levelSlightlyUneven' },
                                            { id: 'Uneven', label: 'levelUneven' },
                                            { id: 'Terraced', label: 'levelTerraced' },
                                            { id: 'Sloped', label: 'levelSloped' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    },
                                    {
                                        id: 'irrig_moisture', label: 'Current Soil Moisture', options: [
                                            { id: 'Very Wet', label: 'moistVeryWet' },
                                            { id: 'Moist', label: 'moistMoist' },
                                            { id: 'Normal', label: 'moistNormal' },
                                            { id: 'Dry', label: 'moistDry' },
                                            { id: 'Very Dry', label: 'moistVeryDry' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    },
                                    {
                                        id: 'irrig_system_cond', label: 'Irrigation System Condition', options: [
                                            { id: 'New', label: 'condNew' },
                                            { id: 'Working', label: 'condWorking' },
                                            { id: 'Minor Leak', label: 'condMinorLeak' },
                                            { id: 'Major Leak', label: 'condMajorLeak' },
                                            { id: 'Damaged', label: 'condDamaged' },
                                            { id: 'Not Sure', label: 'condNotSure' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    },
                                    {
                                        id: 'irrig_storage', label: 'Water Storage Available', options: [
                                            { id: 'Farm Pond', label: 'storageFarmPond' },
                                            { id: 'Tank', label: 'storageTank' },
                                            { id: 'Reservoir', label: 'storageReservoir' },
                                            { id: 'Check Dam', label: 'storageCheckDam' },
                                            { id: 'None', label: 'storageNone' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    },
                                    {
                                        id: 'irrig_rainfall_dep', label: 'Rainfall Dependency', options: [
                                            { id: 'Fully', label: 'depFully' },
                                            { id: 'Mostly', label: 'depMostly' },
                                            { id: 'Partially', label: 'depPartially' },
                                            { id: 'Not', label: 'depNot' },
                                            { id: 'Other', label: 'others' }
                                        ]
                                    }
                                ].map(field => (
                                    <div key={field.id} className="space-y-2">
                                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                                            {ls(field.label)}
                                        </label>
                                        <div className="space-y-2">
                                            <select
                                                name={field.id}
                                                value={inputForm[field.id]}
                                                onChange={handleInputChange}
                                                className="input-field"
                                            >
                                                <option value="">{ls('selectOption') || 'Select Option'}</option>
                                                {field.options.map(opt => (
                                                    <option key={opt.id} value={opt.id}>{ls(opt.label)}</option>
                                                ))}
                                            </select>
                                            {inputForm[field.id] === 'Other' && (
                                                <input
                                                    name={`${field.id}_other`}
                                                    type="text"
                                                    value={inputForm[`${field.id}_other`]}
                                                    onChange={handleInputChange}
                                                    placeholder={ls('specifyOther')}
                                                    className="input-field border-dashed border-farm-sky-300"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>

                    <div className="p-10 pt-0">
                        <button onClick={startSimulation} className="btn-primary w-full py-6 text-xl shadow-farm-green-200">
                            {ls('Generate Virtual Farm')} <FaChartLine />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- STEP 2: Loading Screen ---
    if (step === 2) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full -mr-48 -mt-48 blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100 rounded-full -ml-48 -mb-48 blur-3xl opacity-50"></div>

                <div className="relative">
                    <div className="w-48 h-48 border-[12px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FaSeedling className="text-5xl text-emerald-600 animate-pulse" />
                    </div>
                </div>

                <h2 className="text-4xl font-black text-emerald-900 mt-12 uppercase tracking-widest animate-pulse">
                    {ls('Generating Farm...')}
                </h2>
                <p className="text-emerald-700 font-bold mt-4 tracking-wide">
                    {ls('Analyzing soil and climate data...')}
                </p>
            </div>
        );
    }

    // --- STEPS 3 & 4: Simulation Views ---
    if (step === 3 || step === 4) {
        const isImproved = step === 4;
        const currentData = isImproved ? simData.after : simData.before;
        const viewKey = isImproved ? 'after' : 'before';
        const activeView = simData?.[viewKey];
        const growthPct = activeView?.growth_pct ?? sandbox.growth ?? 0.3;

        let stageLabelEn = 'Early growth';
        if (growthPct >= 0.75) stageLabelEn = 'Late / Maturity stage';
        else if (growthPct >= 0.4) stageLabelEn = 'Mid growth';

        const stageLabel = ls(
            growthPct >= 0.75
                ? 'Late / Maturity stage'
                : growthPct >= 0.4
                    ? 'Mid growth'
                    : 'Early growth'
        );

        const leafLabel = activeView?.visual?.leaf_color;
        let leafDotClass = 'bg-slate-400';
        let leafMeaning = '';
        if (leafLabel === 'Dark Green') {
            leafDotClass = 'bg-emerald-400';
            leafMeaning = ls('Healthy, well-nourished crop');
        } else if (leafLabel === 'Yellowish') {
            leafDotClass = 'bg-yellow-300';
            leafMeaning = ls('Possible nutrient deficiency or stress');
        } else if (leafLabel === 'Brown/Dry') {
            leafDotClass = 'bg-amber-800';
            leafMeaning = ls('Severe stress / dryness or damage');
        }

        return (
            <div className="h-screen bg-slate-950 flex flex-col overflow-hidden relative">
                <TopNav />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col md:flex-row p-6 pt-24 gap-6 min-h-0">

                    {/* Left Sidebar: Crop & Water Info */}
                    <div className="w-full md:w-80 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-2xl">
                            <h2 className="text-[10px] font-black uppercase text-amber-300 tracking-[0.2em] mb-4">
                                {ls('Growth Stage Module')}
                            </h2>
                            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                        {ls('Plant Height')}
                                    </div>
                                    <div className="text-white font-black">
                                        {activeView?.visual?.plant_height || '-'}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                        {ls('Leaf Color')}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-white font-black">
                                            <span className={`w-3 h-3 rounded-full ${leafDotClass}`}></span>
                                            <span>{leafLabel || '-'}</span>
                                        </div>
                                        {leafLabel && (
                                            <div className="text-[9px] text-slate-400 font-semibold leading-tight">
                                                {leafMeaning}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                        {ls('Plant Density')}
                                    </div>
                                    <div className="text-white font-black">
                                        {activeView?.visual?.density || '-'}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                        {ls('Field Problems')}
                                    </div>
                                    <div className="text-white font-black">
                                        {(activeView?.visual?.weeds_present ? ls('WEEDS') : ls('No'))}
                                        {activeView?.visual?.pest_damage ? ` • ${ls('Pests')}` : ''}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 bg-slate-800/40 p-4 rounded-2xl border border-white/5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>{ls('Expected Yield')}</span>
                                    <span className="text-emerald-300">
                                        {simData?.[isImproved ? 'after' : 'before']?.yield_per_acre_tons ?? '-'} {ls('ton/acre')}
                                    </span>
                                </div>
                                <div className="mt-2 text-white font-black text-lg">
                                    {simData?.[isImproved ? 'after' : 'before']?.yield_total_tons ?? '-'} {ls('tons (total)')}
                                </div>
                                <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    {ls('Growth stage')}: {stageLabel}
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <div className="bg-slate-800/60 p-2 rounded-xl border border-white/5">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                                            {ls('Days to Harvest')}
                                        </div>
                                        <div className="text-emerald-400 font-black text-sm">
                                            {activeView?.days_remaining ?? '-'} {ls('Days')}
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/60 p-2 rounded-xl border border-white/5">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                                            {ls('Total Duration')}
                                        </div>
                                        <div className="text-white font-black text-sm">
                                            {activeView?.cycle_days ?? '-'} {ls('Days')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-2xl">
                            <h2 className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] mb-4">
                                {ls('Crop Growth Module')}
                            </h2>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl">
                                    {CROP_MODELS[inputForm.crop_type]?.icon || '🌱'}
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white">{Math.round(sandbox.growth * 100)}%</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ls('Growth Stage')}</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                                        <span>{ls('Predicted Yield')}</span>
                                        <span className="text-emerald-400">{currentData.yield_total_tons} {ls('tons (total)')}</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sandbox.growth * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-2xl">
                            <h2 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em] mb-4">
                                {ls('Water Irrigation Module')}
                            </h2>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl">
                                    <FaTint className="text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xl font-black text-white truncate">
                                        {ls('method' + (isImproved ? simData?.after?.visual?.irrigation_method : inputForm.irrig_method))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ls('Method')}</div>
                                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{inputForm.irrig_source}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">{ls('Usage Level')}</div>
                                    <div className={`text-xs font-black ${isImproved ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {ls(isImproved ? 'Low (Targeted)' : (inputForm.irrig_method === 'Flood' ? 'High (Wastage)' : 'Medium'))}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">{ls('Frequency')}</div>
                                    <div className="text-xs font-black text-white">{isImproved ? ls('Daily (Optimized)') : inputForm.irrig_frequency}</div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">{ls('Soil Moisture')}</div>
                                    <div className={`text-xs font-black ${isImproved ? 'text-emerald-400' : (inputForm.irrig_moisture === 'Normal' ? 'text-blue-400' : 'text-yellow-400')}`}>
                                        {isImproved ? ls('Optimal') : inputForm.irrig_moisture}
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">{ls('Water Needed')}</div>
                                    <div className="text-xs font-black text-white">
                                        {`${Math.round(currentData.water_litres / 1000)}k L`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-2xl">
                            <h2 className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em] mb-4">
                                {ls('Climate Analysis')}
                            </h2>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">
                                    <FaFlask className="text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-black text-white capitalize">
                                        {ls(inputForm.season)} {ls('Season')}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tDistrict(inputForm.district)}</div>
                                </div>
                            </div>
                            <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 space-y-3">
                                <p className="text-xs font-bold text-slate-300 leading-relaxed italic">
                                    "{typeof activeView?.climate?.insight === 'object' ? activeView?.climate?.insight[language] : (activeView?.climate?.insight || ls('analyzing_regional'))}"
                                </p>
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{ls('Temperature')}</div>
                                        <div className="text-xs font-black text-amber-300">{activeView?.climate?.avg_temp || '-'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{ls('Rainfall')}</div>
                                        <div className="text-xs font-black text-blue-300">{activeView?.climate?.rainfall || '-'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{ls('Risk Level')}</div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${activeView?.climate?.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' : activeView?.climate?.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                    {ls(activeView?.climate?.risk_level || 'Normal')}
                                </div>
                            </div>
                        </div>

                        {/* After Simulation: Specific Improvements List */}
                        {isImproved && (
                            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-emerald-500/30 shadow-2xl animate-in slide-in-from-left duration-500">
                                <h2 className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <FaStar /> {ls('Improvements Applied')}
                                </h2>
                                <ul className="space-y-3">
                                    {(() => {
                                        const imps = simData?.after?.improvements;
                                        const items = [];
                                        if (imps?.irrigation) {
                                            items.push({
                                                icon: <FaCheckCircle className="text-emerald-500" />,
                                                text: `${ls('method' + imps.irrigation.from)} → ${ls('method' + imps.irrigation.to)}`
                                            });
                                        }
                                        if (imps?.fertilizer) {
                                            items.push({
                                                icon: <FaCheckCircle className="text-emerald-500" />,
                                                text: language === 'ta' ? imps.fertilizer.dose_note.ta : imps.fertilizer.dose_note.en
                                            });
                                        }
                                        if (imps?.pest_control) {
                                            items.push({
                                                icon: <FaCheckCircle className="text-emerald-500" />,
                                                text: language === 'ta' ? 'துல்லியமான பூச்சி மேலாண்மை' : 'Precision pest management applied'
                                            });
                                        }
                                        if (imps?.climate_adaptation) {
                                            items.push({
                                                icon: <FaCheckCircle className="text-emerald-500" />,
                                                text: language === 'ta' ? imps.climate_adaptation.action.ta : imps.climate_adaptation.action.en
                                            });
                                        }
                                        if (items.length === 0) {
                                            items.push({ icon: <FaCheckCircle className="text-emerald-500" />, text: ls('Water usage reduced by 35%') });
                                            items.push({ icon: <FaCheckCircle className="text-emerald-500" />, text: ls('Crop health index increased') });
                                        }
                                        return items;
                                    })().map((item, id) => (
                                        <li key={id} className="flex items-start gap-3 text-[11px] font-bold text-slate-300 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                            {item.icon} <span>{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Central Area: Visualization */}
                    <div className="flex-1 relative bg-slate-900 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl group">
                        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-10 pointer-events-none">
                            <div className="pointer-events-auto">
                                <div className={`px-5 py-2 rounded-full font-black text-xs uppercase tracking-[0.3em] inline-block mb-2 shadow-2xl border ${isImproved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border-white/10'}`}>
                                    {ls(isImproved ? 'After: Improved Farm' : 'Before: Current Farm')}
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    {ls(inputForm.crop_type)} <span className="text-slate-500">·</span> {inputForm.land_size} {ls('Acres')}
                                </h3>
                            </div>
                        </div>

                        <InlineErrorBoundary
                            fallback={
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                                    <div className="text-white font-black text-2xl uppercase tracking-widest">
                                        {language === 'ta' ? '3D உருவகம் செயல்படவில்லை' : '3D Simulation Unavailable'}
                                    </div>
                                    <p className="mt-4 text-slate-300 font-bold max-w-md">
                                        {language === 'ta'
                                            ? 'உங்கள் சாதனத்தின் graphics/WebGL ஆதரவு காரணமாக 3D காட்சியை ஏற்ற முடியவில்லை. கீழே உள்ள கணிப்புகள் இன்னும் கிடைக்கும்.'
                                            : "Your device's graphics/WebGL support couldn't load the 3D view. The simulation metrics will still work."}
                                    </p>
                                </div>
                            }
                        >
                            <Farm3D
                                data={{
                                    primary_crop: inputForm.crop_type,
                                    before: simData?.before,
                                    after: simData?.after
                                }}
                                improved={isImproved}
                                landArea={inputForm.land_size}
                                sandbox={sandbox}
                            />
                        </InlineErrorBoundary>

                        {/* ─── Bottom Status Bar: badges left, WASD hint right ─── */}
                        <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between gap-4 pointer-events-none">

                            {/* Left: Pest / Weed / Improved badges */}
                            <div className="flex flex-col gap-2 items-start">
                                {!isImproved && sandbox.pests && (
                                    <div className="flex items-center gap-2 bg-red-700/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-400/50 shadow-lg animate-pulse">
                                        <span className="text-base">🐛</span>
                                        <div>
                                            <div className="text-white font-black text-[10px] uppercase tracking-widest">
                                                {ls('PEST ATTACK DETECTED')}
                                            </div>
                                            <div className="text-red-200 text-[8px] font-bold">
                                                {ls('worms_visible')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!isImproved && sandbox.weedsLevel && (
                                    <div className={`flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-lg ${sandbox.weedsLevel === 'High'
                                        ? 'bg-orange-700/90 border-orange-400/50'
                                        : sandbox.weedsLevel === 'Medium'
                                            ? 'bg-yellow-700/90 border-yellow-400/50'
                                            : 'bg-yellow-800/80 border-yellow-600/40'
                                        }`}>
                                        <span className="text-base">🌿</span>
                                        <div>
                                            <div className="text-white font-black text-[10px] uppercase tracking-widest">
                                                {ls('WEEDS')}: {ls(sandbox.weedsLevel)}
                                            </div>
                                            <div className="text-yellow-100 text-[8px] font-bold">
                                                {sandbox.weedsLevel === 'High'
                                                    ? ls('dense_weeds')
                                                    : sandbox.weedsLevel === 'Medium'
                                                        ? ls('moderate_weeds')
                                                        : ls('scattered_weeds')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {isImproved && (
                                    <div className="flex items-center gap-2 bg-emerald-700/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-400/50 shadow-lg">
                                        <span className="text-base">✅</span>
                                        <div>
                                            <div className="text-white font-black text-[10px] uppercase tracking-widest">
                                                {ls('FARM IMPROVED!')}
                                            </div>
                                            <div className="text-emerald-100 text-[8px] font-bold">
                                                {ls('pests_eliminated')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Right Sidebar: Climate & Controls */}
                    <div className="w-full md:w-80 flex flex-col gap-6">
                        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-2xl">
                            <h2 className="text-[10px] font-black uppercase text-amber-400 tracking-[0.2em] mb-4">
                                {ls('Climate Analysis')}
                            </h2>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800/50 p-4 rounded-2xl text-center border border-white/5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">🌡️ {ls('Temperature')}</div>
                                    <div className="text-sm font-black text-amber-300 leading-tight">{simData?.before?.climate?.avg_temp || '--'}</div>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-2xl text-center border border-white/5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">🌧️ {ls('Rainfall')}</div>
                                    <div className="text-sm font-black text-blue-300 leading-tight">{simData?.[isImproved ? 'after' : 'before']?.climate?.rainfall || '--'}</div>
                                </div>
                            </div>
                            <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5 mb-4">
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                                    {typeof simData?.before?.climate?.insight === 'object' ? simData?.before?.climate?.insight[language] : (simData?.before?.climate?.insight || ls('Analyzing soil and climate data...'))}
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ls('Risk Level')}</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isImproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                    {ls(isImproved ? 'Low (Adapted)' : (simData?.before?.climate?.risk_level || 'High'))}
                                </span>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            <button
                                onClick={isImproved ? () => setStep(5) : () => {
                                    setStep(2);
                                    setTimeout(() => nextStep(), 1500);
                                }}
                                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-4 text-sm ${isImproved ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                            >
                                {ls(isImproved ? 'View Final Comparison' : 'Apply Improvements')}
                                {isImproved ? <FaArrowRight /> : <FaMagic />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- STEP 5: Final Comparison Dashboard ---
    if (step === 5) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 relative">
                <TopNav />
                <div className="max-w-6xl mx-auto space-y-8 pt-12">
                    <div className="text-center">
                        <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{ls('Farm Reality Check')}</h1>
                        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-sm">{ls('Comparison: Current vs Improved Methods')}</p>
                    </div>

                    {/* Farmer Input Summary */}
                    <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-4">
                            {ls('Farm Input Details')}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4 text-sm font-semibold text-slate-700">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('District')}
                                </div>
                                <div>{tDistrict(inputForm.district)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('Crop Type')}
                                </div>
                                <div>{inputForm.crop_type === 'Other' ? inputForm.crop_type_other : ls(inputForm.crop_type)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('Land Size')}
                                </div>
                                <div>
                                    {inputForm.land_size} {ls('Acres')}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('Days After Planting')}
                                </div>
                                <div>
                                    {inputForm.planting_mode === 'date'
                                        ? inputForm.planting_date || ls('not_set')
                                        : `${inputForm.days_after_planting || 0} ${ls('Days')}`}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('Seed Variety')}
                                </div>
                                <div>
                                    {inputForm.seed_variety === 'Other' ? inputForm.seed_variety_other : ls(inputForm.seed_variety)}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('Plant Spacing')}
                                </div>
                                <div>
                                    {inputForm.plant_spacing === 'Other' ? inputForm.plant_spacing_other : ls(inputForm.plant_spacing)}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('Fertilizers Used')}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {(inputForm.fertilizer_usage || []).length > 0 ? (
                                        inputForm.fertilizer_usage.map(f => (
                                            <span
                                                key={f}
                                                className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold"
                                            >
                                                {fertilizerLabel(f)}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 text-sm">
                                            {ls('No fertilizer information')}
                                        </span>
                                    )}
                                    {inputForm.fertilizer_other && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-dashed border-emerald-300 text-emerald-900 text-[11px] font-bold">
                                            {inputForm.fertilizer_other}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('Weed Level')}
                                </div>
                                <div>
                                    {inputForm.weed_level === 'Other' ? inputForm.weed_level_other : ls(inputForm.weed_level)}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('Pest Presence')}
                                </div>
                                <div>
                                    {inputForm.pest_presence === 'Other' ? inputForm.pest_presence_other : ls(inputForm.pest_presence)}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {ls('Crop Health Observation')}
                                </div>
                                <div>
                                    {inputForm.crop_health_observation === 'Other' ? inputForm.crop_health_other : ls(inputForm.crop_health_observation)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Summary Cards */}
                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100%] -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                            <div className="relative">
                                <span className="text-4xl">{CROP_MODELS[inputForm.crop_type]?.icon || CROP_MODELS.Default.icon}</span>
                                <h3 className="text-2xl font-black text-slate-800 mt-4 uppercase tracking-tight">{ls('Before Farm')}</h3>
                                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{ls('Traditional Practices')}</p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">{ls('Predicted Yield')}</span>
                                        <span className="text-slate-900 font-black text-xl">
                                            {simData?.before?.yield_total_tons} {ls('tons (total)')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">{ls('Water Usage')}</span>
                                        <span className="text-red-600 font-black text-xl">
                                            {ls(inputForm.irrig_method === 'Flood' ? 'High (Wastage)' : 'Medium')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">{ls('Climate Risk')}</span>
                                        <span className="text-amber-600 font-black text-xl">{ls(simData?.before?.climate?.risk_level || 'High')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group border-4 border-emerald-500/20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-bl-[100%] -mr-8 -mt-8 transition-all group-hover:scale-110"></div>
                            <div className="relative">
                                <span className="text-4xl">{CROP_MODELS[inputForm.crop_type]?.icon || CROP_MODELS.Default.icon}</span>
                                <h3 className="text-2xl font-black text-white mt-4 uppercase tracking-tight">{ls('After Farm')}</h3>
                                <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">{ls('Modern Technology')}</p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5">
                                        <span className="text-emerald-300 font-bold text-xs uppercase tracking-widest">{ls('Predicted Yield')}</span>
                                        <div className="text-right">
                                            <span className="text-white font-black text-xl">
                                                {simData?.after?.yield_total_tons} {ls('tons (total)')}
                                            </span>
                                            <div className="text-emerald-400 text-[10px] font-black">+{simData?.after?.yield_increase_pct}% {ls('INCREASE')}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5">
                                        <span className="text-emerald-300 font-bold text-xs uppercase tracking-widest">{ls('Water Savings')}</span>
                                        <div className="text-right">
                                            <span className="text-emerald-400 font-black text-xl">{simData?.after?.water_saved_pct}% {ls('SAVED')}</span>
                                            <div className="text-white/40 text-[10px] font-black uppercase">{ls('EFFICIENT DRIP')}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/5">
                                        <span className="text-emerald-300 font-bold text-xs uppercase tracking-widest">{ls('Climate Risk')}</span>
                                        <span className="text-emerald-400 font-black text-xl">{ls('Low (Resilient)')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── IMPROVEMENTS APPLIED ─── */}
                    {simData && (() => {
                        const imps = simData?.after?.improvements;
                        if (!imps) return null;

                        const crop = inputForm.crop_type === 'Other' ? (inputForm.crop_type_other || 'Crop') : inputForm.crop_type;
                        const ta = language === 'ta';

                        return (
                            <div className="bg-indigo-950 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-indigo-700/30 text-white space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-indigo-300 flex items-center gap-3">
                                        <FaStar className="text-indigo-400" />
                                        {ls('Improvements Applied to Increase Yield')}
                                    </h2>
                                    <div className="px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-indigo-200">
                                        {ls('Recommended Management Practices')}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Fertilizer Card */}
                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-amber-500/30 transition-colors group">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-xl">🌱</div>
                                            <h3 className="font-black uppercase tracking-widest text-amber-300 text-xs">{ls('Fertilizer Management')}</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{ls('Basal Dose')}</div>
                                                <div className="text-xs font-bold text-white/90">
                                                    {(() => {
                                                        const val = imps.fertilizer.basal[language] || imps.fertilizer.basal.en || [];
                                                        return Array.isArray(val) ? val.join(', ') : val;
                                                    })()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{ls('Top Dressing')}</div>
                                                <div className="text-xs font-bold text-white/90">
                                                    {(() => {
                                                        const val = imps.fertilizer.top_dress[language] || imps.fertilizer.top_dress.en || [];
                                                        return Array.isArray(val) ? val.join(' | ') : val;
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-white/5">
                                                <p className="text-[10px] text-amber-200/70 italic leading-relaxed">
                                                    {imps.fertilizer.season_note[language] || imps.fertilizer.season_note.en}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pest Control Card */}
                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-red-500/30 transition-colors group">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-xl">🐛</div>
                                            <h3 className="font-black uppercase tracking-widest text-red-300 text-xs">{ls('Precise Pest Control')}</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {imps.pest_control.threats.map((t, idx) => (
                                                <div key={idx} className="bg-black/20 p-3 rounded-xl border border-white/5">
                                                    <div className="text-[10px] font-black uppercase text-red-400 mb-1">{t.pest[language] || t.pest.en}</div>
                                                    <div className="text-[11px] font-bold text-white/90 mb-1">
                                                        <span className="text-slate-500 font-black mr-1">REQ:</span> {t.chemical[language] || t.chemical.en}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-emerald-400">
                                                        <span className="text-slate-500 font-black mr-1">ORG:</span> {t.organic[language] || t.organic.en}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Weed & Climate Card */}
                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-blue-500/30 transition-colors group">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl">☁️</div>
                                            <h3 className="font-black uppercase tracking-widest text-blue-300 text-xs">{ls('Climate & Weed Control')}</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                                <div className="text-[9px] font-black uppercase text-emerald-400 tracking-widest mb-1">{ls('Climate Adaptation')}</div>
                                                <div className="text-[11px] font-bold text-white leading-relaxed">{imps.climate_adaptation.action[language] || imps.climate_adaptation.action.en}</div>
                                            </div>
                                            <div className="space-y-2 px-1">
                                                <div>
                                                    <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{ls('Herbicide')}</div>
                                                    <div className="text-[11px] font-bold text-white/80">{imps.weed_control.pre_emergent[language] || imps.weed_control.pre_emergent.en}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{ls('Manual Control')}</div>
                                                    <div className="text-[11px] font-bold text-white/80">{imps.weed_control.manual[language] || imps.weed_control.manual.en}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Irrigation Card */}
                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-cyan-500/30 transition-colors group">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-xl">💧</div>
                                            <h3 className="font-black uppercase tracking-widest text-cyan-300 text-xs">{ls('Irrigation Upgrade')}</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between bg-black/30 p-3 rounded-2xl border border-white/5">
                                                <span className="text-[10px] font-black uppercase text-slate-500">{ls('From')}</span>
                                                <span className="text-xs font-black text-white">{ls('method' + imps.irrigation.from)}</span>
                                            </div>
                                            <div className="flex items-center justify-between bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30">
                                                <span className="text-[10px] font-black uppercase text-emerald-400">{ls('Recommended')}</span>
                                                <span className="text-xs font-black text-white">{ls('method' + imps.irrigation.to)}</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-400 leading-relaxed px-1">
                                                {imps.irrigation.reason[language] || imps.irrigation.reason.en}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Schedule Card (Takes 2 columns on larger screens) */}
                                    <div className="lg:col-span-2 bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-emerald-500/30 transition-colors group">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl">📅</div>
                                            <h3 className="font-black uppercase tracking-widest text-emerald-300 text-xs">{ls('Application & Care Schedule')}</h3>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {imps.schedule.map((step, idx) => (
                                                <div key={idx} className="flex gap-4 p-3 rounded-2xl bg-black/20 border border-white/5 active:scale-[0.98] transition-transform cursor-default">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white/5">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-0.5">{step.timing[language] || step.timing.en}</div>
                                                        <div className="text-[11px] font-bold text-white/90 leading-snug">
                                                            {Array.isArray(step.action[language]) ? step.action[language].join(', ') : (step.action[language] || step.action.en)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 space-y-4">
                            <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{ls('next_step_title')}</h4>
                            <p className="text-slate-600 font-bold leading-relaxed text-sm">
                                {ls('next_step_desc')}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={reset} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all">{ls('Start Over')}</button>
                            <button onClick={() => navigate('/dashboard')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 transition-all transform hover:scale-105">{ls('Go to Dashboard')}</button>
                        </div>
                    </div>


                </div>
            </div>
        );
    }

    return null;
};

export default FarmSimulation;
