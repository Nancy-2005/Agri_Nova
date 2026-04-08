import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaCheckCircle, FaChartLine } from 'react-icons/fa';

const GuidanceModal = ({ isOpen, onClose, level }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleViewRecs = () => {
        onClose();
        navigate('/dashboard');
        // Give time for navigation, then scroll
        setTimeout(() => {
            const element = document.getElementById('recommendations');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.hash = 'recommendations';
            }
        }, 500);
    };

    const handleUpdateProfile = () => {
        onClose();
        navigate('/form');
    };

    const getLevelDisplay = () => {
        const lowerLevel = (level || 'low').toLowerCase();
        if (lowerLevel === 'high') return { text: t('high'), color: 'text-green-600', bg: 'bg-green-100' };
        if (lowerLevel === 'medium' || lowerLevel === 'moderate') return { text: t('medium'), color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { text: t('low'), color: 'text-red-600', bg: 'bg-red-100' };
    };

    const levelInfo = getLevelDisplay();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-pop-in">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-farm-green-100 text-farm-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaGraduationCap size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('guidanceTitle')}</h2>
                </div>

                <div className="mb-6 text-center">
                    <p className="text-gray-600 mb-2">{t('currentLevel')}</p>
                    <div className={`inline-block px-6 py-2 rounded-full font-bold text-xl ${levelInfo.bg} ${levelInfo.color} mb-4`}>
                        <FaChartLine className="inline mr-2" />
                        {levelInfo.text}
                    </div>
                    <p className="text-gray-700 font-medium">{t('guidanceMessage')}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-8">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FaCheckCircle className="text-farm-green-500" />
                        {t('suggestedActions')}
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center gap-2">• {t('cropRec')}</li>
                        <li className="flex items-center gap-2">• {t('govScheme')}</li>
                        <li className="flex items-center gap-2">• {t('techUsage')}</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleViewRecs}
                        className="btn-primary w-full py-3"
                    >
                        {t('viewRec')}
                    </button>
                    <button 
                        onClick={handleUpdateProfile}
                        className="bg-white border-2 border-farm-green-600 text-farm-green-600 font-bold py-3 rounded-xl hover:bg-farm-green-50 transition-all shadow-md"
                    >
                        {t('updateProfile')}
                    </button>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 font-semibold hover:text-gray-700 transition-colors py-2"
                    >
                        {t('later')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuidanceModal;
