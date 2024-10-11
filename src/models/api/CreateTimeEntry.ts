export interface CreateTimeEntry {
  issue_id: number
  hours: number | string // format can be in 1h20m for example https://www.redmine.org/projects/redmine/wiki/RedmineTimeTracking
  activity_id: number
  spent_on?: string
  comments: string
}

export interface CreateTimeEntryRequest {
  time_entry: CreateTimeEntry
}
