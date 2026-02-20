import * as React from 'react'
import { Issue } from '../../models/api/Issue'
import { TimeEntries, TimeEntryForm, IssuesSearch, CreateTaskModal } from '@app/components'

export function TimeTracking() {
  const [selectedIssue, setSelectedIssue] = React.useState<Issue | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [createModalSubject, setCreateModalSubject] = React.useState<string | undefined>()
  const [createModalProjectId, setCreateModalProjectId] = React.useState<string | undefined>()
  const [issuesRefreshToken, setIssuesRefreshToken] = React.useState(0)
  const resetSelectedIssues = React.useCallback(() => {
    setSelectedIssue(null)
  }, [])

  const handleOpenCreateModal = React.useCallback(
    (initialSubject?: string, initialProjectId?: string) => {
      setCreateModalSubject(initialSubject)
      setCreateModalProjectId(initialProjectId)
      setIsCreateModalOpen(true)
    },
    []
  )

  const handleCloseCreateModal = React.useCallback(() => {
    setIsCreateModalOpen(false)
    setCreateModalSubject(undefined)
    setCreateModalProjectId(undefined)
  }, [])

  const handleTaskCreated = React.useCallback(() => {
    handleCloseCreateModal()
    setIssuesRefreshToken((t) => t + 1)
  }, [handleCloseCreateModal])

  return (
    <>
      <div className='page__content__panel'>
        <TimeEntries />
        <TimeEntryForm
          preselectedIssueId={selectedIssue?.id}
          onResetSelectedIssue={resetSelectedIssues}
        />
      </div>
      <div className='page__content__panel'>
        <IssuesSearch
          onSelect={setSelectedIssue}
          onCreateTask={handleOpenCreateModal}
          refreshToken={issuesRefreshToken}
        />
      </div>
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreated={handleTaskCreated}
        initialSubject={createModalSubject}
        initialProjectId={createModalProjectId}
      />
    </>
  )
}
