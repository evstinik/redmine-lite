import { User } from "./UsersResponse"
import { TimeEntry } from "./TimeEntriesResponse"

export interface AppState {
  timeEntries?: TimeEntry[]
  apiKey?: string
  user?: User
}

export abstract class AppState {
  static empty(): AppState {
    return {}
  }

  static load(): AppState {
    const stateAsStr = localStorage.getItem('RedmineLite')
    return stateAsStr ? JSON.parse(stateAsStr) : {}
  }

  static store({ apiKey }: AppState) {
    localStorage.setItem('RedmineLite', JSON.stringify({ apiKey }))
  }
}