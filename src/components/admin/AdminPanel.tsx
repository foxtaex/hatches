import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faXmark, faUser, faShield, faUsers,
  faChevronRight, faCheck, faTrash,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

// ── Types ────────────────────────────────────────────────
type Section = "board" | "docs" | "notes" | "websites" | "integrations" | "admin";
const SECTIONS: { key: Section; label: string }[] = [
  { key: "board", label: "Board" },
  { key: "docs", label: "Docs" },
  { key: "notes", label: "Notizen" },
  { key: "websites", label: "Websites" },
  { key: "integrations", label: "Integrationen" },
  { key: "admin", label: "Admin" },
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
interface User { id: number; username: string; email: string; displayName: string | null; isAdmin: boolean; isActive: boolean; memberships: { team: { id: number; name: string; color: string }; role: { id: number; name: string; color: string } }[]; }

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
    <div className="flex border border-zinc-800 rounded-xl overflow-hidden" style={{ height: "calc(100vh - 13rem)" }}>
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
              {SECTIONS.map(({ key, label }) => {
                const perm = selected.permissions.find((p) => p.section === key);
                if (!perm) return null;
                return (
                  <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800">
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
function UsersTab({ users, onRefresh }: { users: User[]; onRefresh: () => Promise<void> }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "" });

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
          <div key={user.id} className={`flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 transition-opacity ${user.isActive ? "" : "opacity-50"}`}>
            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300 flex-shrink-0">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-zinc-200">{user.displayName || user.username}</span>
                <span className="text-xs text-zinc-500">@{user.username}</span>
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
            <button onClick={() => deleteUser(user.id)} className="text-zinc-700 hover:text-red-400 transition-colors flex-shrink-0">
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">Keine Benutzer vorhanden</p>
        )}
      </div>
    </div>
  );
}

// ── Hauptkomponente ───────────────────────────────────────
export function AdminPanel() {
  const [tab, setTab] = useState<"roles" | "teams" | "users">("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const [r, t, u] = await Promise.all([
      fetch("/api/admin/roles").then((res) => res.json()),
      fetch("/api/admin/teams").then((res) => res.json()),
      fetch("/api/admin/users").then((res) => res.json()),
    ]);
    setRoles(Array.isArray(r) ? r : []);
    setTeams(Array.isArray(t) ? t : []);
    setUsers(Array.isArray(u) ? u : []);
  }

  const tabs: { key: "roles" | "teams" | "users"; label: string; icon: IconDefinition }[] = [
    { key: "roles", label: "Rollen", icon: faShield },
    { key: "teams", label: "Teams", icon: faUsers },
    { key: "users", label: "Benutzer", icon: faUser },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-1 border-b border-zinc-800">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
            >
              <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === "roles" && <RolesTab roles={roles} onRefresh={load} />}
        {tab === "teams" && <TeamsTab teams={teams} roles={roles} users={users} onRefresh={load} />}
        {tab === "users" && <UsersTab users={users} onRefresh={load} />}
      </div>
    </div>
  );
}
