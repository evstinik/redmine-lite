import * as React from 'react'
import { useAppState } from '@app/hooks/appState'
import { useLogout } from '@app/hooks/user'
import { useTimeEntryActivities } from '@app/hooks/timeEntries'
import { useOnChange } from '@app/hooks/utils'
import './UserPreferences.css'

export function UserPreferences(props: React.HTMLAttributes<HTMLDivElement>) {
  const [{ primaryActivityId }, setAppState] = useAppState()

  const logout = useLogout(setAppState)
  const activities = useTimeEntryActivities()

  const changePrimaryActivity = React.useCallback(
    (primaryActivityId: number) => {
      setAppState((appState) => ({ ...appState, primaryActivityId }))
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
      <button className='contained logout' onClick={logout}>
        Logout
      </button>
    </div>
  )
}
