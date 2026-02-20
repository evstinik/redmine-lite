import React, { SetStateAction } from 'react'
import { AppState } from './models/AppState'
import { AppStateContext, useAppStateAutosaver } from './hooks/appState'
import { Login } from './components'
import { RedmineServiceContext } from './hooks/redmineService'
import { RedmineService } from './models/RedmineService'
import { JiraServiceContext } from './hooks/jira'
import { JiraService } from './models/JiraService'
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
  const jiraService = React.useMemo(() => new JiraService(), [])

  React.useEffect(() => {
    redmineService.onUnauthorized = logout
  }, [logout, redmineService.onUnauthorized])

  return (
    <AppStateContext.Provider value={appStateGetSet}>
      <RedmineServiceContext.Provider value={redmineService}>
        <JiraServiceContext.Provider value={jiraService}>
          <ThemeProvider theme={theme}>
            <Router>
              <QueryClientProvider client={queryClient}>
                <AppWithContexts />
              </QueryClientProvider>
            </Router>
          </ThemeProvider>
        </JiraServiceContext.Provider>
      </RedmineServiceContext.Provider>
    </AppStateContext.Provider>
  )
}

export default App
