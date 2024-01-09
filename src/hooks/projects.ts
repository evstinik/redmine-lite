import { useAppState } from './appState'
import { useEffect, useState } from 'react'
import { useRedmineService } from './redmineService'

export function useProjects() {
  const [{ apiKey, projects }, setAppState] = useAppState()
  const [isLoading, setIsLoading] = useState(false)
  const redmineService = useRedmineService()
  useEffect(() => {
    if (!projects && !isLoading) {
      setIsLoading(true)
      redmineService
        .getProjects(apiKey!)
        .then(({ projects }) => {
          setAppState((appState) => ({
            ...appState,
            projects
          }))
        })
        .catch()
        .then(() => setIsLoading(false))
    }
  }, [setAppState, redmineService, isLoading, projects, apiKey])
  return projects
}
