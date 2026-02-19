import * as React from 'react'
import { useIssuesSearch } from '@app/hooks/issues'
import { IssueRow } from './IssueRow'
import { useOnChange } from '@app/hooks/utils'
import { Issue } from '@app/models/api/Issue'
import { useProjects } from '@app/hooks/projects'
import { AutocompleteSelect } from '@app/components/AutocompleteSelect'
import TextField from '@mui/material/TextField'
import MuiIconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { CreateIssueModal } from './CreateIssueModal'
import { CreateMultipleIssuesModal } from './CreateMultipleIssuesModal'

import './IssuesSearch.css'

interface IssuesProps {
  onSelect?: (issue: Issue) => void
}

export function IssuesSearch(props: IssuesProps) {
  const { onSelect } = props

  const [query, setQuery] = React.useState('')
  const [projectId, setProjectId] = React.useState<string>('0')

  const [latestQuery, setLatestQuery] = React.useState(query)
  const [latestProjectId, setLatestProjectId] = React.useState<string>(projectId)

  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [createMultipleModalOpen, setCreateMultipleModalOpen] = React.useState(false)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const projects = useProjects() ?? []
  const [issues, isLoading] = useIssuesSearch(latestQuery, Number(latestProjectId), refreshKey)

  const search = React.useCallback(
    (event) => {
      event.preventDefault()
      setLatestQuery(query)
      setLatestProjectId(projectId)
    },
    [projectId, query]
  )

  const handleIssueCreated = React.useCallback(() => {
    setCreateModalOpen(false)
    setRefreshKey((k) => k + 1)
  }, [])

  const handleMultipleIssuesCreated = React.useCallback(() => {
    setCreateMultipleModalOpen(false)
    setRefreshKey((k) => k + 1)
  }, [])

  const handleCloseModal = React.useCallback(() => setCreateModalOpen(false), [])
  const handleCloseMultipleModal = React.useCallback(() => setCreateMultipleModalOpen(false), [])

  const handleOpenModal = React.useCallback(() => setCreateModalOpen(true), [])
  const handleOpenMultipleModal = React.useCallback(() => setCreateMultipleModalOpen(true), [])

  const selectedProjectId = Number(projectId)
  const showCreateIssue = selectedProjectId > 0

  return (
    <div className='issues-search'>
      <h2>Issues search</h2>
      <form className='search-form' onSubmit={search}>
        <AutocompleteSelect<{ id: number; name: string }>
          label={'Project'}
          sx={{ width: 200 }}
          slotProps={{
            paper: {
              sx: {
                minWidth: 400
              }
            }
          }}
          options={[{ id: 0, name: 'Any project' }, ...projects]}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => String(option.id)}
          value={projectId}
          onValueChanged={(pid) => setProjectId(pid ?? '0')}
        />
        {showCreateIssue && (
          <Tooltip title='Create new issue'>
            <MuiIconButton
              size='small'
              onClick={handleOpenModal}
              sx={{
                ml: 1,
                color: '#fff',
                backgroundColor: 'primary.main',
                width: 32,
                height: 32,
                fontSize: '1.25rem',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
            >
              +
            </MuiIconButton>
          </Tooltip>
        )}
        <Tooltip title='Create multiple issues'>
          <MuiIconButton
            size='small'
            onClick={handleOpenMultipleModal}
            sx={{
              ml: 1,
              color: '#fff',
              backgroundColor: 'secondary.main',
              width: 32,
              height: 32,
              fontSize: '0.85rem',
              '&:hover': { backgroundColor: 'secondary.dark' }
            }}
          >
            ++
          </MuiIconButton>
        </Tooltip>
        <TextField
          className='search-form__query'
          label='Search query'
          value={query}
          placeholder='Search query...'
          variant='standard'
          onChange={useOnChange(setQuery)}
        />
        <input type='submit' value='Search' className='contained' />
      </form>
      {issues.length > 0 && (
        <ul>
          {issues.map((issue) => (
            <IssueRow key={issue.id} issue={issue} onClick={onSelect} />
          ))}
        </ul>
      )}
      {issues.length === 0 && (
        <>
          {isLoading && <p className='list-placeholder'>Loading...</p>}
          {!isLoading && (
            <p className='list-placeholder'>Nothing found for your query, try something else</p>
          )}
        </>
      )}
      {showCreateIssue && (
        <CreateIssueModal
          open={createModalOpen}
          projectId={selectedProjectId}
          onClose={handleCloseModal}
          onCreated={handleIssueCreated}
        />
      )}
      <CreateMultipleIssuesModal
        open={createMultipleModalOpen}
        defaultProjectId={selectedProjectId}
        onClose={handleCloseMultipleModal}
        onCreated={handleMultipleIssuesCreated}
      />
    </div>
  )
}