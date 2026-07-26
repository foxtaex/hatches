import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faXmark, faMagnifyingGlass, faTrash, faPen, faArrowRight,
  faSpinner, faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "../../lib/i18n";

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
  type: string;  // "doc" | "board" | "general"
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

const TEMPLATE_TYPES = [
  { key: "general", label: "Allgemein" },
  { key: "doc",     label: "Dokument" },
  { key: "board",   label: "Board" },
];

const ICONS = ["📋", "🚀", "💼", "🎯", "📊", "🛠️", "📱", "🌐", "🎨", "📝", "⚡", "🔧"];

interface Props {
  /** "browse" = nur anwenden (für Modal), "manage" = volle CRUD (für AdminPanel) */
  mode?: "browse" | "manage";
  /** Filtert Templates nach Kontext: "docs" zeigt doc+general, "board" zeigt board+general */
  context?: "docs" | "board";
  /** Callback wenn Template angewendet wird (erhält redirect URL oder null) */
  onApply?: (redirect: string | null) => void;
}

export function TemplateLibrary({ mode = "manage", context, onApply }: Props) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Create/Edit form state (manage mode only)
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", category: "general", type: "general",
    icon: "📋", isPublic: true, teamId: "",
  });
  const [saving, setSaving] = useState(false);

  // Apply modal state
  const [applyTemplate, setApplyTemplate] = useState<Template | null>(null);
  const [applyTeamId, setApplyTeamId] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyDone, setApplyDone] = useState<string | null | false>(false); // false = not done yet

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("category", activeCategory);
      if (context) params.set("type", context);
      const res = await fetch(`/api/templates?${params}`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, context]);

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
    setForm({ name: "", description: "", category: "general", type: context === "docs" ? "doc" : context === "board" ? "board" : "general", icon: "📋", isPublic: true, teamId: "" });
    setShowModal(true);
  }

  function openEdit(t: Template) {
    setEditTemplate(t);
    setForm({
      name: t.name,
      description: t.description ?? "",
      category: t.category,
      type: t.type ?? "general",
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
        type: form.type,
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

  function openApply(t: Template) {
    setApplyTemplate(t);
    setApplyTeamId("");
    setApplyDone(false);
  }

  async function applyNow() {
    if (!applyTemplate) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/templates/${applyTemplate.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: applyTeamId ? Number(applyTeamId) : null }),
      });
      const data = await res.json();
      if (data.ok) {
        setApplyDone(data.redirect ?? null);
        onApply?.(data.redirect ?? null);
      }
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-4 py-2 text-sm text-white/80 outline-none focus:border-[rgba(60,199,154,0.4)] placeholder:text-white/25 transition-colors w-52"
              placeholder={t("templates.searchPlaceholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {mode === "manage" && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#3CC79A] hover:bg-[#34b389] text-white transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            {t("templates.new")}
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 px-6 py-3 border-b border-[rgba(255,255,255,0.06)]">
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
            {t(`templates.categories.${c.key}`)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">
            <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin mr-2" />
            {t("common.loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl opacity-30">📋</span>
            <p className="text-sm text-white/30">{t("templates.noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(template => (
              <div
                key={template.id}
                className="group relative bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.14)] rounded-2xl p-5 cursor-pointer transition-all"
                onClick={() => mode === "manage" ? openEdit(template) : openApply(template)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl leading-none">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white/90 text-sm truncate">{template.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-[rgba(255,255,255,0.08)] text-white/40 uppercase tracking-wider">
                        {template.category}
                      </span>
                      {template.type && template.type !== "general" && (
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider ${
                          template.type === "doc"
                            ? "bg-[rgba(99,102,241,0.15)] text-[#818cf8]"
                            : "bg-[rgba(60,199,154,0.1)] text-[#3CC79A]"
                        }`}>
                          {template.type === "doc" ? "Doc" : "Board"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {template.description && (
                  <p className="text-xs text-white/45 line-clamp-2 mb-3">{template.description}</p>
                )}
                {template.team && (
                  <div className="flex items-center gap-1.5 mt-auto">
                    <div className="w-2 h-2 rounded-full" style={{ background: template.team.color }} />
                    <span className="text-xs text-white/35">{template.team.name}</span>
                  </div>
                )}

                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {mode === "manage" && (
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(template); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.18)] text-white/60 hover:text-white/90 transition-colors"
                      title={t("common.edit")}
                    >
                      <FontAwesomeIcon icon={faPen} className="w-2.5 h-2.5" />
                    </button>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); openApply(template); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-[rgba(60,199,154,0.15)] hover:bg-[rgba(60,199,154,0.25)] text-[#3CC79A] transition-colors"
                    title={t("templates.apply")}
                  >
                    <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Apply button at bottom */}
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); openApply(template); }}
                    className="w-full text-xs text-[#3CC79A] hover:text-white bg-[rgba(60,199,154,0.08)] hover:bg-[rgba(60,199,154,0.18)] rounded-lg py-1.5 transition-colors"
                  >
                    {t("templates.apply")} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Apply Modal ──────────────────────────────────── */}
      {applyTemplate && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => !applying && setApplyTemplate(null)}
        >
          <div
            className="w-full max-w-sm bg-[rgba(22,22,24,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[rgba(255,255,255,0.08)]">
              <div>
                <h2 className="text-base font-semibold text-white/90">{t("templates.apply")}</h2>
                <p className="text-xs text-white/40 mt-0.5">{applyTemplate.icon} {applyTemplate.name}</p>
              </div>
              {!applying && (
                <button onClick={() => setApplyTemplate(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.08)] text-white/50 hover:text-white/80 transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="p-6 flex flex-col gap-4">
              {applyDone !== false ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-[rgba(60,199,154,0.15)] flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheck} className="w-6 h-6 text-[#3CC79A]" />
                  </div>
                  <p className="text-sm text-white/80 font-medium">{t("templates.applied")}</p>
                  {applyDone && (
                    <a href={applyDone} className="text-sm text-[#3CC79A] hover:underline">
                      {t("templates.goToContent")}
                    </a>
                  )}
                  <button onClick={() => setApplyTemplate(null)} className="text-sm text-white/40 hover:text-white/60 transition-colors mt-1">
                    {t("common.close")}
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-white/40 mb-2 block">{t("templates.teamOptional")}</label>
                    <select
                      value={applyTeamId}
                      onChange={e => setApplyTeamId(e.target.value)}
                      className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    >
                      <option value="">🔒 {t("common.private")} ({t("common.noTeam")})</option>
                      {teams.map(t => <option key={t.id} value={String(t.id)}>👥 {t.name}</option>)}
                    </select>
                  </div>

                  {applyTemplate.description && (
                    <p className="text-xs text-white/40 bg-[rgba(255,255,255,0.03)] rounded-xl px-3 py-2.5">
                      {applyTemplate.description}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setApplyTemplate(null)} className="flex-1 px-4 py-2 rounded-xl text-sm bg-[rgba(255,255,255,0.06)] text-white/60 hover:text-white/90 transition-colors">
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={applyNow}
                      disabled={applying}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#3CC79A] hover:bg-[#34b389] text-white transition-colors disabled:opacity-60"
                    >
                      {applying ? <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" /> : <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />}
                      {applying ? t("templates.applying") : t("templates.apply")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit/Create Modal (manage mode only) ────────── */}
      {showModal && mode === "manage" && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md bg-[rgba(22,22,24,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[rgba(255,255,255,0.08)]">
              <h2 className="text-base font-semibold text-white/90">
                {editTemplate ? t("templates.edit") : t("templates.new")}
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
                placeholder={t("common.name")}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <textarea
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] placeholder:text-white/30 transition-colors resize-none h-20"
                placeholder={`${t("common.description")} (${t("common.optional")})`}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t("templates.type")}</label>
                  <select
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {TEMPLATE_TYPES.map(tt => (
                      <option key={tt.key} value={tt.key}>{t(`templates.types.${tt.key}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t("templates.category")}</label>
                  <select
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.filter(c => c.key !== "all").map(c => (
                      <option key={c.key} value={c.key}>{t(`templates.categories.${c.key}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">{t("common.team")}</label>
                  <select
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-[rgba(60,199,154,0.5)] transition-colors"
                    value={form.teamId}
                    onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))}
                  >
                    <option value="">{t("common.noTeam")}</option>
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
                {t("templates.publicForAll")}
              </label>
            </div>

            <div className="px-6 pb-6 flex items-center gap-3">
              {editTemplate && (
                <button
                  onClick={() => deleteTemplate(editTemplate.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.2)] text-[#ef4444] transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                  {t("common.delete")}
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-white/60 hover:text-white/90 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#3CC79A] hover:bg-[#34b389] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? t("common.saving") : editTemplate ? t("common.update") : t("common.create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
