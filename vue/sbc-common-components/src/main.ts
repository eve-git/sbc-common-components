import '@mdi/font/css/materialdesignicons.min.css' // icon library (https://materialdesignicons.com/)
import { createRouter, createWebHistory } from 'vue-router'
import { createApp } from 'vue'

import App from './App.vue'
import { vuetify } from './plugins/vuetify'

const routes = [
  {
      path: '/',
      name: 'Home',
      component: {}
  }
]

async function start() {
  const app = createApp(App)
  const router = createRouter({ history: createWebHistory(), routes })
  // TODO add store.
  app.use(router).use(vuetify).mount('#app')
}

start().catch(error => {
  console.error(error) // eslint-disable-line no-console
  alert(
    'There was an error starting this page. (See console for details.)\n' +
    'Please try again later.'
  )
})
