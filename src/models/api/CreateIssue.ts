export interface CreateIssue {
  project_id: number
  subject: string
  description?: string
  tracker_id?: number
}

export interface CreateIssueResponse {
  issue: {
    id: number
    project: { id: number; name: string }
    tracker: { id: number; name: string }
    status: { id: number; name: string }
    subject: string
    description: string
  }
}
