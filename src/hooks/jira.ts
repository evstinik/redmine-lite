import { createContext, useContext, useMemo } from 'react'
import { JiraService } from '../models/JiraService'

export const JiraServiceContext = createContext(new JiraService())

export function useJiraService() {
  return useContext(JiraServiceContext)
}

const JIRA_API_KEY_STORAGE_KEY = 'RedmineLite_JiraApiKey'

export function useJiraApiKey(): [string | null, (key: string) => void] {
  const storedKey = useMemo(() => localStorage.getItem(JIRA_API_KEY_STORAGE_KEY), [])

  function setJiraApiKey(key: string) {
    localStorage.setItem(JIRA_API_KEY_STORAGE_KEY, key)
  }

  return [storedKey, setJiraApiKey]
}
