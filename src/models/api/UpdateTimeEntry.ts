export interface UpdateTimeEntry {
  issue_id: number
  hours: number
  activity_id: number
  spent_on?: string
  comments: string
}

export interface UpdateTimeEntryRequest {
  time_entry: UpdateTimeEntry
}
