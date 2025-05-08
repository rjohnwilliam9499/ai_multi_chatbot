"use client";
import { useState } from "react";
import { formatMessage } from "@/utils";
import "./chatbot.css";
export const index = () => {
  const [model, setModel] = useState("QWEN3");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const modals = [
    {
      name: "Qwen 3",
      value: "QWEN3",
    },
    {
      name: "DeepSeek v2",
      value: "DEEPSEEKV2",
    },
    {
      name: "Llama 4",
      value: "LLAMA4",
    },
  ];
  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, model }),
      });

      if (!res.ok) throw new Error("API error");
      debugger;
      const data = await res.json();

      setMessages([
        ...updatedMessages,
        { role: data.modalName, content: data.reply || "No response." },
      ]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "⚠️ Failed to get response." },
      ]);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbotContainer">
      <h1 className="title">🤖 AI Agent </h1>

      <div className="model-select">
        <label>Choose Model:</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="model-dropdown"
        >
          {modals.map((modal) => (
            <option key={modal.value} value={modal.value}>
              {modal.name}
            </option>
          ))}
        </select>
      </div>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${
              msg.role === "user" ? "user-message" : "bot-message"
            }`}
          >
            <div
              className="message-bubble"
              style={{
                fontFamily: msg.content.trim().startsWith("```")
                  ? "monospace"
                  : "inherit",
              }}
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
            />
            <div
              className={` message-role ${
                msg.role === "user" ? "user-role" : "bot-role"
              }`}
            >
              {msg.role === "user" ? "User" : msg.role}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot-message">🤖 Bot is thinking...</div>
        )}
      </div>

      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default index;
