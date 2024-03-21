import { discord } from './discord-router.js'
import { t } from './trpc.js'

export function createContext() {
  return {}
}

export const router = t.router({
  discord,
})

export type Router = typeof router
