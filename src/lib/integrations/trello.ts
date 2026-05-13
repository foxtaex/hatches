import type { ExternalIssueData, IntegrationConfig } from "./types";

export async function fetchTrelloIssues(cfg: IntegrationConfig): Promise<ExternalIssueData[]> {
  // extraConfig: { apiKey: "..." }
  const extra = cfg.extraConfig ? JSON.parse(cfg.extraConfig) : {};
  if (!extra.apiKey || !cfg.token) throw new Error("Trello: apiKey (extraConfig) und token erforderlich");

  const boardId = cfg.projectKey;
  if (!boardId) throw new Error("Trello: projectKey (Board-ID) fehlt");

  const auth = `key=${extra.apiKey}&token=${cfg.token}`;
  const res = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?${auth}&fields=id,name,desc,url,idList,labels,idMembers`);
  if (!res.ok) throw new Error(`Trello API error ${res.status}`);
  const cards: any[] = await res.json();

  // Listen-Namen nachladen
  const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?${auth}&fields=id,name`);
  const lists: any[] = listsRes.ok ? await listsRes.json() : [];
  const listMap = Object.fromEntries(lists.map((l) => [l.id, l.name]));

  return cards.map((c) => ({
    externalId: c.id,
    title: c.name,
    description: c.desc || undefined,
    status: listMap[c.idList] ?? "Unknown",
    url: c.url,
    labels: c.labels?.map((l: any) => l.name).filter(Boolean),
  }));
}
