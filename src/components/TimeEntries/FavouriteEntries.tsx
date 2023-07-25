import React from 'react'
import classNames from 'classnames'

import './FavouriteEntries.css'
import { useFavourites } from 'hooks/favourites'
import { IconStar, RedmineLink } from 'components'
import { IconButton } from 'components/IconButton'
import { StopEventPropagation } from 'components/StopEventPropagation'
import { TimeEntry } from 'models/api/TimeEntry'

export interface FavouriteEntriesProps {
  className?: string
  onEntryClicked?: (timeEntry: TimeEntry) => void
}

export function FavouriteEntries(props: FavouriteEntriesProps) {
  const { className, onEntryClicked } = props

  const { favouriteEntries = [], toggleFavouriteEntry } = useFavourites()

  return (
    <div className={classNames('fav-entries', className)}>
      <h2>Saved</h2>

      {favouriteEntries.length === 0 && (
        <p className='tip'>Save time enties for quicker access by clicking star icon</p>
      )}

      <div className='fav-entries__grid'>
        {favouriteEntries.map((timeEntry) => (
          <div
            className='fav-entries__entry fav-entry'
            key={timeEntry.id}
            onClick={() => onEntryClicked?.(timeEntry)}
          >
            <StopEventPropagation>
              <RedmineLink to={`/issues/${timeEntry.issue.id}`} className='fav-entry__issue'>
                #{timeEntry.issue.id}
              </RedmineLink>
            </StopEventPropagation>
            <span className='fav-entry__hours hours'>{timeEntry.hours}h</span>

            <p className='fav-entry__comment'>
              <span className='fav-entry__activity'>{timeEntry.activity.name}: </span>
              {timeEntry.comments}
            </p>

            <span className='fav-entry__project'>{timeEntry.project.name}</span>
            <div className='fav-entry__actions'>
              <StopEventPropagation>
                <IconButton
                  icon={<IconStar filled />}
                  onClick={() => toggleFavouriteEntry(timeEntry)}
                />
              </StopEventPropagation>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
