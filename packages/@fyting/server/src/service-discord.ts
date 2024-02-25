import { once } from 'node:events'
import { client } from './discord.js'
import { DISCORD_TOKEN } from './environment.js'

export async function start() {
  await client.login(DISCORD_TOKEN)
  await once(client, 'ready')
}

export async function stop() {
  await client.destroy()
}
