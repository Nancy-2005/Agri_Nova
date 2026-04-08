import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { farmerAPI, resultsAPI, simulationAPI } from '../utils/api';
import Chatbot from './Chatbot';
import {
    FaTractor, FaDownload, FaLightbulb, FaUniversity, FaSignOutAlt,
    FaChartLine, FaStar, FaLeaf, FaMobileAlt, FaFemale, FaRupeeSign, FaSeedling, FaShieldAlt
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = ({ user, onLogout }) => {
    const { t, tDistrict, tValue, tName, language } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [farmerData, setFarmerData] = useState(null);
    const [adoptionResult, setAdoptionResult] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [schemes, setSchemes] = useState([]);
    const [activeTab, setActiveTab] = useState('Central');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [profileRes, adoptionRes, recommendationsRes, schemesRes] = await Promise.all([
                farmerAPI.getProfile(user.user_id),
                resultsAPI.getAdoptionResult(user.user_id),
                resultsAPI.getRecommendations(user.user_id),
                resultsAPI.getSchemes(user.user_id),
            ]);

            setFarmerData(profileRes.data.farmer_data);
            setAdoptionResult(adoptionRes.data);
            setRecommendations(recommendationsRes.data);
            setSchemes(schemesRes.data.schemes);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            if (error.response?.status === 404) {
                // No farmer data yet, redirect to form
                navigate('/form');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        console.log('Downloading report for user:', user.user_id, 'language:', language);
        try {
            setDownloading(true);
            const response = await resultsAPI.downloadReport(user.user_id, language);

            // Check if backend returned an error (JSON blob instead of PDF)
            const contentType = response.headers?.['content-type'] || '';
            if (contentType.includes('application/json')) {
                const text = await response.data.text();
                try {
                    const errorJson = JSON.parse(text);
                    alert(`Failed to generate report: ${errorJson.error || 'Unknown error'}`);
                } catch {
                    alert('Failed to generate report');
                }
                return;
            }

            // Create blob with explicit PDF MIME type
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const downloadName = language === 'ta'
                ? `AgriNova_உழவர்_அறிக்கை_${user.name}.pdf`
                : `AgriNova_Farmer_Report_${user.name}.pdf`;

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', downloadName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Short delay before revoking the URL so the download can start
            setTimeout(() => window.URL.revokeObjectURL(url), 3000);
        } catch (error) {
            console.error('Failed to download report:', error);
            let errorMessage = language === 'ta' ? 'அறிக்கையைப் பதிவிறக்குவதில் தோல்வி' : 'Failed to download report';

            // Try to extract error message from response
            if (error.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorJson = JSON.parse(reader.result);
                        alert(`${errorMessage}: ${errorJson.error || ''}`);
                    } catch (e) {
                        alert(errorMessage);
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                alert(errorMessage);
            }
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-farm-green-600 font-bold">
                    {language === 'ta' ? 'முகப்பை ஏற்றுகிறது...' : 'Loading Dashboard...'}
                </div>
            </div>
        );
    }

    if (!farmerData || !adoptionResult) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card text-center">
                    <h2 className="text-2xl font-bold mb-4">No Data Found</h2>
                    <button onClick={() => navigate('/form')} className="btn-primary">
                        Fill Farmer Form
                    </button>
                </div>
            </div>
        );
    }

    const adoptionScore = adoptionResult.adoption_score || 0;
    const adoptionCategory = adoptionResult.adoption_category || 'N/A';
    const segment = adoptionResult.segmentation_cluster || 'N/A';

    // Chart data for adoption score
    const doughnutData = {
        labels: [language === 'ta' ? 'ஏற்பு மதிப்பெண்' : 'Adoption Score', language === 'ta' ? 'மீதமுள்ளது' : 'Remaining'],
        datasets: [{
            data: [adoptionScore, 100 - adoptionScore],
            backgroundColor: [
                adoptionScore >= 70 ? '#16a34a' : adoptionScore >= 40 ? '#eab308' : '#dc2626',
                '#e5e7eb'
            ],
            borderWidth: 0,
        }]
    };

    const doughnutOptions = {
        cutout: '70%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        }
    };

    // Technology usage chart
    const techData = {
        labels: [language === 'ta' ? 'பயன்படுத்தப்பட்ட தொழில்நுட்பங்கள்' : 'Technologies Used', language === 'ta' ? 'அறிந்த திட்டங்கள்' : 'Schemes Aware'],
        datasets: [{
            label: 'Count',
            data: [
                farmerData.technologies_used?.length || 0,
                farmerData.schemes_aware?.length || 0
            ],
            backgroundColor: ['#0ea5e9', '#16a34a'],
        }]
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    const getBadgeClass = (category) => {
        if (category === 'High') return 'badge-high';
        if (category === 'Moderate' || category === 'Medium') return 'badge-moderate';
        return 'badge-low';
    };

    // Strip Tamil part from bilingual strings like "English text - தமிழ் உரை"
    const stripTamil = (text) => {
        if (!text || language === 'ta') return text;
        // Split on ' - ' and return only the first (English) part
        const parts = text.split(' - ');
        return parts[0].trim();
    };

    const getAIInsights = () => {
        const insights = [];
        const techs = farmerData?.technologies_used || [];
        const schemesLists = farmerData?.schemes_aware || [];

        if (techs.length < 2) {
            insights.push({ type: 'negative', text: t('insightLowTech') });
        } else {
            insights.push({ type: 'positive', text: t('insightGoodTech') });
        }

        if (schemesLists.length < 2) {
            insights.push({ type: 'negative', text: t('insightLowAwareness') });
        } else {
            insights.push({ type: 'positive', text: t('insightGoodAwareness') });
        }

        if (!farmerData?.drip_irrigation && (farmerData?.irrigation_source === 'Borewell' || farmerData?.soil_type === 'Red' || farmerData?.water_availability === 'Low')) {
            insights.push({ type: 'info', text: t('insightOppDrip') });
        }

        // Ensure we always have at least 3 insights
        if (insights.length < 3) {
            insights.push({ type: 'info', text: t('insightGeneric') });
        }

        return insights;
    };

    // Filter schemes by category
    const womenSchemeIds = ['women_shg', 'nabard_women', 'namo_drone_didi', 'women_subsidy'];
    const digitalSchemeIds = ['uzhavar_santhai', 'grains_portal', 'agristack', 'namma_arasu', 'uzhavan_app'];

    // Check if ID exists before filtering to avoid errors if ID is undefined
    const womenSchemes = schemes.filter(s => s.id && womenSchemeIds.includes(s.id));
    const digitalSchemes = schemes.filter(s => s.id && digitalSchemeIds.includes(s.id));
    const tnSchemes = schemes.filter(s => s.id && s.id.startsWith('tn_'));
    const cenSchemes = schemes.filter(s => s.id && !s.id.startsWith('tn_') && !womenSchemeIds.includes(s.id) && !digitalSchemeIds.includes(s.id));

    const getSchemesToDisplay = () => {
        switch (activeTab) {
            case 'State': return tnSchemes;
            case 'Women': return womenSchemes;
            case 'Digital': return digitalSchemes;
            default: return cenSchemes;
        }
    };

    return (
        <div className="min-h-screen p-4 py-8 flex flex-col items-center">
            {/* Project Branding */}
            <div className="text-center mb-8 animate-fade-in">
                <h1 className="text-4xl font-bold text-farm-green-700 flex items-center justify-center gap-2 mb-2">
                    {t('appName')}
                </h1>
                <p className="text-sm text-gray-500 font-semibold tracking-wider uppercase">
                    {t('appSubtitle')}
                </p>
            </div>

            <div className="max-w-7xl w-full mx-auto">
                {/* Farmer Profile Header */}
                <div className="bg-farm-green-600 rounded-2xl p-6 md:p-8 mb-8 shadow-lg text-white">
                    <p className="text-farm-green-100 text-sm font-bold tracking-widest uppercase mb-4">
                        {t('farmerProfile')}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 tracking-tight">
                        {tName(user.name)}
                    </h1>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
                        {user.district && (
                            <div>
                                <p className="text-farm-green-200 text-xs font-bold tracking-wider uppercase mb-1">{language === 'en' ? 'DISTRICT' : t('district')}</p>
                                <p className="text-white font-semibold text-lg">{tDistrict(user.district)}</p>
                            </div>
                        )}
                        {farmerData?.land_area && (
                            <div>
                                <p className="text-farm-green-200 text-xs font-bold tracking-wider uppercase mb-1">{language === 'en' ? 'LAND AREA' : t('landArea')}</p>
                                <p className="text-white font-semibold text-lg">{farmerData.land_area} {t('acres')}</p>
                            </div>
                        )}
                        {farmerData?.crop_type && farmerData.crop_type.length > 0 && (
                            <div>
                                <p className="text-farm-green-200 text-xs font-bold tracking-wider uppercase mb-1">{language === 'en' ? 'CROPS' : t('crops')}</p>
                                <p className="text-white font-semibold text-lg max-w-full truncate" title={Array.isArray(farmerData.crop_type) ? farmerData.crop_type.map(c => tValue('crop', c)).join(', ') : tValue('crop', farmerData.crop_type)}>
                                    {Array.isArray(farmerData.crop_type) ? farmerData.crop_type.map(c => tValue('crop', c)).join(', ') : tValue('crop', farmerData.crop_type)}
                                </p>
                            </div>
                        )}
                        {farmerData?.irrigation_source && (
                            <div>
                                <p className="text-farm-green-200 text-xs font-bold tracking-wider uppercase mb-1">{language === 'en' ? 'IRRIGATION' : t('irrigation')}</p>
                                <p className="text-white font-semibold text-lg">{tValue('irrigation', farmerData.irrigation_source)}</p>
                            </div>
                        )}
                        {farmerData?.soil_type && (
                            <div>
                                <p className="text-farm-green-200 text-xs font-bold tracking-wider uppercase mb-1">{language === 'en' ? 'SOIL' : t('soil')}</p>
                                <p className="text-white font-semibold text-lg">{tValue('soil', farmerData.soil_type)}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4">
                        <div className="border border-farm-green-500 bg-farm-green-700 px-4 py-2 rounded-lg text-sm font-medium text-farm-green-50 flex items-center shadow-sm">
                            {t('assessment')}: {language === 'ta' ? `${new Date().getDate()} ${t(new Date().toLocaleDateString('en-GB', { month: 'short' }).toLowerCase())} ${new Date().getFullYear()}` : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="border border-farm-green-500 bg-farm-green-700 px-4 py-2 rounded-lg text-sm font-medium text-farm-green-50 flex items-center shadow-sm">
                            {adoptionCategory !== 'N/A' ? (language === 'ta' ? `${tValue('category', adoptionCategory)} விவசாயி` : `${adoptionCategory} Farmer`) : 'Farmer'}
                        </div>
                        {user.district && (
                            <div className="border border-farm-green-500 bg-farm-green-700 px-4 py-2 rounded-lg text-sm font-medium text-farm-green-50 flex items-center shadow-sm">
                                {tDistrict(user.district)} &middot; {language === 'ta' ? 'தமிழ்நாடு' : 'Tamil Nadu'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Adoption Score Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Adoption Meter */}
                    <div className="card text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('adoptionScore')}</h3>
                        <div className="relative w-48 h-48 mx-auto mb-4">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-farm-green-700">{adoptionScore}%</div>
                                </div>
                            </div>
                        </div>
                        <div className={`badge ${getBadgeClass(adoptionCategory)} text-lg`}>
                            {tValue('category', adoptionCategory)}
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="card shadow-sm border border-gray-100 flex flex-col justify-start">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">
                            {t('aiInsights')}
                        </h3>

                        <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 max-w-max" style={{ backgroundColor: '#F8EBD9', color: '#5A4A42' }}>
                            <span className="font-semibold text-sm mr-2">{tValue('category', adoptionCategory)}</span>
                            <FaLeaf className="opacity-80" />
                        </div>

                        <div className="bg-farm-green-50 rounded-xl p-5 border border-farm-green-100 flex-grow">
                            <h4 className="flex items-center text-xl font-bold text-gray-800 mb-4">
                                <FaLightbulb className="text-farm-green-600 mr-2 text-2xl" /> {t('insights')}
                            </h4>
                            <ul className="space-y-4">
                                {getAIInsights().map((insight, index) => (
                                    <li key={index} className="flex items-start text-lg">
                                        {insight.type === 'negative' ? (
                                            <div className="bg-red-500 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                <span className="text-white text-xs">▲</span>
                                            </div>
                                        ) : insight.type === 'info' ? (
                                            <div className="bg-green-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                <span className="text-white text-xs">v</span>
                                            </div>
                                        ) : (
                                            <div className="bg-green-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                <span className="text-white text-xs">✔</span>
                                            </div>
                                        )}
                                        <span className="text-gray-800 font-medium">{insight.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card mb-6">
                    <h2 className="text-2xl font-bold text-farm-green-800 mb-4">{t('quickActions')}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            id="download-report-btn"
                            onClick={handleDownloadReport}
                            disabled={downloading}
                            className={`btn-primary flex items-center justify-center gap-2 ${downloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <FaDownload className={downloading ? 'animate-bounce' : ''} />
                            {downloading ? (language === 'ta' ? 'பதிவிறக்கம் செய்யப்படுகிறது...' : 'Downloading...') : t('report')}
                        </button>
                        <button onClick={() => navigate('/form')} className="btn-secondary">
                            <FaLeaf /> {t('updateProfile')}
                        </button>
                        <button onClick={() => navigate('/simulation')} className="btn-accent bg-blue-600 text-white flex items-center justify-center gap-2 hover:bg-blue-700 transition-all rounded-lg py-3 px-4 shadow-md font-bold">
                            <FaChartLine /> {t('simulation')}
                        </button>
                        <a href="#recommendations" className="btn-outline text-center flex items-center justify-center gap-2">
                            <FaLightbulb /> {t('viewRecommendations')}
                        </a>
                    </div>
                </div>

                {/* Insurance Recommendations Section */}
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-farm-green-800 mb-6 flex items-center">
                        <FaShieldAlt className="mr-3" /> {language === 'ta' ? 'காப்பீட்டு பரிந்துரைகள்' : 'Insurance Recommendations'}
                    </h2>
                    <div className="card shadow-sm border border-gray-100 p-6 bg-blue-50">
                        {/* Current Insurance Status */}
                        <div className="grid md:grid-cols-2 gap-4 mb-4 border-b pb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">{language === 'ta' ? 'பதிவு நிலை' : 'Enrollment Status'}</p>
                                <p className={`text-lg font-semibold ${(recommendations?.insurance?.status === 'enrolled') ? 'text-green-700' : 'text-red-600'
                                    }`}>
                                    {recommendations?.insurance
                                        ? (language === 'ta' ? recommendations.insurance.status_ta : recommendations.insurance.status_en)
                                        : (stripTamil(farmerData?.insuranceEnrolled) || (language === 'ta' ? 'காப்பீடு இல்லை' : 'Not Enrolled'))}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">{language === 'ta' ? 'மிகப்பெரிய ஆபத்து' : 'Biggest Risk'}</p>
                                <p className="text-lg font-semibold">{stripTamil(farmerData?.farmingRisk) || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">{language === 'ta' ? 'காப்பீடு நிலம்' : 'Insured Land %'}</p>
                                <p className="text-lg font-semibold">{stripTamil(farmerData?.insuredLandPercent) || '0%'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">{language === 'ta' ? 'திட்டம்' : 'Current Scheme'}</p>
                                <p className="text-lg font-semibold">{stripTamil(farmerData?.insuranceScheme) || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Dynamic ML Scheme Recommendations */}
                        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                            <FaLightbulb className="mr-2" /> {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட திட்டங்கள்' : 'Recommended Schemes For You'}
                        </h3>
                        {recommendations?.insurance?.recommendations?.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {recommendations.insurance.recommendations.map((s, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
                                        <h4 className="font-bold text-blue-700 mb-1">
                                            {language === 'ta' ? s.scheme_ta : s.scheme_en}
                                        </h4>
                                        <p className="text-gray-700 text-sm mb-3">
                                            {language === 'ta' ? s.description_ta : s.description_en}
                                        </p>
                                        {s.link && (
                                            <a
                                                href={s.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center"
                                            >
                                                {language === 'ta' ? 'மேலும் அறிய →' : 'Learn More →'}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ul className="list-disc pl-5 space-y-2 text-lg text-gray-800">
                                {(!farmerData?.insuranceEnrolled || farmerData?.insuranceEnrolled.includes('No')) && (
                                    <li>{language === 'ta' ? 'நீங்கள் இன்னும் பயிர் காப்பீட்டில் சேரவில்லை. PMFBY திட்டத்தில் சேர பரிந்துரைக்கப்படுகிறீர்கள்.' : 'You are not fully insured. We highly recommend enrolling in PMFBY (Pradhan Mantri Fasal Bima Yojana).'}</li>
                                )}
                                {farmerData?.insuranceEnrolled?.includes('Yes') && farmerData?.insuredLandPercent?.includes('100') && (
                                    <li>{language === 'ta' ? 'சிறப்பு! நீங்கள் முழுமையாக காப்பீடு செய்யப்பட்டுள்ளீர்கள்.' : 'Excellent! You are fully insured. Make sure to renew your policy on time.'}</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Recommendations Section */}
                <div id="recommendations" className="mb-6">
                    <h2 className="text-3xl font-bold text-farm-green-800 mb-2 flex items-center">
                        <FaLightbulb className="mr-3" /> {t('recommendations')}
                    </h2>
                    <p className="text-gray-600 mb-6 font-medium">
                        {t('adoptionMsgStart')} <span className={`font-bold ${getBadgeClass(adoptionCategory)}`}>{tValue('category', adoptionCategory)}</span> {t('adoptionMsgEnd')}
                    </p>

                    {/* Technology Recommendations */}
                    {recommendations?.technologies && recommendations.technologies.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('recommendedTech')}</h3>

                            {/* Already Using */}
                            {recommendations.technologies.some(t => t.already_using) && (
                                <div className="mb-5">
                                    <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">✓ {language === 'ta' ? 'நீங்கள் ஏற்கனவே பயன்படுத்துகிறீர்கள்' : 'Already Using'}</span>
                                    </h4>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recommendations.technologies.filter(tech => tech.already_using).map((tech, index) => (
                                            <div key={index} className="card-hover border-blue-100 bg-blue-50 relative">
                                                <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                                    {language === 'ta' ? 'பயன்பாட்டில் உள்ளது' : 'In Use'}
                                                </span>
                                                <h4 className="text-xl font-bold text-blue-700 mb-1 pr-20">
                                                    {language === 'ta' ? tech.tech_ta : tech.tech_en}
                                                </h4>
                                                <p className="text-gray-700 mb-3 leading-relaxed">
                                                    {language === 'ta' ? tech.description_ta : tech.description_en}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* To Adopt */}
                            {recommendations.technologies.some(t => !t.already_using) && (
                                <div>
                                    <h4 className="text-lg font-bold text-farm-green-700 mb-3 flex items-center gap-2">
                                        <span className="bg-farm-green-100 text-farm-green-700 px-3 py-1 rounded-full text-sm font-bold">⬆ {language === 'ta' ? 'பின்வருவனவற்றை ஏற்கவும்' : 'Recommended to Adopt'}</span>
                                    </h4>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recommendations.technologies.filter(tech => !tech.already_using).map((tech, index) => (
                                            <div key={index} className="card-hover border-farm-green-100">
                                                <h4 className="text-xl font-bold text-farm-green-700 mb-1">
                                                    {language === 'ta' ? tech.tech_ta : tech.tech_en}
                                                </h4>
                                                <p className="text-gray-700 mb-3 leading-relaxed">
                                                    {language === 'ta' ? tech.description_ta : tech.description_en}
                                                </p>
                                                <div className="border-t pt-3 flex flex-col gap-1">
                                                    <p className="text-sm font-bold text-gray-800 flex justify-between">
                                                        <span className="text-gray-500">{t('cost')}:</span>
                                                        <span>{language === 'ta' ? tech.cost_ta : tech.cost_en}</span>
                                                    </p>
                                                    <p className="text-sm flex justify-between">
                                                        <span className="text-gray-500">{t('schemeLabel')}:</span>
                                                        <span className="text-green-600 font-medium">{language === 'ta' ? tech.scheme_ta : tech.scheme_en}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Government Schemes Section */}
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-farm-green-800 mb-6 flex items-center">
                        <FaUniversity className="mr-3" /> {t('schemes')}
                    </h2>
                    <p className="text-gray-600 mb-6 pb-2 border-b border-gray-100">
                        {t('schemesDesc')}
                    </p>

                    {/* Tabs */}
                    <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                        <button
                            className={`px-4 py-2 rounded-full font-semibold transition-colors ${activeTab === 'Central' ? 'bg-farm-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            onClick={() => setActiveTab('Central')}
                        >
                            {t('centralGovt')}
                        </button>
                        <button
                            className={`px-4 py-2 rounded-full font-semibold transition-colors ${activeTab === 'State' ? 'bg-farm-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            onClick={() => setActiveTab('State')}
                        >
                            <FaSeedling className="inline mr-1" /> {t('tnState')}
                        </button>
                        {farmerData?.gender === 'Female' && (
                            <button
                                className={`px-4 py-2 rounded-full font-semibold transition-colors ${activeTab === 'Women' ? 'bg-farm-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                onClick={() => setActiveTab('Women')}
                            >
                                <FaFemale className="inline mr-1" /> {t('women')}
                            </button>
                        )}
                        <button
                            className={`px-4 py-2 rounded-full font-semibold transition-colors ${activeTab === 'Digital' ? 'bg-farm-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            onClick={() => setActiveTab('Digital')}
                        >
                            <FaMobileAlt className="inline mr-1" /> {t('digital')}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {getSchemesToDisplay().length > 0 ? (
                            getSchemesToDisplay().map((scheme, index) => (
                                <div key={index} className="card-hover">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="text-lg font-bold text-farm-sky-700">
                                                {language === 'ta' ? scheme.name_ta : scheme.name}
                                            </h4>
                                        </div>
                                        <span className={`badge ${scheme.type === 'Insurance' ? 'badge-moderate' : 'badge-high'}`}>
                                            {language === 'ta' ? scheme.type_ta : scheme.type}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mb-2">
                                        {language === 'ta' ? scheme.description_ta : scheme.description}
                                    </p>
                                    <div className="border-t pt-3">
                                        <p className="text-sm font-semibold text-green-600">
                                            {t('benefits')}: {language === 'ta' ? scheme.benefits_ta : scheme.benefits}
                                        </p>
                                        {scheme.reason && (
                                            <p className="text-sm font-medium text-farm-green-600 mt-1 flex items-center">
                                                <span className="mr-1">✔</span> {language === 'ta' ? (scheme.reason_ta || scheme.reason) : scheme.reason}
                                            </p>
                                        )}
                                        {scheme.link && (
                                            <a
                                                href={scheme.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-farm-sky-600 hover:underline mt-2 inline-block"
                                            >
                                                {t('learnMore')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-gray-500 py-8">
                                {t('noSchemesFound')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Crop Recommendations Section - After Schemes */}
                {recommendations?.crops && recommendations.crops.length > 0 && (
                    <div className="mb-12 animate-fade-in" id="recommendations">
                        <h2 className="text-3xl font-bold text-farm-green-800 mb-2 flex items-center">
                            {language === 'en' ? 'Top Crop Recommendations' : 'முக்கிய பயிர் பரிந்துரைகள்'}
                        </h2>
                        <p className="text-gray-500 mb-6 font-medium">
                            {language === 'en' ? 'Our AI model suggests these top 3 crops for your specific conditions.' : 'செயற்கை நுண்ணறிவு மூலம் உங்கள் நிலத்திற்கு ஏற்ற முதல் 3 பயிர் பரிந்துரைகள்.'}
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {recommendations.crops.slice(0, 3).map((crop, index) => {
                                const cropIcons = {
                                    'Paddy': '🌾',
                                    'Sugarcane': '🌱',
                                    'Groundnut': '🌰',
                                    'Millets': '🌾',
                                    'Pulses': '🍲',
                                    'Cotton': '☁️'
                                };
                                const icon = cropIcons[crop.crop_en] || '🌾';

                                return (
                                    <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border-2 border-farm-green-100 hover:border-farm-green-400 transition-all transform hover:-translate-y-1">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="text-farm-green-600 font-bold mb-1">
                                                {language === 'en' ? `Rank #${index + 1}` : `வரிசை எண்: ${index + 1}`}
                                            </div>
                                            <h4 className="text-2xl font-bold text-farm-green-800">
                                                {language === 'ta' ? crop.crop_ta : crop.crop_en}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {language === 'en' ? 'Highly Suitable' : 'மிக பொருத்தமானது'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {/* Floating Chatbot */}
            <Chatbot user={user} />
        </div>
    );
};

export default Dashboard;
