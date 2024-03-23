import { fastifyCookie, type FastifyCookieOptions } from '@fastify/cookie'
import { fastifyOauth2, type FastifyOAuth2Options, type OAuth2Namespace } from '@fastify/oauth2'
import { fastifySession, type FastifySessionOptions } from '@fastify/session'
import { fastifyWebsocket, type WebsocketPluginOptions } from '@fastify/websocket'
import { fastifyTRPCPlugin, type FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'
import { OAuth2Scopes } from 'discord.js'
import { eq } from 'drizzle-orm'
import { Session } from './drizzle-schema.js'
import { db } from './drizzle.js'
import {
  API_HOST,
  API_PORT,
  API_SECRET,
  DISCORD_OAUTH2_CLIENT_ID,
  DISCORD_OAUTH2_CLIENT_SECRET,
} from './environment.js'
import { fastify } from './fastify.js'
import { tid, type TypedId } from './tid.js'
import { createContext, router, type Router } from './trpc-service.js'

declare module 'fastify' {
  interface FastifyInstance {
    oauth2Discord: OAuth2Namespace
  }
}

export async function start() {
  await fastify.register(fastifyWebsocket, {} satisfies WebsocketPluginOptions)

  await fastify.register(fastifyCookie, {} satisfies FastifyCookieOptions)

  await fastify.register(fastifySession, {
    secret: API_SECRET,
    cookie: {
      secure: 'auto',
    },
    idGenerator: () => tid('session', 48),
    store: {
      get: (id, callback) => {
        try {
          const session = db
            .select({ data: Session.data })
            .from(Session)
            .where(eq(Session.id, id as TypedId<'session'>))
            .get()

          callback(null, session?.data)
        } catch (error) {
          callback(error)
        }
      },
      set: (id, session, callback) => {
        try {
          db.insert(Session)
            .values({ id: id as TypedId<'session'>, data: session })
            .onConflictDoUpdate({
              target: [Session.id],
              set: {
                data: session,
                updatedAt: new Date(),
              },
            })
            .run()

          callback()
        } catch (error) {
          callback(error)
        }
      },
      destroy: (id, callback) => {
        try {
          db.delete(Session)
            .where(eq(Session.id, id as TypedId<'session'>))
            .run()

          callback()
        } catch (error) {
          callback(error)
        }
      },
    },
  } satisfies FastifySessionOptions)

  await fastify.register(fastifyOauth2, {
    name: 'oauth2Discord',
    scope: [OAuth2Scopes.Guilds, OAuth2Scopes.GuildsMembersRead, OAuth2Scopes.Identify],
    pkce: 'S256',
    credentials: {
      client: {
        id: DISCORD_OAUTH2_CLIENT_ID,
        secret: DISCORD_OAUTH2_CLIENT_SECRET,
      },
      auth: fastifyOauth2.DISCORD_CONFIGURATION,
    },
    startRedirectPath: '/oauth2/discord/login',
    callbackUri: `${API_HOST}/oauth2/discord/callback`,
  } satisfies FastifyOAuth2Options)

  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/api',
    useWSS: true,
    trpcOptions: {
      router,
      createContext,
    },
  } satisfies FastifyTRPCPluginOptions<Router>)

  await fastify.listen({ port: API_PORT })
}

export async function stop() {
  await fastify.close()
}
