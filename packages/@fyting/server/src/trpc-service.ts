import { parse } from '@fastify/cookie/cookie.js'
import type { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http'
import type { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { discord } from './discord-router.js'
import type { TypedId } from './tid.js'
import { t, type Context } from './trpc.js'

export function createContext(
  options: NodeHTTPCreateContextFnOptions<FastifyRequest, FastifyReply> | CreateWSSContextFnOptions,
): Context {
  let sessionId: TypedId<'session'>

  if ('session' in options.req) {
    sessionId = options.req.session.sessionId as TypedId<'session'>
  } else {
    sessionId = parse(options.req.headers.cookie!)['sessionId'] as TypedId<'session'>
  }

  return {
    sessionId,
    discord: null,
  }
}

export const router = t.router({
  discord,
})

export type Router = typeof router
