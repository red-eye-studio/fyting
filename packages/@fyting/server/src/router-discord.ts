import { observable } from '@trpc/server/observable'
import { ChannelType } from 'discord.js'
import { z } from 'zod'
import { client } from './discord.js'
import { t } from './trpc.js'

export const discord = t.router({
  vc: t.procedure.input(z.object({ guildId: z.string() })).subscription((options) =>
    observable((observer) => {
      client.guilds
        .fetch(options.input.guildId)
        .then((guild) => guild.channels.fetch())
        .then((channels) =>
          channels
            .filter((channel) => channel?.type === ChannelType.GuildVoice)
            .map((channel) => ({ id: channel?.id, name: channel?.name, members: [] }))
        )
        .then((channels) => observer.next(channels))

      return () => {}
    })
  ),
})
