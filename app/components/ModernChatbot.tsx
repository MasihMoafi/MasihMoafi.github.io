'use client';

import React, { useState, useEffect, useRef } from 'react';
// import ReactMarkdown from 'react-markdown'; // Temporarily disabled
import { motion, AnimatePresence } from 'framer-motion';
import { useKokoroTTS } from '../Chatbot/KokoroTTS';
import { 
  MessageCircle, 
  X, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Send, 
  Trash2,
  Loader2,
  Bot,
  User
} from 'lucide-react';

type Message = {
  text: string;
  sender: 'user' | 'bot';
  image?: string;
  source?: string;
  video?: string;
  fileName?: string;
  timestamp?: Date;
};

export default function ModernChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const modelSize = 'qwen3:8b';
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatSessionId') || `session_${Date.now()}`;
    }
    return `session_${Date.now()}`;
  });

  const { speak: kokoroSpeak, isSpeaking: kokoroIsSpeaking, error: kokoroError, stopSpeaking } = useKokoroTTS();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSessionId', sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    setIsSpeaking(kokoroIsSpeaking);
  }, [kokoroIsSpeaking]);

  const speak = async (text: string) => {
    if (!isTTSEnabled || !text || text.trim() === "") return;
    
    try {
      setIsSpeaking(true);
      await kokoroSpeak(text);
    } catch (error) {
      console.error("TTS failed:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = inputText.trim();
    const timestamp = new Date();
    
    try {
      setIsLoading(true);
      
      setMessages(prev => [...prev, { text: userMessage, sender: 'user', timestamp }]);
      setInputText('');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      const data = await response.json();
      const botMessage: Message = { text: data.response, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
      
      if (isTTSEnabled) {
        try {
          await kokoroSpeak(botMessage.text);
        } catch (error) {
          console.error("TTS failed:", error);
        }
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      setMessages(prev => [...prev, { 
        text: `Error: ${error.message} - Verify the API is running properly`, 
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      setMessages([{ 
        text: "Chat history has been cleared. How can I help you today?", 
        sender: 'bot',
        timestamp: new Date()
      }]);
      
    } catch (error: any) {
      console.error('Failed to clear chat history:', error);
      setMessages(prev => [...prev, { 
        text: `Error clearing chat history: ${error.message}`, 
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleTTS = () => {
    if (isTTSEnabled && isSpeaking) {
      try {
        stopSpeaking();
      } catch (err) {
        console.error("Error stopping speech:", err);
      }
    }
    
    setIsTTSEnabled(prev => !prev);
    
    setMessages(prev => [
      ...prev, 
      {
        text: !isTTSEnabled 
          ? "Text-to-speech enabled. Bot responses will be spoken aloud." 
          : "Text-to-speech disabled. Bot responses will be silent.",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      const welcomeMessage = "Welcome to Masih's website. Let me know if I can be of any assistance to you.";
      
      if (messages.length === 0) {
        setMessages([{ text: welcomeMessage, sender: 'bot', timestamp: new Date() }]);
      }
      
      if (isTTSEnabled) {
        setTimeout(() => {
          speak(welcomeMessage).catch(err => {
            console.error("Failed to speak welcome message:", err);
          });
        }, 300);
      }
    }
  }, [isOpen]);

  const chatVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed z-50 ${
              isFullScreen
                ? 'inset-4'
                : 'bottom-6 right-6 w-96 h-[32rem]'
            } bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200`}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-white/80">
                    {isSpeaking ? 'Speaking...' : 'Online'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTTS}
                  className={`p-2 rounded-lg transition-all ${
                    isTTSEnabled ? 'bg-white/20' : 'bg-red-500/50'
                  }`}
                  title={isTTSEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
                >
                  {isTTSEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFullScreen}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                  title={isFullScreen ? "Exit full screen" : "Full screen"}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white border-2 border-gray-200 text-gray-600'
                    }`}>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    
                    <div className={`rounded-2xl px-4 py-2 max-w-full ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200'
                    }`}>
                      {message.sender === 'bot' ? (
                        <div className="text-sm whitespace-pre-wrap">
                          {message.text}
                        </div>
                      ) : (
                        <p className="text-sm">{message.text}</p>
                      )}
                      
                      {message.timestamp && (
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {(isLoading || isSpeaking) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-600 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-200">
                      <div className="flex items-center space-x-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                        {isSpeaking && <Volume2 className="w-4 h-4 text-indigo-600" />}
                        <span className="text-sm text-gray-600">
                          {isSpeaking ? 'Speaking...' : 'Processing...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearChat}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </motion.button>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 text-sm"
                  dir="auto"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}