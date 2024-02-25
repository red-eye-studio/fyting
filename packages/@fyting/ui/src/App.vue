<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>
    Count is {{ count }}
    <button @click="count++">+</button>
    <button @click="count--">-</button>
  </div>
</template>
