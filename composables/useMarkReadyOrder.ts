import { useApi } from './useApi'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

interface MarkReadyOrderResponse {
  success: boolean
  message: string
  data?: any
}

export const useMarkReadyOrder = () => {
  const { orderUrl } = useApi()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const toast = useToast()

  const markReadyOrder = async (orderId: string): Promise<MarkReadyOrderResponse> => {
    toast.add({ title: "Activating 'Mark Ready Order'" })
    
    try {
      console.log('🟢 [MARK READY] Order ID:', orderId)
      
      const response = await authenticatedFetch<any>(`${orderUrl}/mark-order-finished/${orderId}`, {
        method: 'POST'
      })
      
      console.log('✅ [MARK READY] Success:', response)
      toast.add({ 
        title: "Zamówienie gotowe",
        description: "Zamówienie zostało oznaczone jako gotowe",
        color: 'success'
      })
      return {
        success: true,
        message: response.message || 'Order marked as finished',
        data: response
      }
      
    } catch (error: any) {
      console.error('❌ [MARK READY] Error:', error)
      toast.add({ 
        title: "Błąd",
        description: "Nie udało się oznaczyć zamówienia jako gotowe",
        color: 'error'
      })
      throw error
    }
  }

  return {
    markReadyOrder
  }
}
