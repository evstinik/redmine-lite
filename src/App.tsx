import React, { SetStateAction } from 'react'
import { AppState } from './models/AppState'
import { AppStateContext, useAppStateAutosaver } from './hooks/appState'
import { Login } from './components'
import { RedmineServiceContext } from './hooks/redmineService'
import { RedmineService } from './models/RedmineService'
import { useTimeEntryActivitiesFetcher } from './hooks/timeEntries'
import { useLogout } from './hooks/user'
import { useApiKey } from './hooks/apiKey'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './theme'
import { Router } from './Router'
import { AppRoutes } from './AppRoutes'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'

function AppWithContexts() {
  const apiKey = useApiKey()

  useAppStateAutosaver()
  useTimeEntryActivitiesFetcher()

  if (!apiKey) {
    return <Login />
  }

  return <AppRoutes />
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
          <Router>
            <QueryClientProvider client={queryClient}>
              <AppWithContexts />
            </QueryClientProvider>
          </Router>
        </ThemeProvider>
      </RedmineServiceContext.Provider>
    </AppStateContext.Provider>
  )
}

export default App
