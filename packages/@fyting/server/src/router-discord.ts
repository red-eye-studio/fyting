import { ChannelType } from 'discord.js'
import { on } from 'node:events'
import { from } from 'rxjs'
import { z } from 'zod'
import { client } from './discord.js'
import { t } from './trpc.js'

async function* vc({ guildId }: { guildId: string }) {
  const channels: {
    [channelId: string]: {
      name: string
      members: {
        [memberId: string]: {
          name: string
        }
      }
    }
  } = {}

  const guild = await client.guilds.fetch(guildId)

  for (const [channelId, channel] of await guild.channels.fetch()) {
    if (channel?.type !== ChannelType.GuildVoice) {
      continue
    }

    channels[channelId] ??= { name: channel.name, members: {} }
    Object.assign(
      channels[channelId]!.members,
      Object.fromEntries(
        Array.from(channel.members).map(([key, value]) => [
          key,
          { name: value.nickname || value.displayName },
        ])
      )
    )
  }

  yield channels

  for await (const [oldState, newState] of on(client, 'voiceStateUpdate')) {
    if (oldState.channelId && channels[oldState.channelId] && oldState.member) {
      delete channels[oldState.channelId]!.members[oldState.member.id]
    }

    if (newState.channelId && newState.member) {
      if (!channels[newState.channelId]) {
        const channel = await guild.channels.fetch(newState.channelId)

        if (!channel || channel.type !== ChannelType.GuildVoice) {
          continue
        }

        channels[channel.id] ??= { name: channel.name, members: {} }
        Object.assign(
          channels[channel.id]!.members,
          Object.fromEntries(
            Array.from(channel.members).map(([key, value]) => [
              key,
              { name: value.nickname || value.displayName },
            ])
          )
        )
      }

      channels[newState.channelId]!.members[newState.member.id] = {
        name: newState.member.nickname || newState.member.displayName,
      }
    }
  }
}

export const discord = t.router({
  vc: t.procedure
    .input(z.object({ guildId: z.string() }))
    .subscription((options) => from(vc(options.input))),
})
