import React, { SetStateAction } from 'react'
import { AppState } from './models/AppState'
import { AppStateContext, useAppStateAutosaver } from './hooks/appState'
import { Login } from 'components'
import { RedmineServiceContext } from './hooks/redmineService'
import { RedmineService } from './models/RedmineService'
import { useTimeEntryActivitiesFetcher } from './hooks/timeEntries'
import { useLogout } from './hooks/user'
import { useApiKey } from './hooks/apiKey'
import { MainPage } from './pages/MainPage'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from 'theme'

function AppWithContexts() {
  const apiKey = useApiKey()

  useAppStateAutosaver()
  useTimeEntryActivitiesFetcher()

  return (
    <>
      {!apiKey && <Login />}
      {apiKey && <MainPage />}
    </>
  )
}

function App() {
  const appStateGetSet = React.useState(AppState.load()) as [
    AppState,
    React.Dispatch<SetStateAction<AppState>>
  ]

  const logout = useLogout(appStateGetSet[1])

  const redmineService = React.useMemo(() => new RedmineService(), [])

  React.useEffect(() => {
    redmineService.onUnauthorized = logout
  }, [logout, redmineService.onUnauthorized])

  return (
    <AppStateContext.Provider value={appStateGetSet}>
      <RedmineServiceContext.Provider value={redmineService}>
        <ThemeProvider theme={theme}>
          <AppWithContexts />
        </ThemeProvider>
      </RedmineServiceContext.Provider>
    </AppStateContext.Provider>
  )
}

export default App
