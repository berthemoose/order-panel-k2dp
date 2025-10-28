import { useApi } from './useApi'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'

interface ArchiveRejectedOrderResponse {
  success: boolean
  message: string
  data?: any
}

export const useArchiveRejectedOrder = () => {
  const { orderUrl } = useApi()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const toast = useToast()

  const archiveRejectedOrder = async (orderId: string): Promise<ArchiveRejectedOrderResponse> => {
    toast.add({ title: "Activating 'Archive Rejected Order'" })
    
    try {
      console.log('📦 [ARCHIVE REJECTED ORDER] Order ID:', orderId)
      
      const response = await authenticatedFetch<any>(`${orderUrl}/archive-rejected-order/${orderId}`, {
        method: 'POST'
      })
      
      console.log('✅ [ARCHIVE REJECTED ORDER] Success:', response)
      toast.add({ 
        title: "Odrzucone zamówienie zarchiwizowane",
        description: "Zamówienie zostało przeniesione do archiwum",
        color: 'success'
      })
      return {
        success: true,
        message: response.message || 'Rejected order archived successfully',
        data: response
      }
      
    } catch (error: any) {
      console.error('❌ [ARCHIVE REJECTED ORDER] Error:', error)
      toast.add({ 
        title: "Błąd",
        description: "Nie udało się zarchiwizować odrzuconego zamówienia",
        color: 'error'
      })
      throw error
    }
  }

  return {
    archiveRejectedOrder
  }
}
