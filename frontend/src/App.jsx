import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLanguage } from './context/LanguageContext';
import { authAPI } from './utils/api';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerForm from './pages/FarmerForm';
import Dashboard from './pages/Dashboard';
import FarmSimulation from './pages/FarmSimulation';

// Icons
import { FaSignOutAlt } from 'react-icons/fa';

function App() {
    const { language, toggleLanguage, t } = useLanguage();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const response = await authAPI.checkSession();
            if (response.data.logged_in) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Session check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-farm-green-600">Loading...</div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen">
                {/* Top Right Controls - Language & Logout */}
                <div className="fixed top-4 right-4 z-50 flex items-center bg-white shadow-lg rounded-full px-4 py-2 border border-gray-100">
                    {user && (
                        <>
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-farm-green-700 font-bold hover:text-farm-green-800 transition-colors gap-2 text-lg px-2"
                            >
                                {language === 'en' ? 'Logout' : 'வெளியேறு'} <FaSignOutAlt />
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-4"></div>
                        </>
                    )}

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center hover:opacity-80 transition-all text-base"
                        title={language === 'en' ? 'Switch to Tamil' : 'Switch to English'}
                    >
                        <span className="font-semibold text-gray-600 hover:text-farm-green-700 mr-1">
                            {language === 'en' ? 'தமிழ்' : 'EN'}
                        </span>
                        <span className="text-gray-400 mx-1">|</span>
                        <span className="font-bold text-farm-green-700 ml-1">
                            {language === 'en' ? 'A' : 'அ'}
                        </span>
                    </button>
                </div>

                <Routes>
                    <Route
                        path="/login"
                        element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />}
                    />
                    <Route
                        path="/register"
                        element={user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />}
                    />
                    <Route
                        path="/form"
                        element={user ? <FarmerForm user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/dashboard"
                        element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/simulation"
                        element={user ? <FarmSimulation user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/"
                        element={<Navigate to={user ? "/dashboard" : "/login"} />}
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
