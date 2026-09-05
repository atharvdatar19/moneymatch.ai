import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Cpu, 
  BarChart3, 
  Lock, 
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  const highlights = [
    {
      icon: Layers,
      title: "3-Way Cross-Layer Reconciliation",
      desc: "Traces each transaction across Payment Gateway, Bank Statement (UTR), and Internal General Ledger in real-time.",
      color: "var(--accent-cyan)",
    },
    {
      icon: ShieldCheck,
      title: "Deterministic Rule Engine",
      desc: "Zero hallucination risk. Financial verdicts are generated deterministically; AI is strictly restricted to synthesis.",
      color: "#10B981",
    },
    {
      icon: Cpu,
      title: "Groq LPU LLM Acceleration",
      desc: "Sub-500ms natural language root-cause breakdowns and operational next steps with guaranteed schema conformity.",
      color: "#A855F7",
    },
    {
      icon: Lock,
      title: "Cybersecurity & Prompt Guard",
      desc: "Pre-execution regex injection defense, PII data masking (PAN, Account, Phone), and tamper-evident audit trails.",
      color: "#F59E0B",
    },
  ];

  const failureModes = [
    { name: "Exact Match", status: "SUCCESS", count: "53%" },
    { name: "Bank Settlement Delay", status: "DELAYED", count: "10%" },
    { name: "Duplicate UTR Reference", status: "COLLISION", count: "10%" },
    { name: "Amount / Fee Mismatch", status: "DISCREPANCY", count: "8%" },
    { name: "Missing Bank Record", status: "MISSING", count: "8%" },
    { name: "Partial Settlement", status: "FRACTIONAL", count: "7%" },
    { name: "Manual Review Queue", status: "CONFLICT", count: "4%" },
  ];

  return (
    <div style={{
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "60px 24px 80px 24px",
      width: "100%",
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: "center",
        maxWidth: "900px",
        margin: "0 auto 80px auto",
      }}>
        {/* Hackathon problem statement tag */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          borderRadius: "20px",
          background: "rgba(6, 182, 212, 0.1)",
          border: "1px solid rgba(6, 182, 212, 0.3)",
          color: "var(--accent-cyan)",
          fontSize: "13px",
          fontWeight: 700,
          marginBottom: "24px",
        }}>
          <Sparkles size={14} />
          <span>PS-8 Fintech Hackathon Solution • TracePay AI</span>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: "#FFF",
          marginBottom: "20px",
        }}>
          Autonomous AI Merchant <br />
          <span className="gradient-text">Settlement Investigation</span>
        </h1>

        <p style={{
          fontSize: "18px",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          maxWidth: "700px",
          margin: "0 auto 36px auto",
        }}>
          A merchant captures payment successfully, but the final bank credit is delayed, missing, or mismatched. 
          <strong> MoneyMatch.AI</strong> traces across Gateway, Bank, and Ledger to pinpoint the exact failure mode in milliseconds.
        </p>

        {/* Call to Actions */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "14px",
        }}>
          <Link
            to="/investigate?id=TXN-00004"
            className="btn btn-primary"
            style={{ padding: "14px 32px", fontSize: "16px" }}
          >
            <Search size={18} /> Launch Investigation Engine
          </Link>
          <Link
            to="/analytics"
            className="btn btn-secondary"
            style={{ padding: "14px 28px", fontSize: "16px" }}
          >
            <BarChart3 size={18} /> View 100-Txn Batch Analytics
          </Link>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "70px",
      }}>
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: "24px",
                position: "relative",
              }}
            >
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-medium)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}>
                <Icon size={22} color={item.color} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", marginBottom: "8px" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Ground Truth Failure Modes Coverage Card */}
      <div className="glass-panel" style={{ padding: "32px", marginBottom: "70px" }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#FFF", margin: 0 }}>
              Complete Failure Mode Spectrum Coverage
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Tested against 100 real-world benchmark transactions with 100% rule consistency.
            </p>
          </div>
          <Link
            to="/investigate"
            className="btn btn-secondary"
            style={{ fontSize: "13px" }}
          >
            Try Benchmark Cases <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
        }}>
          {failureModes.map((fm, i) => (
            <div
              key={i}
              style={{
                background: "rgba(13, 17, 26, 0.8)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                {fm.status}
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFF", margin: "4px 0" }}>
                {fm.name}
              </div>
              <div style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                {fm.count} dataset share
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Footer banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
        border: "1px solid rgba(6, 182, 212, 0.3)",
        borderRadius: "20px",
        padding: "40px",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#FFF", marginBottom: "8px" }}>
          Ready to Audit Merchant Settlements?
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto 24px auto" }}>
          Inspect live transactions, see the 3-Way trace pipeline, and test Groq LPU explanations in sub-second inference.
        </p>
        <Link
          to="/investigate?id=TXN-00008"
          className="btn btn-primary"
          style={{ padding: "12px 28px" }}
        >
          Test Duplicate UTR Collision (TXN-00008) <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
