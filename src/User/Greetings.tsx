import * as React from 'react'
import { useUser } from '../hooks/user';
import { UserPreferences } from './UserPreferences';

export function Greetings() {
  const user = useUser()
  
  const [isPreferencesVisible, setIsPreferencesVisible] = React.useState(false)
  const toggleUserPreferences = React.useCallback(() => {
    setIsPreferencesVisible((isVisible) => !isVisible)
  }, [setIsPreferencesVisible])

  return (
    <div>
      <h1 onClick={toggleUserPreferences}>Hi, {user?.firstname ?? "..."}!</h1>
      {isPreferencesVisible && <UserPreferences />}
    </div>
  )
}