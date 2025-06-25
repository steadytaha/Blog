import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { debug } from '../utils/debug.js';
import { useSelector } from 'react-redux';

// Constants
const CHATBOT_CONFIG = {
  ANIMATION_DURATION: 300,
  MAX_MESSAGE_LENGTH: 500,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 5, // Reduced to match backend rate limit
  API_ENDPOINT: '/api/chatbot',
  STORAGE_KEY: 'chatbot_messages'
};

const CHATBOT_STYLES = {
  PANEL_WIDTH: 'w-96',
  PANEL_HEIGHT: 'h-[600px]',
  ICON_SIZE: 'w-14 h-14',
  BORDER_RADIUS: 'rounded-2xl',
  SHADOW: 'shadow-2xl',
  GLASS_EFFECT: 'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80'
};

export default function ChatbotPanel() {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [rateLimitCount, setRateLimitCount] = useState(0);
  const [rateLimitResetTime, setRateLimitResetTime] = useState(Date.now());

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHATBOT_CONFIG.STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        debug.error('Failed to load chat history', error);
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHATBOT_CONFIG.STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), CHATBOT_CONFIG.ANIMATION_DURATION);
    }
  }, [isOpen]);

  const checkRateLimit = () => {
    const now = Date.now();
    if (now - rateLimitResetTime > CHATBOT_CONFIG.RATE_LIMIT_WINDOW) {
      setRateLimitCount(0);
      setRateLimitResetTime(now);
      return true;
    }
    
    if (rateLimitCount >= CHATBOT_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      return false;
    }
    
    return true;
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendMessage = async () => {
    const messageText = inputValue.trim();
    
    if (!messageText || messageText.length > CHATBOT_CONFIG.MAX_MESSAGE_LENGTH) {
      return;
    }

    if (!currentUser) {
        const errorMessage = {
            id: generateMessageId(),
            text: 'Please sign in to use the chat feature.',
            sender: 'bot',
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
    }

    if (!checkRateLimit()) {
      const errorMessage = {
        id: generateMessageId(),
        text: 'Rate limit exceeded. Please wait before sending more messages.',
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add user message
    const userMessage = {
      id: generateMessageId(),
      text: messageText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setRateLimitCount(prev => prev + 1);

    try {
      // NOTE: The browser will automatically send the auth cookie.
      // No manual token handling is needed here.
      const response = await fetch(CHATBOT_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText })
      });

      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const botMessage = {
        id: generateMessageId(),
        text: data.reply || "I apologize, but I couldn't process your message.",
        sender: 'bot',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      debug.error('Chatbot error:', error);
      
      let errorText = 'Sorry, I encountered an error. Please try again later.';
      
      if (error.message === 'Rate limit exceeded') {
        errorText = 'You\'re sending messages too quickly. Please wait a moment before trying again.';
      } else if (error.message === 'Failed to send message') {
        errorText = 'Unable to connect to the AI service. Please check your connection and try again.';
      }
      
      const errorMessage = {
        id: generateMessageId(),
        text: errorText,
        sender: 'bot',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    try {
      // Clear on server
      const response = await fetch('/api/chatbot/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Clear local storage and state - return to initial empty state
        setMessages([]);
        localStorage.removeItem(CHATBOT_CONFIG.STORAGE_KEY);
      }
    } catch (error) {
      debug.error('Failed to clear chat:', error);
      // Fallback to local clear only
      setMessages([]);
      localStorage.removeItem(CHATBOT_CONFIG.STORAGE_KEY);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={toggleChat}
            className={`${CHATBOT_STYLES.ICON_SIZE} ${CHATBOT_STYLES.BORDER_RADIUS} ${CHATBOT_STYLES.SHADOW} 
              ${theme === 'dark' ? 'bg-[#9DC88D] text-black' : 'bg-[#4D774E] text-white'}
              flex items-center justify-center transition-all duration-300 hover:scale-110
              animate-pulse hover:animate-none`}
            aria-label="Open chat"
          >
            <MessageCircle className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 ${CHATBOT_STYLES.PANEL_WIDTH} ${CHATBOT_STYLES.PANEL_HEIGHT}
          ${CHATBOT_STYLES.BORDER_RADIUS} ${CHATBOT_STYLES.SHADOW} ${CHATBOT_STYLES.GLASS_EFFECT}
          border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-[#9DC88D]' : 'bg-[#4D774E]'} flex items-center justify-center`}>
              <Bot className={`w-6 h-6 ${theme === 'dark' ? 'text-black' : 'text-white'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Multilingual • Session-aware</p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Messages Container */}
        <div className={`flex-grow overflow-y-auto overflow-x-hidden p-4 space-y-3 scrollbar-thin scrollbar-thumb-rounded-full
          ${theme === 'dark' ? 'scrollbar-track-gray-800/50 scrollbar-thumb-gray-600/50' : 'scrollbar-track-gray-200 scrollbar-thumb-gray-400'}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Start a conversation!</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Ask me about blog posts, projects, or just chat!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                   {message.sender === 'bot' && (
                     <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                       <Bot className="w-5 h-5" />
                     </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? `${theme === 'dark' ? 'bg-[#9DC88D] text-black' : 'bg-[#4D774E] text-white'} rounded-br-none`
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{message.text}</p>
                  </div>
                   {message.sender === 'user' && (
                     <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20">
                       <User className="w-5 h-5" />
                     </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                   <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                     <Bot className="w-5 h-5" />
                   </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${theme === 'dark' ? 'bg-[#9DC88D]' : 'bg-[#4D774E]'} rounded-full animate-bounce`} style={{animationDelay: '0ms'}} />
                      <div className={`w-2 h-2 ${theme === 'dark' ? 'bg-[#9DC88D]' : 'bg-[#4D774E]'} rounded-full animate-bounce`} style={{animationDelay: '100ms'}} />
                      <div className={`w-2 h-2 ${theme === 'dark' ? 'bg-[#9DC88D]' : 'bg-[#4D774E]'} rounded-full animate-bounce`} style={{animationDelay: '200ms'}} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50">
           <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              maxLength={CHATBOT_CONFIG.MAX_MESSAGE_LENGTH}
              className={`w-full flex-1 bg-transparent pl-4 pr-12 py-3 text-sm rounded-full transition-all
                ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:ring-1 focus:ring-[#9DC88D] focus:border-[#9DC88D]'
                    : 'bg-gray-100 text-gray-900 placeholder-gray-500 border border-gray-300 focus:ring-1 focus:ring-[#4D774E] focus:border-[#4D774E]'
                }
                focus:outline-none`}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-[7px] top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full
                ${theme === 'dark' ? 'bg-[#9DC88D] text-black' : 'bg-[#4D774E] text-white'}
                hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 hover:scale-105 disabled:hover:scale-100`}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            {messages.length > 0 ? (
              <button
                onClick={clearChat}
                className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 
                  dark:hover:text-gray-200"
              >
                Clear Chat
              </button>
            ) : <div />}
            <p className="text-gray-400 dark:text-gray-500">
              {inputValue.length}/{CHATBOT_CONFIG.MAX_MESSAGE_LENGTH}
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 