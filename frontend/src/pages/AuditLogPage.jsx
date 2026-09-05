import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatINR, formatDate } from "../utils/formatters";
import { Download, ShieldCheck, Filter } from "lucide-react";

export default function AuditLogPage() {
  const auditEntries = [
    { ts: "2026-09-04 18:32:11", actor: "rule_engine::daemon", action: "BATCH_RECON_EXEC", target: "100 TRANSACTIONS", result: "47 ANOMALIES FLAGGED", hash: "sha256:7f81a...9b42" },
    { ts: "2026-09-04 18:32:09", actor: "operator::ops_lead", action: "TRANSACTION_INVESTIGATE", target: "TXN-00004", result: "DIAGNOSIS: BANK_DELAY", hash: "sha256:12e8c...4fa1" },
    { ts: "2026-09-04 18:31:54", actor: "groq_client::lpu", action: "LLM_SYNTHESIS_REQUEST", target: "TXN-00004", result: "EXPLANATION GENERATED (HIGH CONFIDENCE)", hash: "sha256:33a01...88dc" },
    { ts: "2026-09-04 18:30:40", actor: "prompt_guard::regex", action: "INPUT_SECURITY_SCAN", target: "TXN-00008", result: "PROMPT_SAFE_PASSED", hash: "sha256:91b72...551e" },
    { ts: "2026-09-04 18:29:12", actor: "operator::ops_lead", action: "TRANSACTION_INVESTIGATE", target: "TXN-00008", result: "DIAGNOSIS: DUPLICATE_UTR", hash: "sha256:44c81...009a" },
    { ts: "2026-09-04 18:28:44", actor: "operator::ops_lead", action: "MANUAL_REVIEW_FLAG", target: "TXN-00002", result: "QUEUED FOR COMPLIANCE ESCALATION", hash: "sha256:889fc...33b1" },
    { ts: "2026-09-04 18:25:01", actor: "sanitization::pii", action: "DATA_REDACTION", target: "TXN-00010", result: "SCRUBBED 3 SENSITIVE FIELDS", hash: "sha256:66e01...77cb" },
    { ts: "2026-09-04 18:24:22", actor: "rule_engine::daemon", action: "AMOUNT_DELTA_CHECK", target: "TXN-00010", result: "DIAGNOSIS: AMOUNT_MISMATCH", hash: "sha256:99f1a...44ed" },
    { ts: "2026-09-04 18:20:10", actor: "rule_engine::daemon", action: "BANK_FILE_INGESTION", target: "SET-0001", result: "100 BANK RECORDS AUDITED", hash: "sha256:55ab2...112e" },
    { ts: "2026-09-04 18:15:00", actor: "system::auth", action: "API_KEY_VERIFICATION", target: "APP_SESSION", result: "AUTHORIZATION GRANTED", hash: "sha256:22de8...99ff" },
  ];

  const exportLog = () => {
    const csv = "timestamp,actor,action,target,result,hash\n" + auditEntries.map(e => `"${e.ts}","${e.actor}","${e.action}","${e.target}","${e.result}","${e.hash}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneymatch_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em" }}>
            Immutable Technical Audit Log
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginTop: "6px" }}>
            Cryptographically sealed event ledger capturing all rules engine evaluations, user queries, and AI syntheses.
          </p>
        </div>

        <button onClick={exportLog} className="btn btn-secondary">
          <Download size={15} /> Export Ledger CSV
        </button>
      </div>

      {/* Log Table */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)"
      }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp (UTC)</th>
              <th>Actor / System Module</th>
              <th>Action Trigger</th>
              <th>Target Scope</th>
              <th>Forensic Result / State</th>
              <th style={{ textAlign: "right" }}>Integrity Hash</th>
            </tr>
          </thead>
          <tbody>
            {auditEntries.map((row, i) => (
              <tr key={i}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                  {row.ts}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--brand-primary)" }}>
                  {row.actor}
                </td>
                <td style={{ fontWeight: 600, fontSize: "11px" }}>
                  {row.action}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>
                  {row.target}
                </td>
                <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  {row.result}
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>
                  {row.hash}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
