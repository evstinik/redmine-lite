import * as React from 'react'
import { useAppState } from '@app/hooks/appState'
import { useLogout } from '@app/hooks/user'
import { useTimeEntryActivities } from '@app/hooks/timeEntries'
import { useProjects } from '@app/hooks/projects'
import { useOnChange } from '@app/hooks/utils'
import './UserPreferences.css'

export function UserPreferences(props: React.HTMLAttributes<HTMLDivElement>) {
  const [{ primaryActivityId, favouriteProjectId }, setAppState] = useAppState()

  const logout = useLogout(setAppState)
  const activities = useTimeEntryActivities()
  const projects = useProjects() ?? []

  const changePrimaryActivity = React.useCallback(
    (primaryActivityId: number) => {
      setAppState((appState) => ({ ...appState, primaryActivityId }))
    },
    [setAppState]
  )

  const changeFavouriteProject = React.useCallback(
    (favouriteProjectId: number) => {
      setAppState((appState) => ({
        ...appState,
        favouriteProjectId: favouriteProjectId || undefined
      }))
    },
    [setAppState]
  )

  return (
    <div {...props}>
      <h2>User preferences</h2>
      <label>
        Your primary activity
        <select value={primaryActivityId} onChange={useOnChange(changePrimaryActivity)}>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Favourite project
        <select value={favouriteProjectId ?? 0} onChange={useOnChange(changeFavouriteProject)}>
          <option value={0}>None</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>
      <button className='contained logout' onClick={logout}>
        Logout
      </button>
    </div>
  )
}
