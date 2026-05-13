import type { ExternalIssueData, IntegrationConfig } from "./types";

export async function fetchGitHubIssues(cfg: IntegrationConfig): Promise<ExternalIssueData[]> {
  const base = cfg.baseUrl?.replace(/\/$/, "") ?? "https://api.github.com";
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (cfg.token) headers["Authorization"] = `Bearer ${cfg.token}`;

  const issues: ExternalIssueData[] = [];
  let page = 1;
  while (true) {
    const url = `${base}/repos/${cfg.projectKey}/issues?state=open&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
    const data: any[] = await res.json();
    if (!data.length) break;
    for (const i of data) {
      if (i.pull_request) continue; // PRs rausfiltern
      issues.push({
        externalId: String(i.number),
        title: i.title,
        description: i.body ?? undefined,
        status: i.state,
        url: i.html_url,
        assignee: i.assignee?.login,
        labels: i.labels?.map((l: any) => l.name),
      });
    }
    if (data.length < 100) break;
    page++;
  }
  return issues;
}
