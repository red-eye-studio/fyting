console.log(String.raw`
 ______   __  __     ______   __     __   __     ______
/\  ___\ /\ \_\ \   /\__  _\ /\ \   /\ "-.\ \   /\  ___\
\ \  __\ \ \____ \  \/_/\ \/ \ \ \  \ \ \-.  \  \ \ \__ \
 \ \_\    \/\_____\    \ \_\  \ \_\  \ \_\\"\_\  \ \_____\
  \/_/     \/_____/     \/_/   \/_/   \/_/ \/_/   \/_____/
`)

import 'dotenv/config.js'

import { OAuth2Scopes } from 'discord.js'
import { client } from './discord.js'
import { start as startDiscord, stop as stopDiscord } from './service-discord.js'
import { start as startDrizzle, stop as stopDrizzle } from './service-drizzle.js'
import { start as startTRPC, stop as stopTRPC } from './service-trpc.js'

async function handleError(error?: unknown) {
  if (error) {
    process.exitCode = 1
    console.error(error)
  }

  try {
    await stop()
  } catch (error) {
    process.exitCode = 1
    console.error(error)
  }

  process.exit()
}

async function handleSignal() {
  await handleError()
}

async function start() {
  process.on('uncaughtException', handleError)
  process.on('SIGINT', handleSignal)
  process.on('SIGTERM', handleSignal)
  process.on('SIGQUIT', handleSignal)

  await startDrizzle()
  await startDiscord()
  await startTRPC()

  console.log(client.generateInvite({ scopes: [OAuth2Scopes.Bot] }))
}

async function stop() {
  process.off('SIGQUIT', handleSignal)
  process.off('SIGTERM', handleSignal)
  process.off('SIGINT', handleSignal)
  process.off('uncaughtException', handleError)

  await stopTRPC()
  await stopDiscord()
  await stopDrizzle()
}

start().catch(handleError)
