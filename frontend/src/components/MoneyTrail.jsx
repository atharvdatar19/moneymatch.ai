import React from "react";
import { formatINR, formatDate } from "../utils/formatters";
import { Check, Clock, AlertTriangle, X, HelpCircle, Split } from "lucide-react";

export default function MoneyTrail({ trace, diagnosis, compact = false }) {
  if (!trace) return null;

  const gw = trace.gateway;
  const bk = trace.bank;
  const ld = trace.ledger;
  const category = diagnosis?.category || "UNCLASSIFIED";

  // Determine stage states
  const gwSuccess = gw && String(gw.payment_status).toUpperCase() === "SUCCESS";
  const bkSettled = bk && String(bk.bank_status).toUpperCase() === "SETTLED";
  const bkDelayed = bk && String(bk.bank_status).toUpperCase() === "DELAYED";
  const bkMissing = !bk;
  const isDuplicate = category === "DUPLICATE_UTR";
  const isMismatch = category === "AMOUNT_MISMATCH";
  const isPartial = category === "PARTIAL_SETTLEMENT";
  const isUnclassified = category === "UNCLASSIFIED";

  // Stage 1: Gateway
  const stage1 = {
    title: "GATEWAY",
    sub: gw ? gw.payment_status : "MISSING",
    amount: gw ? formatINR(gw.net_settlement_amount) : "₹0.00",
    time: gw?.gateway_timestamp ? formatDate(gw.gateway_timestamp) : "No record",
    status: gwSuccess ? "success" : "danger",
    icon: gwSuccess ? Check : X,
  };

  // Stage 2: Bank
  let stage2Status = "success";
  let stage2Sub = "SETTLED";
  let stage2Icon = Check;
  if (bkMissing) {
    stage2Status = "danger";
    stage2Sub = "MISSING RECORD";
    stage2Icon = X;
  } else if (bkDelayed) {
    stage2Status = "warning";
    stage2Sub = "DELAYED";
    stage2Icon = Clock;
  } else if (isDuplicate) {
    stage2Status = "collision";
    stage2Sub = "DUPLICATE REF";
    stage2Icon = Split;
  } else if (isMismatch) {
    stage2Status = "danger";
    stage2Sub = "AMOUNT MISMATCH";
    stage2Icon = AlertTriangle;
  } else if (isUnclassified) {
    stage2Status = "neutral";
    stage2Sub = bk?.bank_status || "UNKNOWN";
    stage2Icon = HelpCircle;
  }

  const stage2 = {
    title: "BANK",
    sub: stage2Sub,
    amount: bk?.credited_amount !== undefined && bk?.credited_amount !== null ? formatINR(bk.credited_amount) : "₹0.00",
    time: bk?.bank_timestamp ? formatDate(bk.bank_timestamp) : (bkDelayed ? "Stalled in nodal queue" : "No credit statement"),
    status: stage2Status,
    icon: stage2Icon,
  };

  // Stage 3: Ledger
  let stage3Status = "success";
  let stage3Sub = "COMPLETE";
  let stage3Icon = Check;
  if (category === "SUCCESS") {
    stage3Status = "success";
    stage3Sub = "COMPLETE";
    stage3Icon = Check;
  } else if (isPartial) {
    stage3Status = "warning";
    stage3Sub = "PARTIAL";
    stage3Icon = Clock;
  } else if (isMismatch) {
    stage3Status = "danger";
    stage3Sub = "MISMATCH";
    stage3Icon = AlertTriangle;
  } else if (isUnclassified) {
    stage3Status = "neutral";
    stage3Sub = ld?.ledger_status || "REVIEW";
    stage3Icon = HelpCircle;
  } else {
    stage3Status = "neutral";
    stage3Sub = "PENDING";
    stage3Icon = Clock;
  }

  const stage3 = {
    title: "LEDGER",
    sub: stage3Sub,
    amount: ld?.received_amount !== undefined && ld?.received_amount !== null ? formatINR(ld.received_amount) : "₹0.00",
    time: ld?.ledger_timestamp ? formatDate(ld.ledger_timestamp) : (category === "SUCCESS" ? "Reconciled" : "Awaiting settlement credit"),
    status: stage3Status,
    icon: stage3Icon,
  };

  // Connector 1: Gateway -> Bank
  let c1Class = "solid";
  let c1Color = "var(--status-success)";
  let c1Label = "HANDOFF OK";
  if (bkMissing) {
    c1Class = "broken";
    c1Color = "var(--status-danger)";
    c1Label = "CREDIT MISSING";
  } else if (bkDelayed) {
    c1Class = "dashed";
    c1Color = "var(--status-warning)";
    c1Label = "BANK DELAY";
  } else if (isDuplicate) {
    c1Class = "collision";
    c1Color = "var(--status-collision)";
    c1Label = "COLLISION";
  } else if (isMismatch) {
    c1Class = "dashed";
    c1Color = "var(--status-danger)";
    c1Label = "DELTA MISMATCH";
  } else if (isUnclassified) {
    c1Class = "dotted";
    c1Color = "var(--status-uncertain)";
    c1Label = "CONFLICT";
  }

  // Connector 2: Bank -> Ledger
  let c2Class = "solid";
  let c2Color = "var(--status-success)";
  let c2Label = "RECONCILED";
  if (category !== "SUCCESS") {
    if (isPartial) {
      c2Class = "dashed";
      c2Color = "var(--status-warning)";
      c2Label = "FRACTIONAL";
    } else if (isMismatch) {
      c2Class = "broken";
      c2Color = "var(--status-danger)";
      c2Label = "DISCREPANCY";
    } else {
      c2Class = "broken";
      c2Color = "var(--border-medium)";
      c2Label = "BLOCKED";
    }
  }

  const getColor = (st) => {
    switch (st) {
      case "success": return "var(--status-success)";
      case "warning": return "var(--status-warning)";
      case "danger": return "var(--status-danger)";
      case "collision": return "var(--status-collision)";
      default: return "var(--status-uncertain)";
    }
  };

  if (compact) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
        <span style={{ color: getColor(stage1.status), fontWeight: 700 }}>GW</span>
        <span style={{ color: c1Color, letterSpacing: "-0.05em" }}>{c1Class === "solid" ? "───" : c1Class === "dashed" ? "- - -" : "─×─"}</span>
        <span style={{ color: getColor(stage2.status), fontWeight: 700 }}>BNK</span>
        <span style={{ color: c2Color, letterSpacing: "-0.05em" }}>{c2Class === "solid" ? "───" : c2Class === "dashed" ? "- - -" : "─×─"}</span>
        <span style={{ color: getColor(stage3.status), fontWeight: 700 }}>LDG</span>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "8px",
      padding: "20px 24px",
      boxShadow: "0 1px 3px rgba(18, 30, 22, 0.03)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}>
        <div style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "var(--brand-forest)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--brand-accent)" }} />
          The Money Trail — 3-Stage Relay Forensics
        </div>
        <div style={{
          fontSize: "11px",
          fontFamily: "var(--font-sans)",
          color: "var(--text-muted)",
        }}>
          Connector encoding: <strong style={{ color: "var(--text-secondary)" }}>Solid</strong> (Clean) &nbsp;•&nbsp; <strong style={{ color: "var(--status-warning)" }}>Dashed</strong> (Delayed) &nbsp;•&nbsp; <strong style={{ color: "var(--status-danger)" }}>Broken</strong> (Anomaly)
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 140px 1fr 140px 1fr",
        alignItems: "center",
        gap: "4px",
      }}>
        {/* Stage 1: Gateway */}
        <div style={{
          background: "var(--pista-tint)",
          border: "1px solid var(--pista-medium)",
          borderRadius: "6px",
          padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand-forest)", letterSpacing: "0.04em" }}>
              1. GATEWAY
            </span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: 700,
              color: getColor(stage1.status),
            }}>
              <stage1.icon size={12} /> {stage1.sub}
            </span>
          </div>
          <div style={{
            fontSize: "19px",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
            marginBottom: "4px",
          }}>
            {stage1.amount}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            {stage1.time}
          </div>
        </div>

        {/* Connector 1 */}
        <div style={{ textAlign: "center", padding: "0 4px" }}>
          <div style={{
            fontSize: "9px",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: c1Color,
            marginBottom: "5px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {c1Label}
          </div>
          <div style={{
            height: "2px",
            width: "100%",
            background: c1Class === "solid" ? c1Color : "transparent",
            borderTop: c1Class !== "solid" ? `2px ${c1Class === "dashed" ? "dashed" : "dotted"} ${c1Color}` : "none",
            position: "relative",
          }} />
        </div>

        {/* Stage 2: Bank */}
        <div style={{
          background: stage2.status === 'warning' ? "var(--status-warning-bg)" : stage2.status === 'danger' ? "var(--status-danger-bg)" : "var(--pista-tint)",
          border: `1px solid ${stage2.status === 'warning' ? 'var(--status-warning-border)' : stage2.status === 'danger' ? 'var(--status-danger-border)' : 'var(--pista-medium)'}`,
          borderRadius: "6px",
          padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand-forest)", letterSpacing: "0.04em" }}>
              2. BANK STATEMENT
            </span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: 700,
              color: getColor(stage2.status),
            }}>
              <stage2.icon size={12} /> {stage2.sub}
            </span>
          </div>
          <div style={{
            fontSize: "19px",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: stage2.status === 'danger' ? "var(--status-danger)" : stage2.status === 'warning' ? "var(--status-warning)" : "var(--text-primary)",
            marginBottom: "4px",
          }}>
            {stage2.amount}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            {stage2.time}
          </div>
        </div>

        {/* Connector 2 */}
        <div style={{ textAlign: "center", padding: "0 4px" }}>
          <div style={{
            fontSize: "9px",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: c2Color,
            marginBottom: "5px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {c2Label}
          </div>
          <div style={{
            height: "2px",
            width: "100%",
            background: c2Class === "solid" ? c2Color : "transparent",
            borderTop: c2Class !== "solid" ? `2px ${c2Class === "dashed" ? "dashed" : "dotted"} ${c2Color}` : "none",
          }} />
        </div>

        {/* Stage 3: Ledger */}
        <div style={{
          background: stage3.status === 'success' ? "var(--status-success-bg)" : "#FAF9F3",
          border: `1px solid ${stage3.status === 'success' ? 'var(--status-success-border)' : 'var(--border-medium)'}`,
          borderRadius: "6px",
          padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand-forest)", letterSpacing: "0.04em" }}>
              3. INTERNAL LEDGER
            </span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: 700,
              color: getColor(stage3.status),
            }}>
              <stage3.icon size={12} /> {stage3.sub}
            </span>
          </div>
          <div style={{
            fontSize: "19px",
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: stage3.status === 'success' ? "var(--status-success)" : "var(--text-primary)",
            marginBottom: "4px",
          }}>
            {stage3.amount}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            {stage3.time}
          </div>
        </div>
      </div>
    </div>
  );
}
