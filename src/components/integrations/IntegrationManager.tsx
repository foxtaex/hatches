import { useState, useEffect } from "react";

const INTEGRATION_TYPES = [
  { value: "github", label: "GitHub", fields: ["projectKey:owner/repo"] },
  { value: "gitlab", label: "GitLab", fields: ["baseUrl:GitLab URL (leer = gitlab.com)", "projectKey:Namespace/Projekt"] },
  { value: "jira", label: "Jira", fields: ["baseUrl:Jira URL", "projectKey:Projekt-Key (opt.)", "extra-email:E-Mail für Basic Auth"] },
  { value: "redmine", label: "Redmine", fields: ["baseUrl:Redmine URL", "projectKey:Projekt-ID (opt.)"] },
  { value: "mantisbt", label: "MantisBT", fields: ["baseUrl:MantisBT URL", "projectKey:Projekt-ID (opt.)"] },
  { value: "confluence", label: "Confluence", fields: ["baseUrl:Confluence URL", "projectKey:Space-Key (opt.)", "extra-email:E-Mail für Basic Auth"] },
  { value: "trello", label: "Trello", fields: ["projectKey:Board-ID", "extra-apiKey:API Key"] },
] as const;

interface Integration {
  id: number;
  type: string;
  name: string;
  baseUrl: string | null;
  token: string | null;
  projectKey: string | null;
  extraConfig: string | null;
  enabled: boolean;
  lastSyncAt: string | null;
  _count: { issues: number };
}

interface Issue {
  id: number;
  externalId: string;
  title: string;
  description: string | null;
  status: string | null;
  url: string | null;
  assignee: string | null;
  labels: string | null;
  cardId: number | null;
}

interface Column { id: number; title: string }

function IssuePanel({ integration, onClose }: { integration: Integration; onClose: () => void }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const [importing, setImporting] = useState<number | null>(null);
  const [targetCol, setTargetCol] = useState<number>(0);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch(`/api/integrations/${integration.id}/issues`).then(r => r.json()).then(setIssues);
    fetch("/api/board").then(r => r.json()).then(b => {
      const cols = b?.columns ?? [];
      setColumns(cols);
      if (cols.length) setTargetCol(cols[0].id);
    });
  }, []);

  async function sync() {
    setSyncing(true);
    setSyncMsg("");
    const res = await fetch(`/api/integrations/${integration.id}/sync`, { method: "POST" });
    const data = await res.json();
    setSyncMsg(data.error ? `Fehler: ${data.error}` : `${data.count} Issues synchronisiert`);
    const fresh = await fetch(`/api/integrations/${integration.id}/issues`).then(r => r.json());
    setIssues(fresh);
    setSyncing(false);
  }

  async function importIssue(issueId: number) {
    setImporting(issueId);
    await fetch(`/api/integrations/${integration.id}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId, columnId: targetCol }),
    });
    const fresh = await fetch(`/api/integrations/${integration.id}/issues`).then(r => r.json());
    setIssues(fresh);
    setImporting(null);
  }

  const filtered = issues.filter(i => !filter || i.title.toLowerCase().includes(filter.toLowerCase()) || i.status?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-zinc-200">{integration.name} — Issues</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">{integration._count.issues} gespeichert</span>
            <button onClick={sync} disabled={syncing} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded px-3 py-1.5 disabled:opacity-50">
              {syncing ? "Syncing…" : "Sync"}
            </button>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">×</button>
          </div>
        </div>
        {syncMsg && <p className={`px-5 py-2 text-xs ${syncMsg.startsWith("Fehler") ? "text-red-400" : "text-green-400"}`}>{syncMsg}</p>}
        <div className="px-5 py-3 flex gap-3 border-b border-zinc-800">
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtern…"
            className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">→ Spalte</span>
            <select value={targetCol} onChange={e => setTargetCol(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-2 py-1.5 outline-none">
              {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2">
          {filtered.length === 0 && <p className="text-zinc-600 text-sm text-center py-8">Keine Issues. Sync ausführen.</p>}
          {filtered.map(issue => {
            const labels: string[] = issue.labels ? JSON.parse(issue.labels) : [];
            return (
              <div key={issue.id} className={`flex items-start gap-3 rounded-lg px-4 py-3 border ${issue.cardId ? "border-zinc-800 opacity-50" : "border-zinc-700 bg-zinc-800/30"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500 font-mono">#{issue.externalId}</span>
                    {issue.status && <span className="text-xs bg-zinc-700 text-zinc-400 rounded px-1.5 py-0.5">{issue.status}</span>}
                    {labels.map(l => <span key={l} className="text-xs bg-zinc-700/50 text-zinc-500 rounded px-1.5">{l}</span>)}
                  </div>
                  <p className="text-sm text-zinc-200 mt-0.5 truncate">{issue.title}</p>
                  {issue.assignee && <p className="text-xs text-zinc-600 mt-0.5">@{issue.assignee}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {issue.url && <a href={issue.url} target="_blank" rel="noopener" className="text-zinc-600 hover:text-blue-400 text-xs">↗</a>}
                  {issue.cardId
                    ? <span className="text-xs text-zinc-600">importiert</span>
                    : <button onClick={() => importIssue(issue.id)} disabled={importing === issue.id}
                        className="text-xs bg-blue-700 hover:bg-blue-600 text-white rounded px-2.5 py-1 disabled:opacity-50">
                        {importing === issue.id ? "…" : "→ Karte"}
                      </button>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const TYPE_ICONS: Record<string, string> = {
  github: "GH", gitlab: "GL", jira: "JR", redmine: "RM", mantisbt: "MB", confluence: "CF", trello: "TR",
};

function IntegrationForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [type, setType] = useState("github");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});

  const typeDef = INTEGRATION_TYPES.find(t => t.value === type)!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const extraConfig = Object.keys(extras).length ? JSON.stringify(extras) : null;
    await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, name, token: token || null, projectKey: projectKey || null, baseUrl: baseUrl || null, extraConfig }),
    });
    onSave();
  }

  return (
    <form onSubmit={submit} className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 flex flex-col gap-4">
      <h3 className="font-semibold text-zinc-200">Neue Integration</h3>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Typ</span>
          <select value={type} onChange={e => setType(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none">
            {INTEGRATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">Name *</span>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder={`Mein ${type}`}
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-zinc-500">API Token / Key</span>
          <input value={token} onChange={e => setToken(e.target.value)} type="password" placeholder="Token"
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
        </label>
        {typeDef.fields.filter(f => !f.startsWith("extra-")).map(field => {
          const [key, label] = field.split(":");
          return (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">{label}</span>
              <input value={key === "projectKey" ? projectKey : baseUrl}
                onChange={e => key === "projectKey" ? setProjectKey(e.target.value) : setBaseUrl(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
            </label>
          );
        })}
        {typeDef.fields.filter(f => f.startsWith("extra-")).map(field => {
          const [rawKey, label] = field.split(":");
          const key = rawKey.replace("extra-", "");
          return (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500">{label}</span>
              <input value={extras[key] ?? ""} onChange={e => setExtras(p => ({ ...p, [key]: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
            </label>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded px-4 py-1.5">Hinzufügen</button>
        <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-zinc-300 text-sm px-3">Abbrechen</button>
      </div>
    </form>
  );
}

export function IntegrationManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [creating, setCreating] = useState(false);
  const [active, setActive] = useState<Integration | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await fetch("/api/integrations").then(r => r.json());
    setIntegrations(data);
  }

  async function remove(id: number) {
    if (!confirm("Integration löschen?")) return;
    await fetch(`/api/integrations/${id}`, { method: "DELETE" });
    load();
  }

  async function toggle(id: number, enabled: boolean) {
    await fetch(`/api/integrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    load();
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-200">Integrationen</h1>
          {!creating && (
            <button onClick={() => setCreating(true)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded px-4 py-1.5">
              + Integration hinzufügen
            </button>
          )}
        </div>

        {creating && <IntegrationForm onSave={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} />}

        {integrations.length === 0 && !creating && (
          <div className="text-center py-20 text-zinc-700 text-sm">Keine Integrationen konfiguriert.</div>
        )}

        {integrations.map(integration => (
          <div key={integration.id} className={`bg-zinc-900 border rounded-xl px-5 py-4 flex items-center gap-4 ${integration.enabled ? "border-zinc-800" : "border-zinc-800 opacity-60"}`}>
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0">
              {TYPE_ICONS[integration.type] ?? "??"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-200">{integration.name}</span>
                <span className="text-xs text-zinc-600 capitalize">{integration.type}</span>
              </div>
              <div className="flex gap-3 mt-1 text-xs text-zinc-600">
                {integration.projectKey && <span>{integration.projectKey}</span>}
                {integration.baseUrl && <span>{integration.baseUrl}</span>}
                {integration.lastSyncAt && <span>Sync: {new Date(integration.lastSyncAt).toLocaleString("de")}</span>}
                <span>{integration._count.issues} Issues</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setActive(integration)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded px-3 py-1.5">
                Issues
              </button>
              <button onClick={() => toggle(integration.id, !integration.enabled)}
                className={`text-xs rounded px-2 py-1 ${integration.enabled ? "text-green-500 hover:text-zinc-400" : "text-zinc-600 hover:text-green-500"}`}>
                {integration.enabled ? "Aktiv" : "Inaktiv"}
              </button>
              <button onClick={() => remove(integration.id)} className="text-zinc-700 hover:text-red-500 text-sm">×</button>
            </div>
          </div>
        ))}
      </div>

      {active && <IssuePanel integration={active} onClose={() => { setActive(null); load(); }} />}
    </div>
  );
}
