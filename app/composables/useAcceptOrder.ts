import { useApi } from './useApi'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

interface AcceptOrderResponse {
  success: boolean
  message: string
  data?: any
}

export const useAcceptOrder = () => {
  const { orderUrl } = useApi()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const toast = useToast()

  const acceptOrder = async (orderId: string): Promise<AcceptOrderResponse> => {
    toast.add({ title: "Activating 'Accept Order'" })
    
    try {
      console.log('🟢 [ACCEPT ORDER] Order ID:', orderId)
      
      const response = await authenticatedFetch<any>(`${orderUrl}/make-order-pending/${orderId}`, {
        method: 'POST'
      })
      
      console.log('✅ [ACCEPT ORDER] Success:', response)
      toast.add({ 
        title: "Zamówienie zaakceptowane",
        description: "Zamówienie zostało przeniesione do realizacji",
        color: 'success'
      })
      return {
        success: true,
        message: response.message || 'Order moved to pending orders',
        data: response
      }
      
    } catch (error: any) {
      console.error('❌ [ACCEPT ORDER] Error:', error)
      toast.add({ 
        title: "Błąd",
        description: "Nie udało się zaakceptować zamówienia",
        color: 'error'
      })
      throw error
    }
  }

  return {
    acceptOrder
  }
}
