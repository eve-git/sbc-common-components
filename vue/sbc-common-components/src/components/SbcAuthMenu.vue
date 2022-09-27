<template>
  <!-- Login Menu -->
  <v-card>
    <div>
      <v-card-title class="body-2 font-weight-bold">Select login method</v-card-title>
      <v-divider></v-divider>
    </div>
    <v-list
      tile
      dense
    >
      <v-list-item
        v-for="loginOption in loginOptions"
        :key="loginOption.idpHint"
        @click="login(loginOption.idpHint)"
        class="pr-6"
      >
        <v-list-item-icon left>
          <v-icon>{{loginOption.icon}}</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{loginOption.option}}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { LDClient } from 'launchdarkly-js-client-sdk'
import { Role, IdpHint, LoginSource, Pages } from '../util/constants'
import { UserSettings } from '../models/userSettings'
import AccountModule from '../store/modules/account'
import AuthModule from '../store/modules/auth'
import { KCUserProfile } from '../models/KCUserProfile'
import KeyCloakService from '../services/keycloak.services'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vue2-helpers/vuex'
import { useRouter } from 'vue2-helpers/vue-router'
import { redirectToPath } from '@/composables/navigation'

const accountStore = useStore<AccountModule>()
const authStore = useStore<AuthModule>()

const props = defineProps({
  redirectOnLoginSuccess: {
    type: String,
    default: ''
  },
  redirectOnLoginFail: {
    type: String,
    default: ''
  },
  inAuth: {
    type: Boolean
  },
  fromLogin: {
    type: Boolean
  }
})
const ldClient = ref<LDClient>(null)
const currentAccount = ref<UserSettings | null>(null)
const accountName = ref<string>('')
const currentLoginSource = computed<string>(() => authStore.getters.currentLoginSource)
const isAuthenticated = computed<boolean>(() => authStore.getters.isAuthenticated)

const loadUserInfo = () => accountStore.dispatch('loadUserInfo')
const syncAccount = () => accountStore.dispatch('syncAccount')
const syncUserProfile = () => accountStore.dispatch('syncUserProfile')
const syncWithSessionStorage = () => authStore.dispatch('syncWithSessionStorage')
const getCurrentUserProfile = async (isAuth: boolean) => accountStore.dispatch('getCurrentUserProfile', isAuth)
const updateUserProfile = () => accountStore.dispatch('updateUserProfile')

const loginOptions = [
  {
    idpHint: IdpHint.BCSC,
    option: 'BC Services Card',
    icon: 'mdi-account-card-details-outline'
  },
  {
    idpHint: IdpHint.BCEID,
    option: 'BCeID',
    icon: 'mdi-two-factor-authentication'
  },
  {
    idpHint: IdpHint.IDIR,
    option: 'IDIR',
    icon: 'mdi-account-group-outline'
  }
]

const isIDIR = computed(() => currentLoginSource.value === LoginSource.IDIR)
const isBceid = computed(() => currentLoginSource.value === LoginSource.BCEID)
const isBcscOrBceid = computed(() => currentLoginSource.value === LoginSource.BCSC || currentLoginSource.value === LoginSource.BCEID)

onMounted(async () => {
  syncWithSessionStorage()
  if (isAuthenticated.value) {
    loadUserInfo()
    syncAccount()
    await updateProfile()
    checkAccountStatus()
  }
})

watch(() => isAuthenticated.value, async (isAuth: boolean) => {
  if (isAuth) {
    await updateProfile()
  }
})

const updateProfile = async () => {
  if (isBceid.value) {
    await syncUserProfile()
  }
}

const goToCreateBCSCAccount = () => {
  redirectToPath(props.inAuth, Pages.CREATE_ACCOUNT)
}

const checkAccountStatus = () => {
  // redirect if account status is suspended
  if (currentAccount.value?.accountStatus && currentAccount.value?.accountStatus === 'NSF_SUSPENDED') {
    redirectToPath(props.inAuth, `${Pages.ACCOUNT_FREEZ}`)
  } else if (currentAccount.value?.accountStatus === 'PENDING_AFFIDAVIT_REVIEW') {
    redirectToPath(props.inAuth, `${Pages.PENDING_APPROVAL}/${accountName.value}/true`)
  }
}

const login = (idpHint: string) => {
  if (!props.fromLogin) {
    if (props.redirectOnLoginSuccess) {
      let url = encodeURIComponent(props.redirectOnLoginSuccess)
      url += props.redirectOnLoginFail ? `/${encodeURIComponent(props.redirectOnLoginFail)}` : ''
      window.location.assign(`${getContextPath.value}signin/${idpHint}/${url}`)
    } else {
      window.location.assign(`${getContextPath.value}signin/${idpHint}`)
    }
  } else {
    // Initialize keycloak session
    const kcInit = KeyCloakService.initializeKeyCloak(idpHint, authStore)
    kcInit.then(async (authenticated: boolean) => {
      if (authenticated) {
        // eslint-disable-next-line no-console
        console.info('[SignIn.vue]Logged in User. Init Session and Starting refreshTimer')
        // Set values to session storage
        await KeyCloakService.initSession()
        // tell KeycloakServices to load the user info
        const userInfo = await loadUserInfo()

        // update user profile
        await updateUserProfile()

        // sync the account if there is one
        await syncAccount()

        // if not from the sbc-auth, do the checks and redirect to sbc-auth
        if (!props.inAuth) {
          console.log('[SignIn.vue]Not from sbc-auth. Checking account status')
          // redirect to create account page if the user has no 'account holder' role
          const isRedirectToCreateAccount = (userInfo.roles.includes(Role.PublicUser) && !userInfo.roles.includes(Role.AccountHolder))

          const currentUser = await getCurrentUserProfile(props.inAuth)

          if ((userInfo?.loginSource !== LoginSource.IDIR) && !(currentUser?.userTerms?.isTermsOfUseAccepted)) {
            console.log('[SignIn.vue]Redirecting. TOS not accepted')
            redirectToPath(props.inAuth, Pages.USER_PROFILE_TERMS)
          } else if (isRedirectToCreateAccount) {
            console.log('[SignIn.vue]Redirecting. No Valid Role')
            switch (userInfo.loginSource) {
              case LoginSource.BCSC:
                redirectToPath(props.inAuth, Pages.CREATE_ACCOUNT)
                break
              case LoginSource.BCEID:
                redirectToPath(props.inAuth, Pages.CHOOSE_AUTH_METHOD)
                break
            }
          }
        }
      }
    }).catch(() => {
      if (props.redirectOnLoginFail) {
        window.location.assign(decodeURIComponent(props.redirectOnLoginFail))
      }
    })
  }
}

const getContextPath = computed(() => {
  const router = useRouter()
  let baseUrl = (router && (router as any)['history'] && (router as any)['history'].base) || ''
  baseUrl += (baseUrl.length && baseUrl[baseUrl.length - 1] !== '/') ? '/' : ''
  return baseUrl
})
</script>

<style lang="scss" scoped>
@import "../assets/scss/theme.scss";

.v-list--dense .v-subheader,
.v-list-item {
  padding-right: 1.25rem;
  padding-left: 1.25rem;
}

.v-list--dense .v-subheader,
.v-list--dense .v-list-item__title,
.v-list--dense .v-list-item__subtitle {
  font-size: 0.875rem !important;
}
</style>
