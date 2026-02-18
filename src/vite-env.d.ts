/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_REDMINE_URL?: string
  readonly VITE_JIRA_API_TOKEN?: string
  readonly VITE_JIRA_DOMAIN?: string
  readonly VITE_JIRA_USERNAME?: string
  readonly VITE_JIRA_ACCESS_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
