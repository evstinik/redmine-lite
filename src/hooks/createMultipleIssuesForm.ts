import { useState, useCallback } from 'react'
import { useRedmineService } from './redmineService'
import { useApiKey } from './apiKey'

export interface IssueRow {
  id: string
  projectId: number
  trackerId: number
  subject: string
  description: string
}

export interface IssueRowResult {
  rowId: string
  status: 'success' | 'error'
  error?: string
}

interface CreateMultipleIssuesFormState {
  rows: IssueRow[]
  results: IssueRowResult[]
  isSubmitting: boolean
  error: string | null
}

let nextRowId = 1

function createEmptyRow(defaultProjectId: number, defaultTrackerId: number): IssueRow {
  return {
    id: `row-${nextRowId++}`,
    projectId: defaultProjectId,
    trackerId: defaultTrackerId,
    subject: '',
    description: ''
  }
}

const initialState: CreateMultipleIssuesFormState = {
  rows: [],
  results: [],
  isSubmitting: false,
  error: null
}

export function useCreateMultipleIssuesForm() {
  const [form, setForm] = useState<CreateMultipleIssuesFormState>(initialState)
  const redmineService = useRedmineService()
  const apiKey = useApiKey()

  const initialize = useCallback((defaultProjectId: number, defaultTrackerId: number) => {
    setForm({
      ...initialState,
      rows: [createEmptyRow(defaultProjectId, defaultTrackerId)]
    })
  }, [])

  const addRow = useCallback((defaultProjectId: number, defaultTrackerId: number) => {
    setForm((prev) => ({
      ...prev,
      rows: [...prev.rows, createEmptyRow(defaultProjectId, defaultTrackerId)],
      error: null
    }))
  }, [])

  const removeRow = useCallback((rowId: string) => {
    setForm((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== rowId),
      results: prev.results.filter((r) => r.rowId !== rowId),
      error: null
    }))
  }, [])

  const updateRow = useCallback(
    <K extends keyof IssueRow>(rowId: string, field: K, value: IssueRow[K]) => {
      setForm((prev) => ({
        ...prev,
        rows: prev.rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
        results: prev.results.filter((r) => r.rowId !== rowId),
        error: null
      }))
    },
    []
  )

  const reset = useCallback(() => {
    setForm(initialState)
  }, [])

  const submit = useCallback(async (): Promise<boolean> => {
    const validRows = form.rows.filter((r) => r.subject.trim())

    if (validRows.length === 0) {
      setForm((prev) => ({ ...prev, error: 'Add at least one issue with a subject' }))
      return false
    }

    const invalidRows = validRows.filter((r) => !r.projectId || !r.trackerId)
    if (invalidRows.length > 0) {
      setForm((prev) => ({
        ...prev,
        error: 'All issues must have a project and type selected'
      }))
      return false
    }

    if (!apiKey) {
      setForm((prev) => ({ ...prev, error: 'Not authenticated' }))
      return false
    }

    setForm((prev) => ({ ...prev, isSubmitting: true, error: null, results: [] }))

    const results: IssueRowResult[] = await Promise.all(
      validRows.map(async (row) => {
        try {
          await redmineService.createIssue(
            row.projectId,
            row.subject.trim(),
            row.trackerId,
            row.description,
            apiKey
          )
          return { rowId: row.id, status: 'success' as const }
        } catch (e) {
          const err = e as { errors?: string[]; message?: string }
          return {
            rowId: row.id,
            status: 'error' as const,
            error: err?.errors?.join(', ') ?? err?.message ?? 'Failed to create issue'
          }
        }
      })
    )

    const hasErrors = results.some((r) => r.status === 'error')

    setForm((prev) => {
      const successRowIds = new Set(results.filter((r) => r.status === 'success').map((r) => r.rowId))
      return {
        ...prev,
        isSubmitting: false,
        results,
        rows: hasErrors ? prev.rows.filter((r) => !successRowIds.has(r.id)) : prev.rows,
        error: hasErrors ? 'Some issues failed to create. Failed rows remain below.' : null
      }
    })

    return !hasErrors
  }, [form.rows, apiKey, redmineService])

  const getRowResult = useCallback(
    (rowId: string): IssueRowResult | undefined => {
      return form.results.find((r) => r.rowId === rowId)
    },
    [form.results]
  )

  const successCount = form.results.filter((r) => r.status === 'success').length

  return { form, initialize, addRow, removeRow, updateRow, reset, submit, getRowResult, successCount }
}