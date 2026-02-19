import * as React from 'react'
import { useProjects } from '@app/hooks/projects'
import { useRedmineService } from '@app/hooks/redmineService'
import { useApiKey } from '@app/hooks/apiKey'
import { useAppState } from '@app/hooks/appState'
import { useJiraService, useJiraApiKey } from '@app/hooks/jira'
import { AutocompleteSelect } from '@app/components/AutocompleteSelect'
import { UnprocessableEntityError } from '@app/models/RedmineService'
import { ProjectTracker } from '@app/models/api/Project'
import './CreateTaskModal.css'

const JIRA_URL = import.meta.env.VITE_JIRA_URL || 'https://devstack.vwgroup.com/jira'

const ENV_TRACKER_USER_STORY_ID = parseInt(import.meta.env.VITE_TRACKER_USER_STORY_ID || '', 10)
const ENV_TRACKER_BUG_ID = parseInt(import.meta.env.VITE_TRACKER_BUG_ID || '', 10)
const TRACKER_USER_STORY_ID = isNaN(ENV_TRACKER_USER_STORY_ID) ? 14 : ENV_TRACKER_USER_STORY_ID
const TRACKER_BUG_ID = isNaN(ENV_TRACKER_BUG_ID) ? 1 : ENV_TRACKER_BUG_ID

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
  initialSubject?: string
  initialProjectId?: string
}

function pickTrackerId(trackers: ProjectTracker[], preferred: number): number {
  if (trackers.find((t) => t.id === preferred)) return preferred
  return trackers[0]?.id ?? preferred
}

export function CreateTaskModal(props: CreateTaskModalProps) {
  const { isOpen, onClose, onCreated, initialSubject, initialProjectId } = props

  const [projectId, setProjectId] = React.useState<string>('')
  const [subject, setSubject] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [trackerId, setTrackerId] = React.useState<number>(TRACKER_USER_STORY_ID)
  const [trackers, setTrackers] = React.useState<ProjectTracker[]>([])
  const [isLoadingTrackers, setIsLoadingTrackers] = React.useState(false)
  const [errors, setErrors] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const [showJiraKeyPrompt, setShowJiraKeyPrompt] = React.useState(false)
  const [jiraKeyInput, setJiraKeyInput] = React.useState('')

  const modalRef = React.useRef<HTMLDivElement | null>(null)
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null)

  const projects = useProjects() ?? []
  const redmineService = useRedmineService()
  const jiraService = useJiraService()
  const apiKey = useApiKey()
  const [{ favouriteProjectId }] = useAppState()
  const [jiraApiKey, setJiraApiKey] = useJiraApiKey()

  React.useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null
      const modalNode = modalRef.current
      if (modalNode) {
        const focusableSelectors =
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        const focusableElements = Array.from(
          modalNode.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'))
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        } else {
          modalNode.focus()
        }
      }
    } else if (!isOpen && previouslyFocusedElementRef.current) {
      previouslyFocusedElementRef.current.focus()
      previouslyFocusedElementRef.current = null
    }
  }, [isOpen])

  React.useEffect(() => {
    if (isOpen) {
      setSubject(initialSubject ?? '')
      setDescription('')
      setProjectId(initialProjectId ?? (favouriteProjectId ? String(favouriteProjectId) : ''))
      setTrackerId(TRACKER_USER_STORY_ID)
      setErrors([])
      setShowJiraKeyPrompt(false)
      setJiraKeyInput('')
    }
  }, [isOpen, initialSubject, initialProjectId, favouriteProjectId])

  React.useEffect(() => {
    let isCancelled = false

    if (!isOpen || !projectId || !apiKey) {
      if (!projectId) setTrackers([])
      return () => {
        isCancelled = true
      }
    }

    setIsLoadingTrackers(true)
    redmineService
      .getProjectTrackers(Number(projectId), apiKey)
      .then((fetchedTrackers) => {
        if (isCancelled) return
        setTrackers(fetchedTrackers)
        setTrackerId((prev) => pickTrackerId(fetchedTrackers, prev))
      })
      .catch(() => {
        if (isCancelled) return
        setTrackers([])
      })
      .then(() => {
        if (isCancelled) return
        setIsLoadingTrackers(false)
      })

    return () => {
      isCancelled = true
    }
  }, [isOpen, projectId, apiKey, redmineService])

  const handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()

      if (!projectId || !subject.trim()) {
        setErrors(['Project and subject are required.'])
        return
      }

      setIsSubmitting(true)
      setErrors([])

      redmineService
        .createIssue(
          {
            project_id: Number(projectId),
            subject: subject.trim(),
            description: description.trim() || undefined,
            tracker_id: trackerId
          },
          apiKey!
        )
        .then(() => {
          onCreated ? onCreated() : onClose()
        })
        .catch((err) => {
          if (err instanceof UnprocessableEntityError) {
            setErrors(err.errors)
          } else {
            setErrors([err.message ?? 'Failed to create issue'])
          }
        })
        .then(() => setIsSubmitting(false))
    },
    [projectId, subject, description, trackerId, redmineService, apiKey, onClose, onCreated]
  )

  const performJiraImport = React.useCallback(
    (apiKeyToUse: string, issueKey: string) => {
      setIsImporting(true)
      setErrors([])

      jiraService
        .getIssue(issueKey, apiKeyToUse)
        .then((jiraIssue) => {
          setSubject(`${jiraIssue.key}: ${jiraIssue.fields.summary}`)
          const jiraLink = `${JIRA_URL}/browse/${jiraIssue.key}`
          const desc = jiraIssue.fields.description ?? ''
          setDescription(desc + (desc ? '\n\n' : '') + jiraLink + '\n')

          const issueTypeName = jiraIssue.fields.issuetype.name.toLowerCase()
          const preferredId = issueTypeName === 'bug' ? TRACKER_BUG_ID : TRACKER_USER_STORY_ID
          setTrackerId((prev) => {
            return pickTrackerId(
              trackers.length > 0 ? trackers : [{ id: prev, name: '' }],
              preferredId
            )
          })
        })
        .catch((err) => {
          setErrors([err.message ?? 'Failed to import from Jira'])
        })
        .then(() => setIsImporting(false))
    },
    [jiraService, trackers]
  )

  const handleImportFromJira = React.useCallback(() => {
    const currentKey = jiraApiKey ?? localStorage.getItem('RedmineLite_JiraApiKey')
    if (!currentKey) {
      setShowJiraKeyPrompt(true)
      return
    }

    const issueKey = subject.trim()
    if (!issueKey) {
      setErrors(['Enter a Jira issue key (e.g., AP-12345) in the subject field first.'])
      return
    }

    performJiraImport(currentKey, issueKey)
  }, [jiraApiKey, subject, performJiraImport])

  const handleSaveJiraKey = React.useCallback(() => {
    if (jiraKeyInput.trim()) {
      setJiraApiKey(jiraKeyInput.trim())
      setShowJiraKeyPrompt(false)
      // Re-trigger import after saving key
      const issueKey = subject.trim()
      if (!issueKey) {
        setErrors(['Enter a Jira issue key (e.g., AP-12345) in the subject field first.'])
        return
      }

      performJiraImport(jiraKeyInput.trim(), issueKey)
    }
  }, [jiraKeyInput, setJiraApiKey, subject, performJiraImport])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key === 'Tab') {
        const modalNode = modalRef.current
        if (!modalNode) return

        const focusableSelectors =
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        const focusableElements = Array.from(
          modalNode.querySelectorAll<HTMLElement>(focusableSelectors)
        ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'))

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        const currentElement = document.activeElement as HTMLElement | null

        if (event.shiftKey) {
          if (currentElement === firstElement || !modalNode.contains(currentElement)) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (currentElement === lastElement || !modalNode.contains(currentElement)) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    },
    [onClose]
  )

  if (!isOpen) {
    return null
  }

  return (
    <div className='create-task-overlay' onClick={onClose}>
      <div
        className='create-task-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='create-task-modal-title'
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <h2 id='create-task-modal-title'>Create Task</h2>
        <form onSubmit={handleSubmit}>
          <div className='create-task-modal__field'>
            <AutocompleteSelect<{ id: number; name: string }>
              label={'Project'}
              required
              options={projects}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => String(option.id)}
              value={projectId}
              onValueChanged={(pid) => setProjectId(pid ?? '')}
              fullWidth
            />
          </div>

          <div className='create-task-modal__field'>
            <label>Subject</label>
            <div className='create-task-modal__subject-row'>
              <input
                type='text'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder='Issue subject...'
                required
              />
              <button
                type='button'
                className='create-task-modal__jira-btn'
                onClick={handleImportFromJira}
                disabled={isImporting}
                title='Import issue details from Jira using the subject as issue key'
              >
                {isImporting ? 'Importing...' : 'Import from Jira'}
              </button>
            </div>
            {showJiraKeyPrompt && (
              <div className='create-task-modal__jira-key-prompt'>
                <label>Jira API Token</label>
                <input
                  type='password'
                  value={jiraKeyInput}
                  onChange={(e) => setJiraKeyInput(e.target.value)}
                  placeholder='Enter your Jira personal access token...'
                />
                <div className='tip'>
                  You can generate a token at{' '}
                  <a
                    href={`${JIRA_URL}/plugins/servlet/de.resolution.apitokenauth/admin`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Jira API Token Admin
                  </a>
                </div>
                <div className='create-task-modal__jira-key-actions'>
                  <button
                    type='button'
                    className='bordered'
                    onClick={() => setShowJiraKeyPrompt(false)}
                  >
                    Cancel
                  </button>
                  <button type='button' className='contained' onClick={handleSaveJiraKey}>
                    Save & Import
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className='create-task-modal__field'>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Description (optional)...'
            />
          </div>

          <div className='create-task-modal__field'>
            <label>Tracker</label>
            <select
              value={trackerId}
              onChange={(e) => setTrackerId(Number(e.target.value))}
              disabled={isLoadingTrackers || trackers.length === 0}
            >
              {trackers.length > 0 ? (
                trackers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              ) : (
                <option value={trackerId}>
                  {isLoadingTrackers ? 'Loading...' : 'Select a project first'}
                </option>
              )}
            </select>
          </div>

          {errors.length > 0 && (
            <ul className='errors'>
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          )}

          <div className='create-task-modal__actions'>
            <button type='button' className='bordered' onClick={onClose}>
              Cancel
            </button>
            <button type='submit' className='contained' disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
