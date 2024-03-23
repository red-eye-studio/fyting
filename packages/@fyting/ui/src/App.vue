<script setup lang="ts">
import { trpc, useSubscription } from './server.js';

const channels = useSubscription(trpc.discord.voiceStateUpdate, undefined)
</script>

<template>
  <ul>
    <li v-for="channel in channels.data">
      {{ channel }}
    </li>
  </ul>
</template>
