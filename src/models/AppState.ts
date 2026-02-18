import { User } from './api/User'
import { DetailedTimeEntry, TimeEntry } from './api/TimeEntry'
import { TimeEntryActivity } from './api/TimeEntryActivity'
import { Project } from './api/Project'

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface AppState {
  timeEntries?: {
    value: DetailedTimeEntry[]
    day: Date
  }
  dayForTimeEntries?: Date
  projects?: Project[]
  apiKey?: string
  user?: User
  activities?: TimeEntryActivity[]
  primaryActivityId?: number
  favouriteProjectId?: number
  favouries?: TimeEntry[]
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
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

  static store({ apiKey, primaryActivityId, favouriteProjectId, activities, favouries }: AppState) {
    localStorage.setItem(
      'RedmineLite',
      JSON.stringify({ apiKey, primaryActivityId, favouriteProjectId, activities, favouries })
    )
  }
}
