"use client";

import { useState, useEffect, useRef } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { analyticsTracker } from "@/lib/analytics";

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Chatbot states
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hello! How can I help you today?', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  // Refs for auto-scroll and voice recognition
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token and get user data
      fetchUserProfile(token);
    }
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsVoiceSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setChatInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setVoiceError(`Voice recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
      }
    } catch {
      localStorage.removeItem('authToken');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    setHistoryIndex(-1); // Reset history index when typing
    setVoiceError(""); // Clear voice error when typing
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      navigateHistory('down');
    }
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (inputHistory.length === 0) return;

    let newIndex = historyIndex;
    if (direction === 'up') {
      newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
    } else {
      newIndex = Math.max(historyIndex - 1, -1);
    }

    setHistoryIndex(newIndex);
    if (newIndex === -1) {
      setChatInput("");
    } else {
      setChatInput(inputHistory[inputHistory.length - 1 - newIndex]);
    }
  };

  const startVoiceInput = () => {
    if (recognitionRef.current && !isListening && !isTyping) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setVoiceError("");
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setVoiceError('Failed to start voice recognition');
      }
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      
      // Validation
      if (isRegistering) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        setSuccess(data.message);
        
        // Reset form
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUser(null);
    setError("");
    setSuccess("");
    // Reset chatbot messages
    setMessages([{ sender: 'bot', text: 'Hello! How can I help you today?', timestamp: new Date() }]);
    setChatInput("");
    setInputHistory([]);
    setHistoryIndex(-1);
    setVoiceError("");
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    
    const userMessage = chatInput.trim();
    const userMsg = { sender: 'user', text: userMessage, timestamp: new Date() };
    
    // Add to input history
    if (userMessage && !inputHistory.includes(userMessage)) {
      setInputHistory(prev => [...prev, userMessage].slice(-10)); // Keep last 10 messages
    }
    
    // Track analytics
    analyticsTracker.startMessage();
    analyticsTracker.addUserMessage(userMessage);
    
    setMessages(msgs => [...msgs, userMsg]);
    setChatInput("");
    setHistoryIndex(-1);
    setVoiceError("");
    setIsTyping(true);

    // Simulate bot response with loading
    setTimeout(() => {
      const botResponse = `Hello ${user?.username}! You said: "${userMessage}". I'm here to help you with any questions you might have.`;
      const botMsg = { sender: 'bot', text: botResponse, timestamp: new Date() };
      
      // Track bot response analytics
      analyticsTracker.addBotMessage(botResponse);
      
      setMessages(msgs => [...msgs, botMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">AI Chatbot</h1>
              <span className="text-sm text-gray-500 dark:text-gray-300 transition-colors duration-300">Welcome, {user.username}!</span>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => window.location.href = '/analytics'}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                Analytics
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Chatbot Interface */}
        <div className="flex-1 max-w-4xl mx-auto w-full p-4">
          <div className="bg-white dark:bg-black rounded-lg shadow-lg h-[calc(100vh-140px)] flex flex-col border border-gray-200 dark:border-gray-800 transition-colors duration-300">
            {/* Messages Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-colors duration-300 ${
                    msg.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white border dark:border-gray-700'
                  }`}>
                    <div className="text-xs opacity-75 mb-1 flex justify-between">
                      <span>{msg.sender === 'user' ? 'You' : 'AI Assistant'}</span>
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-sm">{msg.text}</div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start animate-slide-in">
                  <div className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white border dark:border-gray-700 px-4 py-2 rounded-lg">
                    <div className="text-xs opacity-75 mb-1">AI Assistant</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
              {/* Voice Error Message */}
              {voiceError && (
                <div className="mb-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 px-3 py-2 rounded">
                  {voiceError}
                </div>
              )}
              
              <form onSubmit={handleChatSend} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={handleChatInputChange}
                    onKeyDown={handleChatKeyDown}
                    placeholder="Type your message... (Ctrl+↑/↓ for history)"
                    className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                    disabled={isTyping || isListening}
                    autoFocus
                  />
                  
                  {/* Voice Input Button */}
                  {isVoiceSupported && (
                    <button
                      type="button"
                      onClick={isListening ? stopVoiceInput : startVoiceInput}
                      disabled={isTyping}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-200 ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isListening ? 'Stop recording' : 'Start voice input'}
                    >
                      {isListening ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                  
                  {inputHistory.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded p-1 opacity-75">
                      History: {inputHistory.length} messages (Ctrl+↑/↓)
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isTyping || !chatInput.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isTyping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    'Send'
                  )}
                </button>
              </form>
              
              {/* Voice Input Status */}
              {isListening && (
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Listening... Speak now
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded shadow-lg animate-fade-in transition-colors duration-300">
            {success}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
            {isRegistering ? 'Create Account' : 'Login'}
          </h1>
        </div>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4 transition-colors duration-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-white mb-2 transition-colors duration-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                required
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white mb-2 transition-colors duration-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white mb-2 transition-colors duration-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              required
            />
          </div>
          
          {isRegistering && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-white mb-2 transition-colors duration-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              isRegistering ? 'Register' : 'Login'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
              setSuccess("");
              setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: ""
              });
            }}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors duration-300"
          >
            {isRegistering 
              ? 'Already have an account? Login' 
              : "Don't have an account? Register"
            }
          </button>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
          <p>Login or register to access the AI chatbot!</p>
        </div>
      </div>
    </div>
  );
}
