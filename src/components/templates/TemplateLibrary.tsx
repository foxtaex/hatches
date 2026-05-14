import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faXmark, faMagnifyingGlass, faTrash, faPen, faArrowRight
} from "@fortawesome/free-solid-svg-icons";

interface Team {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: number;
  username: string;
  displayName: string | null;
}

interface Template {
  id: number;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  content: string;
  isPublic: boolean;
  teamId: number | null;
  team: Team | null;
  createdById: number | null;
  createdBy: User | null;
  createdAt: string;
}

const CATEGORIES = [
  { key: "all",        label: "Alle" },
  { key: "software",   label: "Software" },
  { key: "project",    label: "Projekt" },
  { key: "marketing",  label: "Marketing" },
  { key: "hr",         label: "HR" },
  { key: "general",    label: "Allgemein" },
];

const ICONS = ["📋", "🚀", "💼", "🎯", "📊", "🛠️", "📱", "🌐", "🎨", "📝", "⚡", "🔧"];

interface Props {
  onApply?: (template: Template) => void;
  showApply?: boolean;
}

export function TemplateLibrary({ onApply, showApply = false }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "general", icon: "📋", isPublic: true, teamId: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/templates?category=${activeCategory}`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/user/teams").then(r => r.json()).then(d => {
      setTeams(Array.isArray(d) ? d : []);
    }).catch(() => {});
  }, []);

  const filtered = templates.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditTemplate(null);
    setForm({ name: "", description: "", category: "general", icon: "📋", isPublic: true, teamId: "" });
    setShowModal(true);
  }

  function openEdit(t: Template) {
    setEditTemplate(t);
    setForm({
      name: t.name,
      description: t.description ?? "",
      category: t.category,
      icon: t.icon,
      isPublic: t.isPublic,
      teamId: t.teamId ? String(t.teamId) : "",
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description || null,
        category: form.category,
        icon: form.icon,
        isPublic: form.isPublic,
        teamId: form.teamId ? Number(form.teamId) : null,
      };
      if (editTemplate) {
        await fetch(`/api/templates/${editTemplate.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, content: "{}" }),
        });
      }
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(id: number) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates(ts => ts.filter(t => t.id !== id));
    setShowModal(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-4 py-2 text-sm text-white/80 outline-none focus:border-[rgba(60,199,154,0.4)] placeholder:text-white/25 transition-colors w-56"
              placeholder="Template suchen…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#3CC79A] hover:bg-[#34b389] text-white transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          Neues Template
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-8 py-3 border-b border-[rgba(255,255,255,0.06)]">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === c.key
                ? "bg-[rgba(60,199,154,0.15)] text-[#3CC79A]"
                : "text-white/50 hover:text-white/80 hover:bg-[rgba(255,255,255,0.05)]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">Laden…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl opacity-30">📋</span>
            <p className="text-sm text-white/30">Keine Templates gefunden</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(t => (
              <div
                key={t.id}
                className="group relative bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.14)] rounded-2xl p-5 cursor-pointer transition-all"
                onClick={() => showApply && onApply ? onApply(t) : openEdit(t)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl leading-none">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white/90 text-sm truncate">{t.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[rgba(255,255,255,0.08)] text-white/40 uppercase tracking-wider">
                      {t.category}
                    </span>
                  </div>
                </div>
                {t.description && (
                  <p className="text-xs text-white/45 line-clamp-2 mb-3">{t.description}</p>
                )}
                {t.team && (
                  <div className="flex items-center gap-1.5 mt-auto">
                    <div className="w-2 h-2 rounded-full" style={{ background: t.team.color }} />
                    <span className="text-xs text-white/35">{t.team.name}</span>
                  </div>
                )}
                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); openEdit(t); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-white/60 hover:text-white/90 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPen} className="w-2.5 h-2.5" />
                  </button>
                  {showApply && onApply && (
                    <button
                      onClick={e => { e.stopPropagation(); onApply(t); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-[rgba(60,199,154,0.15)] hover:bg-[rgba(60,199,154,0.25)] text-[#3CC79A] transition-colors"
                    >
                      <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md bg-[rgba(22,22,24,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[rgba(255,255,255,0.08)]">
              <h2 className="text-base font-semibold text-white/90">
                {editTemplate ? "Template bearbeiten" : "Neues Template"}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-white/50 hover:text-white/80 transition-colors">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Icon picker */}
              <div>
                <label className="text-xs text-white/40 mb-2 block">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setForm(f => ({ ...f, icon: ic }))}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all ${
                        form.icon === ic
                          ? "bg-[rgba(60,199,154,0.2)] ring-1 ring-[#3CC79A]"
                          : "bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <input
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] placeholder:text-white/30 transition-colors"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <textarea
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] placeholder:text-white/30 transition-colors resize-none h-20"
                placeholder="Beschreibung (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Kategorie</label>
                  <select
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.filter(c => c.key !== "all").map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Team</label>
                  <select
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    value={form.teamId}
                    onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
                  >
                    <option value="">Kein Team</option>
                    {teams.map(t => (
                      <option key={t.id} value={String(t.id)}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
                  className="rounded"
                />
                Öffentlich (für alle sichtbar)
              </label>
            </div>

            <div className="px-6 pb-6 flex items-center gap-3">
              {editTemplate && (
                <button
                  onClick={() => deleteTemplate(editTemplate.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.2)] text-[#ef4444] transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                  Löschen
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-white/60 hover:text-white/90 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#3CC79A] hover:bg-[#34b389] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Speichern…" : editTemplate ? "Aktualisieren" : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
