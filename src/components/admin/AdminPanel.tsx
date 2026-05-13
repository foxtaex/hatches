import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faUser, faShield, faUsers, faLock } from "@fortawesome/free-solid-svg-icons";

type Section = "board" | "docs" | "notes" | "websites" | "integrations" | "admin";
const SECTIONS: Section[] = ["board", "docs", "notes", "websites", "integrations", "admin"];
const ACTIONS = ["canView", "canCreate", "canEdit", "canDelete"] as const;
const ACTION_LABELS = { canView: "Lesen", canCreate: "Erstellen", canEdit: "Bearbeiten", canDelete: "Löschen" };

interface Permission {
  section: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface Team {
  id: number;
  name: string;
  description: string | null;
  color: string;
  priority: number;
  isDefault: boolean;
  permissions: Permission[];
  _count: { memberships: number };
}

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  isActive: boolean;
  memberships: { team: { id: number; name: string; color: string } }[];
}

// ── Permission Matrix ─────────────────────────────────────
function PermMatrix({ teams, onSave }: { teams: Team[]; onSave: () => void }) {
  const [local, setLocal] = useState<Team[]>(teams);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setLocal(teams); setDirty(false); }, [teams]);

  function toggle(teamId: number, section: string, action: typeof ACTIONS[number]) {
    setLocal((prev) =>
      prev.map((t) =>
        t.id !== teamId
          ? t
          : {
              ...t,
              permissions: t.permissions.map((p) =>
                p.section !== section ? p : { ...p, [action]: !p[action] }
              ),
            }
      )
    );
    setDirty(true);
  }

  async function save() {
    for (const team of local) {
      await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: team.id, permissions: team.permissions }),
      });
    }
    setDirty(false);
    onSave();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-200">Berechtigungsmatrix</h3>
        {dirty && (
          <button onClick={save} className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded px-4 py-1.5 transition-colors">
            Speichern
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left py-2 pr-4 text-zinc-500 font-medium w-40">Team</th>
              {SECTIONS.map((s) => (
                <th key={s} colSpan={4} className="text-center py-2 px-1 text-zinc-400 font-medium capitalize border-l border-zinc-800">
                  {s}
                </th>
              ))}
            </tr>
            <tr className="border-b border-zinc-800">
              <th />
              {SECTIONS.flatMap((s) =>
                ACTIONS.map((a) => (
                  <th key={`${s}-${a}`} className="py-1 px-1 text-center text-zinc-600 font-normal text-xs">
                    {ACTION_LABELS[a].slice(0, 3)}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {local.map((team) => (
              <tr key={team.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: team.color }} />
                    <span className="text-zinc-300 truncate">{team.name}</span>
                  </div>
                </td>
                {SECTIONS.flatMap((section) =>
                  ACTIONS.map((action) => {
                    const perm = team.permissions.find((p) => p.section === section);
                    const checked = perm?.[action] ?? false;
                    return (
                      <td key={`${section}-${action}`} className="py-2 px-1 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(team.id, section, action)}
                          className="accent-blue-500 cursor-pointer"
                        />
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Team Manager ──────────────────────────────────────────
function TeamManager({ teams, onRefresh }: { teams: Team[]; onRefresh: () => void }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6b7280", priority: "10", isDefault: false });

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, priority: Number(form.priority) }),
    });
    setCreating(false);
    setForm({ name: "", description: "", color: "#6b7280", priority: "10", isDefault: false });
    onRefresh();
  }

  async function deleteTeam(id: number) {
    if (!confirm("Team wirklich löschen?")) return;
    await fetch("/api/admin/teams", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    onRefresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-200">Teams</h3>
        <button onClick={() => setCreating(!creating)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded px-3 py-1.5">
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3 mr-1" /> Neues Team
        </button>
      </div>

      {creating && (
        <form onSubmit={createTeam} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name *" required
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Beschreibung"
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">Farbe</label>
              <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            </div>
            <input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} placeholder="Priorität"
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="accent-blue-500" />
            Neuen Benutzern automatisch zuweisen
          </label>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded px-4 py-1.5">Erstellen</button>
            <button type="button" onClick={() => setCreating(false)} className="text-zinc-500 hover:text-zinc-300 text-sm px-3">Abbrechen</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {teams.map((team) => (
          <div key={team.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: team.color }} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-200">{team.name}</span>
                {team.isDefault && <span className="text-xs bg-zinc-700 text-zinc-400 rounded px-2 py-0.5">Standard</span>}
                <span className="text-xs text-zinc-600">Priorität {team.priority}</span>
              </div>
              {team.description && <p className="text-xs text-zinc-500">{team.description}</p>}
            </div>
            <span className="text-xs text-zinc-600">{team._count.memberships} Mitglieder</span>
            <button onClick={() => deleteTeam(team.id)} className="text-zinc-700 hover:text-red-500 ml-2" title="Team loeschen"><FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── User Manager ──────────────────────────────────────────
function UserManager({ users, teams, onRefresh }: { users: User[]; teams: Team[]; onRefresh: () => void }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "", teamIds: [] as number[] });

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      // Set team memberships
      const data = await res.json();
      if (form.teamIds.length) {
        await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: data.user.id, teamIds: form.teamIds }),
        });
      }
      setCreating(false);
      setForm({ username: "", email: "", password: "", displayName: "", teamIds: [] });
      onRefresh();
    }
  }

  async function toggleActive(user: User) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
    });
    onRefresh();
  }

  async function deleteUser(id: number) {
    if (!confirm("User wirklich löschen?")) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    onRefresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-200">Benutzer</h3>
        <button onClick={() => setCreating(!creating)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded px-3 py-1.5">
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3 mr-1" /> Neuer Benutzer
        </button>
      </div>

      {creating && (
        <form onSubmit={createUser} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="Benutzername *" required
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input value={form.email} type="email" onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="E-Mail *" required
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="Anzeigename"
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
            <input value={form.password} type="password" onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Passwort *" required minLength={6}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded px-3 py-1.5 outline-none focus:border-zinc-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Teams</p>
            <div className="flex flex-wrap gap-2">
              {teams.map((t) => (
                <label key={t.id} className="flex items-center gap-1.5 cursor-pointer text-sm text-zinc-400">
                  <input type="checkbox" checked={form.teamIds.includes(t.id)}
                    onChange={(e) => setForm((f) => ({ ...f, teamIds: e.target.checked ? [...f.teamIds, t.id] : f.teamIds.filter((id) => id !== t.id) }))}
                    className="accent-blue-500" />
                  <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  {t.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded px-4 py-1.5">Erstellen</button>
            <button type="button" onClick={() => setCreating(false)} className="text-zinc-500 hover:text-zinc-300 text-sm px-3">Abbrechen</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div key={user.id} className={`flex items-center gap-3 bg-zinc-900 border rounded-lg px-4 py-3 ${user.isActive ? "border-zinc-800" : "border-zinc-800 opacity-50"}`}>
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300 flex-shrink-0">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-200">{user.displayName || user.username}</span>
                <span className="text-xs text-zinc-500">@{user.username}</span>
                {user.isAdmin && <span className="text-xs bg-red-900/50 text-red-400 rounded px-1.5">Admin</span>}
              </div>
              <div className="flex gap-1 mt-1 flex-wrap">
                {user.memberships.map(({ team }) => (
                  <span key={team.id} className="text-xs rounded px-1.5 py-0.5" style={{ background: team.color + "33", color: team.color }}>{team.name}</span>
                ))}
              </div>
            </div>
            <span className="text-xs text-zinc-600">{user.email}</span>
            <button onClick={() => toggleActive(user)} className={`text-xs rounded px-2 py-0.5 ${user.isActive ? "text-green-500 hover:text-red-400" : "text-red-500 hover:text-green-400"}`}>
              {user.isActive ? "Aktiv" : "Inaktiv"}
            </button>
            <button onClick={() => deleteUser(user.id)} className="text-zinc-700 hover:text-red-500 text-sm">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export function AdminPanel() {
  const [tab, setTab] = useState<"teams" | "users" | "perms">("teams");
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const [t, u] = await Promise.all([
      fetch("/api/admin/teams").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]);
    setTeams(t);
    setUsers(u);
  }

  const tabs = [
    { key: "teams", label: "Teams", icon: faUsers },
    { key: "users", label: "Benutzer", icon: faUser },
    { key: "perms", label: "Berechtigungen", icon: faLock },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-1 border-b border-zinc-800 pb-0">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key ? "border-blue-500 text-blue-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
            >
              <><FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 mr-1.5" />{label}</>
            </button>
          ))}
        </div>

        {tab === "teams" && <TeamManager teams={teams} onRefresh={load} />}
        {tab === "users" && <UserManager users={users} teams={teams} onRefresh={load} />}
        {tab === "perms" && <PermMatrix teams={teams} onSave={load} />}
      </div>
    </div>
  );
}
