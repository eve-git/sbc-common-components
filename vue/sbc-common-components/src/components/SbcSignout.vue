<template>
  <loading-screen :is-loading="isLoading"></loading-screen>
</template>
<script setup lang="ts">
import KeyCloakService from '../services/keycloak.services'
import { onMounted, ref } from 'vue'
const isLoading = ref(true)
const props = defineProps({
  redirectUrl: {
    type: String,
    default: ''
  }
})
onMounted(async () => {
  await KeyCloakService.logout(props.redirectUrl ? decodeURIComponent(props.redirectUrl) : undefined)
})
</script>

<style lang="scss" scoped>
</style>
