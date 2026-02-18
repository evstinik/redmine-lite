export interface JiraIssue {
  key: string
  fields: {
    summary: string
    description?: string
    issuetype?: {
      name: string
    }
    priority?: {
      name: string
    }
    status?: {
      name: string
    }
  }
}

export interface JiraIssueResponse {
  key: string
  fields: any
}

export class JiraService {
  // No constructor parameters needed - authentication is handled by the proxy

  public async getIssue(issueKey: string): Promise<JiraIssue> {
    // Use proxy endpoint to avoid CORS issues
    // The proxy will forward to: {VITE_JIRA_DOMAIN}/jira/rest/api/2/issue/{issueKey}
    const url = `/jira-api/rest/api/2/issue/${issueKey}`

    // Set up headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }

    // Note: Authentication is handled by the proxy server (vite.config.ts)
    // which adds the Authorization header automatically

    console.log('Fetching Jira issue:', issueKey, 'from proxy:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('Jira API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url
      })

      // Provide specific error messages for common issues
      if (response.status === 401) {
        throw new Error(
          `Authentication failed (401): Please check your Jira credentials.\n` +
          `Make sure you have set either:\n` +
          `1. VITE_JIRA_USERNAME and VITE_JIRA_API_TOKEN, or\n` +
          `2. VITE_JIRA_ACCESS_TOKEN (properly Base64 encoded)\n` +
          `in your .env.local file and restart the dev server.`
        )
      } else if (response.status === 404) {
        throw new Error(`Jira issue "${issueKey}" not found (404). Please check the ticket number.`)
      } else if (response.status === 403) {
        throw new Error(`Access forbidden (403): You don't have permission to view this Jira issue.`)
      }

      throw new Error(`Failed to fetch Jira issue (${response.status}): ${response.statusText}. ${errorText || 'Please check your Jira credentials and permissions.'}`)
    }

    const data: JiraIssueResponse = await response.json()
    return {
      key: data.key,
      fields: {
        summary: data.fields.summary,
        description: data.fields.description,
        issuetype: data.fields.issuetype,
        priority: data.fields.priority,
        status: data.fields.status
      }
    }
  }
}
