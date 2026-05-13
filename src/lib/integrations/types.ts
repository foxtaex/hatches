export interface ExternalIssueData {
  externalId: string;
  title: string;
  description?: string;
  status?: string;
  url?: string;
  assignee?: string;
  labels?: string[];
}

export interface IntegrationConfig {
  id: number;
  type: string;
  name: string;
  baseUrl?: string | null;
  token?: string | null;
  projectKey?: string | null;
  extraConfig?: string | null;
}
