<template>
  <loading-screen :is-loading="isLoading"></loading-screen>
</template>
<script setup lang="ts">
import { Role, LoginSource, Pages } from '../util/constants'
import KeyCloakService from '../services/keycloak.services'
import LoadingScreen from './LoadingScreen.vue'
import AccountModule from '../store/modules/account'
import AuthModule from '../store/modules/auth'
import { KCUserProfile } from '../models/KCUserProfile'
import { useStore } from 'vue2-helpers/vuex'
import { onMounted, ref } from 'vue'
import { redirectToPath } from '@/composables/navigation'
const props = defineProps({
  idpHint: {
    type: String,
    default: 'bcsc'
  },
  redirectUrlLoginFail: {
    type: String,
    default: ''
  },
  inAuth: {
    type: Boolean
  }
})
const emit = defineEmits(['sync-user-profile-ready'])
const accountStore = useStore<AccountModule>()
const authStore = useStore<AuthModule>()
const isLoading = ref(true)
const loadUserInfo = (): KCUserProfile => accountStore.getters.loadUserInfo()
const syncAccount = async (): Promise<void> => accountStore.getters.syncAccount()
const getCurrentUserProfile = async (inAuth: boolean): Promise<KCUserProfile> =>
  accountStore.getters.getCurrentUserProfile(inAuth)
const updateUserProfile = async (): Promise<void> => accountStore.getters.updateUserProfile()
onMounted(async () => {
  // Initialize keycloak session
  const kcInit = KeyCloakService.initializeKeyCloak(props.idpHint, authStore)
  kcInit.then(async (authenticated: boolean) => {
    if (authenticated) {
      // eslint-disable-next-line no-console
      console.info('[SignIn.vue]Logged in User. Init Session and Starting refreshTimer')
      // Set values to session storage
      await KeyCloakService.initSession()
      // tell KeycloakServices to load the user info
      const userInfo = loadUserInfo()

      // update user profile
      await updateUserProfile()

      // sync the account if there is one
      await syncAccount()

      // if not from the sbc-auth, do the checks and redirect to sbc-auth
      if (!props.inAuth) {
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

      emit('sync-user-profile-ready')
    }
  }).catch(() => {
    if (props.redirectUrlLoginFail) {
      window.location.assign(decodeURIComponent(props.redirectUrlLoginFail))
    }
  })
})
</script>

<style lang="scss" scoped>
</style>
