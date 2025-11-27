import { useApi } from './useApi'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

interface DeclineOrderResponse {
  success: boolean
  message: string
  data?: any
}

export const useDeclineOrder = () => {
  const { orderUrl } = useApi()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const toast = useToast()

  const declineOrder = async (orderId: string): Promise<DeclineOrderResponse> => {
    toast.add({ title: "Activating 'Decline Order'" })
    
    try {
      console.log('🔴 [DECLINE ORDER] Order ID:', orderId)
      // console.log('🔴 [DECLINE ORDER] Comment:', comment)
      
      const response = await authenticatedFetch<any>(`${orderUrl}/decline-order/${orderId}`, {
        method: 'POST',
        body: {
          
        }
        /* Add comment later */
      })
      
      console.log('✅ [DECLINE ORDER] Success:', response)
      toast.add({ 
        title: "Zamówienie odrzucone",
        description: "Zamówienie zostało przeniesione do odrzuconych",
        color: 'error'
      })
      return {
        success: true,
        message: response.message || 'Order declined successfully',
        data: response
      }
      
    } catch (error: any) {
      console.error('❌ [DECLINE ORDER] Error:', error)
      toast.add({ 
        title: "Błąd",
        description: "Nie udało się odrzucić zamówienia",
        color: 'error'
      })
      throw error
    }
  }

  return {
    declineOrder
  }
}
