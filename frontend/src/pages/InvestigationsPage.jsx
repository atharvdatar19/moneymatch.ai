import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchTransactions, investigateTransaction } from "../api/client";
import MoneyTrail from "../components/MoneyTrail";
import AiDrawer from "../components/AiDrawer";
import { formatINR, formatDate } from "../utils/formatters";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  RefreshCw, 
  ChevronRight, 
  ExternalLink,
  SlidersHorizontal,
  Check,
  Sparkles
} from "lucide-react";

export default function InvestigationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get("id") || "TXN-00004");
  const [detailData, setDetailData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState("ALL");

  // AI Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load transactions list
  useEffect(() => {
    async function load() {
      setLoadingList(true);
      try {
        const res = await fetchTransactions();
        setTransactions(res.transactions || []);
        if (!selectedId && res.transactions?.length > 0) {
          setSelectedId(res.transactions[0].transaction_id);
        }
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setLoadingList(false);
      }
    }
    load();
  }, []);

  // Load detail preview when selectedId changes
  useEffect(() => {
    if (!selectedId) return;
    let isMounted = true;
    async function loadPreview() {
      setLoadingDetail(true);
      try {
        const res = await investigateTransaction(selectedId);
        if (isMounted) setDetailData(res);
      } catch (err) {
        console.error("Preview load error", err);
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    }
    loadPreview();
    return () => { isMounted = false; };
  }, [selectedId]);

  const filteredList = transactions.filter((t) => {
    const matchesCategory = scenarioFilter === "ALL" || t.scenario === scenarioFilter;
    const matchesSearch = !searchQuery || 
      t.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.utr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "420px 1fr",
      gap: "24px",
      height: "calc(100vh - 120px)",
      width: "100%",
    }}>
      {/* Left Pane: Master Transaction List */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)"
      }}>
        {/* Search & Filter Header */}
        <div style={{ padding: "12px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface-raised)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-base)", border: "1px solid var(--border-medium)", borderRadius: "4px", padding: "6px 10px", marginBottom: "8px" }}>
            <Search size={14} color="var(--brand-primary)" />
            <input
              type="text"
              placeholder="Filter transactions by ID, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "12.5px",
                fontFamily: "var(--font-mono)",
                width: "100%",
              }}
            />
          </div>

          {/* Scenario Filter Select */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <select
              value={scenarioFilter}
              onChange={(e) => setScenarioFilter(e.target.value)}
              style={{
                background: "#FFFFFF",
                border: "1px solid var(--border-medium)",
                borderRadius: "4px",
                color: "var(--text-primary)",
                fontSize: "12px",
                padding: "6px 10px",
                outline: "none",
                width: "100%",
              }}
            >
              <option value="ALL">All Diagnoses ({transactions.length})</option>
              <option value="SUCCESS">Exact Match (SUCCESS)</option>
              <option value="BANK_DELAY">Bank Settlement Delay</option>
              <option value="DUPLICATE_UTR">Duplicate Reference (UTR)</option>
              <option value="AMOUNT_MISMATCH">Amount Mismatch</option>
              <option value="MISSING_BANK_RECORD">Missing Bank Statement</option>
              <option value="PARTIAL_SETTLEMENT">Partial Settlement</option>
              <option value="UNCLASSIFIED">Manual Review Conflict</option>
            </select>
          </div>
        </div>

        {/* Dense Rows List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingList ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading queue...
            </div>
          ) : filteredList.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
              No transactions match filter.
            </div>
          ) : (
            filteredList.map((t) => {
              const isSelected = selectedId === t.transaction_id;
              return (
                <div
                  key={t.transaction_id}
                  onClick={() => setSelectedId(t.transaction_id)}
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--border-subtle)",
                    background: isSelected ? "var(--pista-tint)" : "transparent",
                    borderLeft: isSelected ? "3px solid var(--brand-forest)" : "3px solid transparent",
                    cursor: "pointer",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "var(--bg-surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12.5px", color: isSelected ? "var(--brand-forest)" : "var(--text-primary)" }}>
                      {t.transaction_id}
                    </span>
                    <span className="font-mono tabular-nums" style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {formatINR(t.net_settlement_amount)}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.merchant_name}
                    </span>
                    <span className={`tag ${getTagClass(t.scenario)}`} style={{ fontSize: "10px", padding: "1px 6px" }}>
                      {t.scenario.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Selected Transaction Detail Preview */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(17, 28, 21, 0.04)"
      }}>
        {loadingDetail && !detailData ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>
            Cross-referencing settlement stages...
          </div>
        ) : !detailData ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>
            Select a transaction from the list to inspect its money trail.
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                  INSPECTION PREVIEW
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  {detailData.transaction_id}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="btn btn-secondary btn-sm"
                >
                  <Sparkles size={13} /> Ask AI
                </button>
                <Link
                  to={`/investigations/${detailData.transaction_id}`}
                  className="btn btn-primary btn-sm"
                >
                  Full Forensic View <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Money Trail */}
            <div style={{ marginBottom: "20px" }}>
              <MoneyTrail trace={detailData.trace} diagnosis={detailData.diagnosis} />
            </div>

            {/* Deterministic Verdict & Reason */}
            <div style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "4px",
              padding: "14px 16px",
              marginBottom: "16px",
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                Ground Truth Diagnosis
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                {detailData.reason}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Recommended Action: {detailData.recommended_action}
              </div>
            </div>

            {/* Evidence summary stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              fontSize: "12px",
            }}>
              <div style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "4px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Order Reference</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, marginTop: "2px" }}>
                  {detailData.trace?.gateway?.order_id || "—"}
                </div>
              </div>
              <div style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "4px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Bank UTR</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, marginTop: "2px" }}>
                  {detailData.trace?.bank?.utr || "Pending Credit"}
                </div>
              </div>
              <div style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", padding: "12px", borderRadius: "4px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Merchant Account</div>
                <div style={{ fontWeight: 600, marginTop: "2px" }}>
                  {detailData.trace?.gateway?.merchant_name || "Enterprise"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scoped AI Drawer */}
      <AiDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        transactionId={selectedId}
        deterministicCategory={detailData?.diagnosis?.category}
      />
    </div>
  );
}
