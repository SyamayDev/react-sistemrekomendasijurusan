import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import chatbotIcon from '../assets/chatbot-icon.png';
import closeIcon from '../assets/close-icon.svg'; // I'll create this as a simple SVG string

// A simple close icon SVG as a string
const closeIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
`;
const closeIconDataUrl = `data:image/svg+xml;base64,${btoa(closeIconSvg)}`;


export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        // Greet the user when the chat opens for the first time
        if (messages.length === 0) {
            setMessages([
                { role: 'model', parts: [{text: "Halo! Saya Jurusan AI, asisten virtual Anda. Ada yang bisa saya bantu terkait pemilihan jurusan atau kuis di website ini?"}] }
            ]);
        }
        scrollToBottom();
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            message: input,
            history: messages.slice(-10) 
        }),
      });

      // Always try to parse the JSON body, for both success and error cases.
      const data = await response.json();

      if (!response.ok) {
        // If the response is not OK, the `data` object is the error payload from our server.
        // We throw it to be caught by the catch block below.
        throw data;
      }

      const botMessage = { role: 'model', parts: [{ text: data.reply }] };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      // The `error` object here will now be the detailed JSON object from the server.
      console.error("Detailed error from server:", error);
      
      const displayMessage = error.details || error.message || "Terjadi kesalahan pada server. Cek konsol.";
      const errorMessage = { role: 'model', parts: [{ text: `Maaf, terjadi kesalahan. ${displayMessage}` }] };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>Jurusan AI</h3>
          <button onClick={toggleChat} className="chat-close-btn">
            <img src={closeIconDataUrl} alt="Close" />
          </button>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.role === 'user' ? 'user' : 'model'}`}>
              <p>{msg.parts[0].text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble model">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pertanyaanmu..."
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading}>
            {isLoading ? '...' : 'Kirim'}
          </button>
        </div>
      </div>
      <button onClick={toggleChat} className="chatbot-fab">
        <img src={chatbotIcon} alt="Chatbot" />
      </button>
    </div>
  );
}
