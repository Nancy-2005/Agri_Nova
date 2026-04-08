import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../utils/api';
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaTractor, FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterEmail = ({ setUser }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const districtList = t('districts');

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        district: '',
        otp: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authAPI.sendOtp({
                name: formData.name,
                email: formData.email,
                district: formData.district
            });
            setSuccess(t('otpSentSuccessfully'));
            setStep(2);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to send OTP';
            setError(errorMsg);
            if (errorMsg.includes('already exists') || errorMsg.includes('ஏற்கனவே உள்ளார்')) {
                alert(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await authAPI.verifyOtp({
                email: formData.email,
                otp: formData.otp
            });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.register({
                name: formData.name,
                email: formData.email,
                district: formData.district,
                password: formData.password
            });
            setUser(response.data);
            navigate('/form');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Registration failed';
            setError(errorMsg);
            if (errorMsg.includes('already exists') || errorMsg.includes('ஏற்கனவே உள்ளார்')) {
                alert(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
            <div className="text-center mb-8 animate-fade-in">
                <h1 className="text-4xl font-bold text-farm-green-700 flex items-center justify-center gap-2 mb-2">
                    {t('appName')}
                </h1>
                <p className="text-sm text-gray-500 font-semibold tracking-wider uppercase">
                    {t('appSubtitle')}
                </p>
            </div>

            <div className="card max-w-2xl w-full animate-fade-in p-8">
                <div className="text-center mb-8">
                    <div className="icon-container bg-farm-green-100 text-farm-green-600 mx-auto mb-4">
                        <FaEnvelope />
                    </div>
                    <h2 className="text-2xl font-bold text-farm-green-800">
                        {t('registerWithEmail')} - {step === 1 ? t('step1of3') : step === 2 ? t('step2of3') : t('step3of3')}
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                        {success}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                <FaUser className="inline mr-2" />
                                {t('name')} *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                required
                                placeholder={t('name')}
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                <FaEnvelope className="inline mr-2" />
                                {t('email')} *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                required
                                placeholder="example@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                <FaMapMarkerAlt className="inline mr-2" />
                                {t('district')} *
                            </label>
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="">{t('selectDistrict')}</option>
                                {Array.isArray(districtList) && districtList.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-lg"
                        >
                            {loading ? '...' : t('sendOtp')}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                {t('enterOtp')} *
                            </label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                className="input-field"
                                required
                                placeholder="123456"
                                maxLength="6"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-lg"
                        >
                            {loading ? '...' : t('verifyOtp')}
                        </button>
                        
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setSuccess('');
                                }}
                                className="text-farm-green-600 font-semibold hover:underline"
                            >
                                Back
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleCompleteRegistration} className="space-y-6">
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                <FaLock className="inline mr-2" />
                                {t('setPassword')} *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field pr-10"
                                    required
                                    placeholder="••••••••"
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">
                                <FaLock className="inline mr-2" />
                                {t('confirmPassword')} *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input-field pr-10"
                                    required
                                    placeholder="••••••••"
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-lg"
                        >
                            {loading ? '...' : t('register')}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        {t('alreadyHaveAccount')}{' '}
                        <Link to="/login" className="text-farm-green-600 font-semibold hover:underline">
                            {t('login')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterEmail;
