import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Compass, 
  Search, 
  Database, 
  BarChart2, 
  ShieldAlert, 
  Sliders, 
  Command, 
  ExternalLink,
  Lock,
  Cpu,
  ArrowRight,
  Check
} from "lucide-react";

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navItems = [
    { to: "/dashboard", label: "Command Center", icon: Compass },
    { to: "/investigations", label: "Investigations Workspace", icon: Search },
    { to: "/transactions", label: "Transactions Registry", icon: Database },
    { to: "/analytics", label: "Funnel & Attribution", icon: BarChart2 },
    { to: "/audit-log", label: "Audit Ledger", icon: ShieldAlert },
    { to: "/settings", label: "Configuration", icon: Sliders },
  ];

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      navigate(`/investigations/${query.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="terminal-layout">
      {/* 60px Navigation Rail */}
      <aside className="terminal-rail">
        {/* Brand Logo */}
        <Link to="/dashboard" title="moneymatch.ai" style={{ marginBottom: "22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img 
            src="/logo.png" 
            alt="moneymatch.ai" 
            style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px" }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>

        {/* Rail Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", alignItems: "center" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || 
              (item.to === "/investigations" && location.pathname.startsWith("/investigations"));

            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isActive ? "var(--brand-forest)" : "var(--text-muted)",
                  background: isActive ? "var(--pista-light)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--brand-forest)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                  textDecoration: "none",
                }}
              >
                <Icon size={19} />
              </Link>
            );
          })}
        </nav>

        {/* Rail Footer */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", paddingBottom: "10px" }}>
          <div 
            title="Deterministic Rule Engine: Operational" 
            style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              background: "var(--brand-accent)",
              boxShadow: "0 0 6px rgba(64, 145, 108, 0.4)"
            }} 
          />
        </div>
      </aside>

      {/* Main Terminal Region */}
      <div className="terminal-main">
        {/* Top Command Bar */}
        <header className="terminal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Quick ⌘K Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#FFFFFF",
                border: "1px solid var(--border-medium)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "var(--text-muted)",
                fontSize: "13.5px",
                cursor: "pointer",
                width: "420px",
                boxShadow: "0 1px 2px rgba(18, 30, 22, 0.03)",
              }}
            >
              <Search size={16} color="var(--brand-forest)" />
              <span style={{ flex: 1, textAlign: "left", color: "var(--text-secondary)" }}>Search Txn, UTR, Order, Merchant...</span>
              <kbd style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                padding: "2px 7px",
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}>
                ⌘K
              </kbd>
            </button>

            {/* Scope breadcrumb */}
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
              RECONCILE: <span style={{ color: "var(--brand-forest)", fontWeight: 700 }}>T+1 NODAL CLEARING</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: "13px" }}>
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--brand-forest)",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "12px",
              background: "var(--pista-tint)",
              padding: "5px 12px",
              borderRadius: "20px",
              border: "1px solid var(--pista-medium)",
            }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--brand-accent)" }} />
              DETERMINISTIC ENGINE
            </span>
            <span style={{ color: "var(--border-medium)" }}>|</span>
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "var(--text-secondary)",
              fontSize: "11px",
              fontWeight: 500,
            }}>
              <Cpu size={13} color="var(--brand-forest)" /> Groq LPU Active
            </span>
          </div>
        </header>

        {/* Dynamic Screen Content */}
        <div className="terminal-content">
          {children}
        </div>
      </div>

      {/* Global Command Palette Modal */}
      {searchOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(18, 30, 22, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "120px",
        }}
        onClick={() => setSearchOpen(false)}
        >
          <div 
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--border-medium)",
              borderRadius: "8px",
              width: "560px",
              boxShadow: "0 12px 36px rgba(18, 30, 22, 0.15)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)", background: "#FAF9F3" }}>
              <Search size={16} color="var(--brand-forest)" style={{ marginRight: "10px" }} />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to Transaction (e.g. TXN-00004)..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontFamily: "var(--font-mono)",
                  width: "100%",
                }}
              />
              <kbd style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>ESC to close</kbd>
            </form>

            <div style={{ padding: "10px 14px", background: "#FFFFFF" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                Benchmark Settlement Scenarios
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {[
                  { id: "TXN-00001", label: "Exact Match (SUCCESS)" },
                  { id: "TXN-00004", label: "Bank Settlement Delay (BANK_DELAY)" },
                  { id: "TXN-00008", label: "Duplicate Reference UTR (DUPLICATE_UTR)" },
                  { id: "TXN-00010", label: "Amount Mismatch (AMOUNT_MISMATCH)" },
                  { id: "TXN-00009", label: "Missing Bank Statement (MISSING_BANK_RECORD)" },
                  { id: "TXN-00017", label: "Partial Settlement (PARTIAL_SETTLEMENT)" },
                  { id: "TXN-00002", label: "Manual Review Conflict (UNCLASSIFIED)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(`/investigations/${item.id}`);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--pista-tint)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--brand-forest)" }}>{item.id}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
