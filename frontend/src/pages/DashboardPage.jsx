import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchBatchInvestigation } from "../api/client";
import { formatINR, formatDate } from "../utils/formatters";
import { 
  ArrowRight, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Filter,
  X,
  Layers,
  ChevronRight,
  TrendingDown,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStageFilter, setActiveStageFilter] = useState("ALL"); // ALL, GATEWAY, BANK, LEDGER
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchBatchInvestigation();
        setData(res);
      } catch (err) {
        console.error("Dashboard data load error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const summary = data?.summary || {};
  const results = data?.results || [];

  // Filter exceptions based on selected stage or category
  const exceptions = useMemo(() => {
    return results.filter((r) => r.category !== "SUCCESS");
  }, [results]);

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((r) => {
      // Category filter
      if (activeCategoryFilter !== "ALL" && r.category !== activeCategoryFilter) {
        return false;
      }

      // Stage filter
      if (activeStageFilter === "BANK") {
        return r.category === "BANK_DELAY" || r.category === "MISSING_BANK_RECORD";
      }
      if (activeStageFilter === "LEDGER") {
        return r.category === "AMOUNT_MISMATCH" || r.category === "DUPLICATE_UTR" || r.category === "PARTIAL_SETTLEMENT" || r.category === "UNCLASSIFIED";
      }
      return true;
    });
  }, [exceptions, activeStageFilter, activeCategoryFilter]);

  const getTagClass = (cat) => {
    switch (cat) {
      case "BANK_DELAY": return "tag-warning";
      case "DUPLICATE_UTR": return "tag-collision";
      case "UNCLASSIFIED": return "tag-neutral";
      default: return "tag-danger";
    }
  };

  // Capital at risk distribution segments
  const riskAllocation = useMemo(() => {
    const totalAtRisk = summary.at_risk_volume_inr || 687818.48;
    const breakdown = summary.category_breakdown || {};
    
    const bankDelayCount = breakdown.BANK_DELAY || 10;
    const missingBankCount = breakdown.MISSING_BANK_RECORD || 8;
    const amountMismatchCount = breakdown.AMOUNT_MISMATCH || 15;
    const duplicateUtrCount = breakdown.DUPLICATE_UTR || 3;
    const totalExceptionCount = bankDelayCount + missingBankCount + amountMismatchCount + duplicateUtrCount || 36;

    return [
      {
        id: "AMOUNT_MISMATCH",
        label: "Amount Deltas",
        pct: Math.round((amountMismatchCount / totalExceptionCount) * 100),
        amount: Math.round(totalAtRisk * (amountMismatchCount / totalExceptionCount)),
        color: "var(--status-danger)",
        bg: "#FEE2E2",
      },
      {
        id: "BANK_DELAY",
        label: "Nodal Queue Delays",
        pct: Math.round((bankDelayCount / totalExceptionCount) * 100),
        amount: Math.round(totalAtRisk * (bankDelayCount / totalExceptionCount)),
        color: "var(--status-warning)",
        bg: "#FEF3C7",
      },
      {
        id: "MISSING_BANK_RECORD",
        label: "Missing Statements",
        pct: Math.round((missingBankCount / totalExceptionCount) * 100),
        amount: Math.round(totalAtRisk * (missingBankCount / totalExceptionCount)),
        color: "#C2410C",
        bg: "#FFEDD5",
      },
      {
        id: "DUPLICATE_UTR",
        label: "Duplicate References",
        pct: Math.round((duplicateUtrCount / totalExceptionCount) * 100),
        amount: Math.round(totalAtRisk * (duplicateUtrCount / totalExceptionCount)),
        color: "var(--status-collision)",
        bg: "#EDE9FE",
      },
    ];
  }, [summary]);

  const resetFilters = () => {
    setActiveStageFilter("ALL");
    setActiveCategoryFilter("ALL");
  };

  return (
    <div style={{ width: "100%" }}>
      {/* 1. Header & Command Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ 
              fontSize: "11px", 
              fontWeight: 800, 
              color: "var(--brand-forest)", 
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "var(--pista-tint)",
              border: "1px solid var(--pista-light)",
              padding: "3px 8px",
              borderRadius: "4px"
            }}>
              Settlement Intelligence Platform
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>•</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              NODE CLEARING: <strong style={{ color: "var(--brand-primary)" }}>CYCLE T+1</strong>
            </span>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em" }}>
            Settlement Pipeline Command Center
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Continuous cross-layer reconciliation: Gateway (Capture) → Bank Statement (Credit) → General Ledger.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {(activeStageFilter !== "ALL" || activeCategoryFilter !== "ALL") && (
            <button 
              onClick={resetFilters}
              className="btn btn-sm"
              style={{ background: "#FFFFFF", color: "var(--status-danger)", borderColor: "var(--status-danger-border)" }}
            >
              <X size={13} /> Reset Filter
            </button>
          )}

          <span style={{ 
            fontSize: "12.5px", 
            color: "var(--brand-forest)", 
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            background: "#FFFFFF",
            border: "1px solid var(--border-medium)",
            padding: "8px 14px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 1px 2px rgba(17, 28, 21, 0.03)"
          }}>
            <span className="pulse-indicator" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--brand-accent)" }} />
            ENGINE: <strong>100% DETERMINISTIC</strong>
          </span>

          <Link to="/investigations" className="btn btn-primary" style={{ padding: "9px 18px", fontSize: "14px" }}>
            Launch Workspace <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* 2. Interactive Settlement Pipeline Highway (Click to Filter by Stage) */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
        padding: "24px 28px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)",
        width: "100%"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            <Layers size={14} color="var(--brand-primary)" />
            <span>Interactive Settlement Highway (Click any node to filter triage queue)</span>
          </div>

          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            STAGE SCOPE: <strong style={{ color: "var(--brand-forest)" }}>{activeStageFilter}</strong>
          </span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 48px 1fr 48px 1fr",
          alignItems: "center",
          gap: "12px",
        }}>
          {/* Node 1: Gateway Ingestion */}
          <div 
            onClick={() => setActiveStageFilter(activeStageFilter === "GATEWAY" ? "ALL" : "GATEWAY")}
            className="interactive-hover"
            style={{ 
              background: activeStageFilter === "GATEWAY" ? "var(--pista-tint)" : "var(--bg-base)", 
              border: activeStageFilter === "GATEWAY" ? "2px solid var(--brand-primary)" : "1px solid var(--border-subtle)", 
              borderRadius: "8px", 
              padding: "20px",
              position: "relative"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.06em" }}>STAGE 1: CAPTURE</span>
              <span style={{ fontSize: "11px", color: "var(--brand-primary)", fontWeight: 700 }}>100% INGESTED</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "6px" }}>
              {summary.total_investigated || 100} TXNS
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "6px" }}>
              Captured volume: <strong className="font-mono">{formatINR(summary.total_volume_inr || 8421980)}</strong>
            </div>
          </div>

          {/* Connector 1 -> 2 */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", height: "2px", background: "var(--brand-accent)", position: "relative" }}>
              <span className="pulse-indicator" style={{ position: "absolute", top: "-3px", left: "40%", width: "8px", height: "8px", borderRadius: "50%", background: "var(--brand-accent)" }} />
            </div>
          </div>

          {/* Node 2: Bank Settlement */}
          <div 
            onClick={() => setActiveStageFilter(activeStageFilter === "BANK" ? "ALL" : "BANK")}
            className="interactive-hover"
            style={{ 
              background: activeStageFilter === "BANK" ? "var(--pista-tint)" : "var(--bg-base)", 
              border: activeStageFilter === "BANK" ? "2px solid var(--status-warning)" : "1px solid var(--border-subtle)", 
              borderRadius: "8px", 
              padding: "20px",
              position: "relative"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--status-warning)", letterSpacing: "0.06em" }}>STAGE 2: BANK TRANSIT</span>
              <span className="tag tag-warning" style={{ fontSize: "10px", padding: "1px 6px" }}>18 EXCEPTIONS</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", marginTop: "6px" }}>
              {(summary.total_investigated || 100) - (summary.category_breakdown?.MISSING_BANK_RECORD || 8)} CREDITED
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--status-warning)", marginTop: "6px", fontWeight: 600 }}>
              {summary.category_breakdown?.BANK_DELAY || 10} delays • {summary.category_breakdown?.MISSING_BANK_RECORD || 8} missing statements
            </div>
          </div>

          {/* Connector 2 -> 3 */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", height: "2px", background: "var(--border-medium)", position: "relative" }}>
              <span style={{ position: "absolute", top: "-3px", left: "40%", width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-danger)" }} />
            </div>
          </div>

          {/* Node 3: General Ledger */}
          <div 
            onClick={() => setActiveStageFilter(activeStageFilter === "LEDGER" ? "ALL" : "LEDGER")}
            className="interactive-hover"
            style={{ 
              background: activeStageFilter === "LEDGER" ? "var(--pista-tint)" : "var(--bg-base)", 
              border: activeStageFilter === "LEDGER" ? "2px solid var(--brand-forest)" : "1px solid var(--border-subtle)", 
              borderRadius: "8px", 
              padding: "20px",
              position: "relative"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--brand-primary)", letterSpacing: "0.06em" }}>STAGE 3: GENERAL LEDGER</span>
              <span className="tag tag-success" style={{ fontSize: "10px", padding: "1px 6px" }}>53% HEALTHY</span>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--brand-primary)", marginTop: "6px" }}>
              {summary.success_count || 53} RECONCILED
            </div>
            <div style={{ fontSize: "13.5px", color: "var(--brand-forest)", marginTop: "6px", fontWeight: 700 }}>
              {summary.success_rate_percent || 53}% matched • 47 exceptions flagged
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hero Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "18px",
        marginBottom: "24px",
        width: "100%"
      }}>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)" }}>
          <div style={{ fontSize: "34px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            {formatINR(summary.total_volume_inr)}
          </div>
          <div style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-secondary)", marginTop: "6px" }}>
            Total Audited Volume
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
            100% trace coverage across 100 transaction cycles
          </div>
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)" }}>
          <div style={{ fontSize: "34px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--status-success)", letterSpacing: "-0.02em" }}>
            {summary.success_rate_percent}%
          </div>
          <div style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-secondary)", marginTop: "6px" }}>
            Clean Exact Match Rate
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
            {summary.success_count} transactions confirmed fully settled
          </div>
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)" }}>
          <div style={{ fontSize: "34px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--status-danger)", letterSpacing: "-0.02em" }}>
            {summary.anomaly_count}
          </div>
          <div style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-secondary)", marginTop: "6px" }}>
            Exceptions Flagged
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
            Requiring operational triage or bank re-query
          </div>
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "22px 24px", boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)" }}>
          <div style={{ fontSize: "34px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--status-danger)", letterSpacing: "-0.02em" }}>
            {formatINR(summary.at_risk_volume_inr)}
          </div>
          <div style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-secondary)", marginTop: "6px" }}>
            Capital Currently at Risk
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
            Held in delay queues or delta mismatches
          </div>
        </div>
      </div>

      {/* 4. Interactive Capital-at-Risk Allocation Bar */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        padding: "20px 24px",
        marginBottom: "28px",
        boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
              Capital-at-Risk Distribution & Origin Attribution
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
              Click any category slice to isolate affected transactions:
            </div>
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, color: "var(--status-danger)" }}>
            Total At Risk: {formatINR(summary.at_risk_volume_inr)}
          </div>
        </div>

        {/* Multi-Segment Horizontal Bar */}
        <div style={{
          height: "22px",
          width: "100%",
          display: "flex",
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
          marginBottom: "14px"
        }}>
          {riskAllocation.map((seg) => {
            const isSelected = activeCategoryFilter === seg.id;
            return (
              <div
                key={seg.id}
                onClick={() => setActiveCategoryFilter(activeCategoryFilter === seg.id ? "ALL" : seg.id)}
                title={`${seg.label}: ${seg.pct}% (${formatINR(seg.amount)})`}
                style={{
                  width: `${seg.pct}%`,
                  background: seg.color,
                  cursor: "pointer",
                  opacity: activeCategoryFilter === "ALL" || isSelected ? 1 : 0.35,
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  transform: isSelected ? "scaleY(1.15)" : "scaleY(1)",
                }}
              />
            );
          })}
        </div>

        {/* Segment Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "13px" }}>
          {riskAllocation.map((seg) => {
            const isSelected = activeCategoryFilter === seg.id;
            return (
              <div 
                key={seg.id}
                onClick={() => setActiveCategoryFilter(activeCategoryFilter === seg.id ? "ALL" : seg.id)}
                className="interactive-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: isSelected ? "var(--pista-tint)" : "transparent",
                  border: isSelected ? `1px solid ${seg.color}` : "1px solid transparent",
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: seg.color }} />
                <span style={{ color: "var(--text-primary)" }}>{seg.label}</span>
                <span className="font-mono tabular-nums" style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  ({seg.pct}% • {formatINR(seg.amount)})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Stream of Active Exceptions (With Stage & Category Filters applied) */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)",
        width: "100%"
      }}>
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface-raised)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Active Exception Triage Stream ({filteredExceptions.length} Filtered / {exceptions.length} Total)
            </span>
            {(activeStageFilter !== "ALL" || activeCategoryFilter !== "ALL") && (
              <span className="tag tag-pista" style={{ fontSize: "11px" }}>
                Filter: {activeStageFilter !== "ALL" ? `Stage ${activeStageFilter}` : ""} {activeCategoryFilter !== "ALL" ? activeCategoryFilter : ""}
              </span>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
            PRIORITIZED BY SETTLEMENT SLA
          </span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "16%" }}>Timestamp</th>
              <th style={{ width: "13%" }}>Transaction ID</th>
              <th style={{ width: "16%" }}>Merchant</th>
              <th style={{ width: "14%" }}>Net Amount</th>
              <th style={{ width: "15%" }}>Deterministic Diagnosis</th>
              <th style={{ width: "18%" }}>Root Cause Summary</th>
              <th style={{ textAlign: "right", width: "8%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExceptions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No exceptions match the selected filter combination. <button onClick={resetFilters} style={{ color: "var(--brand-primary)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Reset filters</button>
                </td>
              </tr>
            ) : (
              filteredExceptions.slice(0, 15).map((ex) => (
                <tr key={ex.transaction_id}>
                  <td style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                    {formatDate(ex.timestamp)}
                  </td>
                  <td className="font-mono" style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14.5px" }}>
                    {ex.transaction_id}
                  </td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "14.5px" }}>
                    {ex.merchant_name}
                  </td>
                  <td className="font-mono tabular-nums" style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "14.5px" }}>
                    {formatINR(ex.net_amount)}
                  </td>
                  <td>
                    <span className={`tag ${getTagClass(ex.category)}`}>
                      {ex.category.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "13.5px", maxWidth: "420px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ex.reason}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      to={`/investigations/${ex.transaction_id}`}
                      className="btn btn-sm"
                      style={{ background: "var(--bg-base)" }}
                    >
                      Inspect <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
