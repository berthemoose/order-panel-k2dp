import { useApi } from './useApi'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

interface ArchiveOrderResponse {
  success: boolean
  message: string
  data?: any
}

export const useArchiveOrder = () => {
  const { orderUrl } = useApi()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const toast = useToast()

  const archiveOrder = async (orderId: string): Promise<ArchiveOrderResponse> => {
    toast.add({ title: "Activating 'Archive Order'" })
    
    try {
      console.log('📦 [ARCHIVE ORDER] Order ID:', orderId)
      
      const response = await authenticatedFetch<any>(`${orderUrl}/archive-order/${orderId}`, {
        method: 'POST'
      })
      
      console.log('✅ [ARCHIVE ORDER] Success:', response)
      toast.add({ 
        title: "Zamówienie zarchiwizowane",
        description: "Zamówienie zostało przeniesione do archiwum",
        color: 'success'
      })
      return {
        success: true,
        message: response.message || 'Order archived successfully',
        data: response
      }
      
    } catch (error: any) {
      console.error('❌ [ARCHIVE ORDER] Error:', error)
      toast.add({ 
        title: "Błąd",
        description: "Nie udało się zarchiwizować zamówienia",
        color: 'error'
      })
      throw error
    }
  }

  return {
    archiveOrder
  }
}
