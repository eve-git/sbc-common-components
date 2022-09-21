import * as countries from 'country-list/data.json'
import * as provinces from 'provinces/provinces.json'

/**
 * Composable that allows VM access to useful country/province data and functions.
 * @link https://www.npmjs.com/package/country-list
 * @lint https://www.npmjs.com/package/provinces
 */
/**
 * Helper function to return a list of countries.
 * @returns An array of country objects, sorted alphabetically.
 */
const getCountries = (): Array<object> => {
  return countries.sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0)
}

/**
 * Helper function to return a list of provinces.
 * @returns An array of country objects, sorted alphabetically.
 */

const getProvinces = (): Array<object> => {
  return provinces.sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0)
}

/**
 * Helper function to return a country's name.
 * @param code The short code of the country.
 * @returns The long name of the country.
 */
const getCountryName = (code: string): string => {
  if (!code) return null
  if (window['countryNameCache'][code]) return window['countryNameCache'][code]
  const country = window['countries'].find(c => c.code === code)
  const result = country ? country.name : null
  window['countryNameCache'][code] = result
  return result
}

/**
 * Helper function to return a country's list of provinces.
 * @param code The short code of the country.
 * @returns An array of province objects, sorted alphabetically.
 */
const getCountryRegions = (code: string): Array<object> => {
  if (!code) return null
  if (window['countryRegionsCache'][code]) return window['countryRegionsCache'][code]
  const result = window['provinces']
    .filter(p => p.country === code)
    .map(p => ({
      name: p.english || p.name,
      short: (p.short && p.short.length <= 2) ? p.short : '--'
    }))
  window['countryRegionsCache'][code] = result
  return result
}
