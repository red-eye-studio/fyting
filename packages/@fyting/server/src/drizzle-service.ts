import { sqlite } from './drizzle.js'

export async function start() {}

export async function stop() {
  sqlite?.close()
}
