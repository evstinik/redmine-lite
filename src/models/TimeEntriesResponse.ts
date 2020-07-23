export interface Project {
  id: number;
  name: string;
}

export interface Issue {
  id: number;
}

export interface User {
  id: number;
  name: string;
}

export interface Activity {
  id: number;
  name: string;
}

export interface TimeEntry {
  id: number;
  project: Project;
  issue: Issue;
  user: User;
  activity: Activity;
  hours: number;
  comments: string;
  spent_on: string;
  created_on: Date;
  updated_on: Date;
}

export interface TimeEntriesResponse {
  time_entries: TimeEntry[];
  total_count: number;
  offset: number;
  limit: number;
}
