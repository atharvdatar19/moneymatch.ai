import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [operatorId, setOperatorId] = useState("ops_lead_01");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        width: "400px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-medium)",
        borderRadius: "8px",
        padding: "36px 32px",
        textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <img
            src="/logo.png"
            alt="moneymatch.ai"
            style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "6px" }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Wordmark */}
        <div style={{
          fontSize: "18px",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "var(--brand-forest)",
          marginBottom: "6px",
          fontFamily: "var(--font-display)",
        }}>
          moneymatch<span style={{ color: "var(--brand-primary)" }}>.ai</span>
        </div>

        {/* Single clear headline as required by brief */}
        <h1 style={{
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--text-secondary)",
          margin: "0 0 24px 0",
        }}>
          Find where the money stopped.
        </h1>

        {/* Restrained money trail motif as the ONLY visual */}
        <div style={{
          background: "var(--bg-base)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "6px",
          padding: "12px 14px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
        }}>
          <span style={{ color: "var(--brand-primary)", fontWeight: 600 }}>GATEWAY</span>
          <span style={{ color: "var(--brand-primary)" }}>─────</span>
          <span style={{ color: "var(--status-warning)", fontWeight: 600 }}>BANK</span>
          <span style={{ color: "var(--status-warning)", letterSpacing: "-0.05em" }}>- - -</span>
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>LEDGER</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
              Operator Terminal ID
            </label>
            <input
              type="text"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-medium)",
                borderRadius: "6px",
                padding: "9px 12px",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px" }}>
            Authenticate & Open Pipeline <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)", marginTop: "20px" }}>
          <ShieldCheck size={13} color="var(--brand-primary)" />
          <span>Deterministic Audit Mode Active</span>
        </div>
      </div>
    </div>
  );
}
