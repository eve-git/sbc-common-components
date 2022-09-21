import ConfigHelper from '../util/config-helper'
import Axios from 'axios'
import type { AxiosResponse } from 'axios'
import type { Accounts } from '../models/account'
import { addAxiosInterceptors } from '../util/interceptors'
import type { Count } from '../models/member'
import type { UserSettings } from '../models/userSettings'

const axios = addAxiosInterceptors(Axios.create())

export default class AccountService {
  static getAccounts (): Promise<AxiosResponse<Accounts>> {
    return axios.get(`${ConfigHelper.getAuthAPIUrl()}/users/orgs`)
  }

  static getPendingMemberCount (accountId: number, currentUserSub: string): Promise<AxiosResponse<Count>> {
    return axios.get(`${ConfigHelper.getAuthAPIUrl()}/users/${currentUserSub}/org/${accountId}/notifications`)
  }

  static getUserSettings (currentUserSub: string): Promise<AxiosResponse<UserSettings[]>> {
    return axios.get(`${ConfigHelper.getAuthAPIUrl()}/users/${currentUserSub}/settings`)
  }
}
