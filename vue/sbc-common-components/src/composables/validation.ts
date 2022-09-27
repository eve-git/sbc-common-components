import { useVuelidate } from '@vuelidate/core'

export const v$ = useVuelidate().value

/**
 * Composable that provides some useful validation utilities.
 */
/**
 * Creates a Vuetify rules object from the Vuelidate state.
 * @param model The name of the model we are validating.
 * @returns A Vuetify rules object.
 */
export const createVuetifyRulesObject = (model: string): { [attr: string]: Array<Function> } => {
  let obj = {
    streetAddress: [],
    streetAddressAdditional: [],
    addressCity: [],
    addressRegion: [],
    postalCode: [],
    addressCountry: [],
    deliveryInstructions: []
  }

  // ensure Vuelidate state object is initialized
  if (v$ && v$[model]) {
    // iterate over Vuelidate object properties
    Object.keys(v$[model])
      // only look at validation properties
      .filter(prop => prop.charAt(0) !== '$')
      .forEach(prop => {
        // create array for each validation property
        obj[prop] = []
        // iterate over validation property params
        Object.keys(v$[model][prop].$params)
          .forEach(param => {
            // add specified validation functions to array
            switch (param) {
              case 'required': obj[prop].push(() => requiredRule(model, prop)); break
              case 'minLength': obj[prop].push(() => minLengthRule(model, prop)); break
              case 'maxLength': obj[prop].push(() => maxLengthRule(model, prop)); break
              case 'isCanada': obj[prop].push(() => isCanadaRule(model, prop)); break
              case 'isBC': obj[prop].push(() => isBCRule(model, prop)); break
              // FUTURE: add extra validation functions here
              default: break
            }
          })
      })
  }

  // sample return object
  // streetAddress: [
  //   () => this.requiredRule('addressLocal', 'streetAddress'),
  //   () => this.minLengthRule('addressLocal', 'streetAddress'),
  //   () => this.maxLengthRule('addressLocal', 'streetAddress')
  // ],
  // ...

  return obj
}

/**
 * Misc Vuetify rules.
 * @param prop The name of the property object to validate.
 * @param key The name of the property key (field) to validate.
 * @returns True if the rule passes, otherwise an error string.
 */
const requiredRule = (prop: string, key: string): boolean | string => {
  return Boolean(v$[prop] && v$[prop][key].required) || 'This field is required'
}

const minLengthRule = (prop: string, key: string): boolean | string => {
  const min = v$[prop][key].$params.minLength.min
  return Boolean(v$[prop] && v$[prop][key].minLength) || `Minimum length is ${min}`
}

const maxLengthRule = (prop: string, key: string): boolean | string => {
  const max = v$[prop][key].$params.maxLength.max
  return Boolean(v$[prop] && v$[prop][key].maxLength) || `Maximum length is ${max}`
}

// FUTURE: generalize this rule to take a validation parameter (ie, 'CA')
const isCanadaRule = (prop: string, key: string): boolean | string => {
  return Boolean(v$[prop] && v$[prop][key].isCanada) || `Address must be in Canada`
}

// FUTURE: generalize this rule to take a validation parameter (ie, 'BC')
const isBCRule = (prop: string, key: string): boolean | string => {
  return Boolean(v$[prop] && v$[prop][key].isBC) || `Address must be in BC`
}
