<template>
  <sbc-system-banner
    v-if="isSbcSystemDown"
    v-bind:show="isSbcSystemDown"
    type="warning"
    v-bind:message="alertMessage"
  ></sbc-system-banner>
</template>

<script setup lang='ts'>
import Vue, { PropType, ref, onMounted } from 'vue'
import VueI18n from 'vue-i18n'
import { createI18n, useI18n } from 'vue-i18n-composable'
import { getBoolean } from '../util/common-util'
import { OutageMessages } from '../util/enums'
import SbcSystemBanner from '../components/SbcSystemBanner.vue'
import StatusServices from '../services/status.services'
/* Vue.use(VueI18n)
const messages = {
  en: {
    serviceMaintenanceMessage: '{serviceName} processing is currently not available for corporate filings.',
    serviceScheduledOutageMessage: '{serviceName} processing is currently not available for corporate filings.',
    serviceEmergenceMessage: '{serviceName} processing is currently not available for corporate filings.'
  }
}
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
}) */
interface ServiceData {
  serviceName: string
  serviceNameDesc: string
}
const props = defineProps({
  serviceData: {
    type: Object as PropType<ServiceData>
  },
  statusUrl: {
    type: String,
    default: ''
  }
})
const isSbcSystemDown = ref<boolean>(false)
const alertMessage = ref<string>('')
onMounted(async () => {
  StatusServices.getServiceStatus(props.serviceData.serviceName)
    .then((response) => {
      isSbcSystemDown.value = !getBoolean(response.data && response.data.currentStatus)
      if (isSbcSystemDown.value) {
        alertMessage.value = useI18n().t(OutageMessages.outage, { serviceName: props.serviceData.serviceNameDesc })
          .toString()
      }
    })
})
</script>
