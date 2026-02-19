import { useState, useCallback } from 'react'
import { useRedmineService } from './redmineService'
import { useApiKey } from './apiKey'

interface CreateIssueFormState {
  subject: string
  description: string
  trackerId: number
  error: string | null
  isSubmitting: boolean
}

const initialState: CreateIssueFormState = {
  subject: '',
  description: '',
  trackerId: 0,
  error: null,
  isSubmitting: false
}

export function useCreateIssueForm(projectId: number) {
  const [form, setForm] = useState<CreateIssueFormState>(initialState)
  const redmineService = useRedmineService()
  const apiKey = useApiKey()

  const setField = useCallback(
    <K extends keyof CreateIssueFormState>(field: K, value: CreateIssueFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value, error: null }))
    },
    []
  )

  const reset = useCallback(() => setForm(initialState), [])

  const submit = useCallback(async (): Promise<boolean> => {
    if (!form.subject.trim()) {
      setForm((prev) => ({ ...prev, error: 'Subject is required' }))
      return false
    }
    if (!form.trackerId) {
      setForm((prev) => ({ ...prev, error: 'Please select a type' }))
      return false
    }
    if (!apiKey) {
      setForm((prev) => ({ ...prev, error: 'Not authenticated' }))
      return false
    }

    setForm((prev) => ({ ...prev, isSubmitting: true, error: null }))

    try {
      await redmineService.createIssue(
        projectId,
        form.subject.trim(),
        form.trackerId,
        form.description,
        apiKey
      )
      setForm(initialState)
      return true
    } catch (e) {
      const err = e as { errors?: string[]; message?: string }
      setForm((prev) => ({
        ...prev,
        isSubmitting: false,
        error: err?.errors?.join(', ') ?? err?.message ?? 'Failed to create issue'
      }))
      return false
    }
  }, [form.subject, form.trackerId, form.description, apiKey, projectId, redmineService])

  return { form, setField, reset, submit }
}