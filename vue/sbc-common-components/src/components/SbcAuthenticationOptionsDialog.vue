<template>
  <v-dialog :v-model="showModal" max-width="850px" :attach="attach" persistent>
    <v-card class="pa-4">
      <sbc-authentication-options :is-dialog="true" :redirect-url="redirectUrl" @close="emitClose()"/>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import SbcAuthenticationOptions from './SbcAuthenticationOptions.vue'
const props = defineProps({
  inAuth: {
    type: Boolean,
    default: false
  },
  showModal: {
    type: Boolean,
    default: false
  },
  attach: {
    type: String,
    default: ''
  },
  redirectUrl: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['close'])
const emitClose = () => emit('close')
</script>

<style lang="scss" scoped>
  .v-dialog > .v-card {
    border-radius: 4px!important;
  }
</style>
