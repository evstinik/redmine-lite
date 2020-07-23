import React from 'react';
import './App.css';
import { AppState } from './models/AppState';
import { AppStateContext, useAppStateAutosaver } from './hooks/appState';
import { Login } from './Login/Login';
import { TimeEntries } from './TimeEntries/TimeEntries';
import { RedmineServiceContext } from './hooks/redmineService';
import { RedmineService } from './models/RedmineService';

function App() {
  const appStateGetSet = React.useState(AppState.load())
  const redmineService = React.useMemo(() => new RedmineService(), [])
  
  const [appState] = appStateGetSet
  const apiKey = appState.apiKey

  useAppStateAutosaver(appState)
  
  return (
    <AppStateContext.Provider value={appStateGetSet}>
      <RedmineServiceContext.Provider value={redmineService}>
        {!apiKey && <Login />}
        {apiKey && <TimeEntries />}
      </RedmineServiceContext.Provider>
    </AppStateContext.Provider>
  );
}

export default App;
