import { relations } from 'drizzle-orm/relations'
import { sql } from 'drizzle-orm/sql'
import { int, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import type { Session as FsatifySession } from 'fastify'
import type { TypedId } from './tid.js'

export const User = sqliteTable('user', {
  id: text('id').$type<TypedId<'user'>>().primaryKey(),

  createdAt: int('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(UNIXEPOCH('subsecond') * 1000)`),
  updatedAt: int('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(UNIXEPOCH('subsecond') * 1000)`),
})

export const UserRelations = relations(User, ({ many }) => ({
  sessions: many(Session),
  tokens: many(Token),
}))

export const Session = sqliteTable('session', {
  id: text('id').$type<TypedId<'session'>>().primaryKey(),
  userId: text('user_id').$type<TypedId<'user'>>(),

  data: text('data', { mode: 'json' }).$type<FsatifySession>(),

  createdAt: int('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(UNIXEPOCH('subsecond') * 1000)`),
  updatedAt: int('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(UNIXEPOCH('subsecond') * 1000)`),
})

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, {
    fields: [Session.userId],
    references: [User.id],
  }),
}))

export const Token = sqliteTable(
  'token',
  {
    id: text('id').$type<TypedId<'token'>>().primaryKey(),
    userId: text('user_id').$type<TypedId<'user'>>().notNull(),

    provider: text('provider', { enum: ['discord'] }).notNull(),
    providerId: text('provider_id').notNull(),

    accessToken: text('access_token').notNull(),
    tokenType: text('token_type', { enum: ['Bearer'] }).notNull(),
    expiresIn: int('expires_in').notNull(),
    refreshToken: text('refresh_token').notNull(),
    scope: text('scope', { mode: 'json' }).$type<string[]>().notNull(),

    createdAt: int('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(UNIXEPOCH('subsecond') * 1000)`),
    updatedAt: int('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(UNIXEPOCH('subsecond') * 1000)`),
  },
  (t) => ({
    _providerId: unique().on(t.provider, t.providerId),
  }),
)

export const TokenRelations = relations(Token, ({ one }) => ({
  user: one(User, {
    fields: [Token.userId],
    references: [User.id],
  }),
}))
