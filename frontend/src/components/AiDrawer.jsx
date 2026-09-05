import React, { useState } from "react";
import { askCopilot } from "../api/client";
import { X, Send, Cpu, ShieldCheck, Sparkles } from "lucide-react";

export default function AiDrawer({ isOpen, onClose, transactionId, aiExplanation, deterministicCategory }) {
  if (!isOpen) return null;

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [asking, setAsking] = useState(false);

  const suggestedQuestions = [
    "What is the financial delta between Gateway and Bank?",
    "What action should operations communicate to the merchant?",
    "Why was this transaction not settled automatically?",
    "Does this require escalation to the partner bank nodal desk?",
  ];

  const handleAsk = async (text) => {
    const q = text || question;
    if (!q || !q.trim() || asking) return;

    const userMsg = { sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await askCopilot(transactionId, q);
      setMessages((prev) => [...prev, { sender: "bot", text: res.answer, status: res.status }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: `Error: ${err.message || "Copilot unavailable."}`, status: "error" }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      width: "440px",
      background: "#FFFFFF",
      borderLeft: "1px solid var(--border-medium)",
      boxShadow: "-8px 0 32px rgba(18, 30, 22, 0.08)",
      zIndex: 90,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#FAF9F3",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            background: "var(--pista-tint)",
            border: "1px solid var(--pista-medium)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--brand-forest)",
          }}>
            <Cpu size={17} />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--brand-forest)" }}>
              Settlement Forensics Copilot
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Scoped to {transactionId}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Security Scope Notice */}
      <div style={{
        padding: "8px 18px",
        background: "var(--pista-tint)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "11px",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--brand-forest)", fontWeight: 600 }}>
          <ShieldCheck size={13} color="var(--brand-accent)" /> PII Scrubbed & Prompt Guard Active
        </span>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
          {deterministicCategory}
        </span>
      </div>

      {/* Body: AI Synthesis + Chat */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        background: "#FBFBFA",
      }}>
        {/* Grounded Explanation Box */}
        {aiExplanation ? (
          <div style={{
            background: "#FFFFFF",
            border: "1px solid var(--pista-medium)",
            borderLeft: "3px solid var(--brand-forest)",
            borderRadius: "6px",
            padding: "14px 16px",
            boxShadow: "0 1px 2px rgba(18, 30, 22, 0.03)",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand-forest)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              AI Root-Cause Synthesis
            </div>
            <p style={{ fontSize: "12.5px", color: "var(--text-primary)", lineHeight: 1.6 }}>
              {aiExplanation}
            </p>
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", padding: "10px 0" }}>
            Query the Copilot regarding transaction details, delays, or recommended escalation steps.
          </div>
        )}

        {/* Suggested Queries */}
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
            Suggested Operator Queries
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                disabled={asking}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  fontSize: "11.5px",
                  background: "#FFFFFF",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "6px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--brand-forest)";
                  e.currentTarget.style.borderColor = "var(--pista-medium)";
                  e.currentTarget.style.background = "var(--pista-tint)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.background = "#FFFFFF";
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "90%",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "12.5px",
              lineHeight: 1.5,
              background: m.sender === "user" ? "var(--brand-forest)" : "#FFFFFF",
              border: `1px solid ${m.sender === "user" ? "var(--brand-forest)" : "var(--border-subtle)"}`,
              color: m.sender === "user" ? "#FFFFFF" : "var(--text-primary)",
              boxShadow: "0 1px 2px rgba(18, 30, 22, 0.03)",
            }}
          >
            {m.text}
          </div>
        ))}
        {asking && (
          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
            Analyzing evidence records...
          </div>
        )}
      </div>

      {/* Input Region */}
      <div style={{
        padding: "14px 18px",
        borderTop: "1px solid var(--border-subtle)",
        background: "#FAF9F3",
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          style={{ display: "flex", gap: "8px" }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this transaction..."
            disabled={asking}
            style={{
              flex: 1,
              background: "#FFFFFF",
              border: "1px solid var(--border-medium)",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="btn btn-primary"
            style={{ padding: "0 14px" }}
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
