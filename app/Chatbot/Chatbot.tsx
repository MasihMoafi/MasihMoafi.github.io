'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { useKokoroTTS } from './KokoroTTS';

type Message = {
  text: string;
  sender: 'user' | 'bot';
  image?: string;
  source?: string;
  video?: string;
  fileName?: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const modelSize = 'qwen3:8b'; // Using default model without size specification
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatSessionId') || `session_${Date.now()}`;
    }
    return `session_${Date.now()}`;
  });

  // Use our custom Kokoro TTS hook
  const { speak: kokoroSpeak, isSpeaking: kokoroIsSpeaking, error: kokoroError, stopSpeaking } = useKokoroTTS();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSessionId', sessionId);
    }
  }, [sessionId]);

  // Update isSpeaking state from Kokoro
  useEffect(() => {
    setIsSpeaking(kokoroIsSpeaking);
  }, [kokoroIsSpeaking]);

  // Simplified speak function that only runs when TTS is enabled
  const speak = async (text: string) => {
    if (!isTTSEnabled || !text || text.trim() === "") return;
    
    try {
      setIsSpeaking(true);
      // Use the TTS API
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
    
    try {
      setIsLoading(true);
      
      setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
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
      const botMessage: Message = { text: data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
      
      // Only call speak if TTS is enabled - completely bypass otherwise
      if (isTTSEnabled) {
        try {
          console.log("Speaking bot response");
          await kokoroSpeak(botMessage.text);
        } catch (error) {
          console.error("TTS failed:", error);
          // Continue without speech if TTS fails
        }
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      setMessages(prev => [...prev, { 
        text: `Error: ${error.message} - Verify the API is running properly`, 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to clear chat history
  const handleClearChat = async () => {
    try {
      setIsLoading(true);
      
      // Call the clear API endpoint
      const response = await fetch('/api/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: sessionId,
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      // Reset local messages state
      setMessages([{ 
        text: "Chat history has been cleared. How can I help you today?", 
        sender: 'bot' 
      }]);
      
    } catch (error: any) {
      console.error('Failed to clear chat history:', error);
      setMessages(prev => [...prev, { 
        text: `Error clearing chat history: ${error.message}`, 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Welcome message when chatbot opens - with conditional TTS
  useEffect(() => {
    if (isOpen) {
      const welcomeMessage = "Welcome to Joe's website. Let me know if I can be of any assistance to you.";
      
      // Add welcome message to the messages if it's empty
      if (messages.length === 0) {
        setMessages([{ text: welcomeMessage, sender: 'bot' }]);
      }
      
      // Only attempt to speak if TTS is enabled
      if (isTTSEnabled) {
        // Use setTimeout to ensure DOM is ready before speaking
        setTimeout(() => {
          speak(welcomeMessage).catch(err => {
            console.error("Failed to speak welcome message:", err);
          });
        }, 300);
      }
    }
  }, [isOpen]);

  // Determine styles based on fullscreen state
  const chatWindowStyle: React.CSSProperties = {
    width: isFullScreen ? '90vw' : '400px',
    height: isFullScreen ? '90vh' : 'auto',
    position: isFullScreen ? 'fixed' : 'relative',
    top: isFullScreen ? '5vh' : 'auto',
    left: isFullScreen ? '5vw' : 'auto',
    zIndex: isFullScreen ? 1100 : 1000,
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
  };

  const iconButtonStyle: React.CSSProperties = {
    padding: '8px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#31616c',
    color: '#fff',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const messageContainerStyle: React.CSSProperties = {
    flex: '1',
    minHeight: 0,
    overflowY: 'auto',
    marginBottom: '16px',
    padding: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    color: '#000000',
  };

  const messageBubbleStyle = (sender: 'user' | 'bot'): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: sender === 'user' ? 'flex-end' : 'flex-start',
    marginBottom: '12px',
    maxWidth: '100%',
  });

  // Add a function to detect Farsi text
  const isFarsiText = (text: string): boolean => {
    // Persian/Farsi Unicode range
    const farsiPattern = /[\u0600-\u06FF]/;
    return farsiPattern.test(text);
  };

  const textStyle = (sender: 'user' | 'bot', text: string): React.CSSProperties => {
    const isRTL = isFarsiText(text);
    
    return {
      display: 'inline-block',
      padding: '8px 12px',
      borderRadius: '12px',
      backgroundColor: sender === 'user' ? '#31616c' : '#e5e7eb',
      color: sender === 'user' ? '#ffffff' : '#000000',
      maxWidth: '80%',
      wordWrap: 'break-word',
      fontWeight: '500',
      direction: isRTL ? 'rtl' : 'ltr',
      textAlign: isRTL ? 'right' : 'left',
    };
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: '1',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    color: '#333',
  };

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '4px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#31616c',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
  };

  const toggleButtonStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#31616c',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontSize: '20px',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const clearButtonStyle: React.CSSProperties = {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
  };

  // Button for toggling TTS functionality
  const toggleTTS = () => {
    console.log(`Toggling TTS from ${isTTSEnabled} to ${!isTTSEnabled}`);
    
    // If turning off TTS while speaking, stop immediately
    if (isTTSEnabled && isSpeaking) {
      try {
        stopSpeaking();
      } catch (err) {
        console.error("Error stopping speech:", err);
      }
    }
    
    setIsTTSEnabled(prev => !prev);
    
    // Show message about TTS status
    setMessages(prev => [
      ...prev, 
      {
        text: !isTTSEnabled 
          ? "Text-to-speech enabled. Bot responses will be spoken aloud." 
          : "Text-to-speech disabled. Bot responses will be silent.",
        sender: 'bot'
      }
    ]);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {isOpen ? (
        <div style={chatWindowStyle}>
          <div style={headerStyle}>
            <div style={titleStyle}>AI Assistant</div>
            <div style={buttonContainerStyle}>
              <button 
                onClick={toggleFullScreen} 
                style={iconButtonStyle}
                title={isFullScreen ? "Exit full screen" : "Full screen"}
              >
                {isFullScreen ? '⊙' : '⊕'}
              </button>
              <button 
                onClick={toggleTTS} 
                style={{
                  ...iconButtonStyle,
                  backgroundColor: isTTSEnabled ? '#31616c' : '#ff4444'
                }}
                title={isTTSEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
              >
                {isTTSEnabled ? '🔊' : '🔇'}
              </button>
              <button onClick={() => setIsOpen(false)} style={iconButtonStyle} title="Close">×</button>
            </div>
          </div>

          <div ref={chatContainerRef} style={messageContainerStyle}>
            {messages.map((msg, index) => (
              <div key={index} style={messageBubbleStyle(msg.sender)}>
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Uploaded" 
                    style={{ 
                      maxWidth: '200px', 
                      borderRadius: '8px', 
                      marginBottom: '8px',
                      display: 'block',
                      marginLeft: msg.sender === 'user' ? 'auto' : '0',
                      marginRight: msg.sender === 'user' ? '0' : 'auto',
                    }} 
                  />
                )}
                <div style={textStyle(msg.sender, msg.text)}>
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.fileName && (
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '4px',
                    fontStyle: 'italic',
                  }}>
                    File: {msg.fileName}
                  </div>
                )}
                {msg.source && (
                  <div style={{
                    fontSize: '10px',
                    color: '#666',
                    marginTop: '4px',
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                  }}>
                    Source: {msg.source}
                  </div>
                )}
              </div>
            ))}
            {(isLoading || isSpeaking) && (
              <div style={{ 
                textAlign: 'center', 
                padding: '8px', 
                color: '#31616c',
                fontStyle: 'italic'
              }}>
                {isSpeaking ? '🔊 Speaking...' : '⏳ Processing...'}
              </div>
            )}
          </div>

          <div style={inputContainerStyle}>
            <div style={buttonRowStyle}>
              <button 
                onClick={handleClearChat}
                style={clearButtonStyle}
                disabled={isLoading}
              >
                Clear Chat
              </button>
              
            </div>

            <div style={inputRowStyle}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                style={inputStyle}
                placeholder="Type your message..."
                disabled={isLoading}
                dir="auto"
              />
              <button
                onClick={() => {
                  handleSendMessage();
                }}
                style={{
                  backgroundColor: '#31616c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !inputText.trim() ? 0.5 : 1,
                }}
                disabled={isLoading || !inputText.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={toggleButtonStyle}
          title="Open AI Assistant"
        >
          💬
        </button>
      )}
    </div>
  );
}
