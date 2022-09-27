<template>
  <v-alert tile :v-model="show" :type="type" :icon="icon" :dismissible="dismissible"><span v-html="message"></span></v-alert>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
defineProps({
  message: {
    type: String,
    default: 'warning'
  },
  type: {
    type: String as PropType<'info' | 'warning' | 'error' | 'success'>,
    default: 'warning'
  },
  icon: {
    type: String,
    // See https://material.io/resources/icons/?style=baseline for accepted values
    default: 'mdi-information'
  },
  show: {
    type: Boolean
  },
  dismissible: {
    type: Boolean
  }
})
</script>

<style lang="scss" scoped>
.v-alert {
  margin: 0;
  padding: 0;
}

.v-alert :deep(.v-alert__wrapper) {
  margin: 0 auto;
  padding: 1.25rem 0.75rem;
  overflow: hidden;
}
</style>
