<template>
    <v-dialog :v-model="showModal" width="50rem" persistent>
        <sbc-system-error v-bind="$props" v-on:continue-event="submit()"  v-on:cancel-event="cancel()"></sbc-system-error>
    </v-dialog>
</template>

<script setup lang="ts">
import SbcSystemError from '../components/SbcSystemError.vue'
defineProps({
  title: {
    type: String
  },
  description: {
    type: String
  },
  primaryButtonTitle: {
    type: String
  },
  secondaryButtonTitle: {
    type: String
  },
  showModal: {
    type: Boolean
  }
})
const emit = defineEmits(['continue-event', 'cancel-event'])
const submit = () => emit('continue-event')
const cancel = () => emit('cancel-event')
</script>

<style lang="scss" scoped>
    @import '../assets/scss/theme.scss';
    @import '../assets/scss/overrides.scss';

    article {
      .v-card {
        line-height: 1.2rem;
        font-size: 0.875rem;
      }
    }
    section p {
      // font-size 0.875rem
      color: $gray6;
    }
    section + section {
      margin-top: 3rem;
    }
    h2 {
      margin-bottom: 0.25rem;
    }
    .title-container {
      margin-bottom: 0.5rem;
    }
    #buttons-container {
      padding-top: 2rem;
      border-top: 1px solid $gray5;
      .buttons-left {
        width: 50%;
      }
      .buttons-right {
        margin-left: auto;
      }
      .v-btn + .v-btn {
        margin-left: 0.5rem;
      }
    }
    .error-dialog-padding {
      margin-left: 1rem;
    }
</style>
