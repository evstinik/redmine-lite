import bent from 'bent'
import prompts from 'prompts'
import { config } from 'dotenv'
import fs from 'fs/promises'
import { Issue, IssueDetailResponse, IssuesPaginatedList } from '../src/models/api/Issue'
import { TimeEntriesResponse, TimeEntry } from '../src/models/api/TimeEntry'

config({
  debug: true,
  path: '.env.local'
})

const redmineBaseUrl = process.env['REDMINE_URL'] ?? process.env['VITE_REDMINE_URL']
if (!redmineBaseUrl) {
  throw new Error('No Redmine URL configured')
}

// Ask user for access token via command line
const getAccessToken = async () => {
  if (process.env['SCRIPT_REDMINE_ACCESS_TOKEN']) {
    return process.env['SCRIPT_REDMINE_ACCESS_TOKEN']
  }

  const { accessToken } = await prompts({
    type: 'text',
    name: 'accessToken',
    message: 'Enter your Redmine API access token:'
  })
  return accessToken
}

// Ask user for project ID via command line
const getProjectId = async () => {
  if (process.env['SCRIPT_REDMINE_PROJECT_ID']) {
    return process.env['SCRIPT_REDMINE_PROJECT_ID']
  }
  const { projectId } = await prompts({
    type: 'text',
    name: 'projectId',
    message: 'Enter the project ID:'
  })
  return projectId
}

// Ask user for fixed version via command line
const getFixedVersion = async (projectId: string, accessToken: string) => {
  // Load fixed versions from redmine API
  const getJSON = bent('json')
  const fixedVersions = await getJSON(
    `${redmineBaseUrl}/projects/${projectId}/versions.json?key=${accessToken}`
  )

  const { fixedVersionId } = await prompts({
    type: 'select',
    name: 'fixedVersionId',
    message: 'Select version:',
    choices: fixedVersions.versions.map((version: any) => ({
      title: version.name,
      value: version.id
    }))
  })

  return fixedVersionId
}

// Asl user for time span via command line
const getTimeSpan = async () => {
  if (process.env['SCRIPT_REDMINE_TIME_SPAN']) {
    return process.env['SCRIPT_REDMINE_TIME_SPAN']
  }
  const { timeSpan } = await prompts({
    type: 'text',
    name: 'timeSpan',
    message: 'Enter the time span (e.g. 2021-01-01,2021-01-31):'
  })
  return timeSpan
}

// Get all time entries from Redmine
const loadEntries = async (
  accessToken: string,
  projectId: string,
  timeSpan?: string,
  versionId?: string
): Promise<TimeEntriesResponse> => {
  console.log(`Loading time entries for project ${projectId}...`)

  let baseUrl = `${redmineBaseUrl}/time_entries.json?key=${accessToken}&project_id=${projectId}&limit=100`

  if (timeSpan) {
    const [from, to] = timeSpan.split(',')
    baseUrl += `&from=${from}&to=${to}`
    console.log('Time span:', from, to)
  }

  if (versionId) {
    baseUrl += `&fixed_version_id=${versionId}`
    console.log('Fixed version: #', versionId)
  }

  const getJSON = bent('json')

  console.time('Loaded time entries in')

  const timeEntries: TimeEntriesResponse = await getJSON(baseUrl)

  while (timeEntries.total_count > timeEntries.time_entries.length) {
    console.log(
      `Loading more time entries... (${timeEntries.time_entries.length}/${timeEntries.total_count})`
    )

    const offset = timeEntries.time_entries.length
    const moreTimeEntries = await getJSON(`${baseUrl}&offset=${offset}`)
    timeEntries.time_entries = timeEntries.time_entries.concat(moreTimeEntries.time_entries)
  }

  console.timeEnd('Loaded time entries in')

  return timeEntries
}

// Load multiple issue details from Redmine
const loadIssueDetails = async (
  accessToken: string,
  projectId: number
): Promise<IssuesPaginatedList> => {
  const getJSON = bent('json')

  // Issues loaded per ID does not work, load all issues of the project instead

  console.log(`Loading issue details for project ${projectId}...`)
  console.time('Loaded issues in')

  const issueDetails: IssuesPaginatedList = await getJSON(
    `${redmineBaseUrl}/issues.json?key=${accessToken}&limit=100&project_id=${projectId}&status_id=*`
  )

  while (issueDetails.total_count > issueDetails.issues.length) {
    console.log(
      `Loading more issue details... (${issueDetails.issues.length}/${issueDetails.total_count})`
    )
    const offset = issueDetails.issues.length
    const moreIssueDetails = await getJSON(
      `${redmineBaseUrl}/issues.json?key=${accessToken}&limit=100&offset=${offset}&project_id=${projectId}&status_id=*`
    )
    issueDetails.issues = issueDetails.issues.concat(moreIssueDetails.issues)
  }

  console.timeEnd('Loaded issues in')

  console.log(issueDetails.issues.length, 'issues loaded.')

  return issueDetails
}

// Group time entries by issue of type user story
const groupEntriesByUserStory = (
  timeEntries: TimeEntriesResponse,
  issueDetails: IssuesPaginatedList
) => {
  const issuesPerId = new Map<number, Issue>(issueDetails.issues.map((i) => [i.id, i]))

  const groupedEntries: { [storyId: number]: TimeEntry[] } = {}
  const problematicIssues = {
    detailNotAvailable: new Set<number>(),
    notLeadingToUserStory: new Set<number>()
  }

  timeEntries.time_entries.forEach((entry: TimeEntry) => {
    let issue = issuesPerId.get(entry.issue.id)

    while (issue && issue.tracker.name !== 'User Story' && issue.parent) {
      issue = issuesPerId.get(issue.parent.id)
    }

    if (!issue) {
      problematicIssues.detailNotAvailable.add(entry.issue.id)
      // console.warn('Found time entry, but no issue details:', entry.issue.id)
      return
    }

    if (issue.tracker.name === 'User Story') {
      const storyEntries = groupedEntries[issue.id] ?? []
      storyEntries.push(entry)
      groupedEntries[issue.id] = storyEntries
    } else {
      // This entry refers to issue, that does not lead to user story
      // Earlier we just registered it...
      problematicIssues.notLeadingToUserStory.add(entry.issue.id)
      // ...now we place it under it's own name
      const storyEntries = groupedEntries[entry.issue.id] ?? []
      storyEntries.push(entry)
      groupedEntries[entry.issue.id] = storyEntries
    }
  })

  if (problematicIssues.detailNotAvailable.size > 0) {
    console.warn(
      'There are time entries referencing not available issues (not enough permissions?):',
      Array.from(problematicIssues.detailNotAvailable)
        .sort((a, b) => a - b)
        .map((id) => `#${id}`)
        .join(', ')
    )
  }

  if (problematicIssues.notLeadingToUserStory.size > 0) {
    console.warn('There are time entries not leading to any user story:')
    Array.from(problematicIssues.notLeadingToUserStory)
      .sort((a, b) => a - b)
      .forEach((id) => {
        const issue = issuesPerId.get(id)
        console.warn(`  #${id} - ${issue?.tracker.name ?? 'N/A'} - ${issue?.subject ?? 'N/A'}`)
      })
    console.warn("You will se all of them under it's own name")
  }

  return groupedEntries
}

// Group time entries by user
const groupEntriesByUser = (timeEntries: TimeEntry[]): { [name: string]: TimeEntry[] } => {
  const groupedEntries: { [name: string]: TimeEntry[] } = {}
  timeEntries.forEach((entry: TimeEntry) => {
    const userEntries = groupedEntries[entry.user.name] ?? []
    userEntries.push(entry)
    groupedEntries[entry.user.name] = userEntries
  })
  return groupedEntries
}

// Print time entries to console
const printEntries = (timeEntries: TimeEntriesResponse) => {
  timeEntries.time_entries.forEach((entry: TimeEntry) => {
    console.log(`${entry.spent_on} ${entry.hours} ${entry.activity.name} ${entry.comments}`)
  })
  console.log('Total entries:', timeEntries.total_count)
}

// Print sum spent time per user story per user
const printSum = (
  groupedEntries: { [storyId: number]: { [name: string]: TimeEntry[] } },
  issueDetails: IssuesPaginatedList
) => {
  const issuesPerId = new Map<number, Issue>(issueDetails.issues.map((i) => [i.id, i]))
  Object.keys(groupedEntries)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((storyId) => {
      const issue = issuesPerId.get(storyId)
      if (!issue) {
        return
      }

      const totalSum = Object.keys(groupedEntries[storyId]).reduce((sum, userName) => {
        return groupedEntries[storyId][userName].reduce((sum, entry) => sum + entry.hours, sum)
      }, 0)

      console.log(`User Story #${issue.id}: ${issue.subject} (${Number(totalSum).toFixed(2)}h)`)

      Object.keys(groupedEntries[storyId])
        .sort()
        .forEach((userName) => {
          const sum = groupedEntries[storyId][userName].reduce((sum, entry) => sum + entry.hours, 0)

          const issueIds = Array.from(
            new Set(groupedEntries[storyId][userName].map((e) => e.issue.id))
          ).sort((a, b) => a - b)

          console.log(
            `  ${userName}: ${Number(sum).toFixed(2)}h (${issueIds
              .map((id) => `#${id}`)
              .join(', ')})`
          )
        })
    })
}

// Export sum spent time per user story per user to CSV
const exportSum = async (
  groupedEntries: { [storyId: number]: { [name: string]: TimeEntry[] } },
  issueDetails: IssuesPaginatedList,
  filename: string
) => {
  const issuesPerId = new Map<number, Issue>(issueDetails.issues.map((i: Issue) => [i.id, i]))
  const csvRows: string[] = ['User story ID;User story subject;User;Hours;Subtasks;Comment']

  Object.keys(groupedEntries)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((storyId) => {
      const issue = issuesPerId.get(storyId)
      if (!issue) {
        return
      }

      Object.keys(groupedEntries[storyId])
        .sort()
        .forEach((userName) => {
          const sum = groupedEntries[storyId][userName].reduce((sum, entry) => sum + entry.hours, 0)

          const issueIds = Array.from(
            new Set(groupedEntries[storyId][userName].map((e) => e.issue.id))
          ).sort((a, b) => a - b)

          const comment = issue.tracker.name !== 'User Story' ? `${issue.tracker.name}` : ''

          csvRows.push(
            `${issue.id};${issue.subject};${userName};${Number(sum)
              .toFixed(2)
              .replace('.', ',')};${issueIds.map((id) => `#${id}`).join(', ')};${comment}`
          )
        })
    })

  const csv = csvRows.join('\n')
  await fs.writeFile(filename, csv)

  console.log(`Exported to ${filename}`)
}

// Main function
const main = async () => {
  const accessToken = await getAccessToken()
  const projectId = await getProjectId()
  // const versionId = await getFixedVersion(projectId, accessToken)
  const timeSpan = await getTimeSpan()
  const timeEntries = await loadEntries(accessToken, projectId, timeSpan)

  const issueDetails = await loadIssueDetails(accessToken, projectId)
  // printEntries(timeEntries)

  const groupedEntries = groupEntriesByUserStory(timeEntries, issueDetails) as any
  Object.keys(groupedEntries).forEach((storyId) => {
    const storyEntries = groupedEntries[storyId]
    const groupedEntriesByUser = groupEntriesByUser(storyEntries)
    groupedEntries[storyId] = groupedEntriesByUser
  })

  // printSum(groupedEntries, issueDetails)
  exportSum(groupedEntries, issueDetails, `${projectId}_${timeSpan.split(',').join('_')}.csv`)
}

main()
