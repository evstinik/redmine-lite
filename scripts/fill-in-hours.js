const fs = require('fs/promises')

// This script is intended for filling in hours in the CSV file with estimations.
// It is hardcoded for our Redmine instance, format of the CSV file and users of specific project.

if (process.argv.length < 3 || !process.env['SCRIPT_REDMINE_ACCESS_TOKEN']) {
  console.error(
    'Usage: SCRIPT_REDMINE_ACCESS_TOKEN=<your-token> node fill-in-hours.js <csv-file> > <out-csv-file>'
  )
  process.exit(1)
}

async function getRedmineIssue(taskName) {
  const queryParams = {
    'f[]': 'subject',
    'op[subject]': '~',
    'v[subject][]': taskName,
    sort: 'updated_on:desc'
  }
  const makeUrlWithEscape = () => {
    const url = new URL(`https://redmine.sabo-gmbh.de/issues.json`)
    Object.keys(queryParams).forEach((name) =>
      url.searchParams.append(name, queryParams[name].toString())
    )
    return url.toString()
  }
  const r = await fetch(makeUrlWithEscape(), {
    headers: {
      'X-Redmine-API-Key': process.env['SCRIPT_REDMINE_ACCESS_TOKEN']
    }
  })
  const json = await r.json()
  return json.issues.find((issue) => issue.subject.includes(taskName))
}

async function getTimeEntries(issueId) {
  const queryParams = {
    issue_id: issueId
  }
  const makeUrlWithEscape = () => {
    const url = new URL(`https://redmine.sabo-gmbh.de/time_entries.json`)
    Object.keys(queryParams).forEach((name) =>
      url.searchParams.append(name, queryParams[name].toString())
    )
    return url.toString()
  }
  const r = await fetch(makeUrlWithEscape(), {
    headers: {
      'X-Redmine-API-Key': process.env['SCRIPT_REDMINE_ACCESS_TOKEN']
    }
  })
  const json = await r.json()
  return json.time_entries
}

async function main() {
  const csvContent = await fs.readFile(process.argv[2], 'utf8')
  const lines = csvContent
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter((l) => l.length > 0)
  // .slice(0, 1);
  const newLines = await Promise.all(
    lines.map(async (line) => {
      const cells = line.split(';')
      const task = cells[0].slice(0, 7) // MDC-XXX
      // console.log('Task: ', task);

      // Find out hours
      const issue = await getRedmineIssue(task)
      if (!issue) {
        console.log(`Issue for task "${task}" not found`)
        return line
      }
      const timeEntries = await getTimeEntries(issue.id)
      const hours = timeEntries
        .filter((entry) => {
          return ['Nikita Evstigneev', 'Josef Prerost'].includes(entry.user.name)
        })
        .reduce((acc, entry) => acc + Number(entry.hours), 0)
      cells[3] = hours.toString().replace('.', ',')
      cells[4] = issue.id.toString()
      cells[5] = issue.subject

      return cells.join(';')
    })
  )
  const newCsvContent = [lines[0], ...newLines].join('\n')
  console.log(newCsvContent)
}

main()
