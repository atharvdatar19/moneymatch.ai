import React from "react";
import { formatINR, formatDate, maskSensitive } from "../utils/formatters";
import { 
  Building2, 
  Landmark, 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle,
  Hash,
  Layers
} from "lucide-react";

export default function TracePipeline({ trace, diagnosis }) {
  if (!trace) return null;

  const gw = trace.gateway;
  const bk = trace.bank;
  const ld = trace.ledger;

  const category = diagnosis?.category || "UNCLASSIFIED";

  // System status evaluations
  const isGwSuccess = gw && String(gw.payment_status).toUpperCase() === "SUCCESS";
  const isBkSuccess = bk && String(bk.bank_status).toUpperCase() === "SETTLED";
  const isBkDelayed = bk && String(bk.bank_status).toUpperCase() === "DELAYED";
  const isBkMissing = !bk;
  const isLdComplete = ld && String(ld.ledger_status).toUpperCase() === "COMPLETE";
  const isLdMismatch = ld && String(ld.ledger_status).toUpperCase() === "MISMATCH";
  const isLdPartial = ld && String(ld.ledger_status).toUpperCase() === "PARTIAL";

  return (
    <div className="glass-panel" style={{ padding: "24px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        borderBottom: "1px solid var(--border-subtle)",
        paddingBottom: "14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Layers size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            3-Way Settlement Pipeline Trace
          </h3>
        </div>
        <div style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <span>Source Verification:</span>
          <span style={{
            color: "var(--accent-cyan)",
            fontWeight: 600,
            background: "rgba(6, 182, 212, 0.1)",
            padding: "2px 8px",
            borderRadius: "4px",
          }}>
            Gateway ➔ Bank ➔ Ledger
          </span>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "18px",
        position: "relative",
      }}>
        {/* Node 1: Payment Gateway */}
        <div style={{
          background: "rgba(13, 17, 26, 0.8)",
          borderRadius: "14px",
          border: `1px solid ${gw ? "rgba(6, 182, 212, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
          padding: "18px",
          position: "relative",
          boxShadow: gw ? "0 4px 20px rgba(6, 182, 212, 0.08)" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(6, 182, 212, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Building2 size={16} color="var(--accent-cyan)" />
              </div>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                  Layer 1
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Payment Gateway
                </div>
              </div>
            </div>

            {gw ? (
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "12px",
                background: isGwSuccess ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: isGwSuccess ? "#10B981" : "#EF4444",
                border: `1px solid ${isGwSuccess ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              }}>
                {gw.payment_status}
              </span>
            ) : (
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Not Found</span>
            )}
          </div>

          {gw ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Net Settlement:</span>
                <span style={{ fontWeight: 700, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                  {formatINR(gw.net_settlement_amount)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Gross / Fee / Tax:</span>
                <span style={{ color: "var(--text-primary)", fontSize: "12px" }}>
                  {formatINR(gw.gross_amount)} | {formatINR(gw.platform_fee)} | {formatINR(gw.tax_on_fee)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Order ID:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{gw.order_id || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Gateway UTR:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)" }}>
                  {gw.utr || "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Captured At:</span>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{formatDate(gw.gateway_timestamp)}</span>
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: "12px", fontStyle: "italic", padding: "10px 0" }}>
              No record found in Gateway Settlement logs.
            </div>
          )}
        </div>

        {/* Node 2: Bank Statement */}
        <div style={{
          background: "rgba(13, 17, 26, 0.8)",
          borderRadius: "14px",
          border: `1px solid ${
            isBkMissing 
              ? "rgba(249, 115, 22, 0.4)" 
              : isBkDelayed 
              ? "rgba(245, 158, 11, 0.4)" 
              : "rgba(59, 130, 246, 0.3)"
          }`,
          padding: "18px",
          position: "relative",
          boxShadow: isBkMissing ? "0 4px 20px rgba(249, 115, 22, 0.1)" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(59, 130, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Landmark size={16} color="var(--accent-blue)" />
              </div>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                  Layer 2
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Nodal Bank Statement
                </div>
              </div>
            </div>

            {bk ? (
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "12px",
                background: isBkSuccess 
                  ? "rgba(16, 185, 129, 0.15)" 
                  : isBkDelayed 
                  ? "rgba(245, 158, 11, 0.15)" 
                  : "rgba(239, 68, 68, 0.15)",
                color: isBkSuccess ? "#10B981" : isBkDelayed ? "#F59E0B" : "#EF4444",
                border: `1px solid ${
                  isBkSuccess 
                    ? "rgba(16, 185, 129, 0.3)" 
                    : isBkDelayed 
                    ? "rgba(245, 158, 11, 0.3)" 
                    : "rgba(239, 68, 68, 0.3)"
                }`,
              }}>
                {bk.bank_status}
              </span>
            ) : (
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "12px",
                background: "rgba(249, 115, 22, 0.2)",
                color: "#F97316",
                border: "1px solid rgba(249, 115, 22, 0.4)",
              }}>
                MISSING RECORD
              </span>
            )}
          </div>

          {bk ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Credited Amount:</span>
                <span style={{
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: category === "AMOUNT_MISMATCH" ? "#EF4444" : "#10B981",
                }}>
                  {formatINR(bk.credited_amount)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Bank Ref / UTR:</span>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: category === "DUPLICATE_UTR" ? "#A855F7" : "var(--text-primary)",
                  fontWeight: category === "DUPLICATE_UTR" ? 700 : 500,
                }}>
                  {bk.utr || "—"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Settlement Ref:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{bk.settlement_id || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Credit Timestamp:</span>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{formatDate(bk.bank_timestamp)}</span>
              </div>
            </div>
          ) : (
            <div style={{
              background: "rgba(249, 115, 22, 0.08)",
              border: "1px dashed rgba(249, 115, 22, 0.3)",
              borderRadius: "8px",
              padding: "14px",
              textAlign: "center",
              color: "#F97316",
              fontSize: "12px",
              marginTop: "8px",
            }}>
              <AlertCircle size={20} style={{ margin: "0 auto 6px auto", display: "block" }} />
              <strong>No bank statement record found.</strong>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Gateway recorded successful charge, but bank statement did not register the payout credit.
              </div>
            </div>
          )}
        </div>

        {/* Node 3: Internal Ledger */}
        <div style={{
          background: "rgba(13, 17, 26, 0.8)",
          borderRadius: "14px",
          border: `1px solid ${
            isLdComplete 
              ? "rgba(16, 185, 129, 0.3)" 
              : isLdMismatch 
              ? "rgba(239, 68, 68, 0.3)" 
              : isLdPartial 
              ? "rgba(14, 165, 233, 0.3)" 
              : "rgba(148, 163, 184, 0.25)"
          }`,
          padding: "18px",
          position: "relative",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <BookOpen size={16} color="var(--accent-indigo)" />
              </div>
              <div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                  Layer 3
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Internal Ledger
                </div>
              </div>
            </div>

            {ld ? (
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "12px",
                background: isLdComplete 
                  ? "rgba(16, 185, 129, 0.15)" 
                  : isLdMismatch 
                  ? "rgba(239, 68, 68, 0.15)" 
                  : isLdPartial 
                  ? "rgba(14, 165, 233, 0.15)" 
                  : "rgba(148, 163, 184, 0.15)",
                color: isLdComplete 
                  ? "#10B981" 
                  : isLdMismatch 
                  ? "#EF4444" 
                  : isLdPartial 
                  ? "#0EA5E9" 
                  : "#94A3B8",
                border: `1px solid ${
                  isLdComplete ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.15)"
                }`,
              }}>
                {ld.ledger_status}
              </span>
            ) : (
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Not Found</span>
            )}
          </div>

          {ld ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Reconciliation Status:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {ld.ledger_status}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Settlement Batch:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                  {ld.settlement_id || "SET-DEFAULT"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Audit Matched:</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                  {ld.matched_at ? formatDate(ld.matched_at) : "Pending Reconciliation"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Ledger Sync:</span>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Automated Rule Check</span>
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: "12px", fontStyle: "italic", padding: "10px 0" }}>
              Ledger record not initialized.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
