import { initTRPC } from '@trpc/server'
import type { RESTGetAPIUserResult } from 'discord-api-types/v10'
import type { DiscordToken } from './discord-router.js'
import type { TypedId } from './tid'

export interface Context {
  sessionId: TypedId<'session'>
  discord: {
    info: RESTGetAPIUserResult
    token: DiscordToken
  } | null
}

export const t = initTRPC.context<Context>().create()
