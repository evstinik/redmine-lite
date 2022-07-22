import { PaginatedList } from './PaginatedList'
import { CustomField } from './CustomField'

export interface Project {
  id: number
  name: string
}

export interface Tracker {
  id: number
  name: string
}

export interface Status {
  id: number
  name: string
}

export interface Priority {
  id: number
  name: string
}

export interface Author {
  id: number
  name: string
}

export interface Issue {
  id: number
  project: Project
  tracker: Tracker
  status: Status
  priority: Priority
  author: Author
  subject: string
  description: string
  start_date: string
  done_ratio: number
  custom_fields: CustomField[]
  created_on: string
  updated_on: string
}

export interface IssuesPaginatedList extends PaginatedList {
  issues: Issue[]
}

export interface IssueDetailResponse {
  issue: Issue
}
