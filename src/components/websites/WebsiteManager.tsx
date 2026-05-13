import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash, faLink, faCodeBranch } from "@fortawesome/free-solid-svg-icons";

interface Website {
  id: number;
  name: string;
  url: string | null;
  repoUrl: string | null;
  deployCmd: string | null;
  buildCmd: string | null;
  description: string | null;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-zinc-700 text-zinc-400",
  building: "bg-yellow-900 text-yellow-400",
  deployed: "bg-green-900 text-green-400",
  error: "bg-red-900 text-red-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.idle}`}>
      {status}
    </span>
  );
}

interface EditFormProps {
  initial: Partial<Website>;
  onSave: (data: Partial<Website>) => void;
  onCancel: () => void;
}

function EditForm({ initial, onSave, onCancel }: EditFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    url: initial.url ?? "",
    repoUrl: initial.repoUrl ?? "",
    deployCmd: initial.deployCmd ?? "",
    buildCmd: initial.buildCmd ?? "",
    description: initial.description ?? "",
    status: initial.status ?? "idle",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      url: form.url || null,
      repoUrl: form.repoUrl || null,
      deployCmd: form.deployCmd || null,
      buildCmd: form.buildCmd || null,
      description: form.description || null,
    });
  }

  const field = (label: string, key: keyof typeof form, placeholder?: string) => (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <input
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500"
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {field("Name *", "name", "Mein Projekt")}
      {field("URL", "url", "https://example.com")}
      {field("Repository", "repoUrl", "https://github.com/...")}
      {field("Build-Command", "buildCmd", "npm run build")}
      {field("Deploy-Command", "deployCmd", "npm run deploy")}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-500">Beschreibung</span>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500 resize-none"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-500">Status</span>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none"
        >
          {["idle", "building", "deployed", "error"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!form.name.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded py-1.5 font-medium transition-colors"
        >
          Speichern
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 text-zinc-500 hover:text-zinc-300 text-sm"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export function WebsiteManager() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { loadWebsites(); }, []);

  async function loadWebsites() {
    const res = await fetch("/api/websites");
    setWebsites(await res.json());
  }

  async function createWebsite(data: Partial<Website>) {
    const res = await fetch("/api/websites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const site: Website = await res.json();
    setWebsites((prev) => [site, ...prev]);
    setCreating(false);
  }

  async function updateWebsite(id: number, data: Partial<Website>) {
    const res = await fetch(`/api/websites/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated: Website = await res.json();
    setWebsites((prev) => prev.map((w) => (w.id === id ? updated : w)));
    setEditingId(null);
  }

  async function deleteWebsite(id: number) {
    await fetch(`/api/websites/${id}`, { method: "DELETE" });
    setWebsites((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-200">Websites</h1>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded px-4 py-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="w-3 h-3 mr-1" /> Website hinzufuegen
            </button>
          )}
        </div>

        {creating && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Neue Website</h3>
            <EditForm
              initial={{}}
              onSave={createWebsite}
              onCancel={() => setCreating(false)}
            />
          </div>
        )}

        {websites.length === 0 && !creating && (
          <div className="text-center py-20 text-zinc-700 text-sm">
            Noch keine Websites. Füge deine erste hinzu.
          </div>
        )}

        {websites.map((site) => (
          <div key={site.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            {editingId === site.id ? (
              <>
                <h3 className="text-sm font-semibold text-zinc-300 mb-4">Bearbeiten</h3>
                <EditForm
                  initial={site}
                  onSave={(data) => updateWebsite(site.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-zinc-100">{site.name}</h3>
                      <StatusBadge status={site.status} />
                    </div>
                    {site.description && (
                      <p className="text-sm text-zinc-500 mt-1">{site.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditingId(site.id)} className="text-zinc-600 hover:text-zinc-300 transition-colors" title="Bearbeiten"><FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteWebsite(site.id)} className="text-zinc-700 hover:text-red-500 transition-colors" title="Loeschen"><FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {site.url && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-zinc-600">URL</span>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 truncate"
                      >
                        {site.url}
                      </a>
                    </div>
                  )}
                  {site.repoUrl && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-zinc-600">Repository</span>
                      <a
                        href={site.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 truncate"
                      >
                        {site.repoUrl}
                      </a>
                    </div>
                  )}
                  {site.buildCmd && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-zinc-600">Build</span>
                      <code className="text-zinc-400 font-mono bg-zinc-800 rounded px-2 py-0.5">{site.buildCmd}</code>
                    </div>
                  )}
                  {site.deployCmd && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-zinc-600">Deploy</span>
                      <code className="text-zinc-400 font-mono bg-zinc-800 rounded px-2 py-0.5">{site.deployCmd}</code>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
