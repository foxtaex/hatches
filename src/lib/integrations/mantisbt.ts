import type { ExternalIssueData, IntegrationConfig } from "./types";

export async function fetchMantisBTIssues(cfg: IntegrationConfig): Promise<ExternalIssueData[]> {
  const base = cfg.baseUrl?.replace(/\/$/, "");
  if (!base) throw new Error("MantisBT: baseUrl fehlt");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.token) headers["Authorization"] = cfg.token;

  const issues: ExternalIssueData[] = [];
  let page = 1;
  const pageSize = 50;
  while (true) {
    const projectParam = cfg.projectKey ? `&project_id=${cfg.projectKey}` : "";
    const url = `${base}/api/rest/issues?page_size=${pageSize}&select=id,summary,description,status,handler,tags,resolution${projectParam}&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`MantisBT API error ${res.status}`);
    const data = await res.json();
    const batch = data.issues ?? [];
    for (const i of batch) {
      if (i.resolution?.name && i.resolution.name !== "open") continue;
      issues.push({
        externalId: String(i.id),
        title: `#${i.id} ${i.summary}`,
        description: i.description,
        status: i.status?.label,
        url: `${base}/view.php?id=${i.id}`,
        assignee: i.handler?.name,
        labels: (i.tags ?? []).map((t: any) => t.name),
      });
    }
    if (batch.length < pageSize) break;
    page++;
  }
  return issues;
}
