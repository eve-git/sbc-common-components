export interface NavigationBarConfig {
  titleItem: NavigationMenuItem,
  menuItems: NavigationMenuItem[]
}

export interface NavigationMenuItem {
  name: string;
  url: string;
  mdiIcon?: string;
  meta: NavigationMenuItemMetaConfig
  icon?: string
}

export interface NavigationMenuItemMetaConfig {
  requiresAuth: boolean
  requiresAccount: boolean
}
