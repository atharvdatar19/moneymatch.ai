import React from "react";
import { getCategoryInfo } from "../utils/categories";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  FileCheck2, 
  ArrowUpRight,
  Sparkles
} from "lucide-react";

export default function DiagnosisBox({ diagnosis, reason, action, onGenerateAi, isAiLoading }) {
  if (!diagnosis) return null;

  const category = diagnosis.category || "UNCLASSIFIED";
  const info = getCategoryInfo(category);
  const isSuccess = category === "SUCCESS";
  const isManual = diagnosis.manual_review;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${info.bg} 0%, rgba(15, 23, 42, 0.9) 100%)`,
        border: `1px solid ${info.border}`,
        borderRadius: "16px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 8px 32px ${info.bg}`,
      }}
    >
      {/* Decorative ambient badge */}
      <div style={{
        position: "absolute",
        top: "-20px",
        right: "-20px",
        width: "120px",
        height: "120px",
        background: `radial-gradient(circle, ${info.color} 0%, transparent 70%)`,
        opacity: 0.15,
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: info.bg,
            border: `1px solid ${info.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {isSuccess ? (
              <CheckCircle2 size={20} color={info.color} />
            ) : (
              <AlertTriangle size={20} color={info.color} />
            )}
          </div>
          <div>
            <div style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
            }}>
              Deterministic Rule Engine Verdict
            </div>
            <h2 style={{
              fontSize: "20px",
              fontWeight: 800,
              color: info.color,
              margin: 0,
              letterSpacing: "-0.01em",
            }}>
              {info.label}
            </h2>
          </div>
        </div>

        {/* Confidence & Review tags */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border-medium)",
            color: "var(--text-secondary)",
          }}>
            Confidence: <strong style={{ color: "var(--text-primary)" }}>{diagnosis.confidence || "HIGH"}</strong>
          </span>

          {isManual ? (
            <span style={{
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "6px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#EF4444",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              <ShieldAlert size={14} /> Manual Review Flagged
            </span>
          ) : (
            <span style={{
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "6px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10B981",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              <FileCheck2 size={14} /> Deterministic Verified
            </span>
          )}
        </div>
      </div>

      {/* Root Cause & Recommended Action */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "16px",
        marginTop: "16px",
      }}>
        {/* Cause */}
        <div style={{
          background: "rgba(0, 0, 0, 0.25)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            marginBottom: "6px",
          }}>
            Root Cause Diagnosis
          </div>
          <p style={{
            fontSize: "14px",
            color: "var(--text-primary)",
            lineHeight: 1.6,
          }}>
            {reason || info.description}
          </p>
        </div>

        {/* Action */}
        <div style={{
          background: "rgba(0, 0, 0, 0.25)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--accent-cyan)",
            marginBottom: "6px",
          }}>
            Recommended Resolution
          </div>
          <p style={{
            fontSize: "14px",
            color: "var(--text-primary)",
            lineHeight: 1.6,
          }}>
            {action || "Review evidence logs and contact banking partner if required."}
          </p>
        </div>
      </div>
    </div>
  );
}
