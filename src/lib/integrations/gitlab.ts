import type { ExternalIssueData, IntegrationConfig } from "./types";

export async function fetchGitLabIssues(cfg: IntegrationConfig): Promise<ExternalIssueData[]> {
  const base = cfg.baseUrl?.replace(/\/$/, "") ?? "https://gitlab.com";
  const headers: Record<string, string> = {};
  if (cfg.token) headers["PRIVATE-TOKEN"] = cfg.token;

  const projectId = encodeURIComponent(cfg.projectKey ?? "");
  const issues: ExternalIssueData[] = [];
  let page = 1;
  while (true) {
    const url = `${base}/api/v4/projects/${projectId}/issues?state=opened&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitLab API error ${res.status}`);
    const data: any[] = await res.json();
    if (!data.length) break;
    for (const i of data) {
      issues.push({
        externalId: String(i.iid),
        title: i.title,
        description: i.description ?? undefined,
        status: i.state,
        url: i.web_url,
        assignee: i.assignee?.username,
        labels: i.labels,
      });
    }
    if (data.length < 100) break;
    page++;
  }
  return issues;
}
