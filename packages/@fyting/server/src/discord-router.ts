import { TRPCError } from '@trpc/server'
import { and, eq } from 'drizzle-orm'
import { on } from 'node:events'
import { z } from 'zod'
import { subscription } from './async-iterable.js'
import { api } from './discord-api.js'
import { client } from './discord.js'
import { Session, Token, User } from './drizzle-schema.js'
import { db } from './drizzle.js'
import { fastify } from './fastify.js'
import { tid, type TypedId } from './tid.js'
import { t, type Context } from './trpc.js'

const DiscordTokenResponse = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().min(0),
  refresh_token: z.string(),
  scope: z.string().transform((scope) => scope.split(' ')),
})

export type DiscordToken = z.infer<typeof DiscordTokenResponse>

fastify.get('/oauth2/discord/callback', async (request, _reply) => {
  const { token } = await fastify.oauth2Discord.getAccessTokenFromAuthorizationCodeFlow(request)
  const credentials = DiscordTokenResponse.parse(token)
  const info = await api('get', 'user', credentials.access_token, '@me')

  db.transaction<void>((tx) => {
    let userId: TypedId<'user'>

    const token = tx
      .update(Token)
      .set({
        accessToken: credentials.access_token,
        tokenType: credentials.token_type,
        expiresIn: credentials.expires_in,
        refreshToken: credentials.refresh_token,
        scope: credentials.scope,

        updatedAt: new Date(),
      })
      .where(and(eq(Token.provider, 'discord'), eq(Token.providerId, info.id)))
      .returning({ userId: Token.userId })
      .get()

    userId = token?.userId

    if (!userId) {
      const user = tx
        .insert(User)
        .values({ id: tid('user') })
        .returning({ id: User.id })
        .get()

      tx.insert(Token)
        .values({
          id: tid('token'),
          userId: user.id,

          provider: 'discord',
          providerId: info.id,

          accessToken: credentials.access_token,
          tokenType: credentials.token_type,
          expiresIn: credentials.expires_in,
          refreshToken: credentials.refresh_token,
          scope: credentials.scope,
        })
        .run()

      userId = user.id
    }

    tx.update(Session)
      .set({ userId })
      .where(eq(Session.id, request.session.sessionId as TypedId<'session'>))
      .run()
  })
})

const authenticated = t.procedure.use(async (ops) => {
  console.log(ops)

  const token = db
    .select({
      access_token: Token.accessToken,
      refresh_token: Token.refreshToken,
      expires_in: Token.expiresIn,
      token_type: Token.tokenType,
      scope: Token.scope,
    })
    .from(Token)
    .where(
      eq(Token.userId, db.select({ userId: Session.userId }).from(Session).where(eq(Session.id, ops.ctx.sessionId))),
    )
    .get()

  console.log(token)

  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return ops.next({
    ctx: {
      ...ops.ctx,
      discord: {
        info: await api('get', 'user', token.access_token, '@me'),
        token: token,
      },
    },
  })
})

async function* voiceStateUpdate(_input: undefined, context: Context, signal: AbortSignal) {
  for await (const [oldState, newState] of on(client, 'voiceStateUpdate', { signal })) {
    if (
      oldState.channel!.members.has(context.discord!.info.id) ||
      newState.channel!.members.has(context.discord!.info.id)
    ) {
      yield [oldState, newState]
    }
  }
}

export const discord = t.router({
  voiceStateUpdate: authenticated.subscription(subscription(voiceStateUpdate)),
})
