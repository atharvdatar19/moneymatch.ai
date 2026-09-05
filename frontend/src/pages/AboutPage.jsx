import React from "react";
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  Users, 
  FileText, 
  Code2,
  Terminal,
  Zap,
  ArrowRight
} from "lucide-react";

export default function AboutPage() {
  const teamRoles = [
    {
      role: "Person 1: LLM Prompts & Reasoning",
      resp: "Engineered strict system prompts, reasoning schemas, root cause deduction logic, and operational action playbooks.",
      tag: "LLM Reasoning",
    },
    {
      role: "Person 2: Groq Provider / API Integration",
      resp: "Integrated Groq LPU client, exponential backoff retries, JSON mode formatting, error boundary isolation, and batch execution.",
      tag: "Core LLM Provider",
    },
    {
      role: "Person 3: Cybersecurity & Threat Defense",
      resp: "Implemented Prompt Injection Regex Shield, PII scrubbing (masking PAN, UTR, accounts), rate-limiting, and HMAC authorization.",
      tag: "Fintech Security",
    },
    {
      role: "Person 4: Frontend & UI/UX Experience",
      resp: "Designed high-contrast dark glassmorphism dashboard, 3-way trace pipeline visualizer, benchmark picker, and analytics suite.",
      tag: "User Experience",
    },
  ];

  const securityFeatures = [
    {
      title: "Zero-Hallucination Deterministic Engine",
      detail: "The rule engine has absolute authority over classification. The LLM cannot invent or modify the settlement category.",
    },
    {
      title: "Pre-Execution Prompt Guard",
      detail: "All input data passing to the LLM is inspected for prompt injection keywords (system prompt, jailbreak, ignore instructions).",
    },
    {
      title: "Automated PII Redaction",
      detail: "PAN, mobile numbers, emails, and full bank account numbers are scrubbed or masked with asterisk wildcards prior to inference.",
    },
    {
      title: "Strict Output Schema Enforcement",
      detail: "Groq responses are parsed with strict JSON structure validation and constrained against allowed categories.",
    },
    {
      title: "Tamper-Evident Audit Logging",
      detail: "All queries, investigations, and anomalies are logged to an immutable security audit event stream.",
    },
    {
      title: "API Rate Limiting & Header Hardening",
      detail: "OWASP-compliant security headers (CSP, X-Frame-Options, HSTS) and sliding-window request throttling.",
    },
  ];

  return (
    <div style={{
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "24px 24px 80px 24px",
      width: "100%",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 12px",
          borderRadius: "16px",
          background: "rgba(99, 102, 241, 0.15)",
          color: "var(--accent-indigo)",
          fontSize: "12px",
          fontWeight: 700,
          marginBottom: "12px",
        }}>
          <Layers size={14} /> System Architecture & Security Specification
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#FFF", margin: 0, letterSpacing: "-0.02em" }}>
          How MoneyMatch.AI Solves PS-8
        </h1>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginTop: "6px", maxWidth: "800px" }}>
          A dual-engine fintech architecture: Combining deterministic financial reconciliation rules with ultra-fast Groq LPU synthesis under strict cybersecurity guardrails.
        </p>
      </div>

      {/* 3-Tier Architecture Diagram Card */}
      <div className="glass-panel" style={{ padding: "30px", marginBottom: "36px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFF", marginBottom: "20px" }}>
          Dual-Engine Architecture: Deterministic Truth + AI Explanation
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          {/* Layer 1 */}
          <div style={{
            background: "rgba(13, 17, 26, 0.8)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            borderRadius: "14px",
            padding: "20px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              Stage 1: Ingestion & 3-Way Trace
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", margin: "6px 0 10px 0" }}>
              Data Layer
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Ingests raw settlement feeds across Gateway (charges, fees, taxes), Bank statements (UTR credits, settlement timestamps), and the Internal General Ledger.
            </p>
          </div>

          {/* Layer 2 */}
          <div style={{
            background: "rgba(13, 17, 26, 0.8)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "14px",
            padding: "20px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#10B981", textTransform: "uppercase" }}>
              Stage 2: Deterministic Rule Engine
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", margin: "6px 0 10px 0" }}>
              Source of Truth
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Evaluates 7 strict reconciliation rules. Checks for missing bank records, delays, duplicate UTR references, fee discrepancies, and conflicting states. Zero hallucinations.
            </p>
          </div>

          {/* Layer 3 */}
          <div style={{
            background: "rgba(13, 17, 26, 0.8)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "14px",
            padding: "20px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-purple)", textTransform: "uppercase" }}>
              Stage 3: Groq LPU Copilot
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", margin: "6px 0 10px 0" }}>
              Executive AI Synthesis
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Sub-500ms inference generates human-readable explanations and action recommendations for operations teams, strictly locked to the deterministic verdict.
            </p>
          </div>
        </div>
      </div>

      {/* Cybersecurity Defenses */}
      <div className="glass-panel" style={{ padding: "30px", marginBottom: "36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Lock size={20} color="#F59E0B" />
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFF", margin: 0 }}>
            Enterprise Fintech Cybersecurity & Data Governance
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
        }}>
          {securityFeatures.map((sec, i) => (
            <div
              key={i}
              style={{
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <CheckCircle2 size={16} color="#10B981" />
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFF", margin: 0 }}>
                  {sec.title}
                </h4>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {sec.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Division of Responsibilities */}
      <div className="glass-panel" style={{ padding: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Users size={20} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#FFF", margin: 0 }}>
            4-Person Hackathon Engineering Distribution
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}>
          {teamRoles.map((member, i) => (
            <div
              key={i}
              style={{
                background: "rgba(13, 17, 26, 0.8)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <div style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--accent-cyan)",
                background: "rgba(6, 182, 212, 0.1)",
                padding: "2px 8px",
                borderRadius: "4px",
                display: "inline-block",
                marginBottom: "8px",
              }}>
                {member.tag}
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#FFF", marginBottom: "8px" }}>
                {member.role}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {member.resp}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
