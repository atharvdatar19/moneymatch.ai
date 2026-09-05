import React from "react";
import { getCategoryInfo } from "../utils/categories";
import { CheckCircle2, Clock, AlertTriangle, XCircle, HelpCircle, Copy, AlertOctagon } from "lucide-react";

export default function StatusBadge({ category, showDescription = false }) {
  const info = getCategoryInfo(category);

  const getIcon = () => {
    switch (info.id) {
      case "SUCCESS":
        return <CheckCircle2 size={14} color={info.color} />;
      case "BANK_DELAY":
        return <Clock size={14} color={info.color} />;
      case "DUPLICATE_UTR":
        return <AlertOctagon size={14} color={info.color} />;
      case "AMOUNT_MISMATCH":
        return <XCircle size={14} color={info.color} />;
      case "MISSING_BANK_RECORD":
        return <AlertTriangle size={14} color={info.color} />;
      case "PARTIAL_SETTLEMENT":
        return <AlertTriangle size={14} color={info.color} />;
      default:
        return <HelpCircle size={14} color={info.color} />;
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: "4px" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          background: info.bg,
          border: `1px solid ${info.border}`,
          color: info.color,
          boxShadow: `0 0 12px ${info.bg}`,
        }}
      >
        {getIcon()}
        {info.shortLabel}
      </span>
      {showDescription && (
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {info.description}
        </span>
      )}
    </div>
  );
}
