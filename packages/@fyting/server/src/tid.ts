import { randomBytes } from 'node:crypto'

export type TypedId<Type extends string> = `${Type}_${string}`

export const tid = <const Type extends string>(type: Type, length: 16 | 48 = 16): TypedId<Type> => {
  const now = Date.now()
  const bytes = randomBytes(length)

  bytes[0] = now / 2 ** 40
  bytes[1] = now / 2 ** 32
  bytes[2] = now / 2 ** 24
  bytes[3] = now / 2 ** 16
  bytes[4] = now / 2 ** 8
  bytes[5] = now / 2 ** 0

  return `${type}_${bytes.toString('base64url')}`
}
