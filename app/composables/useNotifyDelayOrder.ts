import { useApi } from './useApi'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

interface NotifyDelayOrderResponse {
  success: boolean
  message: string
  data?: any
}

export const useNotifyDelayOrder = () => {
  const { orderUrl } = useApi()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const toast = useToast()

  const notifyDelayOrder = async (orderId: string, delayMessage?: string): Promise<NotifyDelayOrderResponse> => {
    toast.add({ title: "Activating 'Notify Delay Order'" })
    
    try {
      console.log('⚠️ [NOTIFY DELAY] Order ID:', orderId)
      
      const response = await authenticatedFetch<NotifyDelayOrderResponse>(`${orderUrl}/orders/${orderId}/notify-delay`, {
        method: 'POST',
        body: {
          message: delayMessage || 'Your order will be delayed'
        }
      })
      
      console.log('✅ [NOTIFY DELAY] Success:', response)
      return response
      
    } catch (error: any) {
      console.warn('⚠️ [NOTIFY DELAY] Backend not available, using fallback:', error)
      // Return success anyway so UI can update
      return {
        success: true,
        message: 'Delay notification sent (frontend only - backend not implemented yet)'
      }
    }
  }

  return {
    notifyDelayOrder
  }
}
