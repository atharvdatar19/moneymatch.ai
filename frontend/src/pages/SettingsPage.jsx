import React from "react";
import { Sliders, Shield, Key, Database, Cpu } from "lucide-react";

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em" }}>
          System & Engine Configuration
        </h1>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginTop: "6px" }}>
          Reconciliation engine configuration, API limits, cryptographic audit, and model routing.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Panel 1 */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "22px 24px", boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            Reconciliation Engine Parameters
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Deterministic rule tolerances for amount delta and timing gaps across the Gateway → Bank → Ledger stages.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px" }}>
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", fontWeight: 600, fontSize: "12px", marginBottom: "6px" }}>Amount Tolerance (INR)</label>
              <input type="text" readOnly value="₹0.01 (Strict Zero Delta)" className="form-input" style={{ width: "100%", fontFamily: "var(--font-mono)" }} />
            </div>
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", fontWeight: 600, fontSize: "12px", marginBottom: "6px" }}>Settlement Cycle SLA</label>
              <input type="text" readOnly value="T+1 Nodal Queue" className="form-input" style={{ width: "100%", fontFamily: "var(--font-mono)" }} />
            </div>
          </div>
        </div>

        {/* Panel 2 */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "22px 24px", boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
            Operational AI Synthesis Provider (Groq LPU)
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Hardware-accelerated inference parameters strictly conditioned on verified deterministic signals.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px" }}>
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", fontWeight: 600, fontSize: "12px", marginBottom: "6px" }}>Active LLM Model</label>
              <input type="text" readOnly value="qwen/qwen3.8-27b (Groq LPU)" className="form-input" style={{ width: "100%", fontFamily: "var(--font-mono)" }} />
            </div>
            <div>
              <label style={{ display: "block", color: "var(--text-secondary)", fontWeight: 600, fontSize: "12px", marginBottom: "6px" }}>Inference Temperature</label>
              <input type="text" readOnly value="0.2 (Deterministic Bound)" className="form-input" style={{ width: "100%", fontFamily: "var(--font-mono)" }} />
            </div>
          </div>
        </div>

        {/* Panel 3: Security & Privacy */}
        <div style={{ background: "var(--pista-tint)", border: "1px solid var(--pista-light)", borderRadius: "8px", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "var(--brand-forest)", marginBottom: "6px" }}>
            <Shield size={16} color="var(--brand-accent)" />
            <span>PII Redaction & Epistemic Separation Active</span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Customer names, account numbers, and phone numbers are automatically scrubbed via regex and HMAC hashing prior to any LLM inference. The deterministic rules engine maintains 100% diagnostic authority.
          </div>
        </div>
      </div>
    </div>
  );
}
