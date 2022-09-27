//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

<template>
  <div class="base-address">
    <!-- Display fields -->
    <v-expand-transition>
      <div v-if="!editing" class="address-block">
        <div class="address-block__info pre-line">
          <div class="address-block__info-row street-address">
            {{ addressLocal.streetAddress }}
          </div>

          <div class="address-block__info-row street-address-additional">
            {{ addressLocal.streetAddressAdditional }}
          </div>

          <div class="address-block__info-row">
            <span class="address-city">{{ addressLocal.addressCity }}</span>

            <template v-if="addressLocal.addressRegion">
              <span class="address-region">&nbsp;{{ addressLocal.addressRegion }}</span>
            </template>

            <template v-if="addressLocal.postalCode">
              <span class="postal-code">&nbsp;{{ addressLocal.postalCode }}</span>
            </template>
          </div>

          <div class="address-block__info-row address-country">
            {{ getCountryName(addressCountry) }}
          </div>

          <template v-if="addressLocal.deliveryInstructions">
            <div class="address-block__info-row delivery-instructions mt-5 font-italic">
              {{ addressLocal.deliveryInstructions }}
            </div>
          </template>
        </div>
      </div>
    </v-expand-transition>

    <!-- Edit fields -->
    <v-expand-transition>
      <v-form v-if="editing" ref="addressForm" name="address-form" lazy-validation>
        <div class="form__row">
          <!-- NB1: AddressComplete needs to be enabled each time user clicks in this search field.
               NB2: Only process first keypress -- assumes if user moves between instances of this
                   component then they are using the mouse (and thus, clicking). -->
          <v-text-field autocomplete="chrome-off"
                        :name="Math.random()"
                        filled
                        class="street-address"
                        :hint="streetAddressHint"
                        persistent-hint
                        :id="streetAddressId"
                        :label="streetAddressLabel"
                        v-model="addressLocal.streetAddress"
                        :rules="[...rules.streetAddress, ...spaceRules]"
                        @keypress.once="enableAddressComplete()"
                        @click="enableAddressComplete()"
          />
        </div>
        <div class="form__row">
          <v-textarea auto-grow
                      filled
                      class="street-address-additional"
                      :label="streetAddressAdditionalLabel"
                      rows="1"
                      v-model="addressLocal.streetAddressAdditional"
                      :rules="[...rules.streetAddressAdditional, ...spaceRules]"
          />
        </div>
        <div class="form__row three-column">
          <v-text-field filled
                        class="item address-city"
                        :label="addressCityLabel"
                        v-model="addressLocal.addressCity"
                        :rules="[...rules.addressCity, ...spaceRules]"
          />
          <v-select v-if="useCountryRegions(addressCountry)"
                    filled
                    class="item address-region"
                    :menu-props="{maxHeight:'40rem'}"
                    :label="addressRegionLabel"
                    item-text="name"
                    item-value="short"
                    v-model="addressLocal.addressRegion"
                    :items="getCountryRegions(addressCountry)"
                    :rules="[...rules.addressRegion, ...spaceRules]"
          />
          <v-text-field v-else
                        filled
                        class="item address-region"
                        :label="addressRegionLabel"
                        v-model="addressLocal.addressRegion"
                        :rules="[...rules.addressRegion, ...spaceRules]"
          />
          <v-text-field filled
                        class="item postal-code"
                        :label="postalCodeLabel"
                        v-model="addressLocal.postalCode"
                        :rules="[...rules.postalCode, ...spaceRules]"
          />
        </div>
        <div class="form__row">
          <v-select filled
                    class="address-country"
                    :label="addressCountryLabel"
                    menu-props="auto"
                    item-text="name"
                    item-value="code"
                    v-model="addressLocal.addressCountry"
                    :items="getCountries()"
                    :rules="[...rules.addressCountry, ...spaceRules]"
          />
          <!-- special field to select AddressComplete country, separate from our model field -->
          <input type="hidden" :id="addressCountryId" :value="addressCountry" />
        </div>
        <div class="form__row">
          <v-textarea auto-grow
                      filled
                      class="delivery-instructions"
                      :label="deliveryInstructionsLabel"
                      rows="2"
                      v-model="addressLocal.deliveryInstructions"
                      :rules="[...rules.deliveryInstructions, ...spaceRules]"
          />
        </div>
      </v-form>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import Vue, { computed, PropType, ref, watch } from 'vue'
import { uniqueId as loUniqueId } from 'lodash'
import { required, email } from '@vuelidate/validators'
import { getCountries, getCountryRegions, getCountryName } from '@/composables/countries-provinces'
import { createVuetifyRulesObject, v$ } from '@/composables/validation'

/**
 * The component for displaying and editing an address.
 * Vuelidate is used to implement the validation rules (eg, what 'required' means and whether it's satisfied).
 * Vuetify is used to display any validation errors/styling.
 * Optionally uses Canada Post AddressComplete (aka Postal Code Anywhere - PCA) for address lookup.
 */
/**
 * The validation object used by Vuelidate to compute address model validity.
 * @returns the Vuelidate validations object
 */
// @Validation() TODO fix
// https://vuelidate-next.netlify.app/#alternative-syntax-composition-api
// const v$ = useVuelidate(rules, state)
const validations = () => {
  return { addressLocal: { ...schemaLocal.value } }
}

const props = defineProps({
  /**
   * The address to be displayed/edited.
   * Default is "empty address" in case parent doesn't provide it (eg, for new address).
   */
  address:
  {
    type: Object as PropType<Address>,
    default: () => {
      return {
        streetAddress: '',
        streetAddressAdditional: '',
        addressCity: '',
        addressRegion: '',
        postalCode: '',
        addressCountry: 'CA',
        deliveryInstructions: ''
      }
    }
  },
  /** Whether the address should be shown in editing mode (true) or display mode (false). */
  editing: {
    type: Boolean,
    default: false
  },
  /** The address schema containing Vuelidate rules. */
  schema: {
    type: Object,
    default: null
  },
  noPoBox: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:address', 'valid'])

/** HTML element */
const addressForm = ref<HTMLFormElement>(null)

/** A local (working) copy of the address, to contain the fields edited by the component (ie, the model). */
const addressLocal = ref<Address>()

/** A local (working) copy of the address schema. */
const schemaLocal = ref({})

/** A unique id for this instance of this component. */
const uniqueId = ref(loUniqueId())

/** A unique id for the Street Address input. */
const streetAddressId = (): string => {
  return `street-address-${uniqueId.value}`
}

/** A unique id for the Address Country input. */
const addressCountryId = (): string => {
  return `address-country-${uniqueId.value}`
}

/** The Address Country, to simplify the template and so we can watch it below. */
const addressCountry = computed<string>(() => addressLocal.value.addressCountry)

/** The Street Address Additional label with 'optional' as needed. */
const streetAddressAdditionalLabel = computed<string>(() => {
  return 'Additional Street Address' + (isSchemaRequired('streetAddressAdditional') ? '' : ' (Optional)')
})

/** The Street Address label with 'optional' as needed. */
const streetAddressLabel = computed<string>(() => {
  return 'Street Address' + (isSchemaRequired('streetAddress') ? '' : ' (Optional)')
})

/** The Address City label with 'optional' as needed. */
const addressCityLabel = computed<string>(() => {
  return 'City' + (isSchemaRequired('addressCity') ? '' : ' (Optional)')
})

/** The Address Region label with 'optional' as needed. */
const addressRegionLabel = computed<string>(() => {
  let label: string
  let required = isSchemaRequired('addressRegion')

  // NB: make region required for Canada and USA
  if (addressLocal.value.addressCountry === 'CA') {
    label = 'Province'
    required = true
  } else if (addressLocal.value.addressCountry === 'US') {
    label = 'State'
    required = true
  } else {
    label = 'Province/State'
  }

  return label + (required ? '' : ' (Optional)')
})

/** The Postal Code label with 'optional' as needed. */
const postalCodeLabel = computed<string>(() => {
  let label: string
  if (addressLocal.value.addressCountry === 'US') {
    label = 'Zip Code'
  } else {
    label = 'Postal Code'
  }
  return label + (isSchemaRequired('postalCode') ? '' : ' (Optional)')
})

/** The Address Country label with 'optional' as needed. */
const addressCountryLabel = computed<string>(() => {
  return 'Country' + (isSchemaRequired('addressCountry') ? '' : ' (Optional)')
})

/** The Delivery Instructions label with 'optional' as needed. */
const deliveryInstructionsLabel = computed<string>(() => {
  return 'Delivery Instructions' + (isSchemaRequired('deliveryInstructions') ? '' : ' (Optional)')
})

const streetAddressHint = computed<string>(() => {
  return props.noPoBox ? 'Address cannot be a PO Box' : ''
})

/** Whether the specified prop is required according to the schema. */
const isSchemaRequired = (prop: string): boolean => {
  return Boolean(schemaLocal.value && schemaLocal.value[prop] && schemaLocal.value[prop].required)
}

/** Array of validation rules used by input elements to prevent extra whitespace. */
const spaceRules: Array<Function> = [
  v => !/^\s/g.test(v) || 'Invalid spaces', // leading spaces
  v => !/\s$/g.test(v) || 'Invalid spaces', // trailing spaces
  v => !/\s\s/g.test(v) || 'Invalid word spacing' // multiple inline spaces
]

/**
 * The Vuetify rules object. Used to display any validation errors/styling.
 * NB: As a getter, this is initialized between created() and mounted().
 * @returns the Vuetify validation rules object
 */
const rules = computed<{ [attr: string]: Array<Function> }>(() => {
  return createVuetifyRulesObject('addressLocal')
})

/** Emits an update message for the address prop, so that the caller can ".sync" with it. */
const emitAddress = (address: object): void => {
  emit('update:address', address)
}

/** Emits the validity of the address entered by the user. */
const emitValid = (valid: boolean): void => {
  emit('valid', valid)
}

/**
 * Watches changes to the Schema object, so that if the parent changes the data, then
 * the working copy of it is updated.
 */
watch(() => props.schema, (newSchema: object) => {
  schemaLocal.value = { ...newSchema }
}, { deep: true, immediate: true })

/**
 * Watches changes to the Address object, so that if the parent changes the data, then
 * the working copy of it is updated.
 */
watch(() => props.address, (newAddress: object) => {
  addressLocal.value = { ...newAddress as Address }
}, { deep: true, immediate: true })

/**
 * Watches changes to the Address Country and updates the schema accordingly.
 */
watch(() => addressCountry.value, (newAddressCountry: string) => {
  // skip this if component is called without a schema (eg, display mode)
  if (props.schema) {
    if (useCountryRegions(addressLocal.value.addressCountry)) {
      // we are using a region list for the current country so make region a required field
      const addressRegion = { ...props.schema.addressRegion, required }
      // re-assign the local schema because Vue does not detect property addition
      schemaLocal.value = { ...props.schema, addressRegion }
    } else {
      // we are not using a region list for the current country so remove required property
      const { required, ...addressRegion } = props.schema.addressRegion
      // re-assign the local schema because Vue does not detect property deletion
      schemaLocal.value = { ...props.schema, addressRegion }
    }
  }
})
/**
 * Watches changes to the Address Local object, to catch any changes to the fields within the address.
 * Will notify the parent object with the new address and whether or not the address is valid.
 */
watch(() => addressLocal.value, (newAddress: object) => {
  emitAddress(newAddress)
  emitValid(!v$.$invalid)
}, { deep: true, immediate: true })

/**
 * Determines whether to use a country's known regions (ie, provinces/states).
 * @param code the short code of the country
 * @returns whether to use v-select (true) or v-text-field (false) for input
 */
const useCountryRegions = (code: string): boolean => {
  return (code === 'CA' || code === 'US')
}

/** Enables AddressComplete for this instance of the address. */
const enableAddressComplete = (): void => {
  // If you want to use this component with the Canada Post AddressComplete service:
  // 1. The AddressComplete JavaScript script (and stylesheet) must be loaded.
  // 2. Your AddressComplete account key must be defined.
  const pca = window['pca']
  const key = window['addressCompleteKey']
  if (!pca || !key) {
    // eslint-disable-next-line no-console
    console.log('AddressComplete not initialized due to missing script and/or key')
    return
  }

  // Destroy the old object if it exists, and create a new one.
  if (window['currentAddressComplete']) {
    window['currentAddressComplete'].destroy()
  }
  window['currentAddressComplete'] = createAddressComplete(pca, key)
}

/**
 * Creates the AddressComplete object for this instance of the component.
 * @param pca the Postal Code Anywhere object provided by AddressComplete
 * @param key the key for the Canada Post account that is to be charged for lookups
 * @returns an object that is a pca.Address instance
 */
const createAddressComplete = (pca, key: string): object => {
  // Set up the two fields that AddressComplete will use for input.
  // Ref: https://www.canadapost.ca/pca/support/guides/advanced
  // Note: Use special field for country, which user can't click, and which AC will overwrite
  //       but that we don't care about.
  const fields = [
    { element: streetAddressId, field: 'Line1', mode: pca.fieldMode.SEARCH },
    { element: addressCountryId, field: 'CountryName', mode: pca.fieldMode.COUNTRY }
  ]
  const options = { key }

  const addressComplete = new pca.Address(fields, options)

  // The documentation contains sample load/populate callback code that doesn't work, but this will. The side effect
  // is that it breaks the autofill functionality provided by the library, but we really don't want the library
  // altering the DOM because Vue is already doing so, and the two don't play well together.
  addressComplete.listen('populate', addressCompletePopulate)

  return addressComplete
}

/**
 * Callback to update the address data after the user chooses a suggested address.
 * @param address the data object returned by the AddressComplete Retrieve API
 */
const addressCompletePopulate = (address: object): void => {
  const newAddressLocal: Address = {}

  newAddressLocal.streetAddress = address['Line1'] || 'N/A'
  // Combine extra address lines into Street Address Additional field.
  newAddressLocal.streetAddressAdditional = combineLines(
    combineLines(address['Line2'], address['Line3']),
    combineLines(address['Line4'], address['Line5'])
  )
  newAddressLocal.addressCity = address['City']
  if (useCountryRegions(address['CountryIso2'])) {
    // In this case, v-select will map known province code to province name
    // or v-select will be blank and user will have to select a known item.
    newAddressLocal.addressRegion = address['ProvinceCode']
  } else {
    // In this case, v-text-input will allow manual entry but province info is probably too long
    // so set region to null and add province name to the Street Address Additional field.
    // If length is excessive, user will have to fix it.
    newAddressLocal.addressRegion = null
    newAddressLocal.streetAddressAdditional = combineLines(
      newAddressLocal.streetAddressAdditional, address['ProvinceName']
    )
  }
  newAddressLocal.postalCode = address['PostalCode']
  newAddressLocal.addressCountry = address['CountryIso2']

  // re-assign the local address to force Vuetify update
  addressLocal.value = newAddressLocal

  // Validate the form, in case any fields are missing or incorrect.
  Vue.nextTick(() => { (addressForm as any).validate() }) // TODO not sure if this works
}

const combineLines = (line1: string, line2: string) => {
  if (!line1) return line2
  if (!line2) return line1
  return line1 + '\n' + line2
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/theme.scss";

// Address Block Layout
.address-block {
  display: flex;
}

.address-block__info {
  flex: 1 1 auto;
}

// Form Row Elements
.form__row.three-column {
  align-items: stretch;
  display: flex;
  flex-flow: row nowrap;
  margin-left: -0.5rem;
  margin-right: -0.5rem;

  .item {
    flex: 1 1 auto;
    flex-basis: 0;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
}

.pre-line {
  white-space: pre-line;
}

// make 'readonly' inputs looks disabled
// (can't use 'disabled' because we want normal error styling)
.v-select.v-input--is-readonly,
.v-text-field.v-input--is-readonly {
  pointer-events: none;

  :deep(.v-label) {
    // set label colour to same as disabled
    color: rgba(0,0,0,.38);
  }

  :deep(.v-select__selection) {
    // set selection colour to same as disabled
    color: rgba(0,0,0,.38);
  }

  :deep(.v-icon) {
    // set error icon colour to same as disabled
    color: rgba(0,0,0,.38) !important;
    opacity: 0.6;
  }
}
</style>
