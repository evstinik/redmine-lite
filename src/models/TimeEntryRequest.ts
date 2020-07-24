export interface CreateTimeEntry {
  issue_id: number;
  hours: number;
  activity_id: number;
  comments: string;
}

export interface CreateTimeEntryRequest {
  time_entry: CreateTimeEntry;
}
