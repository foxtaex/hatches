import { useState } from "react";

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
      {/* Logo / Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Hatches einrichten</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {step === "db"      && "Schritt 1 von 2 — Datenbankverbindung konfigurieren"}
          {step === "admin"   && "Schritt 2 von 2 — Admin-Account erstellen"}
          {step === "restart" && "Fast fertig — Server neu starten"}
        </p>
        {/* Progress bar */}
        <div className="flex gap-1.5 justify-center mt-4">
          <div className={`h-1 w-16 rounded-full transition-colors ${step !== "restart" ? "bg-blue-500" : "bg-zinc-700"}`} />
          <div className={`h-1 w-16 rounded-full transition-colors ${step === "admin" ? "bg-blue-500" : "bg-zinc-700"}`} />
        </div>
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

  return (
    <div className="flex flex-col gap-5">
      {/* Provider selection */}
      <div className="grid grid-cols-2 gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleProviderChange(p.id)}
            className={`flex items-center gap-2.5 px-3 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
              provider === p.id
                ? "border-blue-500 bg-blue-500/10 text-blue-300"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            <span className="text-base">{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* URL input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
          {provider === "sqlite" ? "Dateipfad" : "Verbindungs-URL"}
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={current.placeholder}
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded px-4 py-2.5 outline-none focus:border-zinc-500 font-mono text-sm"
          spellCheck={false}
        />
        {provider === "sqlite" && (
          <p className="text-xs text-zinc-600">
            Relativer Pfad vom Arbeitsverzeichnis — z.B. <code className="text-zinc-500">file:./data/hatches.db</code>
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded px-3 py-2.5 text-red-300 text-sm font-mono whitespace-pre-wrap">
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || !url.trim()}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded py-2.5 transition-colors flex items-center justify-center gap-2"
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
        window.location.href = "/board";
      } else {
        setError(data.error ?? "Unbekannter Fehler");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <input
        type="text" value={username} onChange={(e) => setUsername(e.target.value)}
        placeholder="Benutzername" required autoFocus
        className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded px-4 py-2.5 outline-none focus:border-zinc-500"
      />
      <input
        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="E-Mail" required
        className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded px-4 py-2.5 outline-none focus:border-zinc-500"
      />
      <input
        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        placeholder="Passwort (min. 6 Zeichen)" required minLength={6}
        className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded px-4 py-2.5 outline-none focus:border-zinc-500"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded py-2.5 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <><Spinner /> Erstelle Account…</> : "Admin-Account erstellen →"}
      </button>
    </form>
  );
}

/* ─── Restart notice ─────────────────────────────────────────────────────── */

function RestartStep() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-amber-950/40 border border-amber-700/50 rounded-lg px-4 py-4 text-amber-200 text-sm">
        <p className="font-semibold mb-1">Datenbank erfolgreich konfiguriert ✓</p>
        <p className="text-amber-300/70">
          Die Konfiguration wurde in <code className="text-amber-300">.env</code> gespeichert.
          Starte den Server neu, damit die neue Verbindung aktiv wird.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Server neu starten</p>

        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
          <p className="text-xs text-zinc-600 mb-1.5">Node direkt</p>
          <code className="text-green-400 text-sm font-mono block">
            node --env-file=.env dist/server/entry.mjs
          </code>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
          <p className="text-xs text-zinc-600 mb-1.5">Docker</p>
          <code className="text-green-400 text-sm font-mono block">
            docker compose restart
          </code>
        </div>
      </div>

      <p className="text-zinc-600 text-xs text-center">
        Nach dem Neustart öffne <span className="text-zinc-400">/setup</span> erneut um den Admin-Account zu erstellen.
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
