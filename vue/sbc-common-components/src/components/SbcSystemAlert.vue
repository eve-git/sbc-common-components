<template>
  <sbc-system-banner
    v-if="isSbcSystemDown"
    v-bind:show="isSbcSystemDown"
    type="warning"
    v-bind:message="alertMessage"
  ></sbc-system-banner>
</template>

<script setup lang='ts'>
import VueI18n from 'vue-i18n'
import { getBoolean } from '../util/common-util'
import { OutageMessages } from '../util/enums'
import { Vue, Component, Prop } from 'vue-property-decorator'
import SbcSystemBanner from '../components/SbcSystemBanner.vue'
import StatusServices from '../services/status.services'
import { ServiceStatus } from '../models'

Vue.use(VueI18n)

const messages = {
  en: {
    serviceMaintenanceMessage: '{serviceName} processing is currently not available for corporate filings.',
    serviceScheduledOutageMessage: '{serviceName} processing is currently not available for corporate filings.',
    serviceEmergenceMessage: '{serviceName} processing is currently not available for corporate filings.'
  }
}

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

interface ServiceData {
  serviceName: string
  serviceStatusDesc: string
}

const props = defineProps({
  serviceData: {
    type: ServiceData[],
    default: []
  },
  statusUrl: {
    type: String,
    default: ''
  }
})

const isSbcSystemDown = ref<boolean>(false)
const alertMessage = ref<string>('')

onMounted(async () => {
  StatusServices.getServiceStatus(this.serviceData['serviceName'])
    .then((response) => {
      isSbcSystemDown.value = !getBoolean(response.data && response.data.currentStatus)
      if (isSbcSystemDown.value) {
        alertMessage.value = this.$t(OutageMessages.outage, { serviceName: props.serviceData['serviceNameDesc'] }).toString()
      }
    })
})
</script>
