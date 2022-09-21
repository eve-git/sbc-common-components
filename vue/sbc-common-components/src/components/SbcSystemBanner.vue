<template>
  <!-- NB: set icon="null" to prevent v-alert default icon + vue complains if set to "" -->
  <v-alert class="py-2" v-model="state.show" :type="type" icon="null" :dismissible="state.dismissible">
    <div class="px-3">
      <v-icon v-if="state.icon !== ''" class="mr-2" size="34">{{ state.icon }}</v-icon>
      <span v-html="state.message"></span>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const props = defineProps({
  setDismissible: {
    type: Boolean
  },
  setIcon: {
    type: String,
    // See https://material.io/resources/icons/?style=baseline for accepted values
    default: 'mdi-information'
  },
  setMessage: {
    type: String,
    default: ''
  },
  setShow: {
    type: Boolean
  },
  setType: {
    type: String,
    default: 'warning'
  }
})

const state = reactive({
  dismissible: computed(() => { return props.setDismissible }),
  icon: computed(() => { return props.setIcon }),
  message: computed(() => { return props.setMessage }),
  show: computed(() => { return props.setShow }),
  type: computed(() => { return props.setType as 'info' | 'warning' | 'error' | 'success' }),
})
</script>

<style lang="scss" scoped>
.v-alert {
  border-radius: 0;
  padding: 0;
  max-height: 48px;
}
:deep(.v-alert__prepend) {
  height: 0;
  width: 0;
  margin-inline-end: 0;
}

.v-alert :deep(.v-alert__wrapper) {
  margin: 0;
  overflow: hidden;
}

:deep(.v-alert__content) {
  max-width: 1360px;  // should match sbc header / breadcrumb max widths
  width: 100%;
}
</style>
