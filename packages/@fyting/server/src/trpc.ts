import { initTRPC } from '@trpc/server'

export interface Context {}

export const t = initTRPC.context<Context>().create()
