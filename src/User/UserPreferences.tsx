import * as React from 'react'
import { useAppState } from '../hooks/appState'
import { useLogout } from '../hooks/user'
import { useTimeEntryActivities } from '../hooks/timeEntries'
import { useOnChange } from '../hooks/utils'

export function UserPreferences() {
  const [{ primaryActivityId }, setAppState] = useAppState()

  const logout = useLogout(setAppState)
  const activities = useTimeEntryActivities()

  const changePrimaryActivity = React.useCallback((primaryActivityId: number) => {
    setAppState((appState) => ({ ...appState, primaryActivityId }))
  }, [setAppState])

  return (
    <div>
      <h2>User preferences</h2>
      <label>
        Your primary activity
        <select
          value={primaryActivityId}
          onChange={useOnChange(changePrimaryActivity)}
        >
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
      </label>
      <button onClick={logout}>Logout</button>
    </div>
  );
}