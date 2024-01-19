import * as React from 'react'
import { useIssuesSearch } from 'hooks/issues'
import { IssueRow } from './IssueRow'
import { useOnChange } from 'hooks/utils'
import { Issue } from 'models/api/Issue'
import { useProjects } from 'hooks/projects'
import { AutocompleteSelect } from 'components/AutocompleteSelect'
import TextField from '@mui/material/TextField'

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

  const projects = useProjects() ?? []
  const [issues, isLoading] = useIssuesSearch(latestQuery, Number(latestProjectId))

  const search = React.useCallback(
    (event) => {
      event.preventDefault()
      setLatestQuery(query)
      setLatestProjectId(projectId)
    },
    [projectId, query]
  )

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
    </div>
  )
}
