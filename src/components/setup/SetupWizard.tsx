import { useState } from "react";
import { HatchesLogo } from "../brand/HatchesLogo";

type Step = "db" | "admin" | "restart";
type Provider = "sqlite" | "postgresql" | "mysql" | "mssql";

const PROVIDERS: { id: Provider; label: string; icon: string; placeholder: string }[] = [
  { id: "sqlite",     label: "SQLite",           icon: "🗄️",  placeholder: "file:./dev.db" },
  { id: "postgresql", label: "PostgreSQL",        icon: "🐘",  placeholder: "postgresql://user:password@localhost:5432/hatches" },
  { id: "mysql",      label: "MySQL / MariaDB",   icon: "🐬",  placeholder: "mysql://user:password@localhost:3306/hatches" },
  { id: "mssql",      label: "SQL Server",        icon: "🪟",  placeholder: "sqlserver://localhost:1433;database=hatches;user=sa;password=YourPassword" },
];

interface Props {
  initialStep: Step;
}

export function SetupWizard({ initialStep }: Props) {
  const [step, setStep] = useState<Step>(initialStep);

  return (
    <div className="w-full max-w-md px-4">
      {/* Logo hero */}
      <div className="flex flex-col items-center mb-8 gap-4">
        <HatchesLogo size={60} wordmark wordmarkSize={26} />
        <div className="text-center">
          <p className="text-zinc-500 text-[13px]" style={{ letterSpacing: "-0.01em" }}>
            {step === "db"      && "Schritt 1 von 2 — Datenbankverbindung"}
            {step === "admin"   && "Schritt 2 von 2 — Admin-Account erstellen"}
            {step === "restart" && "Fast fertig — Server neu starten"}
          </p>
        </div>
        {/* Progress bar */}
        {step !== "restart" && (
          <div className="flex gap-1.5">
            <div className="h-0.5 w-14 rounded-full" style={{ background: "#3CC79A" }} />
            <div className="h-0.5 w-14 rounded-full" style={{ background: step === "admin" ? "#3CC79A" : "rgba(255,255,255,0.12)" }} />
          </div>
        )}
      </div>

      {step === "db"      && <DbStep onDone={(needsRestart) => needsRestart ? setStep("restart") : setStep("admin")} />}
      {step === "admin"   && <AdminStep />}
      {step === "restart" && <RestartStep />}
    </div>
  );
}

/* ─── Step 1: DB Config ──────────────────────────────────────────────────── */

function DbStep({ onDone }: { onDone: (needsRestart: boolean) => void }) {
  const [provider, setProvider] = useState<Provider>("sqlite");
  const [url, setUrl]           = useState("file:./dev.db");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const current = PROVIDERS.find((p) => p.id === provider)!;

  function handleProviderChange(id: Provider) {
    setProvider(id);
    const p = PROVIDERS.find((p) => p.id === id)!;
    setUrl(p.placeholder);
    setError("");
  }

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/setup/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, url }),
      });
      const data = await res.json();
      if (data.ok) {
        onDone(data.needsRestart ?? false);
      } else {
        setError(data.error ?? "Unbekannter Fehler");
      }
    } catch (e: any) {
      setError(e.message ?? "Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "#1c1f23",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "#f4f4f5",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 20px" }}>
      {/* Provider selection */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleProviderChange(p.id)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 12px",
              borderRadius: 10,
              border: provider === p.id ? "1px solid rgba(60,199,154,0.5)" : "1px solid rgba(255,255,255,0.08)",
              background: provider === p.id ? "rgba(60,199,154,0.10)" : "rgba(255,255,255,0.03)",
              color: provider === p.id ? "#5DDBB0" : "rgba(255,255,255,0.45)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              textAlign: "left", transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: 15 }}>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* URL input */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {provider === "sqlite" ? "Dateipfad" : "Verbindungs-URL"}
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={current.placeholder}
          style={{ ...inputStyle, fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 12 }}
          spellCheck={false}
        />
        {provider === "sqlite" && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>
            Relativer Pfad vom Arbeitsverzeichnis
          </p>
        )}
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 12px", color: "#fca5a5", fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !url.trim()}
        style={{
          background: "linear-gradient(135deg,#3CC79A,#1e8e74)",
          color: "#fff", fontWeight: 600, fontSize: 14,
          border: "none", borderRadius: 10, padding: "11px",
          cursor: loading || !url.trim() ? "not-allowed" : "pointer",
          opacity: loading || !url.trim() ? 0.5 : 1,
          transition: "opacity 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          letterSpacing: "-0.01em", fontFamily: "inherit",
        }}
      >
        {loading ? (
          <>
            <Spinner /> Datenbank einrichten…
          </>
        ) : (
          "Datenbank einrichten →"
        )}
      </button>
    </div>
  );
}

/* ─── Step 2: Admin Account ──────────────────────────────────────────────── */

function AdminStep() {
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.ok) {
        window.location.href = "/projects";
      } else {
        setError(data.error ?? "Unbekannter Fehler");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const iStyle = {
    background: "#1c1f23", border: "1px solid rgba(255,255,255,0.10)",
    color: "#f4f4f5", borderRadius: 10, padding: "10px 14px",
    fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%",
    boxSizing: "border-box" as const,
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 20px" }}>
      <input type="text"     value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Benutzername"            required autoFocus style={iStyle} />
      <input type="email"    value={email}    onChange={(e) => setEmail(e.target.value)}    placeholder="E-Mail"                  required          style={iStyle} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort (min. 6 Zeichen)" required minLength={6} style={iStyle} />
      {error && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>}
      <button
        type="submit" disabled={loading}
        style={{
          background: "linear-gradient(135deg,#3CC79A,#1e8e74)", color: "#fff",
          fontWeight: 600, fontSize: 14, border: "none", borderRadius: 10, padding: 11,
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          letterSpacing: "-0.01em", fontFamily: "inherit", marginTop: 4,
          transition: "opacity 0.15s",
        }}
      >
        {loading ? <><Spinner /> Erstelle Account…</> : "Admin-Account erstellen →"}
      </button>
    </form>
  );
}

/* ─── Restart notice ─────────────────────────────────────────────────────── */

function RestartStep() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 20px" }}>
      <div style={{ background: "rgba(60,199,154,0.08)", border: "1px solid rgba(60,199,154,0.25)", borderRadius: 10, padding: "12px 14px" }}>
        <p style={{ fontWeight: 600, fontSize: 13, color: "#5DDBB0", margin: "0 0 4px" }}>Datenbank konfiguriert ✓</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
          Konfiguration in <code style={{ color: "rgba(255,255,255,0.6)" }}>.env</code> gespeichert.
          Starte den Server neu um fortzufahren.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Server neu starten</p>

        <div style={{ background: "#0f1214", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Node direkt</p>
          <code style={{ color: "#3CC79A", fontSize: 12, fontFamily: "'JetBrains Mono','SF Mono',monospace", display: "block" }}>
            node --env-file=.env dist/server/entry.mjs
          </code>
        </div>

        <div style={{ background: "#0f1214", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Docker</p>
          <code style={{ color: "#3CC79A", fontSize: 12, fontFamily: "'JetBrains Mono','SF Mono',monospace", display: "block" }}>
            docker compose restart
          </code>
        </div>
      </div>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", margin: 0 }}>
        Nach dem Neustart öffne <span style={{ color: "rgba(255,255,255,0.4)" }}>/setup</span> erneut.
      </p>
    </div>
  );
}

/* ─── Spinner ────────────────────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}
