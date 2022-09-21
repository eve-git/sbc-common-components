<template>
  <sbc-system-banner
    v-if="hasPayMessage"
    v-bind:show="hasPayMessage"
    type="warning"
    v-bind:message="alertMessage"
  ></sbc-system-banner>
</template>

<script setup lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import SbcSystemBanner from './SbcSystemBanner.vue'
import { ServiceStatus } from '../models/ServiceStatus'

const statusAPIResponse = ref<ServiceStatus>(null)
const paySystemStatus = computed(() => statusStore.state.paySystemStatus) // mapState('status', ['paySystemStatus'])
const fetchPaySystemStatus = computed(() => statusStore.actions.fetchPaySystemStatus))) // mapActions('status', ['fetchPaySystemStatus'])

const getBoolean () (value: boolean | string | number): boolean {
    let resultVal = value
    if (typeof value === 'string') {
      resultVal = value.toLowerCase()
    }
    switch (resultVal) {
      case true:
      case 'true':
      case 1:
      case '1':
      case 'on':
      case 'yes':
      case 'none':
        return true
      default:
        return false
    }
}

onMounted(() => {
  try {
    statusAPIResponse.value = await this.fetchPaySystemStatus()
  } catch (error) {
    statusAPIResponse.value = null
  }
})

const alertMessage = () => computed(() => {
  return paySystemStatus.value?.customMessage ? paySystemStatus.value.customMessage : paySystemStatus.value.message
})

const hasPayMessage = () => computed(() => {
  return statusAPIResponse.value && (!getBoolean(paySystemStatus.value?.currentStatus) || paySystemStatus.value?.customMessage)
})
</script>

<style lang="scss" scoped>
  ::v-deep {
    .v-alert__wrapper {
      margin: 0 auto;
      max-width: 1224px;
    }
  }
</style>
