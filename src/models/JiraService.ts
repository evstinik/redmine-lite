const JIRA_API_URL = '/jira-api'

interface JiraIssueFields {
  summary: string
  description: string | null
  issuetype: {
    name: string
  }
}

export interface JiraIssue {
  key: string
  fields: JiraIssueFields
}

interface JiraIssueResponse {
  key: string
  fields: JiraIssueFields
}

export class JiraUnauthorizedError extends Error {
  constructor() {
    super('Jira authentication failed. Please check your API key.')
  }
}

export class JiraService {
  public async getIssue(issueKey: string, jiraApiKey: string): Promise<JiraIssue> {
    const url = `${JIRA_API_URL}/rest/api/2/issue/${encodeURIComponent(issueKey)}?fields=summary,description,issuetype`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jiraApiKey}`,
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new JiraUnauthorizedError()
      }
      if (response.status === 404) {
        throw new Error(`Jira issue "${issueKey}" not found.`)
      }
      throw new Error(`Failed to fetch Jira issue: ${response.status} ${response.statusText}`)
    }

    const data: JiraIssueResponse = await response.json()
    return data
  }
}
