import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import { once } from 'node:events'
import { WebSocketServer } from 'ws'
import { APP_PORT } from './environment.js'
import { discord } from './router-discord.js'
import { t } from './trpc.js'

const router = t.router({
  discord,
})

export type Router = typeof router

const server = createHTTPServer({
  router,
  createContext: async () => {
    return {}
  },
})

const wss = new WebSocketServer({ server })

applyWSSHandler({
  wss,
  router,
  createContext: async () => {
    return {}
  },
})

export async function start() {
  server.listen(APP_PORT)
  await once(server, 'listening')
}

export async function stop() {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
