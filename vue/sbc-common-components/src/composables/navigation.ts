import { useRouter } from 'vue2-helpers/vue-router'
import ConfigHelper from '@/util/config-helper'

export const redirectInTriggeredApp = (routePath: string) => {
  const router = useRouter()
  const resolvedRoutes = router.resolve({ path: `/${routePath}` })
  if (resolvedRoutes.resolved.matched.length > 0) {
    router.push(`/${routePath}`)
  } else {
    // navigate to auth app if route is not found in the triggered app
    window.location.assign(`${ConfigHelper.getAuthContextPath()}/${routePath}`)
  }
}

export const redirectToPath = (inAuth: boolean, routePath: string) => {
  if (inAuth) {
    redirectInTriggeredApp(routePath)
  } else {
    window.location.assign(`${ConfigHelper.getAuthContextPath()}/${routePath}`)
  }
}
