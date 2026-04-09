import React, { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaStop, FaCloudSun } from 'react-icons/fa';

// ── Weather Card Component ─────────────────────────────────────────────────────
const getWeatherBg = (cond) => {
    if (!cond) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    const c = cond.toLowerCase();
    if (c.includes('thunder')) return 'linear-gradient(135deg, #2c3e50, #4a0072)';
    if (c.includes('rain') || c.includes('drizzle')) return 'linear-gradient(135deg, #1d3557, #457b9d)';
    if (c.includes('snow')) return 'linear-gradient(135deg, #a8edea, #fed6e3)';
    if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return 'linear-gradient(135deg, #bdc3c7, #2c3e50)';
    if (c.includes('clear')) return 'linear-gradient(135deg, #f7971e, #ffd200)';
    if (c.includes('cloud')) return 'linear-gradient(135deg, #4facfe, #78a9c8)';
    return 'linear-gradient(135deg, #56ccf2, #2f80ed)';
};

const WeatherCard = ({ data, language }) => {
    if (!data) return null;
    const { city, current, forecast, farming_tip } = data;
    const bg = getWeatherBg(current.condition);
    return (
        <div style={{
            borderRadius: '14px', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            fontFamily: 'inherit', marginTop: '4px',
        }}>
            {/* Current weather header */}
            <div style={{
                background: bg, padding: '16px',
                color: '#fff', textAlign: 'center',
            }}>
                <div style={{ fontSize: '11px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {language === 'ta' ? 'தற்போதைய வானிலை' : 'Current Weather'} — {city}
                </div>
                <div style={{ fontSize: '48px', margin: '6px 0 2px' }}>{current.icon}</div>
                <div style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1 }}>{current.temp}&deg;C</div>
                <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>{current.description}</div>
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '18px',
                    marginTop: '10px', fontSize: '12px', opacity: 0.88,
                }}>
                    <span>💧 {language === 'ta' ? 'ஈரப்ப' : 'Humidity'}: {current.humidity}%</span>
                    <span>💨 {language === 'ta' ? 'காற்று' : 'Wind'}: {current.wind_speed} km/h</span>
                    <span>🌡️ {language === 'ta' ? 'உணர்வு' : 'Feels'}: {current.feels_like}&deg;</span>
                </div>
            </div>

            {/* 5-day forecast strip */}
            {forecast && forecast.length > 0 && (
                <div style={{
                    background: 'rgba(255,255,255,0.97)',
                    padding: '10px 8px 8px',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                }}>
                    <div style={{
                        fontSize: '10px', fontWeight: 700, color: '#6b7280',
                        textTransform: 'uppercase', letterSpacing: '0.8px',
                        marginBottom: '8px', paddingLeft: '4px',
                    }}>
                        {language === 'ta' ? '5-நாள் முன்னறிவிப்பு' : '5-Day Forecast'}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {forecast.map((day, i) => (
                            <div key={i} style={{
                                flex: 1, textAlign: 'center', padding: '8px 4px',
                                borderRadius: '10px',
                                background: i === 0 ? 'linear-gradient(135deg,#e0f2fe,#bae6fd)' : '#f9fafb',
                                border: i === 0 ? '1px solid #7dd3fc' : '1px solid #f3f4f6',
                            }}>
                                <div style={{ fontSize: '10px', fontWeight: 600, color: '#374151' }}>
                                    {day.day.slice(0, 3)}
                                </div>
                                <div style={{ fontSize: '18px', margin: '3px 0' }}>{day.icon}</div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{day.temp_max}&deg;</div>
                                <div style={{ fontSize: '10px', color: '#9ca3af' }}>{day.temp_min}&deg;</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Farming tip */}
            {farming_tip && (
                <div style={{
                    background: '#f0fdf4', padding: '10px 14px',
                    borderTop: '1px solid #d1fae5',
                    fontSize: '12px', color: '#166534', lineHeight: 1.5,
                }}>
                    {farming_tip}
                </div>
            )}
        </div>
    );
};

const Chatbot = ({ user }) => {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    // Each message shape: { role: 'user' | 'bot', text: string (if user), reply_en: string (if bot), reply_ta: string (if bot) }
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [playingMsgIndex, setPlayingMsgIndex] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const LABELS = {
        en: {
            title: 'AgriNova Assistant',
            subtitle: 'Your farming guide',
            placeholder: 'Ask about crops, schemes, irrigation...',
            send: 'Send',
            typing: 'Typing',
            micOn: 'Microphone is on',
            micOff: 'Microphone is off',
        },
        ta: {
            title: 'AgriNova உதவியாளர்',
            subtitle: 'உங்கள் விவசாய வழிகாட்டி',
            placeholder: 'பயிர்கள், திட்டங்கள், நீர்ப்பாசனம் பற்றி கேளுங்கள்...',
            send: 'அனுப்பு',
            typing: 'தட்டச்சு',
            micOn: 'மைக்ரோஃபோன் இயக்கத்தில் உள்ளது',
            micOff: 'மைக்ரோஃபோன் அணைக்கப்பட்டுள்ளது',
        },
    };

    const label = LABELS[language] || LABELS.en;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !isInitialized) {
            // Show greeting when chat is first opened
            setIsTyping(true);
            setTimeout(async () => {
                try {
                    const res = await chatbotAPI.sendMessage('hello', language);
                    setMessages([{
                        role: 'bot',
                        reply_en: res.data.reply_en,
                        reply_ta: res.data.reply_ta
                    }]);
                } catch {
                    setMessages([{
                        role: 'bot',
                        reply_en: '👋 Hello! I\'m your farming assistant. Ask me anything about farming!',
                        reply_ta: '👋 வணக்கம்! நான் உங்கள் விவசாய உதவியாளர். எனக்கு கேளுங்கள்!'
                    }]);
                } finally {
                    setIsTyping(false);
                    setIsInitialized(true);
                }
            }, 600);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const handleSend = async (overrideText) => {
        // Guard: if overrideText is not a plain string (e.g. a click event), ignore it
        const trimmed = (typeof overrideText === 'string' ? overrideText : inputValue).trim();
        if (!trimmed || isTyping) return;

        const userMsg = { role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await chatbotAPI.sendMessage(trimmed, language);
            setTimeout(() => {
                const botMsg = {
                    role: 'bot',
                    reply_en: res.data.reply_en,
                    reply_ta: res.data.reply_ta,
                    intent: res.data.intent,
                    weather_data: res.data.weather_data || null,
                };
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);
            }, 400);
        } catch {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    reply_en: '❌ Sorry, something went wrong. Please try again.',
                    reply_ta: '❌ மன்னிக்கவும், ஏதோ தவறு நடந்தது. மீண்டும் முயற்சிக்கவும்.',
                    intent: 'error',
                    weather_data: null,
                }]);
                setIsTyping(false);
            }, 400);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClose = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setPlayingMsgIndex(null);
        }
        setIsOpen(false);
    };

    const handleOpen = () => {
        setIsOpen(true);
    };

    return (
        <>
            {/* ── Floating Button ── */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    id="chatbot-toggle-btn"
                    title={label.title}
                    style={{
                        position: 'fixed',
                        bottom: '28px',
                        right: '28px',
                        zIndex: 1000,
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        boxShadow: '0 4px 20px rgba(22,163,74,0.45)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.12)';
                        e.currentTarget.style.boxShadow = '0 6px 28px rgba(22,163,74,0.6)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(22,163,74,0.45)';
                    }}
                >
                    <FaComments />
                    {/* Pulse ring */}
                    <span style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px solid #16a34a',
                        animation: 'chatbotPulse 2s ease-out infinite',
                        opacity: 0.6,
                    }} />
                </button>
            )}

            {/* ── Chat Window ── */}
            {isOpen && (
                <div
                    id="chatbot-window"
                    style={{
                        position: 'fixed',
                        bottom: '28px',
                        right: '28px',
                        zIndex: 1000,
                        width: '360px',
                        maxWidth: 'calc(100vw - 32px)',
                        height: '520px',
                        maxHeight: 'calc(100vh - 56px)',
                        borderRadius: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
                        overflow: 'hidden',
                        animation: 'chatbotSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#fff',
                        flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px',
                            }}>
                                <FaRobot />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '15px' }}>{label.title}</div>
                                <div style={{ fontSize: '11px', opacity: 0.8 }}>
                                    <span style={{
                                        display: 'inline-block', width: '7px', height: '7px',
                                        borderRadius: '50%', background: '#4ade80',
                                        marginRight: '5px', verticalAlign: 'middle',
                                    }} />
                                    {label.subtitle}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            id="chatbot-close-btn"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none', cursor: 'pointer', color: '#fff',
                                width: '30px', height: '30px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px', transition: 'background 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '16px',
                        background: '#f0fdf4',
                        display: 'flex', flexDirection: 'column', gap: '12px',
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}>
                                {msg.role === 'bot' && (
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#16a34a,#15803d)',
                                        color: '#fff', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '12px',
                                        flexShrink: 0, marginRight: '8px', marginTop: '2px',
                                    }}>
                                        <FaRobot />
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: '78%',
                                    padding: '10px 14px',
                                    borderRadius: msg.role === 'user'
                                        ? '18px 18px 4px 18px'
                                        : '4px 18px 18px 18px',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg,#16a34a,#15803d)'
                                        : '#fff',
                                    color: msg.role === 'user' ? '#fff' : '#1f2937',
                                    fontSize: '13.5px',
                                    lineHeight: '1.55',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    position: 'relative'
                                }}>
                                {/* Render translated text dynamically based on current language */}
                                    {msg.role === 'user'
                                        ? msg.text
                                        : msg.intent === 'live_weather' && msg.weather_data
                                            ? <WeatherCard data={msg.weather_data} language={language} />
                                            : (language === 'en' ? msg.reply_en : msg.reply_ta)
                                    }

                                    {/* Small speaker icon for manual playback of bot messages */}
                                    {msg.role === 'bot' && (
                                        <button
                                            onClick={() => {
                                                if ('speechSynthesis' in window) {
                                                    if (playingMsgIndex === i) {
                                                        window.speechSynthesis.cancel();
                                                        setPlayingMsgIndex(null);
                                                        return;
                                                    }
                                                    
                                                    window.speechSynthesis.cancel();
                                                    setPlayingMsgIndex(i);
                                                    
                                                    const rawText = language === 'en' ? msg.reply_en : msg.reply_ta;
                                                    // Remove markdown symbols before reading
                                                    const cleanText = rawText.replace(/[*#/_`~]/g, '');
                                                    const utterance = new SpeechSynthesisUtterance(cleanText);
                                                    utterance.lang = language === 'en' ? 'en-IN' : 'ta-IN';

                                                    utterance.onend = () => setPlayingMsgIndex(null);
                                                    utterance.onerror = () => setPlayingMsgIndex(null);

                                                    const voices = window.speechSynthesis.getVoices();
                                                    const targetLang = language === 'en' ? 'en-IN' : 'ta-IN';
                                                    const searchName = language === 'ta' ? 'tamil' : 'english';

                                                    // Try strict match -> prefix match -> name match
                                                    const voice = voices.find(v => v.lang.replace('_', '-').toLowerCase() === targetLang.toLowerCase())
                                                        || voices.find(v => v.lang.toLowerCase().startsWith(language.toLowerCase()))
                                                        || voices.find(v => v.name.toLowerCase().includes(searchName));

                                                    if (voice) {
                                                        utterance.voice = voice;
                                                    }

                                                    window.speechSynthesis.speak(utterance);
                                                }
                                            }}
                                            style={{
                                                position: 'absolute', bottom: '-22px', left: '0',
                                                background: 'none', border: 'none', 
                                                color: playingMsgIndex === i ? '#ef4444' : '#6b7280',
                                                cursor: 'pointer', fontSize: '12px', padding: '2px 4px',
                                                display: 'flex', alignItems: 'center', gap: '4px'
                                            }}
                                            title={playingMsgIndex === i 
                                                    ? (language === 'en' ? "Stop reading" : "படிப்பதை நிறுத்து") 
                                                    : (language === 'en' ? "Read aloud" : "சத்தமாக படியுங்கள்")}
                                        >
                                            {playingMsgIndex === i ? <FaStop /> : <FaVolumeUp />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#16a34a,#15803d)',
                                    color: '#fff', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '12px', flexShrink: 0,
                                }}>
                                    <FaRobot />
                                </div>
                                <div style={{
                                    background: '#fff', borderRadius: '4px 18px 18px 18px',
                                    padding: '10px 16px',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                }}>
                                    {[0, 0.2, 0.4].map((delay, di) => (
                                        <span key={di} style={{
                                            width: '7px', height: '7px', borderRadius: '50%',
                                            background: '#16a34a',
                                            display: 'inline-block',
                                            animation: `chatbotBounce 1s ${delay}s ease-in-out infinite`,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '12px 14px',
                        background: '#fff',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex', gap: '8px', alignItems: 'flex-end',
                        flexShrink: 0,
                    }}>
                        <button
                            onClick={() => {
                                setIsListening(!isListening);
                                if (!isListening) {
                                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                    if (SpeechRecognition) {
                                        const recognition = new SpeechRecognition();
                                        recognition.lang = language === 'en' ? 'en-IN' : 'ta-IN';
                                        recognition.onresult = (e) => {
                                            const text = e.results[0][0].transcript;
                                            setInputValue(text);
                                            setIsListening(false);
                                            handleSend(text); // Auto-send when voice is decoded
                                        };
                                        recognition.onerror = () => setIsListening(false);
                                        recognition.onend = () => setIsListening(false);
                                        recognition.start();
                                    } else {
                                        alert(language === 'en' ? 'Voice input is not supported in your browser' : 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை');
                                        setIsListening(false);
                                    }
                                }
                            }}
                            title={isListening ? label.micOn : label.micOff}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: isListening ? '#fee2e2' : '#f3f4f6',
                                color: isListening ? '#ef4444' : '#4b5563',
                                border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '16px', flexShrink: 0,
                                animation: isListening ? 'chatbotPulseMic 1.5s infinite' : 'none'
                            }}
                        >
                            {isListening ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        </button>

                        <textarea
                            ref={inputRef}
                            id="chatbot-input"
                            rows={1}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={label.placeholder}
                            style={{
                                flex: 1, border: '1.5px solid #d1fae5', borderRadius: '12px',
                                padding: '9px 12px', fontSize: '13.5px', fontFamily: 'inherit',
                                resize: 'none', outline: 'none', lineHeight: '1.4',
                                maxHeight: '96px', overflowY: 'auto',
                                transition: 'border-color 0.2s',
                                background: '#f0fdf4',
                                color: '#1f2937',
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = '#16a34a'}
                            onBlur={e => e.currentTarget.style.borderColor = '#d1fae5'}
                        />
                        <button
                            onClick={handleSend}
                            id="chatbot-send-btn"
                            disabled={!inputValue.trim() || isTyping}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: inputValue.trim() && !isTyping
                                    ? 'linear-gradient(135deg,#16a34a,#15803d)'
                                    : '#d1d5db',
                                color: '#fff', border: 'none',
                                cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '15px', flexShrink: 0,
                                transition: 'background 0.2s, transform 0.15s',
                            }}
                            onMouseEnter={e => { if (inputValue.trim() && !isTyping) e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}

            {/* Keyframe animations */}
            <style>{`
                @keyframes chatbotPulse {
                    0%   { transform: scale(1);   opacity: 0.6; }
                    70%  { transform: scale(1.5); opacity: 0;   }
                    100% { transform: scale(1.5); opacity: 0;   }
                }
                @keyframes chatbotSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)     scale(1);    }
                }
                @keyframes chatbotBounce {
                    0%, 60%, 100% { transform: translateY(0);    }
                    30%           { transform: translateY(-6px);  }
                }
            `}</style>
        </>
    );
};

export default Chatbot;
