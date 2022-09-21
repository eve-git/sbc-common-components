import type { ServiceStatus } from '../../models/ServiceStatus'
import StatusService from '../../services/status.services'

export const fetchPaySystemStatus = async () => {
  const response = await StatusService.getServiceStatus('PAYBC')
   return response && response.data || null
}
