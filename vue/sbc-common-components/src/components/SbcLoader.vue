<template>
  <v-overlay :value="show">
      <v-progress-circular size="50" width="5" color="#ffffff"
        :indeterminate="indeterminate"
        :z-index="zIndex"
      ></v-progress-circular>
      <!--
      <span class="ml-3">{{message}}</span>
      -->
  </v-overlay>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps({
  show: {
    type: Boolean
  },
  message: {
    type: String,
    default: 'Account Switching In Progress'
  },
  progressColor: {
    type: String,
    default: ''
  }
})
const indeterminate = ref<boolean>(true)
const zIndex = ref<number>(9)
</script>
