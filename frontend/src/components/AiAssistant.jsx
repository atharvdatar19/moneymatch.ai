import React, { useState } from "react";
import { explainTransaction, askCopilot } from "../api/client";
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  HelpCircle, 
  AlertCircle,
  MessageSquare,
  Cpu
} from "lucide-react";

export default function AiAssistant({ transactionId, currentDiagnosis }) {
  const [aiResult, setAiResult] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState(null);

  // Copilot Q&A state
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  const quickQuestions = [
    "What is the exact financial impact of this issue?",
    "Why was this not settled automatically?",
    "What should the operations team tell the merchant?",
    "Can this transaction be retried or re-batched?",
  ];

  const handleGenerateExplanation = async () => {
    if (!transactionId) return;
    setIsExplaining(true);
    setExplainError(null);
    try {
      const data = await explainTransaction(transactionId);
      setAiResult(data);
    } catch (err) {
      setExplainError(err.message || "Failed to generate AI explanation");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleAskQuestion = async (textToAsk) => {
    const q = textToAsk || question;
    if (!q || !q.trim() || isAsking) return;

    const userMessage = { sender: "user", text: q };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsAsking(true);

    try {
      const res = await askCopilot(transactionId, q);
      const botMessage = {
        sender: "bot",
        text: res.answer,
        status: res.status,
      };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Error: ${err.message || "Could not reach Copilot."}`,
          status: "error",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", position: "relative" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "20px",
        borderBottom: "1px solid var(--border-subtle)",
        paddingBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)",
          }}>
            <Bot size={20} color="#FFF" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                Groq AI Settlement Copilot
              </h3>
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "4px",
                background: "rgba(168, 85, 247, 0.2)",
                color: "#C084FC",
                border: "1px solid rgba(168, 85, 247, 0.4)",
              }}>
                LPU Acceleration
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Context-Aware Natural Language Explanation & Resolution Guidance
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "3px 8px",
            borderRadius: "12px",
            background: "rgba(16, 185, 129, 0.1)",
            color: "#10B981",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}>
            <ShieldCheck size={13} /> PII Masked
          </span>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "3px 8px",
            borderRadius: "12px",
            background: "rgba(6, 182, 212, 0.1)",
            color: "var(--accent-cyan)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
          }}>
            <ShieldCheck size={13} /> Prompt Guard Active
          </span>
        </div>
      </div>

      {/* AI Explanation Trigger & Card */}
      {!aiResult && !isExplaining && (
        <div style={{
          background: "rgba(99, 102, 241, 0.05)",
          border: "1px dashed rgba(99, 102, 241, 0.3)",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "24px",
        }}>
          <Sparkles size={28} color="var(--accent-purple)" style={{ margin: "0 auto 8px auto", display: "block" }} />
          <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>
            Generate Executive Settlement Breakdown
          </h4>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto 16px auto" }}>
            Query the Groq LPU LLM to synthesize transaction evidence, diagnose underlying root causes, and produce operational next steps with guaranteed category alignment.
          </p>
          <button
            onClick={handleGenerateExplanation}
            className="btn btn-ai"
            style={{ margin: "0 auto" }}
          >
            <Sparkles size={16} /> Generate AI Explanation
          </button>
        </div>
      )}

      {isExplaining && (
        <div style={{
          background: "rgba(99, 102, 241, 0.05)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          borderRadius: "12px",
          padding: "28px",
          textAlign: "center",
          marginBottom: "24px",
        }}>
          <RefreshCw size={24} color="var(--accent-purple)" className="animate-spin-slow" style={{ margin: "0 auto 10px auto", display: "block" }} />
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#FFF" }}>
            Groq LPU LLM is synthesizing settlement evidence...
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            Auditing Gateway timestamps, UTR references, and ledger balance deltas
          </div>
        </div>
      )}

      {explainError && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "10px",
          padding: "14px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#EF4444",
          fontSize: "13px",
        }}>
          <AlertCircle size={18} />
          <span>{explainError}</span>
        </div>
      )}

      {aiResult && (
        <div style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 4px 24px rgba(139, 92, 246, 0.15)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Cpu size={16} color="var(--accent-purple)" />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#C084FC" }}>
                AI Executive Summary (Verified by Rule Engine)
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Confidence:</span>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#10B981",
                background: "rgba(16, 185, 129, 0.15)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}>
                {aiResult.ai_confidence || "High"}
              </span>
              <button
                onClick={handleGenerateExplanation}
                title="Regenerate explanation"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: "14px", lineHeight: 1.65, color: "#F1F5F9", marginBottom: "14px" }}>
            {aiResult.ai_explanation}
          </div>

          <div style={{
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: "8px",
            padding: "12px 14px",
            borderLeft: "3px solid var(--accent-purple)",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#C084FC", marginBottom: "4px" }}>
              Actionable Next Step for Operations:
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>
              {aiResult.ai_suggested_action}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Copilot Chat Section */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "20px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
          fontSize: "13px",
          fontWeight: 700,
          color: "var(--text-secondary)",
        }}>
          <MessageSquare size={15} color="var(--accent-cyan)" />
          <span>Ask Copilot about {transactionId || "this transaction"}</span>
        </div>

        {/* Quick prompt chips */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "16px",
        }}>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              disabled={isAsking || !transactionId}
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)";
                e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.3)";
                e.currentTarget.style.color = "#FFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div style={{
            maxHeight: "260px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "16px",
            padding: "10px",
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "10px",
            border: "1px solid var(--border-subtle)",
          }}>
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  background: msg.sender === "user" ? "rgba(6, 182, 212, 0.2)" : "rgba(30, 41, 59, 0.8)",
                  border: msg.sender === "user" ? "1px solid rgba(6, 182, 212, 0.4)" : "1px solid var(--border-subtle)",
                  color: "#FFF",
                }}
              >
                {msg.status === "blocked" && (
                  <div style={{ fontSize: "11px", color: "#EF4444", fontWeight: 700, marginBottom: "4px" }}>
                    Security Policy Intercept:
                  </div>
                )}
                {msg.text}
              </div>
            ))}
            {isAsking && (
              <div style={{
                alignSelf: "flex-start",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "12px",
                background: "rgba(30, 41, 59, 0.8)",
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}>
                Copilot is reviewing transaction records...
              </div>
            )}
          </div>
        )}

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={transactionId ? `Ask a question about ${transactionId}...` : "Select a transaction to ask questions..."}
            disabled={!transactionId || isAsking}
            style={{
              flex: 1,
              background: "rgba(13, 17, 26, 0.8)",
              border: "1px solid var(--border-medium)",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "13px",
              color: "#FFF",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!transactionId || !question.trim() || isAsking}
            className="btn btn-primary"
            style={{ padding: "0 18px" }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
