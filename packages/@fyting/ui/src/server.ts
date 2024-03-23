import type { Router } from '@fyting/server'
import { createTRPCClient, createWSClient, httpLink, splitLink, wsLink, type CreateTRPCClient } from '@trpc/client'
import { onUnmounted, ref, type Ref } from 'vue'
import { API_HTTP_URL, API_WS_URL } from './environment.js'

export const trpc: CreateTRPCClient<Router> = createTRPCClient<Router>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink({
        client: createWSClient({
          url: API_WS_URL,
        }),
      }),
      false: httpLink({
        url: API_HTTP_URL,
      }),
    }),
  ],
})

export function useSubscription<Input, Output, Error>(
  subscription: {
    subscribe: (
      options: Input,
      observer: { onData: (data: Output) => void; onError: (error: Error) => void },
    ) => { unsubscribe: () => void }
  },
  options: Input,
): Ref<{ error: Error; data: null } | { error: null; data: Output }> {
  const value = ref()

  const { unsubscribe } = subscription.subscribe(options, {
    onData: (data) => {
      value.value = { error: null, data }
    },
    onError: (error) => {
      value.value = { error, data: null }
    },
  })

  onUnmounted(unsubscribe)

  return value
}
