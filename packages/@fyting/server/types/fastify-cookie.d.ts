declare module '@fastify/cookie/cookie.js' {
  export function parse(str: string, opt?: object): Record<string, string>
}
