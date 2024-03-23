import { observable as _observable } from '@trpc/server/observable'

type NoInfer<T> = [T][T extends any ? 0 : never]

export function subscription<Input, Context, Value>(
  implementation: (input: NoInfer<Input>, context: NoInfer<Context>, signal: AbortSignal) => AsyncIterable<Value>,
) {
  return (options: { input: Input; ctx: Context }) => {
    return _observable<Value>((observer) => {
      const unsubscribe = new AbortController()

      ;(async () => {
        for await (const value of implementation(options.input, options.ctx, unsubscribe.signal)) observer.next(value)
      })().then(
        () => observer.complete(),
        (error) => observer.error(error),
      )

      return () => {
        unsubscribe.abort()
      }
    })
  }
}

export { on, once } from 'node:events'
