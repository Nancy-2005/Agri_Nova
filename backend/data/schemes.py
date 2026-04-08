# Government Schemes Database for Tamil Nadu Farmers

# Central Government Schemes
CENTRAL_SCHEMES = [
    {
        "id": "pm_kisan",
        "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "name_ta": "பிரதமர் கிசான் சம்மன் நிதி (PM-KISAN)",
        "description": "Income support to farmers",
        "description_ta": "விவசாயிகளுக்கு வருமான ஆதரவு",
        "benefits": "₹6000/year in 3 installments",
        "benefits_ta": "ஆண்டுக்கு ₹6000 (3 தவணைகளில்)",
        "eligibility": ["All landholding farmers"],
        "type": "Income Support",
        "type_ta": "வருமான ஆதரவு",
        "link": "https://pmkisan.gov.in/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "soil_health",
        "name": "Soil Health Card Scheme",
        "name_ta": "மண் ஆரோக்கிய அட்டை திட்டம்",
        "description": "Free soil health cards for fertiliser recommendations",
        "description_ta": "உரப் பரிந்துரைகளுக்கான இலவச மண் ஆரோக்கிய அட்டைகள்",
        "benefits": "Soil health status and nutrient recommendations",
        "benefits_ta": "மண் வள நிலை மற்றும் ஊட்டச்சத்து பரிந்துரைகள்",
        "eligibility": ["All farmers"],
        "type": "Advisory",
        "type_ta": "ஆலோசனை",
        "link": "https://soilhealth.dac.gov.in/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "pmfby",
        "name": "PM Fasal Bima Yojana (Crop Insurance)",
        "name_ta": "பிரதமர் பயிர் காப்பீட்டு திட்டம் (PMFBY)",
        "description": "Insurance against crop loss",
        "description_ta": "பயிர் இழப்பிற்கு எதிரான காப்பீடு",
        "benefits": "Financial support in case of crop failure",
        "benefits_ta": "பயிர் பாதிப்பு ஏற்படும் போது நிதி உதவி",
        "eligibility": ["Farmers with insurable crops"],
        "type": "Insurance",
        "type_ta": "காப்பீடு",
        "link": "https://pmfby.gov.in/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "kcc",
        "name": "Kisan Credit Card (KCC)",
        "name_ta": "கிசான் கடன் அட்டை (KCC)",
        "description": "Low-interest credit for cultivation & allied activities",
        "description_ta": "விவசாயம் மற்றும் அதனைச் சார்ந்த தொழில்களுக்கு குறைந்த வட்டி கடன்",
        "benefits": "Credit at 4% interest rate (with prompt repayment)",
        "benefits_ta": "4% வட்டியில் கடன் (சரியான நேரத்தில் திரும்ப செலுத்தினால்)",
        "eligibility": ["All farmers-individuals/joint borrowers"],
        "type": "Credit",
        "type_ta": "கடன்",
        "link": "https://www.myscheme.gov.in/schemes/kcc",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "enam",
        "name": "National Agriculture Market (e-NAM)",
        "name_ta": "தேசிய வேளான் சந்தை (e-NAM)",
        "description": "Online mandi market for better pricing",
        "description_ta": "சிறந்த விலைக்கு ஆன்லைன் மண்டி சந்தை",
        "benefits": "Transparent auction process, better price realization",
        "benefits_ta": "வெளிப்படையான ஏலம், அதிக லாபம்",
        "eligibility": ["Farmers registered with APMC"],
        "type": "Market Linkage",
        "type_ta": "சந்தை இணைப்பு",
        "link": "https://enam.gov.in/web/",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "pmksy",
        "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
        "name_ta": "பிரதமர் கிரிஷி சின்சாயி யோஜனா (PMKSY)",
        "description": "Micro-irrigation and watershed development",
        "description_ta": "நுண்ணீர் பாசனம் மற்றும் நீர்முனை மேம்பாடு",
        "benefits": "Subsidy for drip and sprinkler irrigation systems",
        "benefits_ta": "சொட்டு மற்றும் தெளிப்பு நீர் பாசனத்திற்கு மானியம்",
        "eligibility": ["Farmers with land and water source"],
        "type": "Irrigation Subsidy",
        "type_ta": "பாசன மானியம்",
        "link": "https://pmksy.gov.in/",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "pm_kusum",
        "name": "PM-KUSUM (Solar Pumps)",
        "name_ta": "பிஎம்-குசும் (சூரிய சக்தி பம்புகள்)",
        "description": "Subsidy for solar pumps and renewable energy",
        "description_ta": "சூரிய சக்தி பம்புகளுக்கான மானியம்",
        "benefits": "Subsidy up to 60% for standalone solar pumps",
        "benefits_ta": "சூரிய சக்தி பம்புகளுக்கு 60% வரை மானியம்",
        "eligibility": ["Farmers, Panchayats, Cooperatives"],
        "type": "Energy",
        "type_ta": "ஆற்றல்",
        "link": "https://pmkusum.mnre.gov.in/",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "aif",
        "name": "Agriculture Infrastructure Fund (AIF)",
        "name_ta": "வேளாண் உள்கட்டமைப்பு நிதி (AIF)",
        "description": "Loans for post-harvest and value chain infrastructure",
        "description_ta": "அறுவடைக்குப் பின் கட்டமைப்பு உருவாக்க கடன்கள்",
        "benefits": "Interest subvention of 3% per annum up to ₹2 crore",
        "benefits_ta": "₹2 கோடி வரை ஆண்டுக்கு 3% வட்டி மானியம்",
        "eligibility": ["Farmers, FPOs, PACS, Startups"],
        "type": "Infrastructure",
        "type_ta": "உள்கட்டமைப்பு",
        "link": "https://agriinfra.dac.gov.in/",
        "adoption_level": ["High"]
    },
    {
        "id": "pm_kmy",
        "name": "PM Kisan Maan-Dhan Yojana (Pension)",
        "name_ta": "பிரதமர் கிசான் மான்-தன் யோஜனா (ஓய்வூதியம்)",
        "description": "Pension scheme for small and marginal farmers",
        "description_ta": "சிறு மற்றும் குறு விவசாயிகளுக்கான ஓய்வூதியத் திட்டம்",
        "benefits": "Monthly pension of ₹3,000 after age 60",
        "benefits_ta": "60 வயதிற்கு பிறகு மாதம் ₹3,000 ஓய்வூதியம்",
        "eligibility": ["Farmers between 18-40 years", "Land <= 2 hectares"],
        "type": "Pension",
        "type_ta": "ஓய்வூதியம்",
        "link": "https://pmkmy.gov.in/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "svamitva",
        "name": "SVAMITVA Scheme",
        "name_ta": "ஸ்வாமித்வா திட்டம்",
        "description": "Property cards for rural households",
        "description_ta": "கிராமப்புற வீடுகளுக்கான சொத்து அட்டைகள்",
        "benefits": "Record of Rights to village household owners",
        "benefits_ta": "கிராம வீட்டு உரிமையாளர்களுக்கு சொத்து உரிமை ஆவணம்",
        "eligibility": ["Rural homeowners"],
        "type": "Governance",
        "type_ta": "ஆளுமை",
        "link": "https://svamitva.nic.in/",
        "adoption_level": ["Low", "Medium"]
    },
    {
        "id": "pkvy",
        "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
        "name_ta": "பரம்பராகத் கிரிஷி விகாஸ் யோஜனா",
        "description": "Promotion of organic farming through clusters",
        "description_ta": "குழுக்கள் மூலம் இயற்கை விவசாயத்தை மேம்படுத்துதல்",
        "benefits": "Financial assistance for organic inputs and certification",
        "benefits_ta": "இயற்கை உரங்கள் மற்றும் சான்றிதழ் பெற நிதி உதவி",
        "eligibility": ["Groups of farmers / Clusters"],
        "type": "Organic Farming",
        "type_ta": "இயற்கை விவசாயம்",
        "link": "https://pgsindia-ncof.dac.net.in/pkvy/index.aspx",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "pm_pranam",
        "name": "PM-PRANAM",
        "name_ta": "பிஎம்-பிரணம் திட்டம்",
        "description": "Reduction of chemical fertilizer usage",
        "description_ta": "ரசாயன உரங்களின் பயன்பாட்டைக் குறைத்தல்",
        "benefits": "State incentives for adopting alternative fertilizers",
        "benefits_ta": "மாற்று உரங்களை ஏற்றுக்கொள்வதற்கான மாநில ஊக்கத்தொகை",
        "eligibility": ["All farmers"],
        "type": "Sustainable Agri",
        "type_ta": "நிலையான வேளாண்மை",
        "link": "https://fert.nic.in/pm-pranam",
        "adoption_level": ["Low", "Medium", "High"]
    }
]

# Tamil Nadu Government Schemes
TAMIL_NADU_SCHEMES = [
    {
        "id": "tn_micro_irrigation",
        "name": "TN Micro Irrigation Subsidy",
        "name_ta": "நுண்ணீர் பாசன மானியத் திட்டம்",
        "description": "Micro Irrigation scheme for state farmers",
        "description_ta": "மாநில விவசாயிகளுக்கான நுண்ணீர் பாசன திட்டம்",
        "benefits": "100% subsidy for small/marginal farmers, 75% for others",
        "benefits_ta": "சிறு/குறு விவசாயிகளுக்கு 100% மானியம், மற்றவர்களுக்கு 75%",
        "eligibility": ["Small/Marginal Farmers: 100%", "Other Farmers: 75%"],
        "type": "Irrigation Subsidy",
        "type_ta": "பாசன மானியம்",
        "link": "https://tnhorticulture.tn.gov.in/horti/pminfo",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "tn_farmers_security",
        "name": "Uzhavar Pathukappu Thittam (Farmers Security)",
        "name_ta": "உழவர் பாதுகாப்புத் திட்டம்",
        "description": "Social security and insurance for TN farmers",
        "description_ta": "தமிழக விவசாயிகளுக்கான சமூக பாதுகாப்பு மற்றும் காப்பீடு",
        "benefits": "Educational assistance, marriage support, and accident insurance",
        "benefits_ta": "கல்வி உதவி, திருமண உதவி மற்றும் விபத்து காப்பீடு",
        "eligibility": ["Registered farmers/agricultural labourers"],
        "type": "Social Security",
        "type_ta": "சமூக பாதுகாப்பு",
        "link": "https://tnagriculture.in",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "tn_cm_health",
        "name": "TN CM Comprehensive Health Insurance (CMCHIS)",
        "name_ta": "தமிழக முதல்வர் விரிவான மருத்துவ காப்பீடு (CMCHIS)",
        "description": "Critical health cover for farm families",
        "description_ta": "விவசாய குடும்பங்களுக்கான மருத்துவ காப்பீடு",
        "benefits": "Coverage up to ₹5 lakh for advanced treatments",
        "benefits_ta": "மேம்பட்ட சிகிச்சைகளுக்கு ₹5 லட்சம் வரை காப்பீடு",
        "eligibility": ["Families with annual income < ₹1.2 lakh"],
        "type": "Health Insurance",
        "type_ta": "மருத்துவ காப்பீடு",
        "link": "https://www.cmchistn.com/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "tn_farm_mechanization",
        "name": "Agricultural Mechanization Programme",
        "name_ta": "வேளாண் இயந்திரமயமாக்கல் திட்டம்",
        "description": "Subsidy for purchasing farm machinery",
        "description_ta": "வேளாண் இயந்திரங்கள் வாங்க மானியம்",
        "benefits": "Subsidy for tractors, tillers, harvesters",
        "benefits_ta": "டிராக்டர், உழவு இயந்திரம் வாங்க மானியம்",
        "eligibility": ["All Farmers"],
        "type": "Machinery",
        "type_ta": "இயந்திரங்கள்",
        "link": "https://aed.tn.gov.in/en/agricultural-mechanisation/",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "kalaignar_scheme",
        "name": "Kalaignar Integrated Agriculture Dev. Prog.",
        "name_ta": "கலைஞரின் ஒருங்கிணைந்த வேளாண் வளர்ச்சித் திட்டம்",
        "description": "Integrated development of villages",
        "description_ta": "கிராமங்களின் ஒருங்கிணைந்த வளர்ச்சி",
        "benefits": "Coconut saplings, horticultural plants, farm kits",
        "benefits_ta": "தென்னங்கன்று, தோட்டக்கலை செடிகள் விநியோகம்",
        "eligibility": ["Village residents"],
        "type": "Integrated Dev",
        "type_ta": "ஒருங்கிணைந்த வளம்",
        "link": "https://www.tnagrisnet.tn.gov.in/",
        "adoption_level": ["Low", "Medium"]
    },
    {
        "id": "tn_free_electricity",
        "name": "Free Electricity for Farmers",
        "name_ta": "விவசாயிகளுக்கு இலவச மின்சாரம்",
        "description": "Free power supply for irrigation pumps",
        "description_ta": "நீர்ப்பாசன பம்புகளுக்கு இலவச மின்சாரம்",
        "benefits": "100% free electricity",
        "benefits_ta": "100% இலவச மின்சாரம்",
        "eligibility": ["Farmers with motor pumpsets"],
        "type": "Energy",
        "type_ta": "ஆற்றல்",
        "link": "https://www.tangedco.gov.in/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "tn_kudimaramathu",
        "name": "Kudimaramathu (Water Conservation)",
        "name_ta": "குடிமராமத்து (நீர் பாதுகாப்பு)",
        "description": "Tank/irrigation infrastructure restoration",
        "description_ta": "குளம்/நீர்ப்பாசன மறுசீரமைப்பு",
        "benefits": "Improved water storage and availability",
        "benefits_ta": "மேம்படுத்தப்பட்ட நீர் சேமிப்பு மற்றும் கிடைக்கும் தன்மை",
        "eligibility": ["Community participation"],
        "type": "Water Conservation",
        "type_ta": "நீர் பாதுகாப்பு",
        "link": "https://www.tndipr.gov.in/DIPR/en/kudimaramathu/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "tn_collective_farming",
        "name": "Collective Farming Scheme",
        "name_ta": "கூட்டுப் பண்ணையத் திட்டம்",
        "description": "Formation of Farmer Producer Organizations (FPOs)",
        "description_ta": "விவசாய உற்பத்தியாளர் அமைப்புகளை உருவாக்குதல்",
        "benefits": "Corpus fund for farm machinery and inputs",
        "benefits_ta": "இயந்திரங்கள் வாங்க ₹5 லட்சம் தொகுப்பு நிதி",
        "eligibility": ["Small and Marginal Farmers in groups"],
        "type": "FPO Support",
        "type_ta": "FPO ஆதரவு",
        "link": "https://tnagrisnet.tn.gov.in/",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "tn_crop_diversification",
        "name": "Crop Diversification Programme",
        "name_ta": "பயிர் வகைப்படுத்தல் திட்டம்",
        "description": "Shift from paddy to pulses and oilseeds",
        "description_ta": "நெல் சாகுபடியிலிருந்து பருப்பு மற்றும் எண்ணெய் வித்துக்களுக்கு மாறுதல்",
        "benefits": "Incentives for high-value alternative crops",
        "benefits_ta": "மாற்றுப் பயிர்களுக்கு ஊக்கத்தொகை",
        "eligibility": ["Paddy growing farmers"],
        "type": "Diversification",
        "type_ta": "பயிர் மாற்றம்",
        "link": "https://tnagrisnet.tn.gov.in/",
        "adoption_level": ["Low", "Medium", "High"]
    }
]

# Women & Gender-Inclusive Support
WOMEN_SCHEMES = [
    {
        "id": "women_shg",
        "name": "DAY-NRLM (Support via SHGs)",
        "name_ta": "DAY-NRLM (சுயஉதவி குழுக்கள் ஆதரவு)",
        "description": "Loans, training, and enterprise support for women",
        "description_ta": "பெண்களுக்கான கடன்கள் மற்றும் நிறுவன ஆதரவு",
        "benefits": "Collateral-free loans to SHGs",
        "benefits_ta": "சுயஉதவி குழுக்களுக்கு பிணையம் இல்லாத கடன்கள்",
        "eligibility": ["Women in SHGs"],
        "type": "Women Empowerment",
        "type_ta": "பெண்கள் அதிகாரமளித்தல்",
        "link": "https://aajeevika.gov.in/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "nabard_women",
        "name": "NABARD Women Farmer Support",
        "name_ta": "நபார்டு பெண் விவசாயி ஆதரவு",
        "description": "Subsidies and loans for women SHGs and agri businesses",
        "description_ta": "பெண் குழுக்களுக்கான மானியங்கள் மற்றும் கடன்கள்",
        "benefits": "Grant assistance for skill development",
        "benefits_ta": "திறன் மேம்பாட்டிற்கு மானிய உதவி",
        "eligibility": ["Women farmers/entrepreneurs"],
        "type": "Women Empowerment",
        "type_ta": "பெண்கள் அதிகாரமளித்தல்",
        "link": "https://www.nabard.org/content1.aspx?cid=506&id=23",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "namo_drone_didi",
        "name": "Namo Drone Didi Scheme",
        "name_ta": "நமோ ட்ரோன் திதி திட்டம்",
        "description": "Drones to women SHGs with heavy subsidy (80% cost assistance)",
        "description_ta": "பெண் குழுக்களுக்கு 80% மானியத்துடன் ட்ரோன்கள்",
        "benefits": "New livelihood opportunities using drones",
        "benefits_ta": "ட்ரோன்கள் மூலம் புதிய வாழ்வாதார வாய்ப்புகள்",
        "eligibility": ["Women SHGs"],
        "type": "Technology",
        "type_ta": "தொழில்நுட்பம்",
        "link": "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1980689",
        "adoption_level": ["High"]
    },
    {
        "id": "women_subsidy",
        "name": "Gender Priority (Women Farmer Incentives)",
        "name_ta": "பெண் விவசாயிகளுக்கான முன்னுரிமை மற்றும் சலுகைகள்",
        "description": "Higher subsidies or priority in many TN and central schemes",
        "description_ta": "பல திட்டங்களில் அதிக மானியங்கள் அல்லது முன்னுரிமை",
        "benefits": "Additional 10-20% subsidy in some schemes",
        "benefits_ta": "சில திட்டங்களில் கூடுதல் 10-20% மானியம்",
        "eligibility": ["Women farmers"],
        "type": "Subsidy",
        "type_ta": "மானியம்",
        "link": "https://tnagriculture.in",
        "adoption_level": ["Low", "Medium", "High"]
    }
]

# Digital Platforms / Apps for Farmers
DIGITAL_PLATFORMS = [
    {
        "id": "uzhavar_santhai",
        "name": "Uzhavar Santhai (Direct Market)",
        "name_ta": "உழவர் சந்தை",
        "description": "Direct farmer-to-consumer market",
        "description_ta": "நேரடி விவசாயி-நுகர்வோர் சந்தை",
        "benefits": "Eliminates middlemen, better returns",
        "benefits_ta": "இடைத்தரகர்கள் இல்லை, சிறந்த லாபம்",
        "eligibility": ["TN Farmers"],
        "type": "Market",
        "type_ta": "சந்தை",
        "link": "https://www.tnmsc.com/uzhavar-santhai.php",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "grains_portal",
        "name": "GRAINS Portal (Grower Registration System)",
        "name_ta": "கிரைன்ஸ் போர்டல்",
        "description": "Single digital platform for TN farmers",
        "description_ta": "தமிழ்நாடு விவசாயிகளுக்கான ஒற்றை டிஜிட்டல் தளம்",
        "benefits": "Easy access to multiple schemes",
        "benefits_ta": "பல திட்டங்களுக்கு எளிதான அணுகல்",
        "eligibility": ["All TN Farmers"],
        "type": "Digital Service",
        "type_ta": "டிஜிட்டல் சேவை",
        "link": "https://grains.tn.gov.in/",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "namma_arasu",
        "name": "Namma Arasu Chatbot",
        "name_ta": "நம்ம அரசு சாட்போட்",
        "description": "WhatsApp/chatbot access to many schemes",
        "description_ta": "பல திட்டங்களுக்கு வாட்ஸ்அப் வழியாக அணுகல்",
        "benefits": "Information at fingertips",
        "benefits_ta": "விரல் நுனியில் தகவல்",
        "eligibility": ["Anyone"],
        "type": "Information",
        "type_ta": "தகவல்",
        "link": "https://www.tn.gov.in/tnchatbot/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "uzhavan_app",
        "name": "Uzhavan App",
        "name_ta": "உழவன் செயலி",
        "description": "One-stop mobile app for all TN agri services",
        "description_ta": "அனைத்து தமிழக வேளாண் சேவைகளுக்கும் ஒரே செயலி",
        "benefits": "Access to 9+ departments services",
        "benefits_ta": "9க்கும் மேற்பட்ட துறை சேவைகளுக்கான அணுகல்",
        "eligibility": ["All Farmers"],
        "type": "Digital Service",
        "type_ta": "டிஜிட்டல் சேவை",
        "link": "https://tnagrisnet.tn.gov.in/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "enam_app",
        "name": "e-NAM Mobile App",
        "name_ta": "e-NAM மொபைல் செயலி",
        "description": "Mobile access to national commodity prices",
        "description_ta": "தேசிய சந்தை விலைகளை மொபைலில் காண",
        "benefits": "Online trading and price information",
        "benefits_ta": "ஆன்லைன் வர்த்தகம் மற்றும் விலை தகவல்",
        "eligibility": ["Registered farmers"],
        "type": "Market App",
        "type_ta": "சந்தை செயலி",
        "link": "https://enam.gov.in/web/",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "tnau_portal",
        "name": "TNAU Agritech Portal",
        "name_ta": "TNAU அக்ரிடெக் போர்டல்",
        "description": "Comprehensive digital guide for crop management",
        "description_ta": "பயிர் மேலாண்மைக்கான விரிவான டிஜிட்டல் வழிகாட்டி",
        "benefits": "Scientific farming advice and insurance guides",
        "benefits_ta": "அறிவியல் ரீதியான விவசாய ஆலோசனைகள்",
        "eligibility": ["All farmers"],
        "type": "Information Portal",
        "type_ta": "தகவல் தளம்",
        "link": "https://agritech.tnau.ac.in/",
        "adoption_level": ["Low", "Medium", "High"]
    },
    {
        "id": "agristack",
        "name": "Agristack Tamil Nadu",
        "name_ta": "அக்ரிஸ்டாக் தமிழ்நாடு",
        "description": "Digital database for scheme access and forecasts",
        "description_ta": "திட்ட அணுகல் மற்றும் கணிப்புகளுக்கான டிஜிட்டல் தரவுத்தளம்",
        "benefits": "Speedy scheme approval and proactive alerts",
        "benefits_ta": "விரைவான திட்ட அனுமதி மற்றும் முன்னெச்சரிக்கை",
        "eligibility": ["All TN Farmers"],
        "type": "Digital Service",
        "type_ta": "டிஜிட்டல் சேவை",
        "link": "https://agristack.gov.in/",
        "adoption_level": ["Medium", "High"]
    },
    {
        "id": "enam",
        "name": "e-NAM (National Agriculture Market)",
        "name_ta": "தேசிய வேளாண் சந்தை (e-NAM)",
        "description": "Online trading platform for agricultural commodities",
        "description_ta": "வேளாண் விளைபொருட்களுக்கான ஆன்லைன் வர்த்தக தளம்",
        "benefits": "Transparent pricing and direct sale to buyers",
        "benefits_ta": "வெளிப்படையான விலை மற்றும் நேரடி விற்பனை",
        "eligibility": ["Registered with APMC mandi"],
        "type": "Market Linkage",
        "type_ta": "சந்தை இணைப்பு",
        "link": "https://enam.gov.in/web/",
        "adoption_level": ["Medium", "High"]
    }
]



def get_all_schemes():
    return CENTRAL_SCHEMES + TAMIL_NADU_SCHEMES + WOMEN_SCHEMES + DIGITAL_PLATFORMS

WOMEN_SCHEME_IDS = ["women_shg", "nabard_women", "namo_drone_didi", "women_subsidy"]

def filter_schemes_by_eligibility(farmer_data):
    """
    Enhanced Government Scheme Recommendation Engine.
    Filters by eligibility, ranks by scoring, and returns top 5-8 results with reasons.
    """
    all_schemes = get_all_schemes()
    scored_schemes = []

    # 1. Inputs Extraction
    adoption_level = str(farmer_data.get('adoption_category', 'Medium'))
    if 'High' in adoption_level: adoption_level = 'High'
    elif 'Medium' in adoption_level or 'Moderate' in adoption_level: adoption_level = 'Medium'
    else: adoption_level = 'Low'
        
    gender = farmer_data.get('gender', 'Male')
    land_area = float(farmer_data.get('land_area', 0))
    irrigation_source = farmer_data.get('irrigation_source', 'Rainfed')
    
    # Tech usage count
    tech_list = farmer_data.get('technologies_used', [])
    tech_usage_count = len(tech_list) if isinstance(tech_list, list) else 0
    
    # Scheme awareness count (from profiles context if available)
    scheme_list = farmer_data.get('schemes_aware', [])
    scheme_awareness = len(scheme_list) if isinstance(scheme_list, list) else 0

    # Define metadata mapping for categories and types
    digital_ids = ["uzhavar_santhai", "grains_portal", "agristack", "namma_arasu", "uzhavan_app", "enam", "enam_app", "tnau_portal"]
    
    for scheme in all_schemes:
        # Step 1: Eligibility Filtering (Keep Existing Logic where applicable)
        is_eligible = True
        
        # Category Identification
        scheme_id = scheme.get('id', '')
        is_women_scheme = (scheme.get('type') == 'Women Empowerment' or 
                          scheme.get('id') in WOMEN_SCHEME_IDS)
        
        if is_women_scheme: category = "Women"
        elif scheme_id in digital_ids: category = "Digital"
        elif scheme_id.startswith('tn_') or scheme_id in ['kalaignar_scheme', 'uzhavan_app']: category = "TN"  # type: ignore
        else: category = "Central"

        # A. Gender Filter
        if category == "Women" and gender.lower() != "female":
            continue

        # B. Adoption Level Match (Pre-filter)
        # Low -> basic, Moderate -> moderate, High -> advanced
        # If scheme lists adoption levels and farmer doesn't match, we skip
        if 'adoption_level' in scheme and adoption_level not in scheme['adoption_level']: # type: ignore
            # For "Low" adopters, don't show "High" adoption schemes (advanced tech)
            if adoption_level == "Low" and "High" in scheme['adoption_level'] and "Low" not in scheme['adoption_level']: # type: ignore
                continue

        # C. Infrastructure Check
        is_irrigation_scheme = any(kw in str(scheme['name']).lower() or kw in str(scheme['description']).lower() # type: ignore
                                  for kw in ['irrigation', 'pump', 'water', 'borewell', 'sinchayee', 'micro-irrigation'])
        
        # Some schemes require a water source
        if scheme_id in ['pmksy', 'tn_micro_irrigation', 'tn_free_electricity', 'pm_kusum']:
            if irrigation_source == 'Rainfed':
                is_eligible = False

        if not is_eligible:
            continue

        # Step 2: Scoring System (NEW)
        score = 0
        reasons = []
        reasons_ta = []

        # ✔ Adoption Level Match (+2)
        if 'adoption_level' in scheme and adoption_level in scheme['adoption_level']: # type: ignore
            score += 2

        # ✔ Irrigation Type Match (+2)
        if is_irrigation_scheme:
            if irrigation_source in ['Borewell', 'Well', 'Canal']:
                score += 2
                reasons.append("Suitable for your irrigation type")
                reasons_ta.append("உங்கள் நீர்ப்பாசன வகைக்கு ஏற்றது")
            elif irrigation_source == 'Rainfed' and 'Conservation' in str(scheme.get('type', '')):
                score += 2
                reasons.append("Supports water conservation for rainfed farms")
                reasons_ta.append("வானாவாரி பண்ணைகளுக்கு நீர் சேமிக்க உதவுகிறது")
        
        # Special case: Free electricity for pumps
        if scheme_id == 'tn_free_electricity' and irrigation_source in ['Borewell', 'Well']:
            score += 2

        # ✔ Land Area fits (+1)
        # Small farmers (<= 5 acres)
        is_small_farmer = land_area <= 5
        eligibility_str = str(scheme.get('eligibility', '')).lower()
        if is_small_farmer and ("small" in eligibility_str or "marginal" in eligibility_str or "all" in eligibility_str):
            score += 1
            if not reasons:
                reasons.append("Recommended for small scale farmers")
                reasons_ta.append("சிறு விவசாயிகளுக்கு பரிந்துரைக்கப்படுகிறது")

        # ✔ Gender matches (+3 for priority)
        if category == "Women" and gender.lower() == "female":
            score += 3
            reasons.append("Exclusive support for female farmers")
            reasons_ta.append("பெண் விவசாயிகளுக்கான பிரத்யேக ஆதரவு")

        # ✔ Tech usage count supports digital (+1)
        if category == "Digital" and tech_usage_count >= 1:
            score += 1
            reasons.append("Matches your interest in digital solutions")
            reasons_ta.append("டிஜிட்டல் தீர்வுகளில் உங்கள் ஆர்வத்திற்கு பொருந்துகிறது")

        # Fallback Reason
        if not reasons:
            reasons.append("Based on your farmer profile")
            reasons_ta.append("உங்கள் விவசாயி சுயவிவரத்தின் அடிப்படையில்")

        # Step 5: Add Reason and Category (Final API Fields)
        scheme_copy = scheme.copy()
        scheme_copy['score'] = score # type: ignore
        scheme_copy['category'] = category
        scheme_copy['tag'] = scheme.get('type', 'General') # Tag name requested
        scheme_copy['reason'] = reasons[0]
        scheme_copy['reason_ta'] = reasons_ta[0]
        
        scored_schemes.append(scheme_copy)

    # Step 3: Sort Schemes by score
    scored_schemes.sort(key=lambda x: x['score'], reverse=True) # type: ignore

    # Step 4: Diversity Selection (NEW)
    # Ensure min 2 Central and 2 TN schemes as requested
    central = [s for s in scored_schemes if s['category'] == "Central"] # type: ignore
    tn = [s for s in scored_schemes if s['category'] == "TN"] # type: ignore
    women = [s for s in scored_schemes if s['category'] == "Women"] # type: ignore
    digital = [s for s in scored_schemes if s['category'] == "Digital"] # type: ignore
    
    top_schemes = []
    
    # 1. Mandatory 2 Central
    top_schemes.extend(central[:2]) # type: ignore
    
    # 2. Mandatory 2 TN
    top_schemes.extend(tn[:2]) # type: ignore
    
    # 3. Add Women/Digital/More if available
    # For female users, ensure at least one women scheme if possible
    if gender.lower() == "female" and women:
        if women[0] not in top_schemes: # type: ignore
            top_schemes.append(women[0]) # type: ignore
            
    # Add one Digital if possible
    if digital and digital[0] not in top_schemes: # type: ignore
        top_schemes.append(digital[0]) # type: ignore
        
    # 4. Fill to 8 total based on highest score from remaining
    remaining = [s for s in scored_schemes if s not in top_schemes]
    top_schemes.extend(remaining)

    # Final Limit (5-8 range, using 8 for diversity)
    return top_schemes[:8] # type: ignore
