'use client';

import React, { useState, useEffect, useRef } from 'react';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

export default function SimpleChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      const botMessage: Message = { text: data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const chatWindowStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px',
    height: '500px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
  };

  const headerStyle: React.CSSProperties = {
    padding: '10px',
    backgroundColor: '#f1f1f1',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const messageContainerStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
  };

  const messageBubbleStyle = (sender: 'user' | 'bot'): React.CSSProperties => ({
    marginBottom: '10px',
    textAlign: sender === 'user' ? 'right' : 'left',
  });

  const textBubbleStyle = (sender: 'user' | 'bot'): React.CSSProperties => ({
    display: 'inline-block',
    padding: '10px',
    borderRadius: '10px',
    backgroundColor: sender === 'user' ? '#007bff' : '#f1f1f1',
    color: sender === 'user' ? '#fff' : '#000',
  });

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ccc',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginRight: '10px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 15px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  };

  const toggleButtonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
  };

  return (
    <div>
      {isOpen ? (
        <div style={chatWindowStyle}>
          <div style={headerStyle}>
            <span>Chat</span>
            <button onClick={() => setIsOpen(false)}>&times;</button>
          </div>
          <div ref={chatContainerRef} style={messageContainerStyle}>
            {messages.map((msg, index) => (
              <div key={index} style={messageBubbleStyle(msg.sender)}>
                <div style={textBubbleStyle(msg.sender)}>{msg.text}</div>
              </div>
            ))}
            {isLoading && <div>Loading...</div>}
          </div>
          <div style={inputContainerStyle}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              style={inputStyle}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage} style={buttonStyle}>Send</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} style={toggleButtonStyle}>
          💬
        </button>
      )}
    </div>
  );
}
