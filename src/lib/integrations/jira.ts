import type { ExternalIssueData, IntegrationConfig } from "./types";

export async function fetchJiraIssues(cfg: IntegrationConfig): Promise<ExternalIssueData[]> {
  const base = cfg.baseUrl?.replace(/\/$/, "");
  if (!base) throw new Error("Jira: baseUrl fehlt");

  // extraConfig enthält optional: { email: "user@example.com" }
  const extra = cfg.extraConfig ? JSON.parse(cfg.extraConfig) : {};
  const auth = Buffer.from(`${extra.email ?? ""}:${cfg.token ?? ""}`).toString("base64");
  const headers = { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };

  const issues: ExternalIssueData[] = [];
  let startAt = 0;
  const maxResults = 100;
  while (true) {
    const jql = cfg.projectKey ? `project=${cfg.projectKey} AND statusCategory != Done` : "statusCategory != Done";
    const url = `${base}/rest/api/3/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${maxResults}&fields=summary,description,status,assignee,labels,issuetype`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Jira API error ${res.status}`);
    const data = await res.json();
    for (const i of data.issues ?? []) {
      issues.push({
        externalId: i.key,
        title: `[${i.key}] ${i.fields.summary}`,
        description: i.fields.description?.content?.[0]?.content?.[0]?.text,
        status: i.fields.status?.name,
        url: `${base}/browse/${i.key}`,
        assignee: i.fields.assignee?.displayName,
        labels: i.fields.labels,
      });
    }
    if (data.issues?.length < maxResults) break;
    startAt += maxResults;
  }
  return issues;
}
