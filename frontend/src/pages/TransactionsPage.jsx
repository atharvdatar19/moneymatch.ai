import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchTransactions } from "../api/client";
import { formatINR, formatDate } from "../utils/formatters";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  ArrowUpRight, 
  Download,
  Check,
  RefreshCw
} from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchTransactions();
        setTransactions(res.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchesScenario = scenarioFilter === "ALL" || t.scenario === scenarioFilter;
    const matchesSearch = !search || 
      t.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
      t.order_id.toLowerCase().includes(search.toLowerCase()) ||
      t.merchant_name.toLowerCase().includes(search.toLowerCase()) ||
      t.utr.toLowerCase().includes(search.toLowerCase());
    return matchesScenario && matchesSearch;
  });

  const getTagClass = (cat) => {
    switch (cat) {
      case "SUCCESS": return "tag-success";
      case "BANK_DELAY": return "tag-warning";
      case "DUPLICATE_UTR": return "tag-collision";
      case "UNCLASSIFIED": return "tag-neutral";
      default: return "tag-danger";
    }
  };

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["Transaction ID", "Order ID", "Merchant", "Net Amount", "UTR", "Scenario", "Timestamp"];
    const rows = filtered.map(t => [
      t.transaction_id,
      t.order_id,
      `"${t.merchant_name}"`,
      t.net_settlement_amount,
      t.utr,
      t.scenario,
      t.gateway_timestamp
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneymatch_txns_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.03em" }}>
            Settlement Transactions Registry
          </h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginTop: "6px" }}>
            Comprehensive ledger of 100 merchant settlement records across gateway, nodal accounts, and book entries.
          </p>
        </div>

        <button onClick={exportCSV} className="btn btn-secondary">
          <Download size={15} /> Export Filtered CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "14px",
        boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 360px" }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Order ID, UTR, or Merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--border-medium)",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
              outline: "none",
              width: "100%",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            value={scenarioFilter}
            onChange={(e) => setScenarioFilter(e.target.value)}
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border-medium)",
              borderRadius: "4px",
              color: "var(--text-primary)",
              fontSize: "12px",
              padding: "6px 10px",
              outline: "none",
            }}
          >
            <option value="ALL">All Categories ({transactions.length})</option>
            <option value="SUCCESS">Exact Match (SUCCESS)</option>
            <option value="BANK_DELAY">Bank Settlement Delay</option>
            <option value="DUPLICATE_UTR">Duplicate UTR Reference</option>
            <option value="AMOUNT_MISMATCH">Amount Mismatch</option>
            <option value="MISSING_BANK_RECORD">Missing Bank Statement</option>
            <option value="PARTIAL_SETTLEMENT">Partial Settlement</option>
            <option value="UNCLASSIFIED">Manual Review Queue</option>
          </select>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            SHOWING {filtered.length} OF {transactions.length}
          </span>
        </div>
      </div>

      {/* Dense Table */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        overflow: "hidden",
      }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "30px" }}></th>
              <th>Transaction ID</th>
              <th>Order ID</th>
              <th>Merchant Account</th>
              <th style={{ textAlign: "right" }}>Net Settlement</th>
              <th>Bank UTR</th>
              <th>Diagnosis</th>
              <th>Captured Timestamp</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Loading transactions from settlement feed...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No transactions match your search filter.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const isExpanded = expandedId === t.transaction_id;
                return (
                  <React.Fragment key={t.transaction_id}>
                    <tr 
                      onClick={() => setExpandedId(isExpanded ? null : t.transaction_id)}
                      style={{ cursor: "pointer", background: isExpanded ? "var(--bg-surface-raised)" : "transparent" }}
                    >
                      <td style={{ color: "var(--text-muted)", textAlign: "center" }}>
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </td>
                      <td className="font-mono" style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        {t.transaction_id}
                      </td>
                      <td className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {t.order_id}
                      </td>
                      <td style={{ color: "var(--text-primary)" }}>
                        {t.merchant_name}
                      </td>
                      <td className="font-mono tabular-nums" style={{ textAlign: "right", fontWeight: 600 }}>
                        {formatINR(t.net_settlement_amount)}
                      </td>
                      <td className="font-mono" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                        {t.utr}
                      </td>
                      <td>
                        <span className={`tag ${getTagClass(t.scenario)}`}>
                          {t.scenario.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {formatDate(t.gateway_timestamp)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          to={`/investigations/${t.transaction_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "11px", padding: "2px 8px" }}
                        >
                          Investigate <ArrowUpRight size={11} />
                        </Link>
                      </td>
                    </tr>

                    {/* Row Expansion for quick evidence glance as specified in brief */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} style={{ background: "var(--bg-base)", padding: "16px 24px", borderBottom: "1px solid var(--border-medium)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: "24px", fontSize: "12px" }}>
                              <div>
                                <span style={{ color: "var(--text-muted)" }}>Gross Amount: </span>
                                <strong className="font-mono">{formatINR(t.gross_amount)}</strong>
                              </div>
                              <div>
                                <span style={{ color: "var(--text-muted)" }}>Merchant ID: </span>
                                <strong className="font-mono">{t.merchant_id}</strong>
                              </div>
                              <div>
                                <span style={{ color: "var(--text-muted)" }}>Audit Notes: </span>
                                <span>{t.notes || "Ground truth scenario recorded in data stream."}</span>
                              </div>
                            </div>

                            <Link
                              to={`/investigations/${t.transaction_id}`}
                              className="btn btn-primary btn-sm"
                            >
                              Open Full 3-Way Forensic View <ArrowUpRight size={12} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
