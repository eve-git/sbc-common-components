import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import AccountService from '../../services/account.services'
import type { Member } from '../../models/member'
import type { UserSettings } from '../../models/userSettings'
import type { KCUserProfile } from '../../models/KCUserProfile'
import KeyCloakService from '../../services/keycloak.services'
import ConfigHelper from '../../util/config-helper'
import { SessionStorageKeys, LoginSource, Role } from '../../util/constants'
import UserService from '../../services/user.services'
import { getAccountIdFromCurrentUrl } from '../../util/common-util'
import { defineStore } from 'pinia'

interface AccountState {
  userSettings: UserSettings[]
  currentAccount: UserSettings | null,
  currentAccountMembership: Member | null,
  pendingApprovalCount: number,
  currentUser: KCUserProfile | null
}


export const useAccountStore = defineStore('account', {
  state: (): AccountState => ({
    userSettings: [],
    currentAccount: null,
    currentAccountMembership: null,
    pendingApprovalCount: 0,
    currentUser: null
  }),
  getters: {
    accountName: (state) => state.currentAccount && state.currentAccount.label,
    switchableAccounts: (state) => state.userSettings.filter(userSetting => userSetting.type === 'ACCOUNT'),
    userName: (state) => `${state.currentUser?.firstName || '-'} ${state.currentUser?.lastName || ''}`
  },
  actions: {
    setCurrentAccount(userSetting: UserSettings) {
      ConfigHelper.addToSession(SessionStorageKeys.CurrentAccount, JSON.stringify(userSetting))
      this.currentAccount = userSetting
    },
    loadUserInfo() { this.currentUser = KeyCloakService.getUserInfo() },
    async syncUserSettings (currentAccountId: string) {
      
    }
  }
})


  
  @Action({ rawError: true, commit: 'setUserSettings' })
  public async syncUserSettings (currentAccountId: string): Promise<UserSettings[]> {
    const response = await AccountService.getUserSettings(this.currentUser?.keycloakGuid)
    if (response?.data) {
      const orgs = response.data.filter(userSettings => (userSettings.type === 'ACCOUNT'))
      const currentAccount = orgs.find(org => String(org.id) === currentAccountId)
      // if passed account is not user account list setting first one as current account
      this.context.commit('setCurrentAccount', currentAccount || orgs[0])
      if (this.currentUser?.loginSource === LoginSource.BCSC || this.currentUser.roles.includes(Role.GOVMAccountUser)) {
        await this.context.dispatch('fetchPendingApprovalCount')
      }
      return orgs
    }
    return []
  }

  @Action({ rawError: true, commit: 'setPendingApprovalCount' })
  public async fetchPendingApprovalCount (): Promise<number> {
    if (this.context.rootState.account?.currentAccount?.id) {
      const response = await AccountService.getPendingMemberCount(this.context.rootState.account.currentAccount.id, this.currentUser?.keycloakGuid)
      return (response && response.data && response.data.count) || 0
    } else {
      return 0
    }
  }

  @Action({ rawError: true, commit: 'setCurrentAccount' })
  public async syncCurrentAccount (userSetting: UserSettings): Promise<UserSettings> {
    return userSetting
  }

  @Action({ rawError: true, commit: 'setCurrentUser' })
  public async syncUserProfile () {
    // TODO improve the logic of not fetching the first name last name every time of header mounted
    const response = await UserService.getUserProfile('@me')
    if (response && response.data) {
      const userProfile = response.data
      // update the first name and last name for the users
      const updateProfile:KCUserProfile = {
        ...this.currentUser,
        lastName: response.data.lastname,
        firstName: userProfile.firstname
      }
      return updateProfile
    }
  }

  @Action({ rawError: true })
  public async getCurrentUserProfile (isAuth: boolean = false) {
    try {
      const response = await UserService.getUserProfile('@me')
      const userProfile = response?.data || {}
      if (isAuth) {
        this.context.commit('user/setUserProfile', userProfile, { root: true })
      }
      return userProfile
    } catch (error) {
      // for handling the 404 while first time user login in dir search
      // redirect to auth-web for first time logins from other apps, even if user is 404
      // @ts-ignore - allow response of error
      console.error('Error: ', error?.response)
    }
  }

  @Action({ rawError: true })
  public async syncAccount () {
    function getLastAccountId (): string {
      const currentAccount = getAccountIdFromCurrentUrl()
      let pathList = window.location.pathname.split('/')
      let indexOfAccount = pathList.indexOf('account')
      let nextValAfterAccount = indexOfAccount > 0 ? pathList[indexOfAccount + 1] : ''
      let orgIdFromUrl = isNaN(+nextValAfterAccount) ? '' : nextValAfterAccount
      const storageAccountId = currentAccount || JSON.parse(ConfigHelper.getFromSession(SessionStorageKeys.CurrentAccount) || '{}').id
      return orgIdFromUrl || String(storageAccountId || '') || ''
    }

    if (!this.currentUser.roles.includes(Role.Staff)) {
      const lastUsedAccount = getLastAccountId()
      if (this.currentUser?.keycloakGuid) {
        await this.syncUserSettings(lastUsedAccount)

        ConfigHelper.addToSession(SessionStorageKeys.CurrentAccount, JSON.stringify(this.currentAccount || ''))
      }
    }
  }

  @Action({ rawError: true })
  public async updateUserProfile () {
    await UserService.updateUserProfile()
  }
}
