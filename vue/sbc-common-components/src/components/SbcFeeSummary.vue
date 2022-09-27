<template>
  <v-card>
    <header class="font-weight-bold px-3 py-3">
      <slot name="header">Fee Summary</slot>
    </header>

    <div v-show="fetchError">
      <v-alert color="error" icon="warning" outlined>{{fetchError}}</v-alert>
    </div>

    <v-slide-y-transition group tag="ul" class="fee-list" v-show="!fetchError">
      <template
        v-for="lineItem in fees"
        >
        <li class="container fee-list__item"
          :key="lineItem.filingType"
          >
          <div class="fee-list__item-name">{{filingLabel ? filingLabel : lineItem.filingType}}</div>
          <div class="fee-list__item-value" v-if="lineItem.fee > 0">{{lineItem.fee}}</div>
          <div class="fee-list__item-value" v-else>No Fee</div>
        </li>
        <li class="container fee-list__item"
          v-if="lineItem.priorityFees"
          :key="lineItem.filingType+'-priority'"
          >
          <div class="fee-list__item-name pl-3">Priority Fee</div>
          <div class="fee-list__item-value">{{lineItem.priorityFees}}</div>
        </li>
        <li class="container fee-list__item"
          v-if="lineItem.futureEffectiveFees"
          :key="lineItem.filingType+'-futureEffective'"
          >
          <div class="fee-list__item-name pl-3">Future Effective Fee</div>
          <div class="fee-list__item-value">{{lineItem.futureEffectiveFees}}</div>
        </li>
        <li class="container fee-list__item"
          v-if="lineItem.serviceFees"
          :key="lineItem.filingType+'-transaction'"
          >
          <div class="fee-list__item-name pl-3">Service Fee</div>
          <div class="fee-list__item-value">{{lineItem.serviceFees}}</div>
        </li>
      </template>
    </v-slide-y-transition>

    <div class="container fee-total" v-show="!fetchError">
      <div class="fee-total__name">Total Fees</div>
      <div class="fee-total__currency">CAD</div>
      <div class="fee-total__value">
        <v-slide-y-reverse-transition name="slide" mode="out-in">
          <div>{{totalFilingFees}}</div>
        </v-slide-y-reverse-transition>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import '../plugins/vuetify'
import FeeServices from '../services/fee.services'
import { Fee, FilingData } from '../models'
import { computed, PropType, ref, watch } from 'vue'
const props = defineProps({
  /* This prop is an array of filing data. See model for details. */
  filingData: {
    type: Array as PropType<Array<FilingData>>,
    default: () => []
  },
  payURL: {
    type: String
  },
  filingLabel: {
    type: String
  }
})
const emit = defineEmits(['total-fee'])
const fees = ref<Fee[]>([])
const fetchError = ref<string>('')
const totalFilingFees = computed(() => fees.value.reduce((acc, fee) => acc + fee.total, 0))
watch(props.filingData, (newVal, oldVal) => {
  FeeServices.getFee(newVal, props.payURL)
    .then(data => {
      fetchError.value = ''
      fees.value = data
      emit('total-fee', totalFilingFees)
    })
    .catch((error: any) => {
      fetchError.value = 'Error fetching fees' + error
    })
}, { immediate: true })
</script>

<style lang="scss" scoped>
@import "../assets/scss/theme.scss";

header {
  color: #fff;
  background: $BCgovBlue5;
}

ul {
    padding: 0;
    list-style-type: none;
}

.container {
  display: flex;
  flex-flow: row nowrap;
  line-height: 1.2rem;
  font-size: 0.875rem;
}

.fee-list {
  border-bottom: 1px solid $gray3;
}

.fee-list__item {
  &-name, &-value {
    font-weight: 700;
  }

  &-name {
    flex: 1 1 auto;
    margin-right: 2rem;
  }

  &-value {
    flex: 0 0 auto;
    text-align: right;
  }
}

.fee-list__item + .fee-list__item {
  border-top: 1px solid $gray3;
}

.fee-total {
  align-items: center;
  letter-spacing: -0.01rem;
  line-height: auto;

  &__name {
    flex: 1 1 auto;
    margin-right: auto;
    font-weight: 700;
  }

  &__currency {
    margin-right: 0.5rem;
    color: $gray5;
    font-weight: 500;
  }

  &__value {
    font-size: 1.65rem;
    font-weight: 700;
  }
}
</style>
