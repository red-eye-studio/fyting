<script setup lang="ts">
import { trpc, useSubscription } from './server.js';

const channels = useSubscription(trpc.discord.vc, { guildId: '467585733658542080' })
</script>

<template>
  <ul>
    <li v-for="channel in channels.data">
      {{ channel.name }}
    </li>
  </ul>
</template>
