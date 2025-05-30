export enum SessionStorageKeys {
  KeyCloakToken = 'KEYCLOAK_TOKEN',
  KeyCloakRefreshToken = 'KEYCLOAK_REFRESH_TOKEN',
  KeyCloakIdToken = 'KEYCLOAK_ID_TOKEN',
  ApiConfigKey = 'AUTH_API_CONFIG',
  PreventStorageSync = 'PREVENT_STORAGE_SYNC',
  LaunchDarklyFlags = 'LD_FLAGS',
  CurrentAccount = 'CURRENT_ACCOUNT',
  AuthApiUrl = 'AUTH_API_URL',
  AuthWebUrl = 'AUTH_WEB_URL',
  StatusApiUrl = 'STATUS_API_URL',
  WhatsNew = 'WHATS_NEW',
  SessionSynced = 'SESSION_SYNCED',
  RegistryHomeUrl = 'REGISTRY_HOME_URL',
  NameRequestUrl = 'NAME_REQUEST_URL',
  PprWebUrl = 'PPR_WEB_URL',
  SiteminderLogoutUrl = 'SITEMINDER_LOGOUT_URL'
}

export enum Account {
  ANONYMOUS = 'ANONYMOUS',
  PREMIUM = 'PREMIUM',
  BASIC = 'BASIC',
  SBC_STAFF = 'SBC_STAFF',
  STAFF = 'STAFF'
}

export enum IdpHint {
  BCROS = 'bcros',
  IDIR = 'idir',
  BCSC = 'bcsc',
  BCEID = 'bceid'
}

export enum LoginSource {
  BCROS = 'BCROS',
  IDIR = 'IDIR',
  BCSC = 'BCSC',
  BCEID = 'BCEID'
}

export enum Role {
  AccountHolder = 'account_holder',
  PublicUser = 'public_user',
  Staff = 'staff',
  GOVMAccountUser = 'gov_account_user'
}

export enum Pages {
  HOME = 'home',
  USER_PROFILE = 'userprofile',
  ACCOUNT = 'account',
  SETTINGS = 'settings',
  SIGNIN = 'signin',
  USER_PROFILE_TERMS = 'userprofileterms',
  CREATE_ACCOUNT = 'setup-account',
  CHOOSE_AUTH_METHOD = 'choose-authentication-method',
  NON_BCSC_INSTRUCTIONS = 'nonbcsc-info/instructions',
  ACCOUNT_FREEZ = 'account-freeze',
  PENDING_APPROVAL = 'pendingapproval',
  ACCOUNT_SWITCHING = 'account-switching',
  REGISTRY_DASHBOARD = 'dashboard'
}

export const ALLOWED_URIS_FOR_PENDING_ORGS: string[] = ['setup-non-bcsc-account', 'signout']

export const ACCOUNT_ID = 'accountid'

export enum LDFlags {
  AuthLearnMore = 'auth-options-learn-more',
  PaymentTypeAccountCreation = 'payment-type-in-account-creation',
  LinkToNewNameRequestApp ='link-to-new-name-request-app',
  EnableMandatoryAddress = 'enable-mandatory-address',
  EnableGovmInvite = 'enable-govm-account-invite',
  HideProductPackage = 'hide-product-packages',
  EnableOrgNameAutoComplete = 'enable-org-name-auto-complete',
  IaSupportedEntities = 'ia-supported-entities',
  EnableFasDashboard = 'enable-fas-dashboard',
  DisableGovNAccountCreation='disable-govn-account',
  EnableBcCccUlc = 'enable-bc-ccc-ulc',
  ProductBusSearchStatus = 'product-BUSINESS_SEARCH-status',
  ProductBusSearchPremTooltip = 'product-BUSINESS_SEARCH-prem-tooltip',
  ProductCSOStatus = 'product-CSO-status',
  ProductWillsStatus = 'product-VS-status',
  ProductSiteRegistryStatus = 'product-ESRA-status',
  ProductBCAStatus = 'product-BCA-status',
  BusSearchLink = 'bus-search-staff-link',
  EnableDetailsFilter = 'enable-transactions-detail-filter',
  SentryEnable = 'sentry-enable',
  BannerText = 'banner-text'
}
