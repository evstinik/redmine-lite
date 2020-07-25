import React from 'react';
import './App.css';
import { AppState } from './models/AppState';
import { AppStateContext, useAppStateAutosaver } from './hooks/appState';
import { Login } from './Login/Login';
import { TimeEntries } from './TimeEntries/TimeEntries';
import { RedmineServiceContext } from './hooks/redmineService';
import { RedmineService } from './models/RedmineService';
import { useTimeEntryActivitiesFetcher } from './hooks/timeEntries';
import { useLogout } from './hooks/user';
import { useApiKey } from './hooks/apiKey';

function AppWithContexts() {
  const apiKey = useApiKey()

  useAppStateAutosaver()
  useTimeEntryActivitiesFetcher()

  return (
    <>
      {!apiKey && <Login />}
      {apiKey && <TimeEntries />}
    </>
  );
}

function App() {
  const appStateGetSet = React.useState(AppState.load())

  const logout = useLogout(appStateGetSet)

  const redmineService = React.useMemo(() => {
    const service = new RedmineService()
    service.onUnauthorized = logout
    return service
  }, [logout])
  
  return (
    <AppStateContext.Provider value={appStateGetSet}>
      <RedmineServiceContext.Provider value={redmineService}>
        <AppWithContexts />
      </RedmineServiceContext.Provider>
    </AppStateContext.Provider>
  );
}

export default App;
