from flask import Blueprint, jsonify, request, session
from models import FarmerData
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Configure Groq
groq_api_key = os.getenv("GROQ_API_KEY")
if groq_api_key:
    groq_client = Groq(api_key=groq_api_key)
else:
    groq_client = None

chatbot_bp = Blueprint('chatbot', __name__)


def require_login(f):
    """Decorator to require login"""
    def wrapper(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper


# ── Knowledge base ──────────────────────────────────────────────────────────
RESPONSES = {
    # --- crops ---
    'crop': {
        'en': (
            "🌾 Based on your profile, consider growing:\n"
            "• Paddy – high water area\n"
            "• Millets (Ragi/Sorghum) – drought-resistant\n"
            "• Pulses (Black gram/Green gram) – soil enrichment\n"
            "• Vegetables – higher market value\n\n"
            "Check the *Recommendations* section above for your personalised crop list!"
        ),
        'ta': (
            "🌾 உங்கள் சுயவிவரத்தின் அடிப்படையில் வளர்க்க பரிந்துரைக்கப்படும் பயிர்கள்:\n"
            "• நெல் – அதிக நீர் பகுதி\n"
            "• தினை/சோளம் – வறட்சி எதிர்ப்பு\n"
            "• பருப்பு வகைகள் – மண் வளம்\n"
            "• காய்கறிகள் – அதிக சந்தை மதிப்பு\n\n"
            "மேலே உள்ள *பரிந்துரைகள்* பிரிவில் உங்கள் தனிப்பட்ட பயிர் பட்டியலைப் பாருங்கள்!"
        ),
    },
    # --- water / irrigation ---
    'water': {
        'en': (
            "💧 Water management tips:\n"
            "• **Drip irrigation** saves 40–60% water vs flood irrigation\n"
            "• **Sprinkler irrigation** suits vegetables & groundnuts\n"
            "• Consider rainwater harvesting for drought seasons\n"
            "• PM Krishi Sinchayee Yojana offers subsidies for drip/sprinkler systems"
        ),
        'ta': (
            "💧 நீர் மேலாண்மை குறிப்புகள்:\n"
            "• **சொட்டு நீர்ப்பாசனம்** – வெள்ள நீர்ப்பாசனத்தை விட 40–60% நீரை சேமிக்கிறது\n"
            "• **தெளிப்பு நீர்ப்பாசனம்** – காய்கறிகள் மற்றும் நிலக்கடலைக்கு ஏற்றது\n"
            "• வறட்சி காலங்களுக்கு மழை நீர் சேகரிப்பு பயன்படுத்துங்கள்\n"
            "• PM கிருஷி சிஞ்சையி யோஜனா சொட்டு/தெளிப்பு அமைப்புகளுக்கு மானியம் வழங்குகிறது"
        ),
    },
    'irrigation': {
        'en': (
            "💧 Irrigation methods to consider:\n"
            "• **Drip irrigation** – most efficient, 50% water saving\n"
            "• **Sprinkler** – works well for vegetables\n"
            "• **Flood** – suitable for paddy but uses more water\n\n"
            "Government subsidies up to 90% are available for micro-irrigation systems!"
        ),
        'ta': (
            "💧 கவனிக்க வேண்டிய நீர்ப்பாசன முறைகள்:\n"
            "• **சொட்டு நீர்ப்பாசனம்** – மிகவும் திறமையானது, 50% நீர் சேமிப்பு\n"
            "• **தெளிப்பு** – காய்கறிகளுக்கு சிறந்தது\n"
            "• **வெள்ளம்** – நெல்லுக்கு ஏற்றது ஆனால் அதிக நீர் பயன்படுத்துகிறது\n\n"
            "நுண் நீர்ப்பாசன அமைப்புகளுக்கு 90% வரை அரசு மானியங்கள் கிடைக்கும்!"
        ),
    },
    # --- fertilizer / soil ---
    'fertilizer': {
        'en': (
            "🌱 Fertilizer best practices:\n"
            "• Get a **Soil Health Card** (free from govt) before applying fertilizer\n"
            "• Mix organic (compost/vermicompost) with chemical fertilizers\n"
            "• Use NPK based on crop stage: N for growth, P for roots, K for fruiting\n"
            "• Avoid over-fertilization — it damages soil long-term"
        ),
        'ta': (
            "🌱 உர சிறந்த நடைமுறைகள்:\n"
            "• உரம் போடுவதற்கு முன் **மண் ஆரோக்கிய அட்டை** பெறுங்கள் (அரசு இலவசம்)\n"
            "• கரிம (கம்போஸ்ட்/வேர்மிகம்போஸ்ட்) மற்றும் இரசாயன உரங்களை கலக்கவும்\n"
            "• பயிர் நிலையின் அடிப்படையில் NPK பயன்படுத்துங்கள்\n"
            "• அதிகப்படியான உரமிடுவதை தவிர்க்கவும் — நீண்ட காலத்தில் மண்ணை சேதப்படுத்துகிறது"
        ),
    },
    'soil': {
        'en': (
            "🌍 Soil health tips:\n"
            "• Apply for a free **Soil Health Card** at your nearest Krishi Vigyan Kendra\n"
            "• Rotate crops to prevent soil exhaustion\n"
            "• Use green manure (Dhaincha/Sunhemp) to improve organic matter\n"
            "• Avoid burning crop residues — incorporate them into the soil instead"
        ),
        'ta': (
            "🌍 மண் ஆரோக்கிய குறிப்புகள்:\n"
            "• உங்கள் அருகிலுள்ள கிருஷி விஞ்ஞான் கேந்திரத்தில் **மண் ஆரோக்கிய அட்டை** பெறுங்கள்\n"
            "• மண் சோர்வை தடுக்க பயிர் சுழற்சி செய்யுங்கள்\n"
            "• கரிம பொருட்களை மேம்படுத்த பச்சை உரம் பயன்படுத்துங்கள்\n"
            "• பயிர் எச்சங்களை எரிக்காதீர்கள் — மாறாக மண்ணில் கலக்கவும்"
        ),
    },
    # --- specific soil types ---
    'black_soil': {
        'en': (
            "⚫ **Black Soil (Regur Soil)** is highly moisture-retentive.\n"
            "**Best crops:** Cotton, Sugarcane, Millets (Sorghum/Bajra), Wheat, and Tobacco."
        ),
        'ta': (
            "⚫ **கரிசல் மண்** அதிக ஈரப்பதத்தைத் தக்கவைக்கும் தன்மை கொண்டது.\n"
            "**சிறந்த பயிர்கள்:** பருத்தி, கரும்பு, தினை (சோளம்/கம்பு), கோதுமை மற்றும் புகையிலை."
        ),
    },
    'red_soil': {
        'en': (
            "🔴 **Red Soil** is porous and typically rich in iron.\n"
            "**Best crops:** Groundnut, Pulses, Millets, Castor, and Potato (with proper fertilizers)."
        ),
        'ta': (
            "🔴 **செம்மண்** நுண்துளைகள் கொண்டது மற்றும் இரும்புச் சத்து நிறைந்தது.\n"
            "**சிறந்த பயிர்கள்:** நிலக்கடலை, பருப்பு வகைகள், தினை, ஆமணக்கு மற்றும் உருளைக்கிழங்கு (சரியான உரங்களுடன்)."
        ),
    },
    'alluvial_soil': {
        'en': (
            "🌊 **Alluvial Soil** is highly fertile and rich in potash.\n"
            "**Best crops:** Rice, Wheat, Sugarcane, Cotton, Jute, and various vegetables."
        ),
        'ta': (
            "🌊 **வண்டல் மண்** மிகவும் வளமானது மற்றும் பொட்டாஷ் நிறைந்தது.\n"
            "**சிறந்த பயிர்கள்:** நெல், கோதுமை, கரும்பு, பருத்தி, சணல் மற்றும் பல்வேறு காய்கறிகள்."
        ),
    },
    'loamy_soil': {
        'en': (
            "🌱 **Loamy Soil** is a perfect mix of sand, silt, and clay, great for drainage.\n"
            "**Best crops:** Wheat, Sugarcane, Cotton, Jute, and Pulses."
        ),
        'ta': (
            "🌱 **களிமண் கலந்த மண் (Loamy Soil)** சிறந்த வடிகால் கொண்டது.\n"
            "**சிறந்த பயிர்கள்:** கோதுமை, கரும்பு, பருத்தி, சணல் மற்றும் பருப்பு வகைகள்."
        ),
    },
    'clay_soil': {
        'en': (
            "🧱 **Clay Soil** holds water very well but drains poorly.\n"
            "**Best crops:** Paddy (Rice), Cabbage, Broccoli, and leafy vegetables."
        ),
        'ta': (
            "🧱 **களிமண்** தண்ணீரை நன்றாக பிடித்துவைக்கும், ஆனால் வடிகால் குறைவு.\n"
            "**சிறந்த பயிர்கள்:** நெல், முட்டைக்கோஸ், ப்ரோக்கோலி மற்றும் இலை காய்கறிகள்."
        ),
    },
    'sandy_soil': {
        'en': (
            "🏜️ **Sandy Soil** drains rapidly and holds little moisture.\n"
            "**Best crops:** Watermelon, Peanuts, Carrots, Potatoes, and other root vegetables."
        ),
        'ta': (
            "🏜️ **மணல் மண்** சீக்கிரம் நீரை வடியச் செய்யும், ஈரப்பதம் குறைவாக இருக்கும்.\n"
            "**சிறந்த பயிர்கள்:** தர்பூசணி, வேர்க்கடலை, கேரட், உருளைக்கிழங்கு மற்றும் பிற வேர் காய்கறிகள்."
        ),
    },
    'silt_soil': {
        'en': (
            "🚜 **Silt Soil** is fertile, holds moisture well, and is easy to cultivate.\n"
            "**Best crops:** Wheat, Grasses, and a variety of vegetables and fruits."
        ),
        'ta': (
            "🚜 **வண்டல் குறை மண் (Silt Soil)** வளமானது, ஈரப்பதத்தை நன்றாகத் தக்கவைக்கும்.\n"
            "**சிறந்த பயிர்கள்:** கோதுமை, புற்கள் மற்றும் பல்வேறு காய்கறிகள் மற்றும் பழங்கள்."
        ),
    },
    'peaty_soil': {
        'en': (
            "💧 **Peaty Soil** is acidic and rich in organic matter.\n"
            "**Best crops:** Root vegetables (Carrots, Beets), Legumes, and leafy greens."
        ),
        'ta': (
            "💧 **கரிம மண் (Peaty Soil)** அமிலத்தன்மை மற்றும் கரிம பொருட்கள் நிறைந்தது.\n"
            "**சிறந்த பயிர்கள்:** வேர் காய்கறிகள் (கேரட், பீட்ரூட்), பருப்பு வகைகள் மற்றும் கீரைகள்."
        ),
    },
    # --- scheme / PM / TNAU ---
    'scheme': {
        'en': (
            "🏛️ Key government schemes for farmers:\n"
            "• **PM-KISAN** – ₹6,000/year direct income support\n"
            "• **PMFBY** – Crop insurance at low premium\n"
            "• **PM Kisan Samman Nidhi** – ₹2,000 every 4 months\n"
            "• **Kisan Credit Card (KCC)** – Low-interest credit up to ₹3 lakh\n"
            "• **TN Uzhavar Santhai** – Direct market access\n\n"
            "See the *Government Schemes* section on the Dashboard for schemes matched to your profile!"
        ),
        'ta': (
            "🏛️ விவசாயிகளுக்கான முக்கிய அரசு திட்டங்கள்:\n"
            "• **PM-KISAN** – ₹6,000/ஆண்டு நேரடி வருமான ஆதரவு\n"
            "• **PMFBY** – குறைந்த பிரீமியத்தில் பயிர் காப்பீடு\n"
            "• **கிசான் கடன் அட்டை (KCC)** – ₹3 லட்சம் வரை குறைந்த வட்டி கடன்\n"
            "• **TN உழவர் சந்தை** – நேரடி சந்தை அணுகல்\n\n"
            "உங்கள் சுயவிவரத்துடன் பொருந்தும் திட்டங்களுக்கு டாஷ்போர்டில் உள்ள *அரசு திட்டங்கள் பிரிவைப்* பாருங்கள்!"
        ),
    },
    'subsidy': {
        'en': (
            "💰 Available subsidies for Tamil Nadu farmers:\n"
            "• 50–90% subsidy on **drip & sprinkler irrigation** equipment\n"
            "• Subsidy on **seed varieties** from TNAU\n"
            "• **Solar pump** subsidy up to 90% under PM-KUSUM\n"
            "• **Farm mechanisation** subsidies (tractor, harvester) via SMAM scheme"
        ),
        'ta': (
            "💰 தமிழ்நாடு விவசாயிகளுக்கு கிடைக்கும் மானியங்கள்:\n"
            "• **சொட்டு & தெளிப்பு நீர்ப்பாசன** உபகரணங்களில் 50–90% மானியம்\n"
            "• TNAU-இல் **விதை வகைகள்** மீது மானியம்\n"
            "• PM-KUSUM-ன் கீழ் **சூரிய ஆற்றல் பம்ப்** 90% வரை மானியம்\n"
            "• SMAM திட்டம் வழியாக **பண்ணை இயந்திரமயமாக்கல்** மானியங்கள் (டிராக்டர், கொடுவாள்)"
        ),
    },
    # --- technology ---
    'technology': {
        'en': (
            "📱 Modern farming technologies to consider:\n"
            "• **Drone spraying** – precise pesticide application, saves 30% chemical cost\n"
            "• **IoT soil sensors** – real-time moisture & nutrient monitoring\n"
            "• **Mobile apps** – mKisan, Kisan Suvidha for weather & market prices\n"
            "• **Precision farming** tools for yield optimisation\n\n"
            "Check your *Recommendations* tab for technologies suited to your farm!"
        ),
        'ta': (
            "📱 கவனிக்க வேண்டிய நவீன விவசாய தொழில்நுட்பங்கள்:\n"
            "• **ட்ரோன் தெளிப்பு** – துல்லியமான பூச்சிக்கொல்லி பயன்பாடு, 30% இரசாயன செலவு சேமிப்பு\n"
            "• **IoT மண் உணரிகள்** – நிகழ்நேர ஈரப்பதம் மற்றும் ஊட்டச்சத்து கண்காணிப்பு\n"
            "• **மொபைல் பயன்பாடுகள்** – mKisan, கிசான் சுவிதா\n"
            "• **துல்லிய விவசாயம்** – விளைச்சல் மேம்படுத்துவதற்கான கருவிகள்\n\n"
            "உங்கள் பண்ணைக்கு ஏற்ற தொழில்நுட்பங்களுக்கு *பரிந்துரைகள்* தாவலைப் பாருங்கள்!"
        ),
    },
    # --- weather ---
    'weather': {
        'en': (
            "☁️ Tips for weather-smart farming:\n"
            "• Use **Meghdoot** or **Damini** apps for localised weather forecasts\n"
            "• Plan sowing based on **IMD agro-met advisories**\n"
            "• Enrol in **PMFBY** crop insurance to protect against crop loss from bad weather\n"
            "• Build farm ponds to capture rainwater during excess rainfall"
        ),
        'ta': (
            "☁️ வானிலை-புத்திசாலி விவசாயத்திற்கான குறிப்புகள்:\n"
            "• உள்ளூர் வானிலை முன்னறிவிப்புகளுக்கு **Meghdoot** அல்லது **Damini** பயன்பாடுகளைப் பயன்படுத்துங்கள்\n"
            "• **IMD agro-met ஆலோசனைகளின்** அடிப்படையில் விதைப்பை திட்டமிடுங்கள்\n"
            "• **PMFBY** பயிர் காப்பீட்டில் சேருங்கள்\n"
            "• அதிக மழைபொழிவின் போது மழை நீரை சேகரிக்க பண்ணை குளங்களை உருவாக்குங்கள்"
        ),
    },
    # --- pest / disease ---
    'pest': {
        'en': (
            "🐛 Integrated Pest Management (IPM) tips:\n"
            "• Use **sticky traps** and **pheromone traps** to monitor pest levels\n"
            "• Introduce natural predators (ladybugs, parasitic wasps)\n"
            "• Apply neem-based pesticides as a safer first step\n"
            "• Rotate crops to break pest cycles\n"
            "• Contact your nearest **Krishi Vigyan Kendra (KVK)** for free pest identification"
        ),
        'ta': (
            "🐛 ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM) குறிப்புகள்:\n"
            "• பூச்சி நிலைகளை கண்காணிக்க **ஒட்டும் பொறி** மற்றும் **ஃபெரோமோன் பொறி** பயன்படுத்துங்கள்\n"
            "• இயற்கை விரோதிகளை அறிமுகப்படுத்துங்கள்\n"
            "• பாதுகாப்பான முதல் படியாக வேம்பு அடிப்படையிலான பூச்சிக்கொல்லிகளை பயன்படுத்துங்கள்\n"
            "• பூச்சி சுழற்சிகளை உடைக்க பயிர் சுழற்சி செய்யுங்கள்\n"
            "• இலவச பூச்சி அடையாளத்திற்கு உங்கள் அருகிலுள்ள **KVK**-ஐ தொடர்பு கொள்ளுங்கள்"
        ),
    },
    'disease': {
        'en': (
            "🦠 Common crop disease prevention:\n"
            "• Use **certified disease-resistant seeds** from TNAU or government centres\n"
            "• Ensure good **field drainage** – most fungal diseases thrive in waterlogged soil\n"
            "• Apply **copper-based fungicides** for fungal infections\n"
            "• Maintain proper **plant spacing** to allow air circulation\n"
            "• Report unusual symptoms to your nearest Agricultural Officer"
        ),
        'ta': (
            "🦠 பயிர் நோய் தடுப்பு:\n"
            "• TNAU அல்லது அரசு மையங்களிலிருந்து **சான்றளிக்கப்பட்ட நோய் எதிர்ப்பு விதைகளை** பயன்படுத்துங்கள்\n"
            "• நல்ல **வயல் வடிகால்** உறுதிசெய்யுங்கள்\n"
            "• பூஞ்சை தொற்றுகளுக்கு **செம்பு அடிப்படையிலான பூஞ்சைக்கொல்லிகளை** பயன்படுத்துங்கள்\n"
            "• காற்று ஓட்டத்தை அனுமதிக்க சரியான **தாவர இடைவெளியை** பராமரிக்கவும்"
        ),
    },
    # --- market / price ---
    'market': {
        'en': (
            "📊 Getting better market prices:\n"
            "• Sell directly via **Uzhavar Santhai** (TN) to avoid middlemen\n"
            "• Check **eNAM** portal for online agri-market prices\n"
            "• Form or join a **Farmer Producer Organisation (FPO)** for bulk selling power\n"
            "• Store produce in **Warehouse Receipt Scheme** to sell when prices are high"
        ),
        'ta': (
            "📊 சிறந்த சந்தை விலைகள் பெறுவது:\n"
            "• இடைத்தரகர்களை தவிர்க்க **உழவர் சந்தை** (TN) மூலம் நேரடியாக விற்கவும்\n"
            "• ஆன்லைன் விவசாய-சந்தை விலைகளுக்கு **eNAM** போர்டலைச் சரிபார்க்கவும்\n"
            "• மொத்த விற்பனை சக்திக்காக **விவசாயி உற்பத்தி அமைப்பு (FPO)** உருவாக்குங்கள் அல்லது சேருங்கள்\n"
            "• விலைகள் அதிகமாக இருக்கும் போது விற்க **கிடங்கு ரசீது திட்டத்தில்** சேமிக்கவும்"
        ),
    },
    # --- loan / credit ---
    'loan': {
        'en': (
            "🏦 Farming finance options:\n"
            "• **Kisan Credit Card (KCC)** – up to ₹3 lakh at ~4% interest rate\n"
            "• **NABARD** loans for farm infrastructure and agro-processing\n"
            "• **Mudra Loan (Kishor/Tarun)** – for farm-linked small businesses\n"
            "• Check with your local **Cooperative Bank** for state-level schemes"
        ),
        'ta': (
            "🏦 விவசாய நிதி விருப்பங்கள்:\n"
            "• **கிசான் கடன் அட்டை (KCC)** – ~4% வட்டி விகிதத்தில் ₹3 லட்சம் வரை\n"
            "• பண்ணை உள்கட்டமைப்புக்கு **NABARD** கடன்கள்\n"
            "• **முத்ரா கடன்** – பண்ணை-இணைப்பு சிறு வணிகங்களுக்கு\n"
            "• மாநில அளவிலான திட்டங்களுக்கு உங்கள் உள்ளூர் **கூட்டுறவு வங்கியை** தொடர்பு கொள்ளுங்கள்"
        ),
    },
    # --- score / adoption ---
    'score': {
        'en': (
            "📈 How to improve your Adoption Score:\n"
            "• **Use more technologies** – drip irrigation, mobile apps, GPS\n"
            "• **Attend KVK trainings** – earns awareness credit\n"
            "• **Enrol in more government schemes** – PM-KISAN, PMFBY etc.\n"
            "• **Update your farmer profile** with latest data for accurate scoring"
        ),
        'ta': (
            "📈 உங்கள் தத்தெடுப்பு மதிப்பெண்ணை மேம்படுத்துவது எப்படி:\n"
            "• **அதிக தொழில்நுட்பங்களை பயன்படுத்துங்கள்** – சொட்டு நீர்ப்பாசனம், மொபைல் பயன்பாடுகள்\n"
            "• **KVK பயிற்சிகளில் கலந்துகொள்ளுங்கள்**\n"
            "• **அதிக அரசு திட்டங்களில் சேருங்கள்** – PM-KISAN, PMFBY போன்றவை\n"
            "• துல்லியமான மதிப்பீட்டிற்கு சமீபத்திய தரவுகளுடன் **உங்கள் விவசாயி சுயவிவரத்தை புதுப்பிக்கவும்**"
        ),
    },
    # --- specific farmer questions ---
    'crop_season': {
        'en': (
            "🌱 **Season-based Crops:**\n"
            "• **Monsoon (Kharif):** Paddy, Maize, Cotton, Groundnut. High water requirement.\n"
            "• **Winter (Rabi):** Wheat, Gram, Mustard, Barley. Cooler climate, less water.\n"
            "• **Summer (Zaid):** Watermelon, Cucumber, Bitter Gourd. Short duration, needs assured irrigation."
        ),
        'ta': (
            "🌱 **பருவகால பயிர்கள்:**\n"
            "• **மழைக்காலம் (காரிப்):** நெல், மக்காச்சோளம், பருத்தி, நிலக்கடலை. அதிக நீர் தேவை.\n"
            "• **குளிர்காலம் (ரபி):** கோதுமை, கொண்டைக்கடலை, கடுகு. குளிர்ந்த காலநிலை, குறைந்த நீர்.\n"
            "• **கோடைக்காலம் (சையத்):** தர்பூசணி, வெள்ளரி, பாகற்காய். குறுகிய கால நீர்ப்பாசனம் அவசியம்."
        ),
    },
    'crop_duration': {
        'en': (
            "⏱️ **Quick Return / Short Duration Crops (60-90 days):**\n"
            "• **Vegetables:** Spinach, Radish, Coriander (30-45 days). High market demand daily.\n"
            "• **Gourds:** Bitter gourd, Bottle gourd (60-80 days).\n"
            "• **Pulses:** Green gram, Black gram (65-75 days). Low water & fertilizer needs.\n"
            "Yields vary, but vegetables give continuous harvest and quick cash flow."
        ),
        'ta': (
            "⏱️ **விரைவான வருமானம் / குறுகிய கால பயிர்கள் (60-90 நாட்கள்):**\n"
            "• **காய்கறிகள்:** கீரை, முள்ளங்கி, கொத்தமல்லி (30-45 நாட்கள்). தினசரி அதிக சந்தை தேவை.\n"
            "• **கொடி காய்கறிகள்:** பாகற்காய், சுரைக்காய் (60-80 நாட்கள்).\n"
            "• **பருப்பு வகைகள்:** பச்சைப்பயறு, உளுந்து (65-75 நாட்கள்).\n"
            "காய்கறிகள் தொடர்ச்சியான அறுவடையையும் விரைவான பணப்புழக்கத்தையும் தரும்."
        ),
    },
    'crop_profit': {
        'en': (
            "💰 **High-Profit Crops for Small Farmers:**\n"
            "• **Commercial Veggies:** Tomato, Onion, Chilli. High fluctuation in prices, but high returns.\n"
            "• **Spices/Herbs:** Turmeric, Ginger, Mint. High market value and longer shelf life.\n"
            "• **Floriculture:** Marigold, Jasmine. Daily income, extremely high demand during festivals."
        ),
        'ta': (
            "💰 **சிறு விவசாயிகளுக்கான அதிக லாபம்தரும் பயிர்கள்:**\n"
            "• **வணிக காய்கறிகள்:** தக்காளி, வெங்காயம், மிளகாய். விலைகளில் அதிக ஏற்ற இறக்கம், அதிக வருமானம்.\n"
            "• **சுவையூட்டிகள்/மூலிகைகள்:** மஞ்சள், இஞ்சி, புதினா. அதிக சந்தை மதிப்பு.\n"
            "• **மலர் சாகுபடி:** சாமந்தி, மல்லிகை. தினசரி வருமானம், பண்டிகை காலங்களில் அதிக தேவை."
        ),
    },
    'crop_budget': {
        'en': (
            "💵 **Farming under ₹50,000 Budget:**\n"
            "• **Vegetable Farming:** 1-2 acres of Tomato or Chilli. Quick returns, covers seed, drip, and fertilizer costs.\n"
            "• **Leafy Greens & Herbs:** Extremely low investment (seeds & basic organic manure), ready in 30-40 days.\n"
            "• **Pulses:** Low seed cost, minimal fertilizer and water required.\n"
            "Check local Agriculture office for 50-90% subsidy on seeds and drip irrigation!"
        ),
        'ta': (
            "💵 **₹50,000 பட்ஜெட்டில் விவசாயம்:**\n"
            "• **காய்கறி விவசாயம்:** 1-2 ஏக்கர் தக்காளி அல்லது மிளகாய். விதை, சொட்டுநீர் மற்றும் உரச் செலவுகளை அடக்கும்.\n"
            "• **கீரைகள் & மூலிகைகள்:** மிகக் குறைந்த முதலீடு, 30-40 நாட்களில் தயார்.\n"
            "• **பருப்பு வகைகள்:** குறைந்த விதைச் செலவு, குறைந்த உரம் மற்றும் நீர் தேவை.\n"
            "மானியங்களுக்கு உள்ளூர் வேளாண் அலுவலகத்தை அணுகவும்!"
        ),
    },
    'crop_water_low': {
        'en': (
            "🌵 **Low-Water / Drought Resistant Crops:**\n"
            "• **Millets:** Pearl Millet (Bajra), Sorghum (Jowar), Finger Millet (Ragi). Highly nutritious, minimal water.\n"
            "• **Pulses:** Grams and Lentils. Can grow on residual soil moisture.\n"
            "• **Oilseeds:** Groundnut, Sesame, Mustard.\n"
            "Use drip irrigation and mulching to save up to 50% more water."
        ),
        'ta': (
            "🌵 **குறைந்த நீர் / வறட்சி தாங்கும் பயிர்கள்:**\n"
            "• **சிறுதானியங்கள்:** கம்பு, சோளம், கேழ்வரகு. அதிக ஊட்டச்சத்து, மிகக் குறைந்த நீர்.\n"
            "• **பருப்பு வகைகள்:** கொண்டைக்கடலை மற்றும் இதர பருப்புகள்.\n"
            "• **எண்ணெய் வித்துக்கள்:** நிலக்கடலை, எள், கடுகு.\n"
            "நீரைச் சேமிக்க சொட்டு நீர்ப்பாசனம் மற்றும் மூடாக்கு பயன்படுத்தவும்."
        ),
    },
    'crop_rotation': {
        'en': (
            "🔄 **Crop Rotation (eg. for Rice Farmers):**\n"
            "• **Why Rotate?** Breaks pest cycles and restores soil nutrients.\n"
            "• **Rice -> Pulses:** Growing Black Gram or Green Gram after Paddy adds Nitrogen naturally.\n"
            "• **Rice -> Vegetables:** Short-duration vegetables enhance cash flow.\n"
            "Legumes (pulses) reduce your next crop's Urea requirement by 20-30%."
        ),
        'ta': (
            "🔄 **பயிர் சுழற்சி (உம். நெல் விவசாயிகளுக்கு):**\n"
            "• **ஏன் சுழற்சி?** பூச்சி சுழற்சிகளை உடைத்து, செழிப்பை மீட்டெடுக்கிறது.\n"
            "• **நெல் -> பருப்பு வகைகள்:** நெல்லுக்குப் பிறகு உளுந்து வளர்ப்பது நைட்ரஜனை சேர்க்கிறது.\n"
            "• **நெல் -> காய்கறிகள்:** குறுகிய கால காய்கறிகள் பணப்புழக்கத்தை மேம்படுத்துகின்றன.\n"
            "பருப்பு வகைகள் அடுத்த பயிரின் யூரியா தேவையைக் குறைக்கின்றன."
        ),
    },
    'crop_land': {
        'en': (
            "🏞️ **Land Size Based Planning (e.g., 5 Acres):**\n"
            "• **1 Acre:** High-value veg (Tomato/Chilli) for daily/weekly cash flow.\n"
            "• **3 Acres:** Staple commercial crops (Paddy/Maize/Cotton) for bulk seasonal income.\n"
            "• **1 Acre:** Orchard/Fruit trees (Mango/Guava/Lemon) for long-term secure returns.\n"
            "Diversification is key to managing risk and ensuring steady income!"
        ),
        'ta': (
            "🏞️ **நில அளவு அடிப்படையிலான திட்டமிடல் (உம். 5 ஏக்கர்):**\n"
            "• **1 ஏக்கர்:** தினசரி/வாராந்திர வருமானத்திற்கு காய்கறிகள்.\n"
            "• **3 ஏக்கர்:** மொத்தப் பருவ வருமானத்திற்கு வணிகப் பயிர்கள் (நெல்/பருத்தி).\n"
            "• **1 ஏக்கர்:** நீண்ட கால வருமானத்திற்கு பழ மரங்கள் (மாம்பழம்/எலுமிச்சை).\n"
            "ஆபத்தை நிர்வகிக்கவும் நிலையான வருமானத்தை உறுதி செய்யவும் பல்வகைப்படுத்தல் முக்கியம்!"
        ),
    },
    # --- specific schemes & finance ---
    'pm_kisan': {
        'en': (
            "🌾 **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)**\n"
            "• **Benefits:** ₹6,000/year directly to bank account in 3 equal installments.\n"
            "• **Eligibility:** All landholding farmers with cultivable land.\n"
            "• **Application:** Apply via PM-KISAN Portal, CSCs, or local Patwari.\n"
            "• **Documents:** Aadhaar, Land ownership papers, Bank account details.\n"
            "• **Link:** [pmkisan.gov.in](https://pmkisan.gov.in/)"
        ),
        'ta': (
            "🌾 **PM-KISAN (பிரதம மந்திரி கிசான் சம்மான் நிதி)**\n"
            "• **நன்மைகள்:** ஆண்டுக்கு ₹6,000 நேரடியாக வங்கி கணக்கில் (3 தவணைகளாக).\n"
            "• **தகுதி:** சாகுபடி நிலம் உள்ள அனைத்து விவசாயிகளும்.\n"
            "• **விண்ணப்பம்:** PM-KISAN போர்டல், CSC அல்லது கிராம நிர்வாக அதிகாரியை அணுகவும்.\n"
            "• **ஆவணங்கள்:** ஆதார், நில ஆவணங்கள், வங்கி கணக்கு.\n"
            "• **இணையதளம்:** [pmkisan.gov.in](https://pmkisan.gov.in/)"
        ),
    },
    'crop_insurance': {
        'en': (
            "🛡️ **PMFBY (Pradhan Mantri Fasal Bima Yojana)**\n"
            "• **Benefits:** Financial support for crop loss due to natural calamities.\n"
            "• **Premium:** 1.5% for Rabi, 2% for Kharif, 5% for commercial/horticulture crops.\n"
            "• **Eligibility:** All farmers growing notified crops in notified areas.\n"
            "• **Application:** Enroll through your bank (if loanee) or pmfby.gov.in / CSC centres (if non-loanee).\n"
            "• **Deadline:** Usually July 31 for Kharif, Dec 31 for Rabi.\n"
            "• **Link:** [pmfby.gov.in](https://pmfby.gov.in/)"
        ),
        'ta': (
            "🛡️ **PMFBY (பிரதம மந்திரி பயிர் காப்பீட்டு திட்டம்)**\n"
            "• **நன்மைகள்:** இயற்கை சீற்றங்களால் ஏற்படும் பயிர் இழப்புக்கு நிதி ஆதரவு.\n"
            "• **பிரீமியம்:** ரபிக்கு 1.5%, காரிப்க்கு 2%, வணிகப் பயிர்களுக்கு 5%.\n"
            "• **விண்ணப்பம்:** வங்கி, CSC அல்லது pmfby.gov.in மூலம் விண்ணப்பிக்கலாம்.\n"
            "• **காலக்கெடு:** காரிப் பருவத்திற்கு ஜூலை 31, ரபிக்கு டிசம்பர் 31.\n"
            "• **இணையதளம்:** [pmfby.gov.in](https://pmfby.gov.in/)"
        ),
    },
    'kisan_credit_card': {
        'en': (
            "💳 **Kisan Credit Card (KCC)**\n"
            "• **Benefits:** Short-term credit limits up to ₹3 Lakhs at a low interest rate (4% with prompt repayment).\n"
            "• **Eligibility:** Individual/joint borrowers who are owner-cultivators, tenant farmers, or sharecroppers.\n"
            "• **Application:** Download the form from pmkisan.gov.in and submit it to your nearest bank branch.\n"
            "• **Documents:** ID proof, Address proof, Land documents, Passport size photo.\n"
            "• **Contact:** Any commercial bank, cooperative bank, or regional rural bank."
        ),
        'ta': (
            "💳 **கிசான் கிரெடிட் கார்டு (KCC)**\n"
            "• **நன்மைகள்:** குறைந்த வட்டியில் (சரியாக கட்டினால் 4%) ₹3 லட்சம் வரை குறுகிய கால கடன்.\n"
            "• **தகுதி:** சொந்த நிலம் உள்ள விவசாயி, குத்தகை விவசாயிகள்.\n"
            "• **விண்ணப்பம்:** படிவத்தை pmkisan.gov.in இல் பதிவிறக்கி உங்கள் வங்கியில் சமர்ப்பிக்கவும்.\n"
            "• **ஆவணங்கள்:** அடையாள / முகவரி சான்று, நில ஆவணங்கள், புகைப்படம்.\n"
            "• **தொடர்புக்கு:** எந்தவொரு அரசு அல்லது கூட்டுறவு வங்கியையும் அணுகலாம்."
        ),
    },
    'soil_health_card_scheme': {
        'en': (
            "🌍 **Soil Health Card (SHC) Scheme**\n"
            "• **Benefits:** Gives crop-wise recommendations of nutrients/fertilizers to improve yield.\n"
            "• **Cost/Subsidy:** Free soil testing by the government.\n"
            "• **Eligibility:** Every farmer in India.\n"
            "• **Process:** State Govt collects soil samples; tests are done in labs, and cards are distributed.\n"
            "• **Contact:** Visit the nearest Krishi Vigyan Kendra (KVK) or Agriculture Dept office.\n"
            "• **Link:** [soilhealth.dac.gov.in](https://soilhealth.dac.gov.in/)"
        ),
        'ta': (
            "🌍 **மண் வளம் அட்டை (Soil Health Card) திட்டம்**\n"
            "• **நன்மைகள்:** விளைச்சலை அதிகரிக்க தேவையான உரங்கள் மற்றும் ஊட்டச்சத்துகள் பற்றிய பரிந்துரைகள்.\n"
            "• **செலவு:** அரசால் இலவசமாக செய்யப்படுகிறது.\n"
            "• **செயல்முறை:** மாநில அரசு மண் மாதிரிகளை சேகரித்து பரிசோதனை செய்த பின் அட்டைகள் வழங்கப்படும்.\n"
            "• **தொடர்புக்கு:** அருகிலுள்ள கிருஷி விஞ்ஞான் கேந்திரா (KVK) அல்லது வேளாண்மைத் துறை அலுவலகம்.\n"
            "• **இணையதளம்:** [soilhealth.dac.gov.in](https://soilhealth.dac.gov.in/)"
        ),
    },
    'e_nam': {
        'en': (
            "💻 **e-NAM (National Agriculture Market)**\n"
            "• **Benefits:** Online trading platform connecting APMCs. Discover better prices and sell transparently.\n"
            "• **Eligibility:** All farmers, FPOs, and traders can register.\n"
            "• **Application:** Register online at enam.gov.in or via the e-NAM mobile app.\n"
            "• **Documents:** Bank details, Aadhaar, and registered mobile number.\n"
            "• **Link:** [enam.gov.in](https://enam.gov.in/)"
        ),
        'ta': (
            "💻 **e-NAM (தேசிய வேளாண் சந்தை)**\n"
            "• **நன்மைகள்:** இடைத்தரகர் இல்லாமல் சிறந்த விலையில் விற்க ஆன்லைன் வர்த்தக தளம்.\n"
            "• **தகுதி:** அனைத்து விவசாயிகள், FPO-கள் பதிவு செய்யலாம்.\n"
            "• **விண்ணப்பம்:** enam.gov.in அல்லது e-NAM மொபைல் செயலி மூலம் பதிவு செய்யலாம்.\n"
            "• **ஆவணங்கள்:** வங்கி விவரங்கள், ஆதார் மற்றும் மொபைல் எண்.\n"
            "• **இணையதளம்:** [enam.gov.in](https://enam.gov.in/)"
        ),
    },
    'organic_farming': {
        'en': (
            "🍃 **Paramparagat Krishi Vikas Yojana (PKVY) - Organic Farming**\n"
            "• **Benefits:** Promotes organic farming through cluster approach. ₹50,000/hectare subsidy over 3 years.\n"
            "• **Usage:** Subsidy for seed/bio-fertilisers/pesticides (₹31,000) and certification/marketing.\n"
            "• **Eligibility:** Groups of minimum 20 farmers forming a cluster of 20 hectares.\n"
            "• **Application:** Contact local Agriculture/Horticulture Office or KVK for cluster formation.\n"
            "• **Link:** [pgsindia-ncof.gov.in](https://pgsindia-ncof.gov.in/)"
        ),
        'ta': (
            "🍃 **PKVY - இயற்கை விவசாயத் திட்டம்**\n"
            "• **நன்மைகள்:** இயற்கை விவசாயத்தை ஊக்குவிக்க ஹெக்டேருக்கு ₹50,000 (3 ஆண்டுகளில்) மானியம்.\n"
            "• **பயன்பாடு:** விதைகள், உயிர் உரங்கள் மற்றும் சான்றிதழ்/சந்தைப்படுத்தல் கட்டணங்களுக்கு.\n"
            "• **தகுதி:** 20 ஹெக்டேர் கொத்து அமைக்கும் குறைந்தபட்சம் 20 விவசாயிகள் கொண்ட குழுக்கள்.\n"
            "• **விண்ணப்பம்:** குழுவை உருவாக்க உள்ளூர் வேளாண்மை அலுவலகத்தை தொடர்பு கொள்ளவும்."
        ),
    },
    'women_farmers': {
        'en': (
            "👩‍🌾 **Mahila Kisan Sashaktikaran Pariyojana (MKSP)**\n"
            "• **Benefits:** Empowers women in agriculture by making them self-reliant through skill development and tools.\n"
            "• **Subsidy/Funding:** GoI provides up to 60% (or higher for specific states) of the project cost.\n"
            "• **Eligibility:** Women farmers, members of Self Help Groups (SHGs).\n"
            "• **Application:** Reach out to the State Rural Livelihood Mission (SRLM) office in your district.\n"
            "• **Additional:** Women also get an extra 10-20% subsidy under SMAM (farm machinery) and PM-KUSUM."
        ),
        'ta': (
            "👩‍🌾 **பெண் விவசாயிகள் அதிகாரமளிப்பு திட்டம் (MKSP)**\n"
            "• **நன்மைகள்:** திறன் மேம்பாடு மற்றும் கருவிகள் மூலம் பெண் விவசாயிகளை தற்சார்பு அடையச் செய்தல்.\n"
            "• **தகுதி:** பெண் விவசாயிகள், சுய உதவிக் குழு (SHG) உறுப்பினர்கள்.\n"
            "• **விண்ணப்பம்:** உங்கள் மாவட்டத்திலுள்ள மாநில ஊரக வாழ்வாதார இயக்க (SRLM) அலுவலகத்தை அணுகவும்.\n"
            "• **கூடுதல்:** இயந்திரங்கள் (SMAM) மற்றும் சூரிய சக்தி பம்புகள் (PM-KUSUM) வாங்குவதில் பெண்களுக்கு 10-20% கூடுதல் மானியம் கிடைக்கும்."
        ),
    },
    # --- weather & agriculture calendar ---
    'weather_sowing_harvesting': {
        'en': (
            "📅 **Seasonal Sowing & Harvesting Calendar:**\n"
            "• **Wheat (Rabi):** Sow in Nov-Dec, Harvest in April-May.\n"
            "• **Paddy (Kharif):** Sow in June-July, Harvest in Oct-Nov.\n"
            "• **Summer Crops (Zaid):** Plant in Jan-March, Harvest before rains.\n"
            "Use your local TNAU/KVK agro-advisories for optimal planting days depending on weather!"
        ),
        'ta': (
            "📅 **பருவகால விதைப்பு & அறுவடை காலண்டர்:**\n"
            "• **கோதுமை (ரபி):** நவ-டிச விதைப்பு, ஏப்-மே அறுவடை.\n"
            "• **நெல் (காரிப்):** ஜூன்-ஜூலை விதைப்பு, அக்-நவ அறுவடை.\n"
            "• **கோடைப் பயிர்கள் (சையத்):** ஜன-மார்ச் விதைப்பு, மழைக்கு முன் அறுவடை.\n"
            "சரியான விதைப்பு நாட்களுக்கு உள்ளூர் TNAU/KVK ஆலோசனைகளைப் பின்பற்றவும்!"
        ),
    },
    'extreme_weather_protection': {
        'en': (
            "🌪️ **Extreme Weather & Pre-Monsoon Protection:**\n"
            "• **Before Monsoon:** Clean drainage channels, arrange inputs early, repair bunds.\n"
            "• **Heavy Rain:** Ensure deep trenching to drain excess water, spray copper fungicides to prevent rot.\n"
            "• **Frost/Cold:** Light evening irrigation raises soil temp; use organic mulching.\n"
            "Always check IMD/Meghdoot app for accurate weekly rain forecasts."
        ),
        'ta': (
            "🌪️ **தீவிர வானிலை & பருவமழைக்கு முந்தைய பாதுகாப்பு:**\n"
            "• **பருவமழைக்கு முன்:** வடிகால் வாய்க்கால்களை சுத்தம் செய்யவும், கரைகளை பலப்படுத்தவும்.\n"
            "• **கனமழை:** உபரி நீரை வெளியேற்ற ஆழமான அகழிகள் அமைக்கவும், அழுகல் நோயை தடுக்க தாமிர பூஞ்சான்கொல்லிகளை தெளிக்கவும்.\n"
            "• **உறைபனி/குளிர்:** மாலையில் லேசான நீர்ப்பாசனம் மண்ணின் வெப்பத்தை அதிகரிக்கும்; மூடாக்கு பயன்படுத்தவும்."
        ),
    },
    'weather_temperature': {
        'en': (
            "🌡️ **Crop Temperature Sensitivities:**\n"
            "• **Tomatoes:** Ideal day temp 21-29°C. Flowers drop if it crosses 35°C.\n"
            "• **Wheat:** Needs cool climate (10-15°C) during vegetative growth.\n"
            "• **Paddy:** Likes warm & humid climate (20-35°C).\n"
            "Use shade nets or polyhouses for sensitive crops in harsh summers."
        ),
        'ta': (
            "🌡️ **பயிர் வெப்பநிலை உணர்திறன்:**\n"
            "• **தக்காளி:** சிறந்த பகல் வெப்பநிலை 21-29°C. 35°C ஐ தாண்டினால் பூக்கள் உதிரும்.\n"
            "• **கோதுமை:** வளரும் பருவத்தில் குளிர்ந்த காலநிலை (10-15°C) தேவை.\n"
            "• **நெல்:** வெப்பமான மற்றும் ஈரப்பதமான காலநிலை (20-35°C) பிடிக்கும்.\n"
            "கடுமையான கோடையில் நிழல் வலைகளைப் (Shade nets) பயன்படுத்தவும்."
        ),
    },
    # --- education & training ---
    'training_programs_kvk': {
        'en': (
            "🏫 **Govt Training & Krishi Vigyan Kendra (KVK):**\n"
            "• **Locations:** Every district has a KVK under ICAR/TNAU offering free training.\n"
            "• **Programs:** Modern farming, bee-keeping, mushroom cultivation, value addition.\n"
            "• **How to Attend:** Walk into your district KVK or register on their portal.\n"
            "• **Farmer Field Schools (FFS):** Hands-on seasonal training directly in villages (contact local Agri block officer)."
        ),
        'ta': (
            "🏫 **அரசு பயிற்சி & கிருஷி விஞ்ஞான் கேந்திரா (KVK):**\n"
            "• **இடங்கள்:** ஒவ்வொரு மாவட்டத்திலும் ICAR/TNAU கீழ் இலவச பயிற்சி வழங்கும் KVK உள்ளது.\n"
            "• **திட்டங்கள்:** நவீன விவசாயம், தேனீ வளர்ப்பு, காளான் வளர்ப்பு.\n"
            "• **எப்படி கலந்துகொள்வது:** உங்கள் மாவட்ட KVK அலுவலகத்தை நேரில் அணுகவும் அல்லது ஆன்லைனில் பதிவு செய்யவும்.\n"
            "• **விவசாயி வயல்வெளிப் பள்ளிகள் (FFS):** கிராமங்களிலேயே செயல்முறை பயிற்சி."
        ),
    },
    'online_courses_agri': {
        'en': (
            "💻 **Online Courses, Certifications & Organic Farming:**\n"
            "• **TNAU Agritech Portal:** Extensive free reading material and guidelines.\n"
            "• **SWAYAM / NPTEL:** Free government courses on organic farming, modern agronomy, and agri-business (with certificates).\n"
            "• **Skill India (ASCI):** Specific certifications like 'Organic Grower' or 'Greenhouse Operator'.\n"
            "• **MANAGE Hyderabad:** Offers paid/free e-courses on agricultural extension."
        ),
        'ta': (
            "💻 **ஆன்லைன் படிப்புகள், சான்றிதழ்கள் & இயற்கை விவசாயம்:**\n"
            "• **TNAU அக்ரிடெக் போர்டல்:** இலவச வழிகாட்டுதல்கள் மற்றும் தகவல்கள்.\n"
            "• **SWAYAM / NPTEL:** இயற்கை விவசாயம் மற்றும் நவீன வேளாண்மை குறித்த இலவச அரசு படிப்புகள் (சான்றிதழுடன்).\n"
            "• **ஸ்கில் இந்தியா (ASCI):** 'இயற்கை விவசாயி' போன்ற சிறப்பு சான்றிதழ்கள்.\n"
            "• **MANAGE:** வேளாண்மை விரிவாக்க படிப்புகள் இணையத்தில் கிடைக்கின்றன."
        ),
    },
    'fpo_cooperative': {
        'en': (
            "🤝 **Farmer Producer Organisations (FPO):**\n"
            "• **What is it?** A cooperative of farmers to collectively buy inputs at wholesale and sell produce at better margins.\n"
            "• **How to Join?** Ask your local Agri/Horti officer about existing FPOs in your block, or form a new one with 300+ farmers to get Nabard/SFAC funding.\n"
            "• **Benefits:** Avoid middlemen, get machinery on rent, and access bulk banking credit."
        ),
        'ta': (
            "🤝 **விவசாயி உற்பத்தி நிறுவனங்கள் (FPO):**\n"
            "• **இது என்ன?** மொத்த விலையில் விவசாய இடுபொருட்களை வாங்கவும், அதிக விலைக்கு பொருட்களை விற்கவும் விவசாயிகள் ஒன்று சேரும் அமைப்பு.\n"
            "• **எப்படி சேருவது?** உங்கள் பகுதியில் உள்ள FPO பற்றி உள்ளூர் வேளாண் அதிகாரியிடம் கேட்கவும்.\n"
            "• **நன்மைகள்:** இடைத்தரகர்களை தவிர்க்கலாம், இயந்திரங்களை வாடகைக்கு எடுக்கலாம், வங்கி கடன் பெறலாம்."
        ),
    },
    'tractor_training': {
        'en': (
            "🚜 **Tractor Driving & Machine Training:**\n"
            "• **Tractor Training Centres (FMTTI):** Government institutes (like in Anantapur for Southern Region) provide formal courses on tractor operation and repair.\n"
            "• **State Agri-Engineering Dept:** Offers localized workshops on handling transplanters, drones, and harvesters.\n"
            "• Some major brands (Mahindra, TAFE) run local skilling camps."
        ),
        'ta': (
            "🚜 **டிராக்டர் ஓட்டுநர் & இயந்திர பயிற்சி:**\n"
            "• **FMTTI பயிற்சி மையங்கள்:** அரசு மையங்களில் டிராக்டர் ஓட்டுதல் மற்றும் பழுதுபார்க்கும் முறை சார்ந்த பயிற்சி.\n"
            "• **மாநில வேளாண் பொறியியல் துறை:** ட்ரோன்கள், அறுவடை இயந்திரங்கள் இயக்குவதற்கான சிறப்பு முகாம்கள்.\n"
            "• சில முன்னணி நிறுவனங்கள் (Mahindra, TAFE) திறன் மேம்பாட்டு முகாம்களை நடத்துகின்றன."
        ),
    },
    # --- AgriNova & Simulation ---
    'agrinova_working': {
        'en': (
            "📱 **How AgriNova Works:**\n"
            "AgriNova is designed to support Tamil Nadu farmers. Here's what we do:\n"
            "• **Profile Simulation:** You enter your farm data (land, water, crops, tech attitude).\n"
            "• **Machine Learning Model:** Our system (using Random Forest & K-Means) analyzes this data to predict your *Technology Adoption Score*.\n"
            "• **Targeted Recommendations:** Based on your score and farm profile, we suggest the most profitable crops, relevant modern technologies, and specific Government Schemes you are eligible for.\n"
            "• **Bilingual Support:** Everything is tailored for Tamil & English."
        ),
        'ta': (
            "📱 **AgriNova எவ்வாறு இயங்குகிறது:**\n"
            "AgriNova தமிழ்நாடு விவசாயிகளை ஆதரிக்க வடிவமைக்கப்பட்டுள்ளது:\n"
            "• **சுயவிவர உருவகப்படுத்துதல் (Simulation):** உங்கள் பண்ணை தரவுகளை நீங்கள் பதிவு செய்கிறீர்கள் (நிலம், நீர், பயிர்கள், மனப்பான்மை).\n"
            "• **மெஷின் லேர்னிங் (ML):** இந்த தரவுகளை பகுப்பாய்வு செய்து, உங்கள் *தொழில்நுட்ப தத்தெடுப்பு மதிப்பெண்ணை* எங்கள் அமைப்பு கணிக்கிறது.\n"
            "• **பரிந்துரைகள்:** உங்கள் மதிப்பெண் மற்றும் நில அமைப்பின் அடிப்படையில், லாபகரமான பயிர்கள், நவீன தொழில்நுட்பங்கள் மற்றும் உங்களுக்கு தகுதியான அரசு திட்டங்களை நாங்கள் பரிந்துரைக்கிறோம்.\n"
            "• **தமிழ் & ஆங்கிலம்:** அனைத்தும் இரு மொழிகளிலும் கிடைக்கும்."
        ),
    },
    'simulation_prediction': {
        'en': (
            "🤖 **About Your Farm Simulation & Score:**\n"
            "Our simulation engine takes 19 features of your farming behavior (like age, land, water, openness to risk) to place you into a specific *Adoption Category* (High, Moderate, or Low).\n\n"
            "Based on this clustering:\n"
            "1. We map you to Government Schemes that fit your category.\n"
            "2. We suggest specific technologies (like Drip Irrigation or App Usage) that you are most likely to adopt successfully.\n"
            "The goal is to provide realistic, risk-managed advice tailored solely to you!"
        ),
        'ta': (
            "🤖 **உங்கள் பண்ணை உருவகப்படுத்துதல் & மதிப்பெண் பற்றி:**\n"
            "எங்கள் சிமுலேஷன் இயந்திரம் உங்கள் விவசாய நடத்தையின் 19 அம்சங்களை (வயது, நிலம், நீர், ஆபத்தை ஏற்கும் திறன் போன்றவை) எடுத்து உங்களை ஒரு குறிப்பிட்ட *தத்தெடுப்பு பிரிவில்* (உயர், நடுத்தர, குறைந்த) வைக்கிறது.\n\n"
            "இதன் அடிப்படையில்:\n"
            "1. உங்கள் பிரிவுக்கு ஏற்ற அரசு திட்டங்களை வரிசைப்படுத்துகிறோம்.\n"
            "2. நீங்கள் எளிதாக பயன்படுத்தக்கூடிய குறிப்பிட்ட தொழில்நுட்பங்களை (சொட்டு நீர்ப்பாசனம் போன்றவை) பரிந்துரைக்கிறோம்.\n"
            "உங்களுக்கு மட்டுமே ஏற்ற, நடைமுறைக்கு சாத்தியமான ஆலோசனைகளை வழங்குவதே இதன் நோக்கம்!"
        ),
    },
    # --- greet ---
    'hello': {
        'en': (
            "👋 Hello! I'm your AgriNova farming assistant.\n\n"
            "I can help you with:\n"
            "• 🌾 Crop recommendations\n"
            "• 💧 Irrigation & water management\n"
            "• 🌱 Fertilizer & soil tips\n"
            "• 🏛️ Government schemes & subsidies\n"
            "• 📱 Modern farming technologies\n"
            "• 📊 Market & pricing advice\n"
            "• 🏦 Loans & credit options\n\n"
            "What would you like to know? 😊"
        ),
        'ta': (
            "👋 வணக்கம்! நான் உங்கள் AgriNova விவசாய உதவியாளர்.\n\n"
            "நான் உதவ முடியும்:\n"
            "• 🌾 பயிர் பரிந்துரைகள்\n"
            "• 💧 நீர்ப்பாசனம் மற்றும் நீர் மேலாண்மை\n"
            "• 🌱 உரம் மற்றும் மண் குறிப்புகள்\n"
            "• 🏛️ அரசு திட்டங்கள் மற்றும் மானியங்கள்\n"
            "• 📱 நவீன விவசாய தொழில்நுட்பங்கள்\n"
            "• 📊 சந்தை மற்றும் விலை ஆலோசனை\n"
            "• 🏦 கடன்கள் மற்றும் கடன் விருப்பங்கள்\n\n"
            "நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்? 😊"
        ),
    },
    # --- thanks ---
    'thank': {
        'en': "😊 You're welcome! Feel free to ask any other farming questions.",
        'ta': "😊 உங்களுக்கு வரவேற்கிறோம்! மற்ற விவசாய கேள்விகளை கேட்க தயங்காதீர்கள்.",
    },
    # --- default ---
    'default': {
        'en': (
            "🤔 I'm not sure about that, but I can help you with:\n"
            "• Crops, irrigation, fertilizers, soil\n"
            "• Government schemes & subsidies\n"
            "• Modern technologies\n"
            "• Market prices & loans\n\n"
            "Try asking something like: *\"What crops should I grow?\"* or *\"Tell me about drip irrigation\"*"
        ),
        'ta': (
            "🤔 அது எனக்கு தெரியவில்லை, ஆனால் நான் இதில் உதவ முடியும்:\n"
            "• பயிர்கள், நீர்ப்பாசனம், உரங்கள், மண்\n"
            "• அரசு திட்டங்கள் மற்றும் மானியங்கள்\n"
            "• நவீன தொழில்நுட்பங்கள்\n"
            "• சந்தை விலைகள் மற்றும் கடன்கள்\n\n"
            "கேட்டுப் பாருங்கள்: *\"என்ன பயிர் வளர்க்கலாம்?\"* அல்லது *\"சொட்டு நீர்ப்பாசனம் பற்றி சொல்லுங்கள்\"*"
        ),
    },
}

# Keywords mapped to response keys
# NOTE: More specific phrases (like "black soil") MUST come before generic words (like "crop" or "soil")
KEYWORD_MAP = [
    (['black soil', 'கரிசல் மண்', 'karisal'], 'black_soil'),
    (['red soil', 'செம்மண்', 'semman'], 'red_soil'),
    (['alluvial soil', 'வண்டல் மண்', 'vandal'], 'alluvial_soil'),
    (['loamy soil', 'loam', 'களிமண் கலந்த'], 'loamy_soil'),
    (['clay soil', 'clay', 'களிமண்'], 'clay_soil'),
    (['sandy soil', 'sand', 'மணல் மண்', 'மணல்'], 'sandy_soil'),
    (['silt soil', 'silt'], 'silt_soil'),
    (['peaty soil', 'peat'], 'peaty_soil'),

    (['monsoon', 'summer', 'winter', 'season', 'kharif', 'rabi', 'zaid', 'பருவ', 'மழைக்காலம்', 'கோடை', 'குளிர்காலம்'], 'crop_season'),
    (['quick', 'fast', '60 days', 'duration', 'short term', 'விரைவான', '60 நாட்கள்', 'குறுகிய கால'], 'crop_duration'),
    (['profit', 'high return', 'cash crop', 'small farmer', 'லாபம்', 'அதிக வருமானம்', 'சிறு விவசாயி'], 'crop_profit'),
    (['budget', '50000', '50,000', 'investment', 'cost', 'பட்ஜெட்', 'முதலீடு', 'செலவு'], 'crop_budget'),
    (['less water', 'low water', 'drought', 'dry', 'குறைந்த நீர்', 'வறட்சி'], 'crop_water_low'),
    (['rotation', 'rotate', 'sequential', 'சுழற்சி'], 'crop_rotation'),
    (['acre', 'hectare', 'land size', '5 acre', 'ஏக்கர்', 'ஹெக்டேர்', 'நில அளவு'], 'crop_land'),

    (['pm kisan', 'pm-kisan', 'kisan samman nidhi', '6000', 'apply for pm'], 'pm_kisan'),
    (['pmfby', 'insurance', 'fasal bima', 'crop insurance', 'காப்பீடு'], 'crop_insurance'),
    (['kcc', 'kisan credit card', 'credit card'], 'kisan_credit_card'),
    (['shc', 'soil health card scheme', 'soil health card', 'மண் வளம் அட்டை'], 'soil_health_card_scheme'),
    (['enam', 'e-nam', 'national agriculture market', 'e nam'], 'e_nam'),
    (['organic', 'pkvy', 'paramparagat', 'இயற்கை விவசாயம்', 'இயற்கை'], 'organic_farming'),
    (['woman', 'women', 'mahila', 'பெண்', 'பெண்கள்'], 'women_farmers'),

    (['sow wheat', 'harvest paddy', 'best time to sow', 'when to harvest', 'sow', 'sowing', 'harvesting', 'harvest', 'விதைக்க', 'அறுவடை'], 'weather_sowing_harvesting'),
    (['before monsoon', 'heavy rain', 'frost', 'extreme weather', 'protect', 'பாதுகாக்க', 'கனமழை', 'உறைபனி'], 'extreme_weather_protection'),
    (['temperature', 'hot climate', 'cold climate', 'வெப்பநிலை'], 'weather_temperature'),
    (['learn farming', 'training', 'learn', 'kvk', 'krishi vigyan kendra', 'field school', 'ffs', 'பயிற்சி', 'கற்க', 'விஞ்ஞான் கேந்திரா'], 'training_programs_kvk'),
    (['online course', 'certification', 'course', 'courses', 'SWAYAM', 'ஆன்லைன் படிப்பு', 'சான்றிதழ்', 'certificate'], 'online_courses_agri'),
    (['fpo', 'producer organization', 'cooperative', 'உற்பத்தி நிறுவனம்', 'கூட்டுறவு'], 'fpo_cooperative'),
    (['tractor', 'driving', 'machinery training', 'டிராக்டர்', 'ஓட்டுநர்'], 'tractor_training'),

    (['agrinova', 'how it works', 'app', 'application', 'features', 'எப்படி இயங்குகிறது', 'செயலி'], 'agrinova_working'),
    (['simulation', 'predict', 'score', 'model', 'ml', 'machine learning', 'உருவகப்படுத்துதல்', 'கணிப்பு', 'மதிப்பெண்'], 'simulation_prediction'),

    (['crop', 'crops', 'grow', 'plant', 'paddy', 'rice', 'millet', 'vegetable', 'pulse',
      'பயிர்', 'நெல்', 'தினை', 'காய்கறி'], 'crop'),
    (['water', 'rain', 'rainfall', 'moisture', 'நீர்', 'மழை'], 'water'),
    (['irrigation', 'drip', 'sprinkler', 'flood', 'நீர்ப்பாசனம்', 'சொட்டு'], 'irrigation'),
    (['fertilizer', 'fertiliser', 'npk', 'compost', 'organic', 'urea',
      'உரம்', 'கம்போஸ்ட்', 'NPK'], 'fertilizer'),
    (['soil', 'land', 'health card', 'மண்', 'நிலம்'], 'soil'),
    (['scheme', 'kisan', 'pmfby', 'pm-kisan', 'government', 'govt', 'yojana',
      'திட்டம்', 'அரசு'], 'scheme'),
    (['subsidy', 'subsidi', 'மானியம்'], 'subsidy'),
    (['technology', 'tech', 'drone', 'iot', 'digital', 'smart', 'mobile', 'app',
      'தொழில்நுட்பம்', 'ட்ரோன்'], 'technology'),
    (['weather', 'climate', 'forecast', 'season', 'வானிலை', 'பருவம்'], 'weather'),
    (['pest', 'insect', 'bug', 'பூச்சி', 'கட்டுப்பாடு'], 'pest'),
    (['disease', 'fungal', 'blight', 'wilt', 'நோய்', 'பூஞ்சை'], 'disease'),
    (['market', 'price', 'sell', 'selling', 'mandi', 'சந்தை', 'விலை', 'விற்பனை'], 'market'),
    (['loan', 'credit', 'finance', 'bank', 'kcc', 'nabard', 'கடன்', 'வங்கி'], 'loan'),
    (['score', 'adoption', 'improve', 'increase', 'மதிப்பெண்', 'தத்தெடுப்பு'], 'score'),
    (['hello', 'hi', 'hey', 'help', 'வணக்கம்', 'ஹலோ', 'நன்றி'], 'hello'),
    (['thank', 'thanks', 'நன்றி', 'வணக்கம்'], 'thank'),
]


def match_intent(message: str) -> str:
    """Return the response key that best matches the user message."""
    msg_lower = message.lower()
    for keywords, key in KEYWORD_MAP:
        for kw in keywords:
            if kw.lower() in msg_lower:
                return key
    return 'default'


# ── Routes ──────────────────────────────────────────────────────────────────
@chatbot_bp.route('/chat', methods=['POST'])
@require_login
def chat():
    """Handle chatbot message and return bot response."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        user_message = data.get('message', '').strip()
        language = data.get('language', 'en')

        if language not in ('en', 'ta'):
            language = 'en'

        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400

        intent = match_intent(user_message)
        response_obj = RESPONSES.get(intent, RESPONSES['default'])

        # Attempt to use Groq LLM explicitly if we have the key
        if groq_client:
            farmer_data = FarmerData.get_by_user_id(session['user_id']) if 'user_id' in session else None
            
            context = "You are an AI assistant for Tamil Nadu farmers called 'AgriNova Chatbot'. "
            if farmer_data:
                context += (
                    f"Here is the farmer's specific profile data:\n"
                    f"- District: {farmer_data.get('Location_District')}\n"
                    f"- Crop: {farmer_data.get('Crop_Type')}\n"
                    f"- Land Size: {farmer_data.get('Land_Size_acres')} acres\n"
                    f"- Irrigation: {farmer_data.get('Irrigation_Method')}\n"
                    f"- Tech Adoption Score (ML Prediction): {farmer_data.get('adoption_score'):.1f}%\n"
                    f"- Adoption Category: {farmer_data.get('adoption_category')}\n\n"
                    f"Use this profile data to personalize your answers if relevant. "
                )

            prompt_text = (
                context
                + f"\nThe user is asking: \"{user_message}\""
                + "\nRespond concisely (under 100 words) and directly address the question."
            )

            try:
                # English response
                chat_en = groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": prompt_text},
                        {"role": "user", "content": user_message + " (answer in English)"},
                    ],
                    model="llama-3.1-8b-instant",
                    max_tokens=200,
                )
                reply_en = chat_en.choices[0].message.content.strip()

                # Tamil response
                chat_ta = groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": prompt_text},
                        {"role": "user", "content": user_message + " (answer strictly in Tamil language)"},
                    ],
                    model="llama-3.1-8b-instant",
                    max_tokens=200,
                )
                reply_ta = chat_ta.choices[0].message.content.strip()

                return jsonify({
                    'reply_en': reply_en,
                    'reply_ta': reply_ta,
                    'intent': intent or 'llm_generated',
                }), 200

            except Exception as e:
                print(f"Groq API Error: {e}")
                # Fallthrough to static responses if API fails

        # Standard static logic fallback
        if isinstance(response_obj, dict):
            reply_en = response_obj.get('en', '')
            reply_ta = response_obj.get('ta', '')
        else:
            reply_en = response_obj
            reply_ta = response_obj
            
        if intent == 'simulation_prediction' and 'user_id' in session:
            farmer_data = FarmerData.get_by_user_id(session['user_id'])
            if farmer_data:
                score = farmer_data.get('adoption_score')
                category = farmer_data.get('adoption_category')
                
                if score is not None and category:
                    en_addon = (
                        f"\n\n📊 **Your Personalized Result:**\n"
                        f"Based on the data you entered in the form, our ML model scored your technology adoption at **{score:.1f}%**. "
                        f"This places you in the **{category} Adoption Category**."
                    )
                    
                    category_ta_map = {'High': 'உயர்', 'Moderate': 'நடுத்தர', 'Low': 'குறைந்த'}
                    cat_ta = category_ta_map.get(category, category)
                    ta_addon = (
                        f"\n\n📊 **உங்கள் தனிப்பட்ட முடிவு:**\n"
                        f"நீங்கள் படிவத்தில் உள்ளிட்ட தரவுகளின் அடிப்படையில், மிஷின் லேர்னிங் மாடல் உங்கள் தொழில்நுட்ப தத்தெடுப்பை **{score:.1f}%** என மதிப்பிட்டுள்ளது. "
                        f"இது உங்களை **{cat_ta} தத்தெடுப்பு பிரிவில்** வைக்கிறது."
                    )
                    
                    reply_en += en_addon
                    reply_ta += ta_addon

        return jsonify({
            'reply_en': reply_en,
            'reply_ta': reply_ta,
            'intent': intent,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
