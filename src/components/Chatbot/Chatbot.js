import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Trash2, MessageSquare, ChevronRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);

    const suggestions = [
        "How do I get my first internship?",
        "I’m confused between AI and Web Dev",
        "What skills should I learn in 2026?",
        "How do I build a strong portfolio?"
    ];

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (text = inputValue) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || ''}/api/chat`, {
                messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
            });

            const assistantMessage = {
                role: 'assistant',
                content: response.data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            toast.error("Failed to connect to AlumConnect assistant.");
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
                error: true,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        toast.success("Chat cleared");
    };

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        toast.success("Copied to clipboard");
    };

    const formatResponse = (text) => {
        // Simple markdown-like formatting for bullets and bold
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .split('\n')
            .map((line, i) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return <li key={i}>{trimmed.substring(2)}</li>;
                }
                return line ? <p key={i}>{line}</p> : <br key={i} />;
            });

        // Wrap consecutive <li> into <ul>
        const processed = [];
        let currentList = [];

        formatted.forEach((item, i) => {
            if (item.type === 'li') {
                currentList.push(item);
            } else {
                if (currentList.length > 0) {
                    processed.push(<ul key={`list-${i}`}>{currentList}</ul>);
                    currentList = [];
                }
                processed.push(item);
            }
        });

        if (currentList.length > 0) {
            processed.push(<ul key={`list-final`}>{currentList}</ul>);
        }

        return processed;
    };

    return (
        <div className="chatbot-wrapper">
            {/* Toggle Button */}
            <motion.div
                className="chatbot-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <X size={30} /> : <MessageSquare size={30} />}
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chatbot-container"
                        initial={{ opacity: 0, y: 100, scale: 0.8, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <header className="chatbot-header">
                            <div className="header-left">
                                <div className="chatbot-avatar">A</div>
                                <div className="header-content">
                                    <div className="header-title-row">
                                        <h1 className="chatbot-header-title">AlumAssist</h1>
                                        <span className="chatbot-status-badge">
                                            <span className="chatbot-status-dot"></span>
                                            <span className="chatbot-status-text">Active now</span>
                                        </span>
                                    </div>
                                    <p className="chatbot-header-subtitle">Your Career Copilot</p>
                                </div>
                            </div>
                            <button onClick={clearChat} className="p-2 text-zinc-400 hover:text-white transition-colors" title="Clear Chat">
                                <Trash2 size={18} />
                            </button>
                        </header>

                        {/* Chat Area */}
                        <main className="chatbot-area">
                            {messages.length === 0 ? (
                                <div className="chatbot-empty-state">
                                    <div className="chatbot-welcome-text">
                                        <motion.h2
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            Stop overthinking. Let's build.
                                        </motion.h2>
                                        <p className="text-zinc-400 text-sm">Direct, practical career advice — no fluff.</p>
                                    </div>
                                    <div className="chatbot-suggestion-chips">
                                        {suggestions.map((text, i) => (
                                            <motion.button
                                                key={i}
                                                className="chatbot-suggestion-chip"
                                                onClick={() => handleSendMessage(text)}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <span className="chatbot-chip-text">{text}</span>
                                                <ChevronRight size={16} className="text-zinc-500" />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="chatbot-message-container">
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            className={`chatbot-message-bubble ${msg.role}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className="chatbot-message-content">
                                                {msg.role === 'assistant' ? formatResponse(msg.content) : msg.content}
                                            </div>
                                            {msg.role === 'assistant' && !msg.error && (
                                                <button
                                                    className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white opacity-0 hover:opacity-100 transition-opacity"
                                                    onClick={() => copyToClipboard(msg.content, i)}
                                                >
                                                    {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                                                </button>
                                            )}
                                            <span className="text-[10px] text-zinc-500 mt-1 self-end">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <motion.div
                                            className="chatbot-message-bubble assistant p-3 flex gap-2 items-center"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="flex gap-1">
                                                <motion.div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                                                <motion.div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                                                <motion.div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                                            </div>
                                            <span className="text-xs text-zinc-500">Thinking...</span>
                                        </motion.div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            )}
                        </main>

                        {/* Input Area */}
                        <footer className="chatbot-footer">
                            <div className="chatbot-input-container">
                                <textarea
                                    ref={textareaRef}
                                    className="chatbot-textarea"
                                    placeholder="Ask about career, skills..."
                                    rows={1}
                                    value={inputValue}
                                    onChange={(e) => {
                                        setInputValue(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    className="chatbot-send-button"
                                    disabled={!inputValue.trim() || isLoading}
                                    onClick={() => handleSendMessage()}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot;
