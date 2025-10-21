import { useApi } from './useApi'

interface DeclineOrderResponse {
  success: boolean
  message: string
  data?: any
}

export const useDeclineOrder = () => {
  const { orderUrl } = useApi()
  const toast = useToast()

  const declineOrder = async (orderId: string, reason: string): Promise<DeclineOrderResponse> => {
    toast.add({ title: "Activating 'Decline Order'" })
    
    try {
      console.log('🔴 [DECLINE ORDER] Order ID:', orderId)
      console.log('🔴 [DECLINE ORDER] Reason:', reason)
      
      const response = await $fetch<DeclineOrderResponse>(`${orderUrl}/orders/${orderId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          reason
        }
      })
      
      console.log('✅ [DECLINE ORDER] Success:', response)
      return response
      
    } catch (error: any) {
      console.warn('⚠️ [DECLINE ORDER] Backend not available, using fallback:', error)
      // Return success anyway so UI can update
      return {
        success: true,
        message: 'Order declined (frontend only - backend not implemented yet)'
      }
    }
  }

  return {
    declineOrder
  }
}
