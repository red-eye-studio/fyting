import { fastifyCookie, type FastifyCookieOptions } from '@fastify/cookie'
import { fastifyOauth2, type FastifyOAuth2Options, type OAuth2Namespace } from '@fastify/oauth2'
import { fastifySession, type FastifySessionOptions } from '@fastify/session'
import { fastifyWebsocket, type WebsocketPluginOptions } from '@fastify/websocket'
import { fastifyTRPCPlugin, type FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'
import { OAuth2Scopes } from 'discord.js'
import {
  API_HOST,
  API_PORT,
  API_SECRET,
  DISCORD_OAUTH2_CLIENT_ID,
  DISCORD_OAUTH2_CLIENT_SECRET,
} from './environment.js'
import { fastify } from './fastify.js'
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
    startRedirectPath: '/login/discord',
    callbackUri: `${API_HOST}/login/discord/callback`,
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
