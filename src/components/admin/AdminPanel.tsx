import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faXmark, faUser, faShield, faUsers, faGear,
  faChevronRight, faCheck, faTrash, faDatabase, faInfoCircle,
  faClockRotateLeft, faLayerGroup, faKey, faRobot, faPen,
  faGlobe, faPuzzlePiece, faRightFromBracket,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { WebsiteManager } from "../websites/WebsiteManager";
import { IntegrationManager } from "../integrations/IntegrationManager";
import { TemplateLibrary } from "../templates/TemplateLibrary";

// ── Types ────────────────────────────────────────────────
type Section = "board" | "docs" | "notes" | "planner" | "templates" | "admin";
const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: "board",     label: "Kanban Board", icon: "📌" },
  { key: "docs",      label: "Docs",         icon: "📄" },
  { key: "notes",     label: "Notizen",      icon: "📝" },
  { key: "planner",   label: "Planner",      icon: "📅" },
  { key: "templates", label: "Templates",    icon: "📋" },
  { key: "admin",     label: "Admin",        icon: "⚙️" },
];
const ACTIONS = [
  { key: "canView" as const, label: "Lesen" },
  { key: "canCreate" as const, label: "Erstellen" },
  { key: "canEdit" as const, label: "Bearbeiten" },
  { key: "canDelete" as const, label: "Löschen" },
];
type PermKey = "canView" | "canCreate" | "canEdit" | "canDelete";

interface Permission { section: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean; }
interface Role { id: number; name: string; description: string | null; color: string; isDefault: boolean; priority: number; permissions: Permission[]; _count: { memberships: number }; }
interface TeamMember { user: { id: number; username: string; displayName: string | null }; role: { id: number; name: string; color: string }; }
interface Team { id: number; name: string; description: string | null; color: string; memberships: TeamMember[]; }
interface User { id: number; username: string; email: string; displayName: string | null; isAdmin: boolean; isOga: boolean; isActive: boolean; memberships: { team: { id: number; name: string; color: string }; role: { id: number; name: string; color: string } }[]; }

// ── Toggle Switch ────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none ${checked ? "bg-green-500" : "bg-zinc-600"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ── Rollen Tab ───────────────────────────────────────────
function RolesTab({ roles, onRefresh }: { roles: Role[]; onRefresh: () => Promise<void> }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [local, setLocal] = useState<Role[]>(roles);
  const [dirty, setDirty] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6b7280");

  useEffect(() => {
    setLocal(roles);
    if (selectedId === null && roles.length) setSelectedId(roles[0].id);
  }, [roles]);

  const selected = local.find((r) => r.id === selectedId);

  function togglePerm(roleId: number, section: string, key: PermKey) {
    setLocal((prev) =>
      prev.map((r) =>
        r.id !== roleId ? r : {
          ...r,
          permissions: r.permissions.map((p) =>
            p.section !== section ? p : { ...p, [key]: !p[key] }
          ),
        }
      )
    );
    setDirty(true);
  }

  async function savePerms() {
    if (!selected) return;
    await fetch("/api/admin/roles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, permissions: selected.permissions }),
    });
    setDirty(false);
    await onRefresh();
  }

  async function createRole() {
    if (!newName.trim()) return;
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    });
    const role = await res.json();
    setNewName("");
    setNewColor("#6b7280");
    setCreating(false);
    await onRefresh();
    setSelectedId(role.id);
  }

  async function deleteRole(id: number) {
    if (!confirm("Rolle wirklich löschen?")) return;
    await fetch("/api/admin/roles", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSelectedId(null);
    await onRefresh();
  }

  return (
    <div className="flex border border-zinc-800 rounded-xl overflow-hidden" style={{ height: "calc(100vh - 10rem)" }}>
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-3 border-b border-zinc-800 flex flex-col gap-2">
          <button
            onClick={() => setCreating(!creating)}
            className="w-full flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 px-2 py-1.5 rounded hover:bg-zinc-800 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Neue Rolle
          </button>
          {creating && (
            <div className="flex flex-col gap-2 pt-1">
              <input
                autoFocus value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createRole(); if (e.key === "Escape") setCreating(false); }}
                placeholder="Rollenname"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded px-2 py-1.5 outline-none focus:border-zinc-500"
              />
              <div className="flex items-center gap-2">
                <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 flex-shrink-0" />
                <button onClick={createRole}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded px-2 py-1 transition-colors">
                  Erstellen
                </button>
                <button onClick={() => setCreating(false)} className="text-zinc-600 hover:text-zinc-400">
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {local.map((role) => (
            <button
              key={role.id}
              onClick={() => { setSelectedId(role.id); setDirty(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${selectedId === role.id ? "bg-zinc-700/60 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"}`}
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: role.color }} />
              <span className="flex-1 truncate">{role.name}</span>
              {role.isDefault && <span className="text-[10px] text-zinc-600 flex-shrink-0">std</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: selected.color }} />
                <h2 className="text-lg font-bold text-zinc-100">{selected.name}</h2>
                <span className="text-xs text-zinc-500 bg-zinc-800 rounded-full px-2 py-0.5">{selected._count.memberships} Mitglieder</span>
              </div>
              <div className="flex items-center gap-2">
                {dirty && (
                  <button onClick={savePerms}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg px-4 py-1.5 transition-colors">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3" /> Speichern
                  </button>
                )}
                <button onClick={() => deleteRole(selected.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-zinc-800" title="Rolle löschen">
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {SECTIONS.map(({ key, label, icon }) => {
                const perm = selected.permissions.find((p) => p.section === key);
                if (!perm) return null;
                return (
                  <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center gap-2">
                      <span>{icon}</span>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
                    </div>
                    <div className="divide-y divide-zinc-800/50">
                      {ACTIONS.map(({ key: ak, label: al }) => (
                        <div key={ak} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-sm text-zinc-300">{al}</span>
                          <Toggle
                            checked={perm[ak as PermKey]}
                            onChange={() => togglePerm(selected.id, key, ak as PermKey)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            Rolle auswählen oder erstellen
          </div>
        )}
      </div>
    </div>
  );
}

// ── Teams Tab ────────────────────────────────────────────
function TeamsTab({ teams, roles, users, onRefresh }: { teams: Team[]; roles: Role[]; users: User[]; onRefresh: () => Promise<void> }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6b7280" });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [memberForm, setMemberForm] = useState({ userId: "", roleId: "" });

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setCreating(false);
    setForm({ name: "", description: "", color: "#6b7280" });
    await onRefresh();
  }

  async function deleteTeam(id: number) {
    if (!confirm("Team wirklich löschen?")) return;
    await fetch("/api/admin/teams", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await onRefresh();
  }

  async function addMember(teamId: number) {
    if (!memberForm.userId || !memberForm.roleId) return;
    await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, userId: Number(memberForm.userId), roleId: Number(memberForm.roleId) }),
    });
    setAddingTo(null);
    setMemberForm({ userId: "", roleId: "" });
    await onRefresh();
  }

  async function removeMember(teamId: number, userId: number) {
    await fetch("/api/admin/members", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId, userId }) });
    await onRefresh();
  }

  async function changeMemberRole(teamId: number, userId: number, roleId: number) {
    await fetch("/api/admin/members", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId, userId, roleId }) });
    await onRefresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-200">Teams</h3>
        <button onClick={() => setCreating(!creating)}
          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 transition-colors">
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Neues Team
        </button>
      </div>

      {creating && (
        <form onSubmit={createTeam} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Teamname *" required
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Beschreibung"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="w-10 h-9 rounded-lg cursor-pointer bg-transparent border border-zinc-700" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-1.5 transition-colors">Erstellen</button>
            <button type="button" onClick={() => setCreating(false)} className="text-zinc-500 hover:text-zinc-300 text-sm px-3 transition-colors">Abbrechen</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {teams.map((team) => (
          <div key={team.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: team.color }} />
              <button onClick={() => setExpandedId(expandedId === team.id ? null : team.id)} className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-200">{team.name}</span>
                  <span className="text-xs text-zinc-500">{team.memberships.length} Mitglieder</span>
                </div>
                {team.description && <p className="text-xs text-zinc-500 mt-0.5">{team.description}</p>}
              </button>
              <FontAwesomeIcon icon={faChevronRight}
                className={`w-3 h-3 text-zinc-600 transition-transform duration-200 ${expandedId === team.id ? "rotate-90" : ""}`} />
              <button onClick={() => deleteTeam(team.id)} className="text-zinc-700 hover:text-red-400 transition-colors ml-1">
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            </div>

            {expandedId === team.id && (
              <div className="border-t border-zinc-800 px-4 py-3 flex flex-col gap-2 bg-zinc-900/50">
                {team.memberships.map(({ user, role }) => (
                  <div key={user.id} className="flex items-center gap-3 py-1">
                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                      {(user.displayName || user.username).charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm text-zinc-300">{user.displayName || user.username}
                      <span className="text-zinc-600 ml-1.5 text-xs">@{user.username}</span>
                    </span>
                    <select
                      value={role.id}
                      onChange={(e) => changeMemberRole(team.id, user.id, Number(e.target.value))}
                      className="bg-zinc-800 border text-zinc-300 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                      style={{ borderColor: role.color + "55" }}
                    >
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <button onClick={() => removeMember(team.id, user.id)} className="text-zinc-700 hover:text-red-400 transition-colors">
                      <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {addingTo === team.id ? (
                  <div className="flex items-center gap-2 pt-1">
                    <select value={memberForm.userId} onChange={(e) => setMemberForm((f) => ({ ...f, userId: e.target.value }))}
                      className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                      <option value="">Benutzer wählen…</option>
                      {users.filter((u) => !team.memberships.some((m) => m.user.id === u.id)).map((u) => (
                        <option key={u.id} value={u.id}>{u.displayName || u.username}</option>
                      ))}
                    </select>
                    <select value={memberForm.roleId} onChange={(e) => setMemberForm((f) => ({ ...f, roleId: e.target.value }))}
                      className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                      <option value="">Rolle wählen…</option>
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <button onClick={() => addMember(team.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0">
                      <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                    </button>
                    <button onClick={() => setAddingTo(null)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                      <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setAddingTo(team.id)}
                    className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 pt-1 transition-colors">
                    <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" /> Mitglied hinzufügen
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {teams.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">Noch keine Teams vorhanden</p>
        )}
      </div>
    </div>
  );
}

// ── Benutzer Tab ─────────────────────────────────────────
function UsersTab({ users, currentUser, onRefresh }: { users: User[]; currentUser: { id: number; isOga: boolean } | null; onRefresh: () => Promise<void> }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "" });
  const [resetPwUserId, setResetPwUserId] = useState<number | null>(null);
  const [resetPwValue, setResetPwValue] = useState("");
  const [resetPwLoading, setResetPwLoading] = useState(false);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setCreating(false);
    setForm({ username: "", email: "", password: "", displayName: "" });
    await onRefresh();
  }

  async function toggleActive(user: User) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
    });
    await onRefresh();
  }

  async function deleteUser(id: number) {
    if (!confirm("Benutzer wirklich löschen?")) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await onRefresh();
  }

  async function resetPassword() {
    if (!resetPwUserId || resetPwValue.trim().length < 6) return;
    setResetPwLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: resetPwUserId, password: resetPwValue }),
    });
    setResetPwUserId(null);
    setResetPwValue("");
    setResetPwLoading(false);
  }

  async function forceLogout(userId: number) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, invalidateSessions: true }),
    });
  }

  async function toggleOga(user: User) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, isOga: !user.isOga }),
    });
    await onRefresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-200">Benutzer</h3>
        <button onClick={() => setCreating(!creating)}
          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 transition-colors">
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Neuer Benutzer
        </button>
      </div>

      {creating && (
        <form onSubmit={createUser} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="Benutzername *" required
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input value={form.email} type="email" onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="E-Mail *" required
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="Anzeigename"
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input value={form.password} type="password" onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Passwort *" required minLength={6}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
          </div>
          <p className="text-xs text-zinc-600">Teamzuweisung über den Teams-Tab nach dem Erstellen.</p>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-1.5 transition-colors">Erstellen</button>
            <button type="button" onClick={() => setCreating(false)} className="text-zinc-500 hover:text-zinc-300 text-sm px-3 transition-colors">Abbrechen</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div key={user.id} className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-opacity ${user.isActive ? "" : "opacity-60"}`}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300 flex-shrink-0">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-zinc-200">{user.displayName || user.username}</span>
                  <span className="text-xs text-zinc-500">@{user.username}</span>
                  {user.isOga && <span className="text-xs bg-yellow-900/40 text-yellow-400 border border-yellow-800/40 rounded-full px-2 py-0.5">Oga ★</span>}
                  {user.isAdmin && <span className="text-xs bg-red-900/40 text-red-400 border border-red-800/40 rounded-full px-2 py-0.5">Admin</span>}
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {user.memberships.map(({ team, role }) => (
                    <span key={team.id} className="text-xs rounded-full px-2.5 py-0.5"
                      style={{ background: team.color + "1a", color: team.color, border: `1px solid ${team.color}44` }}>
                      {team.name} · <span style={{ color: role.color }}>{role.name}</span>
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-xs text-zinc-600 hidden md:block shrink-0">{user.email}</span>
              <button onClick={() => toggleActive(user)}
                className={`text-xs rounded-full px-2.5 py-0.5 font-medium transition-colors flex-shrink-0 ${user.isActive ? "bg-green-900/30 text-green-400 hover:bg-red-900/30 hover:text-red-400" : "bg-red-900/30 text-red-400 hover:bg-green-900/30 hover:text-green-400"}`}>
                {user.isActive ? "Aktiv" : "Inaktiv"}
              </button>
              <button
                onClick={() => { setResetPwUserId(resetPwUserId === user.id ? null : user.id); setResetPwValue(""); }}
                title="Passwort zurücksetzen"
                className={`transition-colors flex-shrink-0 p-1.5 rounded hover:bg-zinc-800 ${resetPwUserId === user.id ? "text-yellow-400" : "text-zinc-700 hover:text-yellow-400"}`}
              >
                <FontAwesomeIcon icon={faKey} className="w-3 h-3" />
              </button>
              <button
                onClick={() => forceLogout(user.id)}
                title="Alle Sitzungen beenden (Force Logout)"
                className="text-zinc-700 hover:text-orange-400 transition-colors flex-shrink-0 p-1.5 rounded hover:bg-zinc-800"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="w-3 h-3" />
              </button>
              {/* Oga toggle: visible to Oga on others, or bootstrap when no Oga exists yet */}
              {(currentUser?.isOga
                ? currentUser.id !== user.id
                : !users.some((u) => u.isOga) && currentUser?.id === user.id
              ) && (
                <button
                  onClick={() => toggleOga(user)}
                  title={user.isOga ? "Oga-Status entziehen" : users.some((u) => u.isOga) ? "Oga-Status vergeben" : "Oga werden"}
                  className={`transition-colors flex-shrink-0 p-1.5 rounded hover:bg-zinc-800 text-xs font-bold ${user.isOga ? "text-yellow-500 hover:text-yellow-300" : "text-zinc-700 hover:text-yellow-500"}`}
                >
                  ★
                </button>
              )}
              <button onClick={() => deleteUser(user.id)} className="text-zinc-700 hover:text-red-400 transition-colors flex-shrink-0 p-1.5 rounded hover:bg-zinc-800">
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            </div>

            {resetPwUserId === user.id && (
              <div className="border-t border-zinc-800 px-4 py-3 bg-zinc-900/50 flex items-center gap-2">
                <FontAwesomeIcon icon={faKey} className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                <span className="text-xs text-zinc-500 flex-shrink-0">Neues Passwort:</span>
                <input
                  autoFocus
                  type="password"
                  value={resetPwValue}
                  onChange={(e) => setResetPwValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") resetPassword(); if (e.key === "Escape") { setResetPwUserId(null); setResetPwValue(""); } }}
                  placeholder="Min. 6 Zeichen"
                  minLength={6}
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-yellow-600/50"
                />
                <button
                  onClick={resetPassword}
                  disabled={resetPwLoading || resetPwValue.trim().length < 6}
                  className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 text-white text-xs rounded-lg px-3 py-1.5 transition-colors flex-shrink-0"
                >
                  {resetPwLoading ? "…" : "Speichern"}
                </button>
                <button onClick={() => { setResetPwUserId(null); setResetPwValue(""); }}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0">
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">Keine Benutzer vorhanden</p>
        )}
      </div>
    </div>
  );
}

// ── App-Info Tab ─────────────────────────────────────────
interface ReleaseEntry {
  key: string;
  display: string;
  stage: string;
  date: string;
  time?: string;
  description: string;
  changes: string[];
  status: string;
  isCurrent: boolean;
}

const STAGE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  dev:    { bg: "bg-zinc-800",                    text: "text-zinc-400",  label: "dev"    },
  a:      { bg: "bg-blue-950",                    text: "text-blue-400",  label: "alpha"  },
  b:      { bg: "bg-violet-950",                  text: "text-violet-400",label: "beta"   },
  pre:    { bg: "bg-yellow-950",                  text: "text-yellow-400",label: "pre"    },
  stable: { bg: "bg-[rgba(60,199,154,0.15)]",     text: "text-[#3CC79A]", label: "stable" },
};

function StageBadge({ stage }: { stage: string }) {
  const s = STAGE_STYLE[stage] ?? STAGE_STYLE.dev;
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function formatReleaseDate(date: string, time?: string): string {
  if (!date) return "";
  try {
    const d = new Date(date + (time ? `T${time}:00` : "T00:00:00"));
    const datePart = d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
    if (!time) return datePart;
    const timePart = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    return `${datePart} · ${timePart} Uhr`;
  } catch {
    return date;
  }
}

function ReleaseCard({ r }: { r: ReleaseEntry }) {
  const [open, setOpen] = useState(r.isCurrent);
  const dateLabel = formatReleaseDate(r.date, r.time);

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${r.isCurrent ? "border-[rgba(60,199,154,0.3)] bg-[rgba(60,199,154,0.04)]" : "border-zinc-800 bg-zinc-900"}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <FontAwesomeIcon
          icon={faChevronRight}
          className={`w-2.5 h-2.5 text-zinc-600 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-90" : ""}`}
        />
        <span className={`font-mono text-sm font-semibold flex-shrink-0 ${r.isCurrent ? "text-[#3CC79A]" : "text-zinc-300"}`}>
          v{r.display}
        </span>
        <StageBadge stage={r.stage} />
        {r.isCurrent && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[rgba(60,199,154,0.15)] text-[#3CC79A]">
            aktuell
          </span>
        )}
        <span className="flex-1" />
        {dateLabel && (
          <span className="text-xs text-zinc-600 flex-shrink-0 tabular-nums">{dateLabel}</span>
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-zinc-800/60">
          {r.description && (
            <p className="text-sm text-zinc-400 pt-3">{r.description}</p>
          )}
          {r.changes.length > 0 && (
            <ul className="flex flex-col gap-1 mt-1">
              {r.changes.map((c, i) => {
                const match = c.match(/^([A-Za-zÄÖÜäöü]+:)\s*(.*)/s);
                return (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-500">
                    <span className="text-zinc-700 mt-0.5 flex-shrink-0">—</span>
                    {match ? (
                      <span>
                        <span className="font-semibold text-zinc-400">{match[1]}</span>{" "}{match[2]}
                      </span>
                    ) : c}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── App-Info Tab (System → Info) ─────────────────────────
function AppInfoTab() {
  const [info, setInfo] = useState<{ version: string; releases: ReleaseEntry[]; node: string; provider: string; url: string; uptime: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/app-info").then((r) => r.json()).then(setInfo);
  }, []);

  const uptime = info
    ? `${Math.floor(info.uptime / 3600)}h ${Math.floor((info.uptime % 3600) / 60)}m`
    : "—";

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Runtime */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 flex items-center gap-2">
          <FontAwesomeIcon icon={faInfoCircle} className="w-3 h-3" /> Laufzeit
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {[
            ["Version", info?.version ?? "—"],
            ["Node.js", info?.node ?? "—"],
            ["Uptime",  uptime],
            ["DB",      info?.provider ?? "—"],
            ["DB-URL",  info?.url ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 last:border-0">
              <span className="text-sm text-zinc-500">{label}</span>
              <span className="text-sm text-zinc-300 font-mono truncate max-w-xs text-right">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Version History */}
      {info?.releases && info.releases.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 flex items-center gap-2">
            <FontAwesomeIcon icon={faClockRotateLeft} className="w-3 h-3" /> Version History
          </h3>
          <div className="flex flex-col gap-2">
            {[...info.releases].reverse().map((r) => <ReleaseCard key={r.key} r={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Workspace Tab (Admin → Workspace) ────────────────────
function WorkspaceTab() {
  const [workspaceName, setWorkspaceName] = useState("Hatches");
  const [wsMsg, setWsMsg]     = useState("");
  const [wsLoading, setWsLoading] = useState(false);
  const [dbProvider, setDbProvider] = useState("sqlite");
  const [dbUrl, setDbUrl]     = useState("file:./dev.db");
  const [dbMsg, setDbMsg]     = useState("");
  const [dbLoading, setDbLoading] = useState(false);
  const [showDbForm, setShowDbForm] = useState(false);

  useEffect(() => {
    fetch("/api/admin/workspace").then((r) => r.json()).then((d) => {
      setWorkspaceName(d.name ?? "Hatches");
    });
    fetch("/api/admin/app-info").then((r) => r.json()).then((d) => {
      setDbProvider(d.provider ?? "sqlite");
      setDbUrl(d.url ?? "file:./dev.db");
    });
  }, []);

  async function saveWorkspaceName() {
    setWsLoading(true); setWsMsg("");
    const res = await fetch("/api/admin/workspace", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: workspaceName }),
    });
    const data = await res.json();
    setWsMsg(data.ok ? "✓ Gespeichert" : (data.error ?? "Fehler"));
    setWsLoading(false);
  }

  async function saveDb() {
    setDbLoading(true); setDbMsg("");
    const res = await fetch("/api/setup/db", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: dbProvider, url: dbUrl }),
    });
    const data = await res.json();
    setDbMsg(data.ok ? "Gespeichert — Server neu starten um zu übernehmen." : (data.error ?? "Fehler"));
    setDbLoading(false);
    if (data.ok) setShowDbForm(false);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Workspace Name */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 flex items-center gap-2">
          <FontAwesomeIcon icon={faGear} className="w-3 h-3" /> Allgemein
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Workspace-Name</label>
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveWorkspaceName(); }}
              placeholder="z.B. Mein Unternehmen"
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
            />
            <p className="text-xs text-zinc-600">Wird im Navigation-Header angezeigt</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveWorkspaceName}
              disabled={wsLoading || !workspaceName.trim()}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: "rgba(60,199,154,0.12)", color: "#3CC79A", border: "1px solid rgba(60,199,154,0.2)" }}>
              {wsLoading ? "…" : "Speichern"}
            </button>
            {wsMsg && <p className={`text-xs ${wsMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{wsMsg}</p>}
          </div>
        </div>
      </section>

      {/* Database */}
      <section className="flex flex-col gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600 flex items-center gap-2">
          <FontAwesomeIcon icon={faDatabase} className="w-3 h-3" /> Datenbank
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-sm text-zinc-500">Provider</span>
            <span className="text-sm text-zinc-300 font-mono">{dbProvider}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-zinc-500">URL</span>
            <span className="text-sm text-zinc-400 font-mono truncate max-w-[240px]">{dbUrl}</span>
          </div>
        </div>
        {!showDbForm ? (
          <button onClick={() => setShowDbForm(true)}
            className="self-start flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "rgba(60,199,154,0.12)", color: "#3CC79A", border: "1px solid rgba(60,199,154,0.2)" }}>
            <FontAwesomeIcon icon={faGear} className="w-3 h-3" /> Verbindung ändern
          </button>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {(["sqlite","postgresql","mysql","mssql"] as const).map((p) => (
                <button key={p} onClick={() => setDbProvider(p)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-left transition-all"
                  style={{ border: dbProvider === p ? "1px solid rgba(60,199,154,0.4)" : "1px solid rgba(255,255,255,0.07)", background: dbProvider === p ? "rgba(60,199,154,0.10)" : "rgba(255,255,255,0.03)", color: dbProvider === p ? "#5DDBB0" : "rgba(255,255,255,0.4)" }}>
                  {p === "sqlite" ? "🗄️ SQLite" : p === "postgresql" ? "🐘 PostgreSQL" : p === "mysql" ? "🐬 MySQL" : "🪟 SQL Server"}
                </button>
              ))}
            </div>
            <input value={dbUrl} onChange={(e) => setDbUrl(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-mono rounded-lg px-3 py-2 outline-none focus:border-zinc-500"
              spellCheck={false} />
            {dbMsg && <p className={`text-xs ${dbMsg.startsWith("Gespeichert") ? "text-green-400" : "text-red-400"}`}>{dbMsg}</p>}
            <div className="flex gap-2">
              <button onClick={saveDb} disabled={dbLoading}
                className="text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                style={{ background: "linear-gradient(135deg,#3CC79A,#1e8e74)", color: "#fff" }}>
                {dbLoading ? "Speichert…" : "Speichern"}
              </button>
              <button onClick={() => setShowDbForm(false)} className="text-sm text-zinc-500 hover:text-zinc-300 px-3 transition-colors">Abbrechen</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ── Global Permissions Tab ───────────────────────────────
const GLOBAL_PERMS = [
  { key: "canCreateTeam",       label: "Teams erstellen",       desc: "Darf neue Teams anlegen" },
  { key: "canManageUsers",      label: "Benutzer verwalten",    desc: "Darf Benutzer erstellen, bearbeiten und deaktivieren" },
  { key: "canSeeApiKeys",       label: "API-Keys einsehen",     desc: "Darf API-Schlüssel und Secrets sehen" },
  { key: "canManageIntegrations", label: "Integrationen verwalten", desc: "Darf externe Integrationen konfigurieren" },
] as const;

interface GlobalPerm {
  id: number;
  permission: string;
  grantedAt: string;
  user: { id: number; username: string; displayName: string | null; email: string };
  grantedBy: { id: number; username: string; displayName: string | null } | null;
}

function GlobalPermissionsTab({ users }: { users: User[] }) {
  const [perms, setPerms] = useState<GlobalPerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ userId: "", permission: "" });
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/global-permissions");
    const data = await res.json();
    setPerms(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function grant() {
    if (!form.userId || !form.permission) return;
    await fetch("/api/admin/global-permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(form.userId), permission: form.permission }),
    });
    setForm({ userId: "", permission: "" });
    setAdding(false);
    load();
  }

  async function revoke(id: number) {
    await fetch("/api/admin/global-permissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPerms((p) => p.filter((x) => x.id !== id));
  }

  // Group by permission key
  const grouped = GLOBAL_PERMS.map(({ key, label, desc }) => ({
    key, label, desc,
    entries: perms.filter((p) => p.permission === key),
  }));

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-200">Globale Berechtigungen</h3>
          <p className="text-xs text-zinc-600 mt-0.5">Team-unabhängige Sonderrechte für einzelne Benutzer</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Berechtigung vergeben
        </button>
      </div>

      {adding && (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Benutzer</label>
              <select
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500"
              >
                <option value="">Benutzer wählen…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.displayName || u.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Berechtigung</label>
              <select
                value={form.permission}
                onChange={(e) => setForm((f) => ({ ...f, permission: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500"
              >
                <option value="">Berechtigung wählen…</option>
                {GLOBAL_PERMS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={grant} disabled={!form.userId || !form.permission}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg px-4 py-1.5 transition-colors">
              Vergeben
            </button>
            <button onClick={() => setAdding(false)} className="text-zinc-500 hover:text-zinc-300 text-sm px-3 transition-colors">Abbrechen</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-zinc-600 text-center py-8">Laden…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {grouped.map(({ key, label, desc, entries }) => (
            <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium text-zinc-300">{label}</span>
                  <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
                </div>
                <span className="text-xs bg-zinc-800 text-zinc-500 rounded-full px-2 py-0.5 flex-shrink-0">{entries.length}</span>
              </div>
              {entries.length === 0 ? (
                <p className="text-xs text-zinc-700 px-4 py-3">Niemand hat diese Berechtigung</p>
              ) : (
                entries.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800/50 last:border-0">
                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                      {(p.user.displayName || p.user.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-zinc-300">{p.user.displayName || p.user.username}</span>
                      <span className="text-zinc-600 ml-1.5 text-xs">@{p.user.username}</span>
                    </div>
                    {p.grantedBy && (
                      <span className="text-xs text-zinc-700 hidden md:block">
                        von {p.grantedBy.displayName || p.grantedBy.username}
                      </span>
                    )}
                    <button onClick={() => revoke(p.id)} className="text-zinc-700 hover:text-red-400 transition-colors flex-shrink-0">
                      <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Org-Gruppen Tab ──────────────────────────────────────
interface OrgGroupMember {
  user: { id: number; username: string; displayName: string | null; email: string };
}
interface OrgGroup {
  id: number;
  name: string;
  description: string | null;
  color: string;
  lockedRights: string;
  normalRights: string;
  members: OrgGroupMember[];
  _count: { members: number };
}

function OrgGroupsTab({ users }: { users: User[] }) {
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6b7280" });
  const [addingMemberTo, setAddingMemberTo] = useState<number | null>(null);
  const [memberUserId, setMemberUserId] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/org-groups");
    const data = await res.json();
    setGroups(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await fetch("/api/admin/org-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "", color: "#6b7280" });
    setCreating(false);
    load();
  }

  async function deleteGroup(id: number) {
    if (!confirm("Gruppe wirklich löschen?")) return;
    await fetch("/api/admin/org-groups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function addMember(groupId: number) {
    if (!memberUserId) return;
    await fetch(`/api/admin/org-groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: Number(memberUserId) }),
    });
    setAddingMemberTo(null);
    setMemberUserId("");
    load();
  }

  async function removeMember(groupId: number, userId: number) {
    await fetch(`/api/admin/org-groups/${groupId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    load();
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-200">Org-Gruppen</h3>
          <p className="text-xs text-zinc-600 mt-0.5">Bereichsbasierte Gruppen mit gesperrten und normalen Rechten</p>
        </div>
        <button onClick={() => setCreating(!creating)}
          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 transition-colors">
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Neue Gruppe
        </button>
      </div>

      {creating && (
        <form onSubmit={createGroup} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Gruppenname *" required
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Beschreibung"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="w-10 h-9 rounded-lg cursor-pointer bg-transparent border border-zinc-700" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-1.5 transition-colors">Erstellen</button>
            <button type="button" onClick={() => setCreating(false)} className="text-zinc-500 hover:text-zinc-300 text-sm px-3 transition-colors">Abbrechen</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-zinc-600 text-center py-8">Laden…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map((g) => (
            <div key={g.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: g.color }} />
                <button onClick={() => setExpandedId(expandedId === g.id ? null : g.id)} className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200">{g.name}</span>
                    <span className="text-xs text-zinc-500">{g._count.members} Mitglieder</span>
                  </div>
                  {g.description && <p className="text-xs text-zinc-500 mt-0.5">{g.description}</p>}
                </button>
                <FontAwesomeIcon icon={faChevronRight}
                  className={`w-3 h-3 text-zinc-600 transition-transform duration-200 ${expandedId === g.id ? "rotate-90" : ""}`} />
                <button onClick={() => deleteGroup(g.id)} className="text-zinc-700 hover:text-red-400 transition-colors ml-1">
                  <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                </button>
              </div>

              {expandedId === g.id && (
                <div className="border-t border-zinc-800 px-4 py-3 flex flex-col gap-2 bg-zinc-900/50">
                  {g.members.map(({ user }) => (
                    <div key={user.id} className="flex items-center gap-3 py-1">
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                        {(user.displayName || user.username).charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 text-sm text-zinc-300">
                        {user.displayName || user.username}
                        <span className="text-zinc-600 ml-1.5 text-xs">@{user.username}</span>
                      </span>
                      <button onClick={() => removeMember(g.id, user.id)} className="text-zinc-700 hover:text-red-400 transition-colors">
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {addingMemberTo === g.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <select value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)}
                        className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                        <option value="">Benutzer wählen…</option>
                        {users.filter((u) => !g.members.some((m) => m.user.id === u.id)).map((u) => (
                          <option key={u.id} value={u.id}>{u.displayName || u.username}</option>
                        ))}
                      </select>
                      <button onClick={() => addMember(g.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0">
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                      </button>
                      <button onClick={() => { setAddingMemberTo(null); setMemberUserId(""); }}
                        className="text-zinc-600 hover:text-zinc-400 transition-colors">
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingMemberTo(g.id)}
                      className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 pt-1 transition-colors">
                      <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" /> Mitglied hinzufügen
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {groups.length === 0 && (
            <p className="text-sm text-zinc-600 text-center py-8">Noch keine Org-Gruppen vorhanden</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── KI-Konfiguration Tab ─────────────────────────────────
const AI_PROVIDERS = [
  { value: "openai",    label: "OpenAI",     placeholder: "https://api.openai.com" },
  { value: "anthropic", label: "Anthropic",  placeholder: "https://api.anthropic.com" },
  { value: "google",    label: "Google AI",  placeholder: "https://generativelanguage.googleapis.com" },
  { value: "deepseek",  label: "DeepSeek",   placeholder: "https://api.deepseek.com" },
  { value: "minimax",   label: "MiniMax",    placeholder: "https://api.minimax.chat" },
  { value: "ollama",    label: "Ollama",     placeholder: "http://localhost:11434" },
  { value: "custom",    label: "Custom",     placeholder: "https://…" },
] as const;

interface AiConfig {
  id: number;
  provider: string;
  name: string;
  apiKey: string | null;
  baseUrl: string | null;
  model: string | null;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}

function AiConfigTab() {
  const [configs, setConfigs] = useState<AiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    provider: "openai", name: "", apiKey: "", baseUrl: "",
    model: "", temperature: "0.7", maxTokens: "2048",
  });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/ai");
    const data = await res.json();
    setConfigs(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditId(null);
    setForm({ provider: "openai", name: "", apiKey: "", baseUrl: "", model: "", temperature: "0.7", maxTokens: "2048" });
    setCreating(true);
  }

  function openEdit(c: AiConfig) {
    setEditId(c.id);
    setForm({
      provider: c.provider,
      name: c.name,
      apiKey: c.apiKey ?? "",
      baseUrl: c.baseUrl ?? "",
      model: c.model ?? "",
      temperature: String(c.temperature),
      maxTokens: String(c.maxTokens),
    });
    setCreating(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      provider: form.provider, name: form.name.trim(),
      apiKey: form.apiKey || null, baseUrl: form.baseUrl || null,
      model: form.model || null,
      temperature: parseFloat(form.temperature),
      maxTokens: parseInt(form.maxTokens, 10),
    };
    if (editId !== null) {
      await fetch("/api/admin/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...body }),
      });
    } else {
      await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setCreating(false);
    setEditId(null);
    load();
  }

  async function deleteConfig(id: number) {
    if (!confirm("KI-Konfiguration wirklich löschen?")) return;
    await fetch("/api/admin/ai", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function setActive(id: number) {
    await fetch("/api/admin/ai", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: true }),
    });
    load();
  }

  const providerInfo = AI_PROVIDERS.find((p) => p.value === form.provider);

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-200">KI-Provider</h3>
          <p className="text-xs text-zinc-600 mt-0.5">API-Verbindungen für KI-Funktionen verwalten</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 transition-colors">
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> Neuer Provider
        </button>
      </div>

      {creating && (
        <form onSubmit={save} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Provider</label>
              <select value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500">
                {AI_PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="z.B. GPT-4o Produktion" required
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">API Key</label>
              <input value={form.apiKey} onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                placeholder="sk-…" type="password" autoComplete="new-password"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500 font-mono" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Base URL (optional)</label>
              <input value={form.baseUrl} onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                placeholder={providerInfo?.placeholder ?? "https://…"}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Modell</label>
              <input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                placeholder="gpt-4o-mini, claude-3-5-haiku…"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Temperature</label>
                <input value={form.temperature} onChange={(e) => setForm((f) => ({ ...f, temperature: e.target.value }))}
                  type="number" min="0" max="2" step="0.1"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Max Tokens</label>
                <input value={form.maxTokens} onChange={(e) => setForm((f) => ({ ...f, maxTokens: e.target.value }))}
                  type="number" min="256" max="128000" step="256"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-zinc-500" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-4 py-1.5 transition-colors">
              {editId !== null ? "Aktualisieren" : "Erstellen"}
            </button>
            <button type="button" onClick={() => { setCreating(false); setEditId(null); }}
              className="text-zinc-500 hover:text-zinc-300 text-sm px-3 transition-colors">Abbrechen</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-zinc-600 text-center py-8">Laden…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {configs.map((c) => (
            <div key={c.id}
              className={`bg-zinc-900 border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${c.isActive ? "border-[rgba(60,199,154,0.35)] bg-[rgba(60,199,154,0.04)]" : "border-zinc-800"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-zinc-200 text-sm">{c.name}</span>
                  <span className="text-xs bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5">{c.provider}</span>
                  {c.isActive && (
                    <span className="text-xs bg-[rgba(60,199,154,0.15)] text-[#3CC79A] rounded-full px-2 py-0.5 font-medium">Aktiv</span>
                  )}
                </div>
                {c.model && <p className="text-xs text-zinc-600 mt-0.5 font-mono">{c.model}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!c.isActive && (
                  <button onClick={() => setActive(c.id)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg px-2.5 py-1 transition-colors">
                    Aktivieren
                  </button>
                )}
                <button onClick={() => openEdit(c)} className="text-zinc-600 hover:text-zinc-300 transition-colors p-1">
                  <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                </button>
                <button onClick={() => deleteConfig(c.id)} className="text-zinc-700 hover:text-red-400 transition-colors p-1">
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {configs.length === 0 && (
            <p className="text-sm text-zinc-600 text-center py-8">Kein KI-Provider konfiguriert</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Hauptkomponente ───────────────────────────────────────
export function AdminPanel() {
  type TabKey = "roles" | "teams" | "users" | "global-perms" | "org-groups" | "websites" | "integrations" | "ai" | "templates" | "workspace" | "info";
  const [tab, setTab] = useState<TabKey>("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; isOga: boolean } | null>(null);

  useEffect(() => {
    load();
    fetch("/api/admin/users").then((r) => r.json()).then((list: User[]) => {
      // currentUser is already loaded via load() but we need isOga — get from profile
      fetch("/api/user/profile").then((r) => r.json()).then((p: { id: number }) => {
        const me = Array.isArray(list) ? list.find((u) => u.id === p.id) : null;
        if (me) setCurrentUser({ id: me.id, isOga: me.isOga });
      });
    });
  }, []);

  async function load() {
    const [r, t, u] = await Promise.all([
      fetch("/api/admin/roles").then((res) => res.json()),
      fetch("/api/admin/teams").then((res) => res.json()),
      fetch("/api/admin/users").then((res) => res.json()),
    ]);
    setRoles(Array.isArray(r) ? r : []);
    setTeams(Array.isArray(t) ? t : []);
    if (Array.isArray(u)) {
      setUsers(u);
      // Update currentUser.isOga if it changed
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const me = u.find((x: User) => x.id === prev.id);
        return me ? { id: me.id, isOga: me.isOga } : prev;
      });
    }
  }

  const tabs: { key: TabKey; label: string; icon: IconDefinition; group: string }[] = [
    { key: "roles",        label: "Rollen",        icon: faShield,           group: "Berechtigungen" },
    { key: "teams",        label: "Teams",          icon: faUsers,            group: "Berechtigungen" },
    { key: "users",        label: "Benutzer",       icon: faUser,             group: "Berechtigungen" },
    { key: "global-perms", label: "Globalrechte",   icon: faKey,              group: "Berechtigungen" },
    { key: "org-groups",   label: "Org-Gruppen",    icon: faLayerGroup,       group: "Berechtigungen" },
    { key: "websites",     label: "Websites",       icon: faGlobe,            group: "Module" },
    { key: "integrations", label: "Integrationen",  icon: faPuzzlePiece,      group: "Module" },
    { key: "templates",    label: "Templates",      icon: faLayerGroup,       group: "Module" },
    { key: "ai",           label: "KI-Provider",    icon: faRobot,            group: "Admin" },
    { key: "workspace",    label: "Workspace",      icon: faGear,             group: "Admin" },
    { key: "info",         label: "App-Info",       icon: faInfoCircle,       group: "Admin" },
  ];

  const fullWidthTabs: TabKey[] = ["websites", "integrations", "templates"];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-48 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col py-4 overflow-y-auto">
        {(["Berechtigungen", "Module", "Admin"] as const).map((group) => (
          <div key={group} className="mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700 px-4 pb-1.5 pt-3">{group}</p>
            {tabs.filter((t) => t.group === group).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
                  tab === key
                    ? "text-[#3CC79A] bg-[rgba(60,199,154,0.1)]"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto ${fullWidthTabs.includes(tab) ? "" : "p-8"}`}>
        <div className={fullWidthTabs.includes(tab) ? "h-full" : "max-w-4xl"}>
          {tab === "roles"        && <RolesTab roles={roles} onRefresh={load} />}
          {tab === "teams"        && <TeamsTab teams={teams} roles={roles} users={users} onRefresh={load} />}
          {tab === "users"        && <UsersTab users={users} currentUser={currentUser} onRefresh={load} />}
          {tab === "global-perms" && <GlobalPermissionsTab users={users} />}
          {tab === "org-groups"   && <OrgGroupsTab users={users} />}
          {tab === "websites"     && <WebsiteManager />}
          {tab === "integrations" && <IntegrationManager />}
          {tab === "ai"           && <AiConfigTab />}
          {tab === "templates"    && <TemplateLibrary mode="manage" />}
          {tab === "workspace"    && <WorkspaceTab />}
          {tab === "info"         && <AppInfoTab />}
        </div>
      </div>
    </div>
  );
}
