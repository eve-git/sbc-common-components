<template>
  <sbc-system-banner
    v-if="hasPayMessage"
    v-bind:show="hasPayMessage"
    type="warning"
    v-bind:message="alertMessage"
  ></sbc-system-banner>
</template>

<script setup lang='ts'>
import SbcSystemBanner from './SbcSystemBanner.vue'
import StatusModule from '../store/modules/status'
import { ServiceStatus } from '../models/ServiceStatus'
import { useStore } from 'vue2-helpers/vuex'
import { computed, onMounted, ref } from 'vue'

const statusStore = useStore<StatusModule>()
const statusAPIResponse = ref<ServiceStatus | null>(null)
const paySystemStatus = computed(() => statusStore.state.paySystemStatus)

const fetchPaySystemStatus = async () => statusStore.getters.fetchPaySystemStatus()
const getBoolean = (value: boolean | string | number): boolean => {
  var resultVal = value
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
onMounted(async () => {
  try {
    statusAPIResponse.value = await fetchPaySystemStatus()
  } catch (error) {
    statusAPIResponse.value = null
  }
})
const alertMessage = computed(() => paySystemStatus.value?.customMessage
  ? paySystemStatus.value.customMessage : paySystemStatus.value.message)
const hasPayMessage = computed(() => statusAPIResponse.value &&
  (!getBoolean(paySystemStatus.value?.currentStatus) || paySystemStatus.value?.customMessage))
</script>

<style lang="scss" scoped>
:deep(.v-alert__wrapper) {
    margin: 0 auto;
    max-width: 1224px;
  }
</style>
