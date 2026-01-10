import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";
import chatbotIcon from "../assets/chatbot-icon.svg";
import sendIcon from "../assets/send-icon.svg";

/* ===== ICON CLOSE ===== */
const closeIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
`;
const closeIconDataUrl = `data:image/svg+xml;base64,${btoa(closeIconSvg)}`;

/* ===== GANTI DENGAN URL BACKEND VERCEL KAMU ===== */
const API_URL = "https://si-raju-backend.vercel.app/api/chat";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* ===== AUTO SCROLL ===== */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ===== GREETING SAAT DIBUKA ===== */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "model",
          text:
            "Halo! Saya SI-RAJU AI 🤖\nSaya bisa membantu kamu memahami jurusan kuliah dan cara kerja kuis rekomendasi.\nSilakan bertanya 😊",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const toggleChat = () => setIsOpen((prev) => !prev);

  /* ===== KIRIM PESAN ===== */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Jika respons tidak ok, server seharusnya mengirim pesan error di `data.reply`
        const serverError =
          data.reply || "⚠️ Maaf, server sedang bermasalah.\nSilakan coba lagi beberapa saat.";
        throw new Error(serverError);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: error.message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? "chat-is-open" : ""}`}>
      <div className="mobile-modal-overlay" onClick={toggleChat}></div>

      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        {/* ===== HEADER ===== */}
        <div className="chat-header">
          <h3>SI-RAJU AI</h3>
          <button onClick={toggleChat} className="chat-close-btn">
            <img src={closeIconDataUrl} alt="Close" />
          </button>
        </div>

        {/* ===== MESSAGES ===== */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-bubble ${
                msg.role === "user" ? "user" : "model"
              }`}
            >
              <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
