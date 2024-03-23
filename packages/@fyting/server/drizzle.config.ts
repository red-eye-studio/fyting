import 'dotenv/config.js'

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/drizzle-schema.ts',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env['API_DATABASE']!,
  },
  verbose: true,
  strict: true,
})
