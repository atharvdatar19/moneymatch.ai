import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { investigateTransaction } from "../api/client";
import TracePipeline from "../components/TracePipeline";
import DiagnosisBox from "../components/DiagnosisBox";
import AiAssistant from "../components/AiAssistant";
import SamplePicker from "../components/SamplePicker";
import { 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Building, 
  Clock, 
  Calendar,
  Sparkles
} from "lucide-react";
import { formatINR, formatDate } from "../utils/formatters";

export default function InvestigatePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "TXN-00004";

  const [transactionId, setTransactionId] = useState(initialId);
  const [currentId, setCurrentId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  const runInvestigation = async (idToSearch) => {
    const target = idToSearch || transactionId;
    if (!target || !target.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await investigateTransaction(target.trim());
      setData(result);
      setCurrentId(target.trim());
      setSearchParams({ id: target.trim() });
    } catch (err) {
      setError(err.message || "Failed to investigate transaction");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      runInvestigation(initialId);
    }
  }, []);

  const handleCopyId = () => {
    if (currentId) {
      navigator.clipboard.writeText(currentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "24px 24px 60px 24px",
      width: "100%",
    }}>
      {/* Top Search & Action Bar */}
      <div className="glass-panel" style={{ padding: "20px", marginBottom: "20px" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runInvestigation(transactionId);
          }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div style={{
            position: "relative",
            flex: "1 1 320px",
          }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Search by Transaction ID (e.g. TXN-00004)..."
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                background: "#FFFFFF",
                border: "1px solid var(--border-medium)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !transactionId.trim()}
            className="btn btn-primary"
            style={{ padding: "12px 24px" }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin-slow" /> Investigating...
              </>
            ) : (
              <>
                <Search size={16} /> Trace & Diagnose
              </>
            )}
          </button>
        </form>
      </div>

      {/* 1-Click Benchmark Scenarios */}
      <SamplePicker
        selectedId={currentId}
        onSelect={(id) => {
          setTransactionId(id);
          runInvestigation(id);
        }}
      />

      {/* Error state */}
      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          color: "#EF4444",
        }}>
          <AlertCircle size={24} />
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700 }}>Investigation Error</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{error}</div>
          </div>
        </div>
      )}

      {/* Result presentation */}
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Transaction Metadata Header Card */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Target Transaction
                  </span>
                  <button
                    onClick={handleCopyId}
                    style={{
                      background: "none",
                      border: "none",
                      color: copied ? "#10B981" : "var(--text-secondary)",
                      cursor: "pointer",
                      padding: "2px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                    }}
                  >
                    <Copy size={12} /> {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <h1 style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  margin: "2px 0 0 0",
                  letterSpacing: "-0.01em",
                }}>
                  {data.transaction_id}
                </h1>
              </div>

              {/* Merchant Details */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                fontSize: "13px",
              }}>
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Merchant</div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {data.trace?.gateway?.merchant_name || "Enterprise Merchant"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Net Settlement</div>
                  <div style={{ fontWeight: 700, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                    {formatINR(data.trace?.gateway?.net_settlement_amount)}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>Gateway Timestamp</div>
                  <div style={{ color: "var(--text-secondary)" }}>
                    {formatDate(data.trace?.gateway?.gateway_timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rule Engine Diagnosis Banner */}
          <DiagnosisBox
            diagnosis={data.diagnosis}
            reason={data.reason}
            action={data.recommended_action}
          />

          {/* 3-Way Pipeline Trace Visualization */}
          <TracePipeline
            trace={data.trace}
            diagnosis={data.diagnosis}
          />

          {/* Groq AI Copilot & Natural Language Explainer */}
          <AiAssistant
            transactionId={data.transaction_id}
            currentDiagnosis={data.diagnosis}
          />
        </div>
      )}
    </div>
  );
}
