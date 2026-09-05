import React from "react";
import { getCategoryInfo } from "../utils/categories";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

export const SAMPLE_CASES = [
  { id: "TXN-00001", label: "Exact Match", category: "SUCCESS", desc: "Settled across all 3 layers" },
  { id: "TXN-00004", label: "Bank Delay", category: "BANK_DELAY", desc: "Captured at gateway, bank pending" },
  { id: "TXN-00008", label: "Duplicate UTR", category: "DUPLICATE_UTR", desc: "UTR collision with TXN-00083" },
  { id: "TXN-00010", label: "Amount Mismatch", category: "AMOUNT_MISMATCH", desc: "Bank credit delta discrepancy" },
  { id: "TXN-00009", label: "Missing Bank Record", category: "MISSING_BANK_RECORD", desc: "Zero credit in bank statement" },
  { id: "TXN-00017", label: "Partial Settlement", category: "PARTIAL_SETTLEMENT", desc: "Fractional payout in ledger" },
  { id: "TXN-00002", label: "Manual Review", category: "UNCLASSIFIED", desc: "Conflicting data flagged" },
];

export default function SamplePicker({ selectedId, onSelect }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "10px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          fontWeight: 700,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          <Zap size={14} color="var(--accent-cyan)" />
          <span>Quick Demo Benchmark Scenarios (1-Click)</span>
        </div>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          Covers all 7 ground-truth failure modes
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "8px",
      }}>
        {SAMPLE_CASES.map((sample) => {
          const info = getCategoryInfo(sample.category);
          const isSelected = selectedId === sample.id;

          return (
            <button
              key={sample.id}
              onClick={() => onSelect(sample.id)}
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, ${info.bg} 0%, rgba(30, 41, 59, 0.8) 100%)` 
                  : "rgba(15, 23, 42, 0.6)",
                border: `1px solid ${isSelected ? info.color : "var(--border-subtle)"}`,
                borderRadius: "10px",
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isSelected ? `0 0 16px ${info.bg}` : "none",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--border-medium)";
                  e.currentTarget.style.background = "rgba(24, 35, 60, 0.8)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.6)";
                }
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: isSelected ? "var(--brand-forest)" : "var(--text-primary)",
                }}>
                  {sample.id}
                </span>
                <span style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: info.color,
                }} />
              </div>
              <div style={{
                fontSize: "11px",
                fontWeight: 600,
                color: info.color,
                marginBottom: "2px",
              }}>
                {sample.label}
              </div>
              <div style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {sample.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
