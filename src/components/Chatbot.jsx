import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";
import chatbotIcon from "../assets/chatbot-icon.svg";
import sendIcon from "../assets/send-icon.svg";

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
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            role: "model",
            parts: [
              {
                text: "Halo! Saya SI-RAJU AI, asisten virtual Anda. Ada yang bisa saya bantu terkait pemilihan jurusan atau kuis di website ini?",
              },
            ],
          },
        ]);
      }
      scrollToBottom();

      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;
    const userMessage = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages.slice(-10) }),
      });
      const data = await response.json();
      if (!response.ok) throw data;
      const botMessage = { role: "model", parts: [{ text: data.reply }] };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        role: "model",
        parts: [{ text: "Maaf, terjadi kesalahan pada server." }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? "chat-is-open" : ""}`}>
      {/* Overlay Gelap (Hanya muncul di Mobile via CSS) */}
      <div className="mobile-modal-overlay" onClick={toggleChat}></div>

      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <h3>SI-RAJU AI</h3>
          <button onClick={toggleChat} className="chat-close-btn">
            <img src={closeIconDataUrl} alt="Close" />
          </button>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-bubble ${
                msg.role === "user" ? "user" : "model"
              }`}
            >
              <p>{msg.parts[0].text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble model">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ketik pertanyaanmu..."
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="send-btn"
          >
            {isLoading ? "..." : <img src={sendIcon} alt="Send" />}
          </button>
        </div>
      </div>

      <button onClick={toggleChat} className="chatbot-fab">
        <img src={chatbotIcon} alt="Chatbot" />
      </button>
    </div>
  );
}
