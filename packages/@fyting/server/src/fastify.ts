import { fastify as createFastifyServer } from 'fastify'

export const fastify = createFastifyServer({ logger: { level: 'trace' } })
