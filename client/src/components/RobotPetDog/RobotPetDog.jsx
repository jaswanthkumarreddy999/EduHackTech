import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { post, put } from '../../services/api.client';
import { MessageCircle, X, Send, Smile } from 'lucide-react';
import './RobotPetDog.css';

const RobotPetDog = () => {
    const { user, token, loginUser } = useAuth();
    const navigate = useNavigate();
    const [showDialogue, setShowDialogue] = useState(false);
    const [dialogueText, setDialogueText] = useState('');
    const [showInterests, setShowInterests] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isAngry, setIsAngry] = useState(false);

    // Chat State
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! How can I help you today? I know a lot about career growth and tech!", sender: 'bot' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const domains = [
        'Web Development', 'Mobile Apps', 'AI/ML', 'Blockchain',
        'Cybersecurity', 'Cloud Computing', 'Data Science', 'IoT',
        'Game Dev', 'DevOps', 'UI/UX Design', 'AR/VR'
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, showChat]);

    // Global trigger for angry state
    useEffect(() => {
        const handleAngryTrigger = () => {
            if (!user) {
                setIsAngry(true);
                setDialogueText("GRRR! You can't see this unless you're one of my humans! Log in or Register first! 🦴");
                setShowDialogue(true);
                setIsVisible(true);

                // Redirect after a delay
                setTimeout(() => {
                    navigate('/login');
                    // Reset after redirecting
                    setTimeout(() => {
                        setIsAngry(false);
                        setShowDialogue(false);
                    }, 2000);
                }, 3000);
            }
        };

        window.addEventListener('robot-dog-trigger-angry', handleAngryTrigger);
        return () => window.removeEventListener('robot-dog-trigger-angry', handleAngryTrigger);
    }, [user, navigate]);

    // Scroll and Visibility Logic
    useEffect(() => {
        const handleScroll = () => {
            const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;

            if (!user) {
                // For guests, always visible to remind them
                setIsVisible(true);
            } else if (user && (!user.interests || user.interests.length === 0)) {
                // For new users without interests, show the modal directly and keep dog visible
                setIsVisible(true);
                setShowInterests(true);
            } else {
                // For old users, only show at the end of scroll
                setIsVisible(isAtBottom || showChat); // Keep visible if chat is open
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check once on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, [user, showChat]);

    useEffect(() => {
        // Initial State Logic
        if (!user) {
            if (!isAngry) {
                setDialogueText("Woof! You look new here! Why not log in or register to join the fun?");
                setShowDialogue(true);
            }
        } else if (user && (!user.interests || user.interests.length === 0)) {
            setDialogueText("Woof woof! I want to show you the best stuff. What are you interested in? Pick 3!");
            setShowDialogue(true);
        } else {
            // If chat is NOT open, do the normal dialogue logic
            if (!showChat) {
                setDialogueText("I've sniffed out some great courses and hackathons for you! Check them out at the top!");
                const timer = setTimeout(() => setShowDialogue(false), 5000);
                return () => clearTimeout(timer);
            } else {
                setShowDialogue(false);
            }
        }
    }, [user, isAngry, showChat]);

    const handleDogClick = () => {
        if (!user) {
            window.dispatchEvent(new CustomEvent('robot-dog-trigger-angry'));
        } else if (user && (!user.interests || user.interests.length === 0)) {
            setShowInterests(true);
        } else {
            // Toggle Chat Window
            setShowChat(!showChat);
            setShowDialogue(false);
        }
    };

    const toggleInterest = (domain) => {
        if (selectedInterests.includes(domain)) {
            setSelectedInterests(selectedInterests.filter(i => i !== domain));
        } else if (selectedInterests.length < 3) {
            setSelectedInterests([...selectedInterests, domain]);
        }
    };

    const saveInterests = async () => {
        if (selectedInterests.length !== 3) return;

        setIsSaving(true);
        try {
            const response = await put('/auth/profile', { interests: selectedInterests }, token);
            if (response.success) {
                // Update local user state
                const updatedUser = { ...user, interests: selectedInterests };
                loginUser(updatedUser, token);
                setShowInterests(false);
                setDialogueText("Awesome! I've updated your feed! I'll pop up when you need more help! 🐾✨");
                setShowDialogue(true);
            }
        } catch (error) {
            console.error('Failed to save interests:', error);
        } finally {
            setIsSaving(false);
        }
    };

    /* --- Chat Logic --- */
    /* --- Chat Logic --- */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = inputMessage;
        // Optimistic Update
        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await post('/ai/chat', {
                message: userMsg,
                history: messages
            }, token);

            if (response && response.success) {
                setMessages(prev => [...prev, { text: response.response, sender: 'bot' }]);
            } else {
                // Fallback if API fails (or key missing)
                setMessages(prev => [...prev, { text: "Woof... I'm having trouble connecting to my brain! Try again later. 🦴", sender: 'bot' }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { text: "Woof... something went wrong. Check my connection!", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`pet-dog-container ${isVisible ? 'visible' : ''} ${isAngry ? 'angry-shake' : ''}`}>

            {/* --- Chat Window --- */}
            {showChat && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3><Smile size={18} className="text-blue-500" /> Robo-Pet Chat</h3>
                        <button onClick={() => setShowChat(false)} className="close-chat-btn">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="chat-input-area">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Ask for advice..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                        />
                        <button type="submit" className="send-btn">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* --- Interest Modal --- */}
            {showInterests && (
                <div className="interest-modal">
                    <h3>Pick 3 Interests 🐾</h3>
                    <div className="interest-grid">
                        {domains.map(domain => (
                            <div
                                key={domain}
                                className={`interest-item ${selectedInterests.includes(domain) ? 'selected' : ''}`}
                                onClick={() => toggleInterest(domain)}
                            >
                                {domain}
                            </div>
                        ))}
                    </div>
                    <button
                        className="save-btn"
                        disabled={selectedInterests.length !== 3 || isSaving}
                        onClick={saveInterests}
                    >
                        {isSaving ? 'Sniffing...' : 'Let\'s Go!'}
                    </button>
                </div>
            )}

            {showDialogue && !showChat && (
                <div className="speech-bubble">
                    {dialogueText}
                </div>
            )}

            <div className="pet-dog-wrapper" onClick={handleDogClick}>
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg animate-bounce z-10">
                    {showChat ? <X size={16} /> : <MessageCircle size={16} />}
                </div>
                <svg width="120" height="120" viewBox="0 0 200 200">
                    {/* Dog Body */}
                    <rect x="60" y="100" width="80" height="60" rx="30" fill="#E2E8F0" />
                    <rect x="70" y="110" width="60" height="40" rx="20" fill="#CBD5E1" />

                    {/* Tail */}
                    <g className="dog-tail">
                        <path d="M140 130 Q160 110 170 130" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" fill="none" />
                    </g>

                    {/* Legs */}
                    <rect x="75" y="150" width="15" height="25" rx="7.5" fill="#94A3B8" />
                    <rect x="110" y="150" width="15" height="25" rx="7.5" fill="#94A3B8" />

                    {/* Head */}
                    <g className="dog-head">
                        <rect x="65" y="50" width="90" height="70" rx="35" fill="#F8FAFC" />
                        <circle cx="95" cy="85" r="8" className={`dog-eye ${isAngry ? 'angry-eye' : ''}`} fill="#1E293B" />
                        <circle cx="135" cy="85" r="8" className={`dog-eye ${isAngry ? 'angry-eye' : ''}`} fill="#1E293B" />
                        <rect x="105" y="95" width="20" height="12" rx="6" fill="#475569" /> {/* Nose */}

                        {/* Ears */}
                        <path d="M70 60 Q50 30 65 20" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="4" />
                        <path d="M150 60 Q170 30 155 20" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="4" />
                    </g>

                    {/* Antena (Robot feel) */}
                    <line x1="110" y1="50" x2="110" y2="30" stroke={isAngry ? "#ef4444" : "#3B82F6"} strokeWidth="4" />
                    <circle cx="110" cy="25" r="5" fill={isAngry ? "#ef4444" : "#3B82F6"}>
                        <animate attributeName="fill" values={isAngry ? "#ef4444;#f87171;#ef4444" : "#3B82F6;#60A5FA;#3B82F6"} dur="2s" repeatCount="indefinite" />
                    </circle>
                </svg>
            </div>
        </div>
    );
};

export default RobotPetDog;
