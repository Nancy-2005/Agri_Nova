import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../utils/api';
import { FaPhone, FaLock, FaTractor, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = ({ setUser }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phone_number: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(formData);
            setUser(response.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8 animate-fade-in">
                <h1 className="text-4xl font-bold text-farm-green-700 flex items-center justify-center gap-2 mb-2">
                    {t('appName')}
                </h1>
                <p className="text-sm text-gray-500 font-semibold tracking-wider uppercase">
                    {t('appSubtitle')}
                </p>
            </div>

            <div className="card max-w-md w-full animate-fade-in p-8">
                <div className="text-center mb-8">
                    <div className="icon-container bg-farm-green-100 text-farm-green-600 mx-auto mb-4">
                        <FaTractor />
                    </div>
                    <h2 className="text-2xl font-bold text-farm-green-800">
                        {t('login')}
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            <FaPhone className="inline mr-2" />
                            {t('loginEmailMobile')}
                        </label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="input-field"
                            required
                            placeholder="Email / 9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                            <FaLock className="inline mr-2" />
                            {t('password')}
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 text-lg"
                    >
                        {loading ? '...' : t('login')}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                    <p className="text-gray-600">
                        {t('dontHaveAccount')}
                        <div className="flex flex-col gap-2 mt-2">
                            <Link to="/register" className="text-farm-green-600 font-semibold hover:underline">
                                {t('registerWithPhone')}
                            </Link>
                            <Link to="/register-email" className="text-farm-green-600 font-semibold hover:underline">
                                {t('registerWithEmail')}
                            </Link>
                        </div>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
