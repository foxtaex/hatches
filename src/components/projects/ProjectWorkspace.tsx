import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faCalendarDays,
  faCheck,
  faFileLines,
  faFolder,
  faFolderOpen,
  faGear,
  faLink,
  faLock,
  faPlus,
  faTableColumns,
  faTrash,
  faUnlink,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { fetchJson } from "../../lib/fetchJson";
import { useTranslation } from "../../lib/i18n";
import { ThemedSelect } from "../ui/ThemedSelect";

interface TeamOption { id: number; name: string; color: string }
interface ProjectFolder { id: number; name: string; position: number; projectId: number }
interface ProjectItem {
  id: number;
  type: "board" | "doc" | string;
  projectId: number;
  folderId: number | null;
  boardId: number | null;
  docId: number | null;
  board: { id: number; name: string } | null;
  doc: { id: number; title: string } | null;
}
interface Project {
  id: number;
  name: string;
  description: string | null;
  dueDate: string | null;
  teamId: number | null;
  team: TeamOption | null;
  folders: ProjectFolder[];
  items: ProjectItem[];
}
interface LinkOption {
  id: number;
  name?: string;
  title?: string;
  projectItem: { id: number; projectId: number } | null;
}
interface LinkOptions { boards: LinkOption[]; docs: LinkOption[] }

export function ProjectWorkspace() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [options, setOptions] = useState<LinkOptions>({ boards: [], docs: [] });
  const [loadError, setLoadError] = useState("");

  const [creatingProject, setCreatingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectTeamId, setProjectTeamId] = useState("");
  const creatingRef = useRef(false);

  const [folderName, setFolderName] = useState("");
  const [addingFolder, setAddingFolder] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkType, setLinkType] = useState<"board" | "doc">("board");
  const [linkTargetId, setLinkTargetId] = useState("");
  const [linkFolderId, setLinkFolderId] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingProject, setEditingProject] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTeamId, setEditTeamId] = useState("");

  const activeProject = projects.find((project) => project.id === activeId) ?? null;
  const availableTargets = useMemo(
    () => (linkType === "board" ? options.boards : options.docs).filter((option) => !option.projectItem),
    [linkType, options],
  );

  useEffect(() => { loadInitial(); }, []);
  useEffect(() => {
    if (!availableTargets.some((option) => String(option.id) === linkTargetId)) {
      setLinkTargetId(availableTargets[0] ? String(availableTargets[0].id) : "");
    }
  }, [availableTargets, linkTargetId]);

  async function loadInitial() {
    setLoadError("");
    try {
      const [projectData, teamData, optionData] = await Promise.all([
        fetchJson<Project[]>("/api/projects"),
        fetchJson<TeamOption[]>("/api/user/teams"),
        fetchJson<LinkOptions>("/api/projects/options"),
      ]);
      setProjects(projectData);
      setTeams(teamData);
      setOptions(optionData);
      const urlId = Number(new URLSearchParams(window.location.search).get("projectId"));
      setActiveId(urlId && projectData.some((project) => project.id === urlId) ? urlId : projectData[0]?.id ?? null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Projekte konnten nicht geladen werden");
    }
  }

  async function reloadProjects(preferredId: number | null = activeId) {
    const [projectData, optionData] = await Promise.all([
      fetchJson<Project[]>("/api/projects"),
      fetchJson<LinkOptions>("/api/projects/options"),
    ]);
    setProjects(projectData);
    setOptions(optionData);
    setActiveId(preferredId && projectData.some((project) => project.id === preferredId) ? preferredId : projectData[0]?.id ?? null);
  }

  function selectProject(id: number) {
    setActiveId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("projectId", String(id));
    window.history.replaceState({}, "", url);
  }

  async function createProject() {
    if (creatingRef.current) return;
    const name = projectName.trim();
    if (!name) return;
    creatingRef.current = true;
    setModalError("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, teamId: projectTeamId ? Number(projectTeamId) : null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Projekt konnte nicht erstellt werden");
      const project = data as Project;
      setProjects((current) => [project, ...current]);
      setActiveId(project.id);
      setProjectName("");
      setProjectTeamId("");
      setCreatingProject(false);
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Projekt konnte nicht erstellt werden");
    } finally {
      creatingRef.current = false;
    }
  }

  async function createFolder() {
    if (!activeProject || !folderName.trim()) return;
    setSaving(true);
    setModalError("");
    try {
      const response = await fetch("/api/projects/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProject.id, name: folderName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unterordner konnte nicht erstellt werden");
      await reloadProjects(activeProject.id);
      setFolderName("");
      setAddingFolder(false);
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Unterordner konnte nicht erstellt werden");
    } finally {
      setSaving(false);
    }
  }

  function openLink(folderId: number | null) {
    setLinkFolderId(folderId === null ? "" : String(folderId));
    setLinkType("board");
    setModalError("");
    setLinking(true);
  }

  async function linkContent() {
    if (!activeProject || !linkTargetId) return;
    setSaving(true);
    setModalError("");
    try {
      const response = await fetch("/api/projects/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProject.id,
          folderId: linkFolderId ? Number(linkFolderId) : null,
          type: linkType,
          targetId: Number(linkTargetId),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Inhalt konnte nicht verknüpft werden");
      await reloadProjects(activeProject.id);
      setLinking(false);
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Inhalt konnte nicht verknüpft werden");
    } finally {
      setSaving(false);
    }
  }

  async function unlinkItem(itemId: number) {
    await fetch("/api/projects/items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemId }),
    });
    await reloadProjects(activeId);
  }

  async function deleteFolder(folder: ProjectFolder) {
    if (!window.confirm(t("projects.deleteFolderConfirm", { name: folder.name }))) return;
    const response = await fetch("/api/projects/folders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: folder.id }),
    });
    if (response.ok) await reloadProjects(activeId);
  }

  function openSettings() {
    if (!activeProject) return;
    setEditName(activeProject.name);
    setEditDescription(activeProject.description ?? "");
    setEditDueDate(activeProject.dueDate?.slice(0, 10) ?? "");
    setEditTeamId(activeProject.teamId === null ? "" : String(activeProject.teamId));
    setModalError("");
    setEditingProject(true);
  }

  async function saveProject() {
    if (!activeProject || !editName.trim()) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription, dueDate: editDueDate || null, teamId: editTeamId ? Number(editTeamId) : null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Projekt konnte nicht gespeichert werden");
      setProjects((current) => current.map((project) => project.id === data.id ? data : project));
      setEditingProject(false);
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Projekt konnte nicht gespeichert werden");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject() {
    if (!activeProject || !window.confirm(t("projects.deleteConfirm", { name: activeProject.name }))) return;
    const response = await fetch(`/api/projects/${activeProject.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) { setModalError(data.error || "Projekt konnte nicht gelöscht werden"); return; }
    setEditingProject(false);
    await reloadProjects(null);
  }

  function renderItem(item: ProjectItem) {
    const isBoard = item.type === "board";
    const title = isBoard ? item.board?.name : item.doc?.title;
    const href = isBoard ? `/board?boardId=${item.boardId}` : `/docs?id=${item.docId}`;
    return (
      <div key={item.id} className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.045]">
        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isBoard ? "bg-sky-500/10 text-sky-400" : "bg-[#3CC79A]/10 text-[#3CC79A]"}`}>
          <FontAwesomeIcon icon={isBoard ? faTableColumns : faFileLines} className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white/80">{title || "—"}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/25">{isBoard ? t("projects.board") : t("projects.doc")}</p>
        </div>
        <a href={href} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/25 transition-colors hover:bg-white/[0.07] hover:text-white/70" title={title || "Öffnen"}>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
        </a>
        <button onClick={() => unlinkItem(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/20 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100" title={t("projects.unlink")}>
          <FontAwesomeIcon icon={faUnlink} className="h-3 w-3" />
        </button>
      </div>
    );
  }

  function renderSection(folder: ProjectFolder | null) {
    if (!activeProject) return null;
    const items = activeProject.items.filter((item) => item.folderId === (folder?.id ?? null));
    return (
      <section key={folder?.id ?? "root"} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(24,24,27,0.62)]">
        <header className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
          <FontAwesomeIcon icon={folder ? faFolder : faFolderOpen} className={`h-4 w-4 ${folder ? "text-amber-400/70" : "text-white/30"}`} />
          <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-white/75">{folder?.name ?? t("projects.noFolder")}</h2>
          <span className="text-[10px] text-white/25">{items.length}</span>
          <button onClick={() => openLink(folder?.id ?? null)} className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] text-[#3CC79A] transition-colors hover:bg-[#3CC79A]/10">
            <FontAwesomeIcon icon={faLink} className="h-3 w-3" /> {t("common.add")}
          </button>
          {folder && (
            <button onClick={() => deleteFolder(folder)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400" title={t("common.delete")}>
              <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
            </button>
          )}
        </header>
        <div className="flex flex-col gap-2 p-3">
          {items.length ? items.map(renderItem) : <p className="py-5 text-center text-xs text-white/20">{t("projects.noItems")}</p>}
        </div>
      </section>
    );
  }

  const scopeOptions = [
    { value: "", label: t("common.private"), icon: <FontAwesomeIcon icon={faLock} className="h-3 w-3" /> },
    ...teams.map((team) => ({ value: String(team.id), label: team.name, icon: <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team.color }} /> })),
  ];

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="flex w-[280px] flex-shrink-0 flex-col border-r border-white/[0.08] bg-[rgba(18,18,18,0.62)] backdrop-blur-[30px]">
        <div className="flex flex-col gap-3 border-b border-white/[0.08] px-5 pb-3 pt-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[17px] font-semibold text-white/90">
              <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4 text-white/45" /> {t("projects.title")}
            </span>
            <button onClick={() => { setCreatingProject(true); setModalError(""); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3CC79A]/10 text-[#3CC79A] transition-colors hover:bg-[#3CC79A]/20" title={t("projects.newProject")}>
              <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
            </button>
          </div>
          {creatingProject && (
            <div className="flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-2.5">
              <input autoFocus value={projectName} onChange={(event) => setProjectName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createProject(); if (event.key === "Escape") setCreatingProject(false); }} placeholder={t("projects.projectName")} className="w-full rounded-lg border border-white/[0.1] bg-zinc-800 px-2.5 py-2 text-xs text-white/85 outline-none focus:border-[#3CC79A]/40" />
              <ThemedSelect value={projectTeamId} onChange={setProjectTeamId} ariaLabel={t("common.team")} compact options={scopeOptions} />
              <div className="flex justify-end gap-1">
                <button onClick={() => setCreatingProject(false)} className="flex h-7 w-7 items-center justify-center text-white/30 hover:text-white/60"><FontAwesomeIcon icon={faXmark} className="h-3 w-3" /></button>
                <button onClick={createProject} disabled={!projectName.trim()} className="flex h-7 w-7 items-center justify-center text-[#3CC79A] disabled:opacity-30"><FontAwesomeIcon icon={faCheck} className="h-3 w-3" /></button>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {projects.map((project) => (
            <button key={project.id} onClick={() => selectProject(project.id)} className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeId === project.id ? "bg-white/[0.08] text-white/90" : "text-white/45 hover:bg-white/[0.04] hover:text-white/70"}`}>
              <FontAwesomeIcon icon={faFolder} className={`h-3.5 w-3.5 ${activeId === project.id ? "text-[#3CC79A]" : "text-white/25"}`} />
              <span className="min-w-0 flex-1 truncate text-sm">{project.name}</span>
              {project.team ? <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.team.color }} /> : <FontAwesomeIcon icon={faLock} className="h-2.5 w-2.5 text-white/20" />}
            </button>
          ))}
          {!projects.length && <p className="px-4 py-8 text-center text-xs text-white/20">{loadError || t("projects.empty")}</p>}
        </nav>
      </aside>

      {!activeProject ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-3 text-white/25">
          <FontAwesomeIcon icon={faFolderOpen} className="h-10 w-10" />
          <p className="text-sm">{loadError || t("projects.select")}</p>
        </main>
      ) : (
        <main className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center gap-4 border-b border-white/[0.08] bg-[rgba(24,24,27,0.65)] px-7 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3CC79A]/10 text-[#3CC79A]"><FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4" /></div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold text-white/90">{activeProject.name}</h1>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <p className="truncate">{activeProject.description || (activeProject.team?.name ?? t("common.private"))}</p>
                {activeProject.dueDate && <span className="flex flex-shrink-0 items-center gap-1 rounded-md bg-[#3CC79A]/10 px-1.5 py-0.5 text-[10px] text-[#3CC79A]/80"><FontAwesomeIcon icon={faCalendarDays} className="h-2.5 w-2.5" />{new Date(activeProject.dueDate).toLocaleDateString()}</span>}
              </div>
            </div>
            <button onClick={() => { setAddingFolder(true); setModalError(""); }} className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"><FontAwesomeIcon icon={faFolder} className="h-3 w-3" /> {t("projects.newFolder")}</button>
            <button onClick={() => openLink(null)} className="flex items-center gap-2 rounded-xl bg-[#3CC79A]/10 px-3 py-2 text-xs text-[#3CC79A] transition-colors hover:bg-[#3CC79A]/20"><FontAwesomeIcon icon={faLink} className="h-3 w-3" /> {t("projects.linkContent")}</button>
            <button onClick={openSettings} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/65" title={t("projects.settings")}><FontAwesomeIcon icon={faGear} className="h-3.5 w-3.5" /></button>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {addingFolder && (
              <div className="mb-4 flex max-w-lg items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-2">
                <input autoFocus value={folderName} onChange={(event) => setFolderName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createFolder(); if (event.key === "Escape") setAddingFolder(false); }} placeholder={t("projects.folderName")} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white/80 outline-none placeholder:text-white/20" />
                <span className="text-[10px] text-white/20">{t("projects.oneLevel")}</span>
                <button onClick={() => setAddingFolder(false)} className="h-7 w-7 text-white/25 hover:text-white/60"><FontAwesomeIcon icon={faXmark} className="h-3 w-3" /></button>
                <button onClick={createFolder} disabled={saving || !folderName.trim()} className="h-7 w-7 text-[#3CC79A] disabled:opacity-30"><FontAwesomeIcon icon={faCheck} className="h-3 w-3" /></button>
              </div>
            )}
            {modalError && !linking && !editingProject && <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300">{modalError}</p>}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {renderSection(null)}
              {activeProject.folders.map((folder) => renderSection(folder))}
            </div>
            <p className="mt-5 text-center text-[11px] text-white/15">{t("projects.whiteboardSoon")}</p>
          </div>
        </main>
      )}

      {linking && activeProject && (
        <div className="fixed inset-0 z-[750] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setLinking(false); }}>
          <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-zinc-950/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
            <div className="mb-5 flex items-center gap-3"><FontAwesomeIcon icon={faLink} className="h-4 w-4 text-[#3CC79A]" /><h2 className="flex-1 text-sm font-semibold text-white/90">{t("projects.linkContent")}</h2><button onClick={() => setLinking(false)} className="text-white/30 hover:text-white/70"><FontAwesomeIcon icon={faXmark} className="h-4 w-4" /></button></div>
            <div className="flex flex-col gap-4">
              <div><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("projects.type")}</span><ThemedSelect value={linkType} onChange={(value) => setLinkType(value === "doc" ? "doc" : "board")} ariaLabel={t("projects.type")} options={[{ value: "board", label: t("projects.board"), icon: <FontAwesomeIcon icon={faTableColumns} className="h-3 w-3" /> }, { value: "doc", label: t("projects.doc"), icon: <FontAwesomeIcon icon={faFileLines} className="h-3 w-3" /> }]} /></div>
              <div><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("projects.target")}</span><ThemedSelect value={linkTargetId} onChange={setLinkTargetId} ariaLabel={t("projects.target")} options={availableTargets.length ? availableTargets.map((option) => ({ value: String(option.id), label: option.name ?? option.title ?? "—", icon: <FontAwesomeIcon icon={linkType === "board" ? faTableColumns : faFileLines} className="h-3 w-3" /> })) : [{ value: "", label: linkType === "board" ? t("projects.noBoards") : t("projects.noDocs"), disabled: true }]} /></div>
              <div><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("projects.location")}</span><ThemedSelect value={linkFolderId} onChange={setLinkFolderId} ariaLabel={t("projects.location")} options={[{ value: "", label: t("projects.noFolder"), icon: <FontAwesomeIcon icon={faFolderOpen} className="h-3 w-3" /> }, ...activeProject.folders.map((folder) => ({ value: String(folder.id), label: folder.name, icon: <FontAwesomeIcon icon={faFolder} className="h-3 w-3" /> }))]} /></div>
              {modalError && <p className="rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-xs text-red-300">{modalError}</p>}
              <div className="flex justify-end gap-2 pt-2"><button onClick={() => setLinking(false)} className="rounded-xl px-3 py-2 text-xs text-white/40 hover:bg-white/[0.05]">{t("common.cancel")}</button><button onClick={linkContent} disabled={saving || !linkTargetId} className="rounded-xl bg-[#3CC79A] px-4 py-2 text-xs font-semibold text-white disabled:opacity-35">{saving ? t("common.saving") : t("projects.linkContent")}</button></div>
            </div>
          </section>
        </div>
      )}

      {editingProject && activeProject && (
        <div className="fixed inset-0 z-[750] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingProject(false); }}>
          <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-zinc-950/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
            <div className="mb-5 flex items-center gap-3"><FontAwesomeIcon icon={faGear} className="h-4 w-4 text-[#3CC79A]" /><h2 className="flex-1 text-sm font-semibold text-white/90">{t("projects.settings")}</h2><button onClick={() => setEditingProject(false)} className="text-white/30 hover:text-white/70"><FontAwesomeIcon icon={faXmark} className="h-4 w-4" /></button></div>
            <div className="flex flex-col gap-4">
              <label><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("common.name")}</span><input value={editName} onChange={(event) => setEditName(event.target.value)} className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#3CC79A]/45" /></label>
              <label><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("projects.description")}</span><textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#3CC79A]/45" /></label>
              <label><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("projects.dueDate")}</span><input type="date" value={editDueDate} onChange={(event) => setEditDueDate(event.target.value)} className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white/85 outline-none focus:border-[#3CC79A]/45 [color-scheme:dark]" /></label>
              <div><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/35">{t("common.team")}</span><ThemedSelect value={editTeamId} onChange={setEditTeamId} ariaLabel={t("common.team")} options={scopeOptions} /></div>
              {modalError && <p className="rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-xs text-red-300">{modalError}</p>}
              <div className="flex items-center border-t border-white/[0.07] pt-4"><button onClick={deleteProject} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"><FontAwesomeIcon icon={faTrash} className="h-3 w-3" /> {t("projects.deleteProject")}</button><div className="flex-1" /><button onClick={() => setEditingProject(false)} className="rounded-xl px-3 py-2 text-xs text-white/40 hover:bg-white/[0.05]">{t("common.cancel")}</button><button onClick={saveProject} disabled={saving || !editName.trim()} className="ml-2 rounded-xl bg-[#3CC79A] px-4 py-2 text-xs font-semibold text-white disabled:opacity-35">{saving ? t("common.saving") : t("common.save")}</button></div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
