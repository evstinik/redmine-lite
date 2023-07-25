import { createContext, useContext } from 'react'
import { RedmineService } from '../models/RedmineService'

export const RedmineServiceContext = createContext(new RedmineService())

export function useRedmineService() {
  return useContext(RedmineServiceContext)
}
