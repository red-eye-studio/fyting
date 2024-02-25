import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { APP_DATABASE } from './environment.js'

export const sqlite: Database.Database = new Database(APP_DATABASE)
export const db = drizzle(sqlite)
