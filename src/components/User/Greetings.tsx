import * as React from 'react'
import { useUser } from 'hooks/user';
import { UserPreferences } from './UserPreferences';
import './Greetings.css'

export function Greetings() {
  const user = useUser()
  
  const [isPreferencesVisible, setIsPreferencesVisible] = React.useState(false)
  const toggleUserPreferences = React.useCallback(() => {
    setIsPreferencesVisible((isVisible) => !isVisible)
  }, [setIsPreferencesVisible])

  return (
    <header className="header">
      <h1 className="greetings">
        Hi,{" "}
        <span className="action" onClick={toggleUserPreferences}>
          {user?.firstname ?? "..."}
        </span>
        !
      </h1>
      {isPreferencesVisible && <UserPreferences className="preferences" />}
    </header>
  );
}