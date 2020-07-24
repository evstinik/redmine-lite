import { User, UsersResponse } from "./UsersResponse"
import { TimeEntry, TimeEntriesResponse } from "./TimeEntriesResponse"

const API_URL = process.env.REACT_APP_API_URL ?? ''

export class RedmineService {
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

  public async getUser(userId: string = 'current', apiKey: string): Promise<User> {
    const { user } = await this.request<UsersResponse>(`/users/${userId}`, { apiKey })
    return user
  }

  private async request<T>(
    endpoint: string, 
    { queryParams = {}, apiKey = '' }: { queryParams?: {[name: string]: string}, apiKey?: string } = {}
  ): Promise<T> {
    const url = new URL(`${API_URL}${endpoint}.json`, window.location as any);
    Object.keys(queryParams)
      .forEach((name) => url.searchParams.append(name, queryParams[name]))
    return fetch(
      url.toString(), 
      {
        headers: {
          "X-Redmine-API-Key": apiKey,
        },
      }
    ).then(r => r.json())
  }
}