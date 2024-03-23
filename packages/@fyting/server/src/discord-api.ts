import { REST, RequestMethod } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'
import type { RESTGetAPIUserResult } from 'discord.js'

type Methods = Lowercase<`${RequestMethod}`>
type Paths = keyof typeof Routes
type Params<Route extends Paths> = Parameters<(typeof Routes)[Route]>
type Responses = {
  get_user: RESTGetAPIUserResult
}
type Response<Method extends Methods, Route extends Paths> = `${Method}_${Route}` extends keyof Responses
  ? Responses[`${Method}_${Route}`]
  : unknown

const rest = new REST({ version: '10', authPrefix: 'Bearer' })

export function api<
  const Method extends Methods,
  const Path extends Paths,
  const P extends Params<Path>,
  const R extends Response<Method, Path>,
>(method: Method, path: Path, token: string, ...params: P): Promise<R> {
  rest.setToken(token)

  return rest.request({
    fullRoute: (Routes[path] as (...params: P) => ReturnType<(typeof Routes)[Path]>)(...params),
    method: method.toUpperCase() as Uppercase<Method> satisfies `${RequestMethod}` as RequestMethod,
  }) as Promise<R>
}
