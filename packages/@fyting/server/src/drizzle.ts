import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { API_DATABASE } from './environment.js'
import { fastify } from './fastify.js'

export const sqlite: Database.Database = new Database(API_DATABASE)
export const db = drizzle(sqlite, {
  logger: { logQuery: (query, params) => fastify.log.trace({ 'db.statement': query }) },
})
