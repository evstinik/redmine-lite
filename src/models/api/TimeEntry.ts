import { Issue as DetailedIssue } from './Issue'

export interface Project {
  id: number
  name: string
}

export interface Issue {
  id: number
}

export interface User {
  id: number
  name: string
}

export interface Activity {
  id: number
  name: string
}

export interface TimeEntry {
  id: number
  project: Project
  issue: Issue
  user: User
  activity: Activity
  hours: number
  comments: string
  spent_on: string
  created_on: string
  updated_on: string
}

export interface DetailedTimeEntry extends TimeEntry {
  issue: Issue & Partial<DetailedIssue>
}

export interface TimeEntriesResponse {
  time_entries: TimeEntry[]
  total_count: number
  offset: number
  limit: number
}

export interface CreateTimeEntryResponse {
  time_entry: TimeEntry
}

export interface UpdateTimeEntryResponse {
  time_entry: TimeEntry
}
