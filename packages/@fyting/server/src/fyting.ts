export type { Router } from './trpc-service.js'

if (import.meta.url === import.meta.resolve(process.argv[1]!)) {
  const { start } = await import('./fyting-service.js')
  await start()
}
