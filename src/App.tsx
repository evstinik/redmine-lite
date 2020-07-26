import React, { SetStateAction } from 'react';
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
  const appStateGetSet = React.useState(AppState.load()) as [
    AppState,
    React.Dispatch<SetStateAction<AppState>>
  ];

  const logout = useLogout(appStateGetSet[1])

  const redmineService = React.useMemo(() => new RedmineService(), [])

  React.useEffect(() => {
    redmineService.onUnauthorized = logout
  }, [logout, redmineService.onUnauthorized])
  
  return (
    <AppStateContext.Provider value={appStateGetSet}>
      <RedmineServiceContext.Provider value={redmineService}>
        <AppWithContexts />
      </RedmineServiceContext.Provider>
    </AppStateContext.Provider>
  );
}

export default App;
