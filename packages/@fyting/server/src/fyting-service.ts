import 'dotenv/config.js'

import { start as startDiscord, stop as stopDiscord } from './discord-service.js'
import { start as startDrizzle, stop as stopDrizzle } from './drizzle-service.js'
import { start as startFastify, stop as stopFastify } from './fastify-service.js'

export type { Router } from './trpc-service.js'

async function handleError(error?: unknown) {
  if (error) {
    process.exitCode ||= 1
    console.error(error)
  }

  try {
    await stop()
  } catch (error) {
    process.exitCode ||= 1
    console.error(error)
  }

  process.exit()
}

async function handleSignal() {
  await handleError()
}

export async function start() {
  console.log(String.raw`
 ______   __  __     ______   __     __   __     ______
/\  ___\ /\ \_\ \   /\__  _\ /\ \   /\ "-.\ \   /\  ___\
\ \  __\ \ \____ \  \/_/\ \/ \ \ \  \ \ \-.  \  \ \ \__ \
 \ \_\    \/\_____\    \ \_\  \ \_\  \ \_\\"\_\  \ \_____\
  \/_/     \/_____/     \/_/   \/_/   \/_/ \/_/   \/_____/
`)

  process.on('uncaughtException', handleError)
  process.on('SIGINT', handleSignal)
  process.on('SIGTERM', handleSignal)
  process.on('SIGQUIT', handleSignal)

  try {
    await startDrizzle()
    await startDiscord()
    await startFastify()
  } catch (error) {
    handleError(error)
  }
}

export async function stop() {
  process.off('SIGQUIT', handleSignal)
  process.off('SIGTERM', handleSignal)
  process.off('SIGINT', handleSignal)
  process.off('uncaughtException', handleError)

  await stopFastify()
  await stopDiscord()
  await stopDrizzle()
}
