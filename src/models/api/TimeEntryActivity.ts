// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface TimeEntryActivity {
  id: number
  name: string
}

export interface TimeEntryActivityResponse {
  time_entry_activities: TimeEntryActivity[]
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class TimeEntryActivity {
  static default = [
    {
      id: 48,
      name: 'Administration'
    },
    {
      id: 10,
      name: 'Analysis/Specification'
    },
    {
      id: 62,
      name: 'Call/Meeting'
    },
    {
      id: 53,
      name: 'Controlling'
    },
    {
      id: 15,
      name: 'Deployment'
    },
    {
      id: 8,
      name: 'Design'
    },
    {
      id: 9,
      name: 'Development'
    },
    {
      id: 14,
      name: 'Documentation/Revision'
    },
    {
      id: 16,
      name: 'Hiring/HR_Management'
    },
    {
      id: 13,
      name: 'Maintenance'
    },
    {
      id: 11,
      name: 'Management'
    },
    {
      id: 52,
      name: 'Marketing'
    },
    {
      id: 49,
      name: 'Other'
    },
    {
      id: 47,
      name: 'Sales'
    },
    {
      id: 58,
      name: 'Self study'
    },
    {
      id: 35,
      name: 'Support'
    },
    {
      id: 12,
      name: 'Testing'
    },
    {
      id: 57,
      name: 'Travel'
    }
  ]

  static defaultPrimaryActivityId = 9
}
