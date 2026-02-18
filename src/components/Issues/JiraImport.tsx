import * as React from 'react'
import { useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { JiraService } from '@app/models/JiraService'
import { useRedmineService } from '@app/hooks/redmineService'
import { UnprocessableEntityError } from '@app/models/RedmineService'
import { useApiKey } from '@app/hooks/apiKey'
import { useUser } from '@app/hooks/user'
import { useProjects } from '@app/hooks/projects'
import { Issue } from '@app/models/api/Issue'

import './JiraImport.css'

interface JiraImportProps {
  onIssueCreated?: (issue: Issue) => void
  projectId?: number
}

export function JiraImport(props: JiraImportProps) {
  const { onIssueCreated, projectId } = props
  const [jiraTicketNumber, setJiraTicketNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const redmineService = useRedmineService()
  const apiKey = useApiKey()
  const user = useUser()
  const projects = useProjects()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!jiraTicketNumber.trim()) {
      setError('Please enter a Jira ticket number')
      return
    }

    // Debug: Log all available data
    console.log('JiraImport - Debug Info:', {
      projectId,
      'projectId type': typeof projectId,
      projects: projects?.map(p => ({ id: p.id, name: p.name })),
      'projects length': projects?.length,
      apiKey: apiKey ? '***set***' : 'NOT SET',
      user: user ? { id: user.id, name: user.firstname + ' ' + user.lastname } : 'NOT LOADED'
    })

    // Use selected project, or first available project as default
    // Note: projectId can be 0 (meaning "Any project"), so we need to check explicitly
    let targetProjectId: number | undefined

    if (projectId !== undefined && projectId !== 0) {
      // A specific project was selected
      targetProjectId = projectId
      console.log('✓ Using selected project:', targetProjectId)
    } else if (projects && projects.length > 0) {
      // Fall back to first available project
      targetProjectId = projects[0].id
      console.log('✓ Using first available project:', targetProjectId, projects[0].name)
    }

    if (!targetProjectId) {
      const errorMsg = `No project selected. ${
        !projects || projects.length === 0 
          ? 'No projects available - please create a project in Redmine first.' 
          : 'Please select a specific project from the dropdown above (not "Any project").'
      }`
      console.error('✗ Project selection failed:', errorMsg)
      setError(errorMsg)
      return
    }

    console.log('➜ Creating Redmine issue in project:', targetProjectId)
    setIsLoading(true)

    try {
      console.log('Jira Configuration: Using proxy endpoint with server-side authentication')

      const jiraService = new JiraService()
      const jiraIssue = await jiraService.getIssue(jiraTicketNumber.trim())
      console.log('✓ Successfully fetched Jira issue:', jiraIssue.key)

      // Create Redmine issue with format: JIRA-KEY Summary
      const subject = `${jiraIssue.key} ${jiraIssue.fields.summary}`
      const description = jiraIssue.fields.description || ''

      const issueData = {
        project_id: targetProjectId,
        subject,
        description,
        tracker_id: 1, // Default tracker, can be made configurable
        assigned_to_id: user?.id // Assign to current user
      }

      console.log('➜ Creating Redmine issue with data:', {
        project_id: issueData.project_id,
        subject: issueData.subject.substring(0, 50) + '...',
        description: issueData.description ? `${issueData.description.substring(0, 50)}...` : '(empty)',
        tracker_id: issueData.tracker_id,
        assigned_to_id: issueData.assigned_to_id
      })

      const redmineIssue = await redmineService.createIssue(issueData, apiKey!)

      setSuccess(`Successfully created Redmine issue #${redmineIssue.id}`)
      setJiraTicketNumber('')

      if (onIssueCreated) {
        onIssueCreated(redmineIssue)
      }
    } catch (err) {
      console.error('Error importing from Jira:', err)

      // Handle different types of errors
      let errorMessage = 'Failed to import Jira ticket'

      if (err instanceof UnprocessableEntityError) {
        // Redmine validation error (422)
        errorMessage = `Redmine validation error:\n${err.errors.join('\n')}`

        // Add helpful hint for project-related errors
        if (err.errors.some(e => e.toLowerCase().includes('project'))) {
          errorMessage += `\n\n💡 Please select a specific project from the dropdown above (not "Any project").\nSee TROUBLESHOOTING.md for detailed debugging steps.`
        }
      } else if (err instanceof Error) {
        errorMessage = err.message

        // Add helpful setup instructions for 401 errors
        if (errorMessage.includes('401') || errorMessage.includes('Authentication failed')) {
          errorMessage += `\n\n💡 Quick Fix: Make sure VITE_JIRA_USERNAME is set in your .env.local file.\nSee JIRA_SETUP.md for detailed instructions.`
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='jira-import'>
      <h3>Import from Jira</h3>
      <p className='jira-import__description'>
        No results found? Create a Redmine ticket from a Jira issue
      </p>
      
      {projectId === 0 && (
        <Alert severity='info' sx={{ mb: 2 }}>
          💡 Please select a specific project from the dropdown above to import Jira tickets.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className='jira-import__form'>
        <TextField
          label='Jira Ticket Number'
          placeholder='e.g., AP-41414 or LAUT-2'
          value={jiraTicketNumber}
          onChange={(e) => setJiraTicketNumber(e.target.value)}
          disabled={isLoading}
          variant='outlined'
          size='small'
          fullWidth
        />

        <Button
          type='submit'
          variant='contained'
          disabled={isLoading}
          className='jira-import__submit'
        >
          {isLoading ? <CircularProgress size={24} /> : 'Import from Jira'}
        </Button>
      </form>

      {error && (
        <Alert severity='error' onClose={() => setError(null)} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity='success' onClose={() => setSuccess(null)} sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </div>
  )
}
