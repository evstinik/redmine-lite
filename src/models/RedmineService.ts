import { User, UsersResponse } from "./api/User"
import { TimeEntry, TimeEntriesResponse, CreateTimeEntryResponse } from "./api/TimeEntry"
import { CreateTimeEntry } from "./api/CreateTimeEntry"
import { TimeEntryActivity, TimeEntryActivityResponse } from "./api/TimeEntryActivity"
import { IssuesPaginatedList } from "./api/Issue"
import { ProjectPaginatedList } from "./api/Project"

const API_URL = process.env.REACT_APP_API_URL ?? ''

interface RequestParams {
  queryParams?: { [name: string]: string | number }
  apiKey?: string
  method?: string
  body?: any // any json convertable
  emptyResponse?: boolean
}

export interface IssuesSearchParams {
  query?: string
  projectId?: number
}

export class UnprocessableEntityError extends Error {
  constructor(public readonly errors: [string]) {
    super('Unprocessable entity')
  }
}

export class RedmineService {

  public onUnauthorized?: () => void

  public async login(apiKey: string): Promise<User> {
    const { user } = await this.request<UsersResponse>('/users/current', { apiKey })
    return user
  }

  public async getTimeEntries(userId: string = 'me', day: Date = new Date(), apiKey: string): Promise<TimeEntry[]> {
    const queryParams = {
      from: day.toJSON().slice(0, 10),
      to: day.toJSON().slice(0, 10),
      limit: 100,
      user_id: userId,
    };
    const { time_entries } = await this.request<TimeEntriesResponse>('/time_entries', { queryParams, apiKey })
    return time_entries
  }

  public async addTimeEntry(timeEntry: CreateTimeEntry, apiKey: string): Promise<TimeEntry> {
    const { time_entry } = await this.request<CreateTimeEntryResponse>(
      '/time_entries',
      { apiKey, method: 'POST', body: {
        time_entry: timeEntry
      } }
    )
    return time_entry
  }

  public async deleteTimeEntry(id: number, apiKey: string): Promise<void> {
    return await this.request<void>(
      `/time_entries/${id}`,
      { apiKey, method: 'DELETE', emptyResponse: true }
    )
  }

  public async getIssues(
    offset: number = 0, 
    limit: number = 10, 
    searchParams: IssuesSearchParams | undefined = undefined,
    apiKey: string
  ): Promise<IssuesPaginatedList> {
    let queryParams: { [name: string]: string | number } = {
      offset,
      limit
    }
    if (searchParams?.query && searchParams?.query?.length > 0) {
      queryParams = {
        ...queryParams,
        "f[]": "subject",
        "op[subject]": "~",
        "v[subject][]": searchParams.query,
        sort: "updated_on:desc",
      };
    }
    if (searchParams?.projectId && Number(searchParams?.projectId) > 0) {
      queryParams['project_id'] = searchParams.projectId
    }
    return await this.request<IssuesPaginatedList>(`/issues`, { apiKey, queryParams }) 
  }

  public async getProjects(
    offset: number = 0,
    limit: number = 10,
    apiKey: string
  ): Promise<ProjectPaginatedList> {
    let queryParams: { [name: string]: string | number } = {
      offset,
      limit,
    };
    return await this.request<ProjectPaginatedList>(`/projects`, {
      apiKey,
      queryParams,
    }); 
  }

  public async getTimeEntryActivities(apiKey: string): Promise<TimeEntryActivity[]> {
    const { time_entry_activities } = await this.request<TimeEntryActivityResponse>(
      "/enumerations/time_entry_activities",
      { apiKey }
    );
    return time_entry_activities
  }

  public async getUser(userId: string = 'current', apiKey: string): Promise<User> {
    const { user } = await this.request<UsersResponse>(`/users/${userId}`, { apiKey })
    return user
  }

  private async request<T>(
    endpoint: string, 
    { 
      queryParams = {}, apiKey = '', 
      method = 'GET', body,
      emptyResponse = false
    }: RequestParams = {}
  ): Promise<T> {
    const url = new URL(`${API_URL}${endpoint}.json`, window.location as any);
    Object.keys(queryParams)
      .forEach((name) => url.searchParams.append(name, queryParams[name].toString()))
    let headers: {[name: string]: string} = {
        "X-Redmine-API-Key": apiKey
    }
    if (body && method !== 'GET') {
      headers['Content-Type'] = 'application/json'
    }
    return fetch(url.toString(), {
      method,
      body: body && JSON.stringify(body),
      headers
    })
      .then(r => {
        if (r.status === 401) {
          this.onUnauthorized?.()
          throw new Error('Unauthorized')
        } else if (r.status === 422) {
          return r.json().then(errorResponse => {
            throw new UnprocessableEntityError(errorResponse.errors ?? [])
          })
        } else if (!r.ok) {
          throw new Error(`${r.status} ${r.statusText}`)
        }
        return r
      })
      .then((r) => {
        if (emptyResponse) {
          return
        }
        return r.json()
      });
  }
}