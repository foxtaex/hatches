import type { ExternalIssueData, IntegrationConfig } from "./types";

// Confluence hat keine "Issues" — wir importieren Pages als Notizen-Links/Cards
export async function fetchConfluencePages(cfg: IntegrationConfig): Promise<ExternalIssueData[]> {
  const base = cfg.baseUrl?.replace(/\/$/, "");
  if (!base) throw new Error("Confluence: baseUrl fehlt");
  const extra = cfg.extraConfig ? JSON.parse(cfg.extraConfig) : {};
  const auth = Buffer.from(`${extra.email ?? ""}:${cfg.token ?? ""}`).toString("base64");
  const headers = { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };

  const spaceKey = cfg.projectKey;
  const items: ExternalIssueData[] = [];
  let start = 0;
  const limit = 50;
  while (true) {
    const spaceParam = spaceKey ? `spaceKey=${spaceKey}&` : "";
    const url = `${base}/rest/api/content?${spaceParam}type=page&status=current&limit=${limit}&start=${start}&expand=body.storage`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Confluence API error ${res.status}`);
    const data = await res.json();
    for (const p of data.results ?? []) {
      items.push({
        externalId: p.id,
        title: p.title,
        description: `Confluence Page in Space "${p._expandable?.space ?? spaceKey}"`,
        status: "active",
        url: `${base}${p._links?.webui ?? ""}`,
      });
    }
    if ((data.results?.length ?? 0) < limit) break;
    start += limit;
  }
  return items;
}
