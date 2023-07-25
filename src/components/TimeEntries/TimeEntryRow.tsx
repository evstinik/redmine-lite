import * as React from 'react'
import { DetailedTimeEntry } from 'models/api/TimeEntry'
import { useDeleteTimeEntry, useUpdateTimeEntry } from 'hooks/timeEntries'
import { RedmineLink } from 'components/RedmineLink/RedmineLink'
import { IconButton } from 'components/IconButton'
import { IconBin, IconStar } from 'components'
import { useFavourites } from 'hooks/favourites'
import './TimeEntryRow.css'

interface TimeEntryRowProps {
  timeEntry: DetailedTimeEntry
  issueName?: string
}

export function TimeEntryRow({ timeEntry, issueName }: TimeEntryRowProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const deleteTimeEntry = useDeleteTimeEntry()

  const deleteWithConfirmation = React.useCallback(() => {
    let isCancelled = false
    const { id, hours, issue, comments } = timeEntry
    const shortDescription = `${hours}h on #${issue.id} - ${comments}`
    if (!window.confirm(`Are you sure you want to remove time entry "${shortDescription}"?`)) {
      return
    }
    setIsDeleting(true)
    deleteTimeEntry(id).catch((err) => {
      if (!isCancelled) {
        // not reseting in `then`, anyway this row will dissapear
        setIsDeleting(false)
      }
      console.log('Error while deleting time entry:', err)
      alert('Deleting did not succeed')
    })
    return () => {
      isCancelled = true
    }
  }, [deleteTimeEntry, timeEntry, setIsDeleting])

  const { favouriteEntries, toggleFavouriteEntry } = useFavourites()
  const toggleFavourite = React.useCallback(() => {
    toggleFavouriteEntry(timeEntry)
  }, [timeEntry, favouriteEntries])
  const isFavourite = React.useMemo(
    () => !!favouriteEntries?.find((e) => e.id === timeEntry.id),
    [timeEntry, favouriteEntries]
  )

  const updateTimeEntry = useUpdateTimeEntry()
  const [isEditingHours, setEditingHours] = React.useState(false)
  const [hours, setHours] = React.useState('')
  React.useEffect(() => {
    setHours(`${timeEntry.hours}`)
  }, [timeEntry.hours])
  const saveNewHours = React.useCallback(() => {
    updateTimeEntry(timeEntry.id, {
      ...timeEntry,
      issue_id: timeEntry.issue.id,
      activity_id: timeEntry.activity.id,
      hours: Number(hours)
    })
    setEditingHours(false)
    setHours(`${timeEntry.hours}`)
  }, [timeEntry, hours])

  return (
    <li className='time-entry-row'>
      <div className='line'>
        <span
          className='hours'
          onClick={() => {
            setEditingHours(true)
          }}
        >
          {isEditingHours && (
            <input
              type='text'
              value={hours}
              onChange={({ target }) => setHours(target.value)}
              autoFocus
              onBlur={saveNewHours}
            />
          )}
          {!isEditingHours && <>{timeEntry.hours}h</>}
        </span>
        <RedmineLink to={`/issues/${timeEntry.issue.id}`} className='issue'>
          {timeEntry.issue.subject && (
            <>
              #{timeEntry.issue.id}: {timeEntry.issue.subject}
            </>
          )}
          {!timeEntry.issue.subject && issueName && (
            <>
              #{timeEntry.issue.id}: {issueName}
            </>
          )}
          {!timeEntry.issue.subject && !issueName && <>Issue #{timeEntry.issue.id}</>}
        </RedmineLink>
        <span className='project'>{timeEntry.project.name}</span>
      </div>
      <div className='line'>
        <p className='comment'>
          <span className='activity'>{timeEntry.activity.name}: </span>
          {timeEntry.comments}
        </p>
        <div className='actions'>
          <IconButton icon={<IconStar filled={isFavourite} />} onClick={toggleFavourite} />
          <IconButton icon={<IconBin />} disabled={isDeleting} onClick={deleteWithConfirmation} />
        </div>
      </div>
    </li>
  )
}
