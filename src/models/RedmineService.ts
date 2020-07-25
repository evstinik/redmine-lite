import { User, UsersResponse } from "./UsersResponse"
import { TimeEntry, TimeEntriesResponse, CreateTimeEntryResponse } from "./TimeEntriesResponse"
import { CreateTimeEntry } from "./TimeEntryRequest"
import { TimeEntryActivity, TimeEntryActivityResponse } from "./TimeEntryActivity"

const API_URL = process.env.REACT_APP_API_URL ?? ''

interface RequestParams {
  queryParams?: {[name: string]: string}
  apiKey?: string
  method?: string
  body?: any // any json convertable
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
      { apiKey, method: 'DELETE' }
    )
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
    { queryParams = {}, apiKey = '', method = 'GET', body }: RequestParams = {}
  ): Promise<T> {
    const url = new URL(`${API_URL}${endpoint}.json`, window.location as any);
    Object.keys(queryParams)
      .forEach((name) => url.searchParams.append(name, queryParams[name]))
    let headers: {[name: string]: string} = {
        "X-Redmine-API-Key": apiKey
    }
    if (body && method !== 'GET') {
      headers['Content-Type'] = 'application/json'
    }
    return fetch(url.toString(), {
      method,
      body: body && JSON.stringify(body),
      headers,
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
      .then((r) => r.json());
  }
}