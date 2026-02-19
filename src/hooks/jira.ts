import { createContext, useContext, useState } from 'react'
import { JiraService } from '../models/JiraService'

export const JiraServiceContext = createContext(new JiraService())

export function useJiraService() {
  return useContext(JiraServiceContext)
}

const JIRA_API_KEY_STORAGE_KEY = 'RedmineLite_JiraApiKey'

export function useJiraApiKey(): [string | null, (key: string) => void, () => void] {
  const [jiraApiKey, setJiraApiKeyState] = useState<string | null>(
    () => localStorage.getItem(JIRA_API_KEY_STORAGE_KEY)
  )

  function setJiraApiKey(key: string) {
    localStorage.setItem(JIRA_API_KEY_STORAGE_KEY, key)
    setJiraApiKeyState(key)
  }

  function clearJiraApiKey() {
    localStorage.removeItem(JIRA_API_KEY_STORAGE_KEY)
    setJiraApiKeyState(null)
  }

  return [jiraApiKey, setJiraApiKey, clearJiraApiKey]
}
