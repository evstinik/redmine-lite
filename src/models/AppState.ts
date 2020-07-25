import { User } from "./UsersResponse"
import { TimeEntry } from "./TimeEntriesResponse"
import { TimeEntryActivity } from "./TimeEntryActivity"

export interface AppState {
  timeEntries?: TimeEntry[]
  apiKey?: string
  user?: User
  activities?: TimeEntryActivity[]
  primaryActivityId?: number
}

export abstract class AppState {
  static empty(): AppState {
    return {}
  }

  static load(): AppState {
    const stateAsStr = localStorage.getItem('RedmineLite')
    const loadedState = stateAsStr ? JSON.parse(stateAsStr) : {}
    return {
      ...AppState.empty(),
      ...loadedState
    }
  }

  static store({ apiKey, primaryActivityId, activities }: AppState) {
    localStorage.setItem(
      "RedmineLite",
      JSON.stringify({ apiKey, primaryActivityId, activities })
    );
  }
}