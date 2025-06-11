import React, { useState, useEffect, useRef } from "react";
import "./ChatPanel.css";
import axios from "axios";

const ChatPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChat, setActiveChat] = useState("valero");
  const [messages, setMessages] = useState({
    team: [
      {
        id: 1,
        sender: "Anna",
        text: "Hallo Team, wie läuft das neue Projekt?",
        isBot: false,
        time: "09:15",
      },
      {
        id: 2,
        sender: "Max",
        text: "Wir sind im Zeitplan. Die erste Phase ist abgeschlossen.",
        isBot: false,
        time: "09:20",
      },
    ],
    customer: [
      {
        id: 1,
        sender: "Kunde XYZ",
        text: "Wann wird unsere Bestellung geliefert?",
        isBot: false,
        time: "10:05",
      },
      {
        id: 2,
        sender: "Support",
        text: "Die Lieferung ist für Donnerstag geplant.",
        isBot: true,
        time: "10:08",
      },
    ],
    valero: [
      {
        id: 1,
        sender: "System",
        text: "Willkommen im ERP-System! Wie kann ich dir helfen?",
        isBot: true,
        time: "09:30",
      },
      {
        id: 2,
        sender: "VALERO-KI",
        text: "Du kannst mich jederzeit nach Hilfe zu den Funktionen fragen.",
        isBot: true,
        time: "09:31",
      },
    ],
  });
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Autoscrolling bei Änderungen an Nachrichten, aktivem Chat oder Panel-Zustand
    useEffect(() => { scrollToBottom(); if (chatMessagesRef.current) { chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight; } }, [messages, activeChat, isExpanded]); useEffect(() => { const scrollTimer = setTimeout(() => { scrollToBottom(); if (chatMessagesRef.current) { chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight; } }, 100); return () => clearTimeout(scrollTimer); }, [messages]);

  // Zweiter useEffect speziell für neue Nachrichten mit Verzögerung
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      scrollToBottom();
      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop =
          chatMessagesRef.current.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [messages]);

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const switchChat = (chat) => {
    setActiveChat(chat);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Neue Nachricht vom User hinzufügen
    const userMessage = {
      id: messages[activeChat].length + 1,
      sender: "Ich",
      text: newMessage,
      isBot: false,
      time: timeString,
    };

    // Update des State mit der neuen Nachricht
    setMessages((prevMessages) => ({
      ...prevMessages,
      [activeChat]: [...prevMessages[activeChat], userMessage],
    }));

    // Eingabefeld zurücksetzen
    setNewMessage("");

    // Wenn VALERO-KI Chat, dann API-Antwort simulieren
    if (activeChat === "valero") {
      setIsLoading(true);

      try {
        // API-Aufruf zur KI (hier simuliert)
        // In einer echten Implementierung würde hier ein Aufruf an den KI-Service stehen
        setTimeout(async () => {
          // Optional: Echter API-Aufruf wenn verfügbar
          // const response = await axios.post('/api/ai', { query: newMessage });
          // const aiResponse = response.data.answer;

          const aiResponse = `Ich habe deine Nachricht "${newMessage}" erhalten und verarbeite sie.`;

          const botMessage = {
            id: messages[activeChat].length + 2,
            sender: "VALERO-KI",
            text: aiResponse,
            isBot: true,
            time: `${now.getHours()}:${(now.getMinutes() + 1).toString().padStart(2, "0")}`,
          };

          setMessages((prevMessages) => ({
            ...prevMessages,
            [activeChat]: [...prevMessages[activeChat], botMessage],
          }));

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Fehler bei der KI-Anfrage:", error);
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className={`chat-panel ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="chat-toggle" onClick={togglePanel}>
        {isExpanded ? "Chat minimieren" : "Chat öffnen"}
      </div>

      {isExpanded && (
        <div className="chat-content">
          <div className="chat-tabs">
            <div
              className={`chat-tab ${activeChat === "team" ? "active" : ""}`}
              onClick={() => switchChat("team")}
            >
              Team Chat
            </div>
            <div
              className={`chat-tab ${activeChat === "customer" ? "active" : ""}`}
              onClick={() => switchChat("customer")}
            >
              Kunden Chat
            </div>
            <div
              className={`chat-tab ${activeChat === "valero" ? "active" : ""}`}
              onClick={() => switchChat("valero")}
            >
              VALERO-KI
            </div>
          </div>

          <div className="chat-messages" ref={chatMessagesRef}>
            {messages[activeChat].map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.isBot ? "bot-message" : "user-message"}`}
              >
                <div className="message-sender">{msg.sender}</div>
                <div className="message-text">{msg.text}</div>
                <div className="message-time">{msg.time}</div>
              </div>
            ))}
            <div
              ref={messagesEndRef}
              style={{ float: "left", clear: "both" }}
            />
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Nachricht eingeben..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={isLoading || !newMessage.trim()}
            >
              {isLoading ? "..." : "Senden"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
