export const DISCORD_TOKEN = process.env['DISCORD_TOKEN']!
export const DISCORD_OAUTH2_CLIENT_ID = process.env['DISCORD_OAUTH2_CLIENT_ID']!
export const DISCORD_OAUTH2_CLIENT_SECRET = process.env['DISCORD_OAUTH2_CLIENT_SECRET']!

export const API_SECRET = process.env['API_SECRET']!
export const API_PORT = Number(process.env['API_PORT'] || 9001)
export const API_DATABASE = process.env['API_DATABASE']
export const API_HOST = `http://localhost:${API_PORT}`
