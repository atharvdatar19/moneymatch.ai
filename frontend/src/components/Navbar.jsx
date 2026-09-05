import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ShieldCheck, 
  Search, 
  BarChart3, 
  Layers, 
  Cpu, 
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { to: "/investigate", label: "Investigate", icon: Search },
    { to: "/analytics", label: "Analytics & Reconciliation", icon: BarChart3 },
    { to: "/about", label: "Architecture & Security", icon: Layers },
  ];

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      background: "rgba(7, 9, 14, 0.85)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
          color: "inherit",
        }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(6, 182, 212, 0.4)",
            fontWeight: 800,
            fontSize: "18px",
            color: "#FFF",
          }}>
            ⚡
          </div>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{
                fontSize: "18px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#F8FAFC",
              }}>
                moneymatch<span style={{ color: "var(--accent-cyan)" }}>.ai</span>
              </span>
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "4px",
                background: "rgba(6, 182, 212, 0.15)",
                color: "var(--accent-cyan)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                letterSpacing: "0.05em",
              }}>
                PS-8
              </span>
            </div>
            <div style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              letterSpacing: "0.01em",
            }}>
              Merchant Settlement Investigation Engine
            </div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(255, 255, 255, 0.03)",
          padding: "4px",
          borderRadius: "12px",
          border: "1px solid var(--border-subtle)",
        }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: isActive ? "#FFF" : "var(--text-secondary)",
                  background: isActive ? "rgba(6, 182, 212, 0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(6, 182, 212, 0.3)" : "1px solid transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={15} color={isActive ? "var(--accent-cyan)" : "currentColor"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Status indicator & badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "var(--text-secondary)",
            background: "rgba(16, 185, 129, 0.08)",
            padding: "6px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(16, 185, 129, 0.25)",
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10B981",
              boxShadow: "0 0 8px #10B981",
              display: "inline-block",
            }} />
            <span style={{ color: "#10B981", fontWeight: 600 }}>Engine Live</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Cpu size={12} color="var(--accent-cyan)" /> Groq LPU
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
