import { prisma } from "../db";
import type { IntegrationConfig } from "./types";
import { fetchGitHubIssues } from "./github";
import { fetchGitLabIssues } from "./gitlab";
import { fetchJiraIssues } from "./jira";
import { fetchRedmineIssues } from "./redmine";
import { fetchMantisBTIssues } from "./mantisbt";
import { fetchTrelloIssues } from "./trello";
import { fetchConfluencePages } from "./confluence";

export async function syncIntegration(integrationId: number) {
  const integration = await prisma.integration.findUniqueOrThrow({
    where: { id: integrationId },
  });

  const cfg: IntegrationConfig = integration;

  let rawIssues;
  switch (cfg.type) {
    case "github":     rawIssues = await fetchGitHubIssues(cfg);   break;
    case "gitlab":     rawIssues = await fetchGitLabIssues(cfg);   break;
    case "jira":       rawIssues = await fetchJiraIssues(cfg);     break;
    case "redmine":    rawIssues = await fetchRedmineIssues(cfg);  break;
    case "mantisbt":   rawIssues = await fetchMantisBTIssues(cfg); break;
    case "trello":     rawIssues = await fetchTrelloIssues(cfg);   break;
    case "confluence": rawIssues = await fetchConfluencePages(cfg); break;
    default: throw new Error(`Unbekannter Integrationstyp: ${cfg.type}`);
  }

  // Upsert alle Issues
  for (const issue of rawIssues) {
    await prisma.externalIssue.upsert({
      where: { integrationId_externalId: { integrationId, externalId: issue.externalId } },
      update: {
        title: issue.title,
        description: issue.description,
        status: issue.status,
        url: issue.url,
        assignee: issue.assignee,
        labels: issue.labels ? JSON.stringify(issue.labels) : null,
      },
      create: {
        integrationId,
        externalId: issue.externalId,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        url: issue.url,
        assignee: issue.assignee,
        labels: issue.labels ? JSON.stringify(issue.labels) : null,
      },
    });
  }

  await prisma.integration.update({
    where: { id: integrationId },
    data: { lastSyncAt: new Date() },
  });

  return rawIssues.length;
}
