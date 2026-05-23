"use client";

import { useState, useEffect, useRef } from "react";

const OPENING_MESSAGE = `One thing before we begin — this is not a replacement for therapy, and I'm not here to do what a therapist does. If you're in a genuinely difficult place right now, please speak to someone who can properly support you. This works best when you bring something specific — a situation that's still bothering you, something that keeps coming up no matter what you try, or a decision you can't seem to land on. What's going on?`;

const COLORS = {
  navy: "#0D1829",
  slate: "#1E3A5F",
  steel: "#4A9ECC",
  red: "#E03535",
  ice: "#EDF4FA",
  cream: "#F5F1EB",
};

export default function ThinkClickApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const callAPI = async (msgs) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.text;
  };

  const startSession = () => {
    setStarted(true);
    setMessages([{ role: "assistant", content: OPENING_MESSAGE }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const text = await callAPI(
        newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
      );
      const updated = [...newMessages, { role: "assistant", content: text }];
      setMessages(updated);
      if (
        updated.length > 8 &&
        (text.includes("leaving with") || text.includes("came in with") || text.includes("taking away"))
      ) {
        setSessionComplete(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetSession = () => {
    setMessages([]);
    setStarted(false);
    setSessionComplete(false);
    setInput("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.navy,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          border-bottom: 1px solid rgba(74,158,204,0.15);
          background: rgba(13,24,41,0.95);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .logo-mark { display: flex; align-items: center; gap: 12px; }
        .logo-dot { width: 8px; height: 8px; background: #4A9ECC; border-radius: 50%; }
        .logo-text { font-size: 13px; font-weight: 600; letter-spacing: 0.12em; color: rgba(237,244,250,0.5); text-transform: uppercase; }
        .phase-hint { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; color: rgba(74,158,204,0.6); text-transform: uppercase; }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 48px 32px 32px;
          display: flex;
          flex-direction: column;
          max-width: 720px;
          width: 100%;
          margin: 0 auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(74,158,204,0.2) transparent;
        }
        .message-row { display: flex; margin-bottom: 32px; animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .message-row.user { justify-content: flex-end; }
        .message-row.assistant { justify-content: flex-start; }

        .bubble { max-width: 76%; padding: 16px 20px; font-size: 15px; line-height: 1.7; font-weight: 400; }
        .bubble.assistant { background: transparent; color: rgba(237,244,250,0.9); padding-left: 20px; border-left: 2px solid #4A9ECC; border-radius: 0; padding-right: 0; }
        .bubble.user { background: rgba(30,58,95,0.7); color: rgba(237,244,250,0.85); border: 1px solid rgba(74,158,204,0.2); border-radius: 2px; font-size: 14px; }

        .thinking-row { display: flex; margin-bottom: 32px; }
        .thinking-dots { display: flex; align-items: center; gap: 5px; border-left: 2px solid rgba(74,158,204,0.3); padding-left: 20px; height: 24px; }
        .dot { width: 5px; height: 5px; background: rgba(74,158,204,0.5); border-radius: 50%; animation: pulse 1.4s ease-in-out infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }

        .input-area { border-top: 1px solid rgba(74,158,204,0.12); padding: 24px 32px; background: rgba(13,24,41,0.95); }
        .input-inner { max-width: 720px; margin: 0 auto; display: flex; gap: 12px; align-items: flex-end; }
        .input-field { flex: 1; background: rgba(30,58,95,0.4); border: 1px solid rgba(74,158,204,0.2); border-radius: 2px; color: rgba(237,244,250,0.9); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 400; line-height: 1.6; padding: 14px 18px; resize: none; outline: none; transition: border-color 0.2s; min-height: 52px; max-height: 160px; }
        .input-field:focus { border-color: rgba(74,158,204,0.5); }
        .input-field::placeholder { color: rgba(237,244,250,0.25); }

        .send-btn { width: 52px; height: 52px; background: #4A9ECC; border: none; border-radius: 2px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s, opacity 0.2s; flex-shrink: 0; }
        .send-btn:hover:not(:disabled) { background: #5bb3e0; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .landing { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 32px; text-align: center; animation: fadeUp 0.6s ease both; }
        .landing-mark { width: 48px; height: 48px; border: 1.5px solid rgba(74,158,204,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px; }
        .landing-mark-inner { width: 8px; height: 8px; background: #4A9ECC; border-radius: 50%; }
        .landing-title { font-size: 28px; font-weight: 300; color: rgba(237,244,250,0.95); letter-spacing: -0.02em; margin-bottom: 16px; line-height: 1.3; }
        .landing-title strong { font-weight: 600; color: #fff; }
        .landing-sub { font-size: 15px; font-weight: 400; color: rgba(237,244,250,0.45); max-width: 380px; line-height: 1.7; margin-bottom: 48px; }

        .start-btn { background: transparent; border: 1px solid rgba(74,158,204,0.5); color: #4A9ECC; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 36px; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
        .start-btn:hover { background: rgba(74,158,204,0.08); border-color: #4A9ECC; }

        .disclaimer { margin-top: 48px; font-size: 11px; color: rgba(237,244,250,0.2); max-width: 340px; line-height: 1.6; }

        .complete-banner { background: rgba(30,58,95,0.5); border: 1px solid rgba(74,158,204,0.2); border-radius: 2px; padding: 20px 24px; margin: 0 auto 24px; max-width: 720px; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .complete-text { font-size: 13px; color: rgba(237,244,250,0.6); }
        .new-session-btn { background: transparent; border: 1px solid rgba(74,158,204,0.3); color: #4A9ECC; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 20px; border-radius: 2px; cursor: pointer; white-space: nowrap; transition: all 0.2s; flex-shrink: 0; }
        .new-session-btn:hover { background: rgba(74,158,204,0.08); }

        @media (max-width: 600px) {
          .header-bar { padding: 16px 20px; }
          .messages-area { padding: 32px 20px 24px; }
          .input-area { padding: 16px 20px; }
          .bubble { font-size: 14px; max-width: 90%; }
          .landing { padding: 48px 24px; }
          .landing-title { font-size: 24px; }
        }
      `}</style>

      {/* Header */}
      <div className="header-bar">
        <div className="logo-mark">
          <div className="logo-dot" />
          <span className="logo-text">ThinkClick</span>
        </div>
        {started && messages.length > 0 && (
          <span className="phase-hint">
            {messages.length < 5
              ? "See the Pattern"
              : messages.length < 10
              ? "Restore the Choice"
              : "Calibrate Deliberately"}
          </span>
        )}
        {started && (
          <button className="new-session-btn" onClick={resetSession}>
            New session
          </button>
        )}
      </div>

      {/* Main content */}
      {!started ? (
        <div className="landing">
          <div className="landing-mark">
            <div className="landing-mark-inner" />
          </div>
          <h1 className="landing-title">
            Something&apos;s
            <br />
            <strong>not working.</strong>
          </h1>
          <p className="landing-sub">
            A structured conversation to help you see what&apos;s going on, understand what&apos;s driving it, and find what to do next.
          </p>
          <button className="start-btn" onClick={startSession}>
            Begin
          </button>
          <p className="disclaimer">
            This is a reflective tool, not therapy. If you&apos;re in distress or experiencing a mental health crisis, please speak to a qualified professional.
          </p>
        </div>
      ) : (
        <>
          <div className="messages-area">
            {messages.map((m, i) => (
              <div key={i} className={`message-row ${m.role}`}>
                <div className={`bubble ${m.role}`}>
                  {m.content.split("\n").map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < m.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="thinking-row">
                <div className="thinking-dots">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {sessionComplete && (
            <div style={{ padding: "0 32px" }}>
              <div className="complete-banner">
                <span className="complete-text">
                  Session complete. Take a moment with what shifted.
                </span>
                <button className="new-session-btn" onClick={resetSession}>
                  Start a new session
                </button>
              </div>
            </div>
          )}

          <div className="input-area">
            <div className="input-inner">
              <div style={{ flex: 1 }}>
                <textarea
                  ref={inputRef}
                  className="input-field"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type your response..."
                  disabled={loading || sessionComplete}
                  rows={1}
                  style={{
                    height:
                      Math.min(160, Math.max(52, input.split("\n").length * 24 + 28)) + "px",
                  }}
                />
              </div>
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || loading || sessionComplete}
                aria-label="Send"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
