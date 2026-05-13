import type { ExternalIssueData, IntegrationConfig } from "./types";

export async function fetchRedmineIssues(cfg: IntegrationConfig): Promise<ExternalIssueData[]> {
  const base = cfg.baseUrl?.replace(/\/$/, "");
  if (!base) throw new Error("Redmine: baseUrl fehlt");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.token) headers["X-Redmine-API-Key"] = cfg.token;

  const issues: ExternalIssueData[] = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const projectParam = cfg.projectKey ? `&project_id=${cfg.projectKey}` : "";
    const url = `${base}/issues.json?status_id=open&limit=${limit}&offset=${offset}${projectParam}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Redmine API error ${res.status}`);
    const data = await res.json();
    for (const i of data.issues ?? []) {
      issues.push({
        externalId: String(i.id),
        title: `#${i.id} ${i.subject}`,
        description: i.description,
        status: i.status?.name,
        url: `${base}/issues/${i.id}`,
        assignee: i.assigned_to?.name,
        labels: [i.tracker?.name, i.priority?.name].filter(Boolean) as string[],
      });
    }
    if ((data.issues?.length ?? 0) < limit) break;
    offset += limit;
  }
  return issues;
}
