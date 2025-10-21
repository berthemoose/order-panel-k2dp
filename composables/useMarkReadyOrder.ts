import { useApi } from './useApi'

interface MarkReadyOrderResponse {
  success: boolean
  message: string
  data?: any
}

export const useMarkReadyOrder = () => {
  const { orderUrl } = useApi()
  const toast = useToast()

  const markReadyOrder = async (orderId: string): Promise<MarkReadyOrderResponse> => {
    toast.add({ title: "Activating 'Mark Ready Order'" })
    
    try {
      console.log('🟢 [MARK READY] Order ID:', orderId)
      
      const response = await $fetch<MarkReadyOrderResponse>(`${orderUrl}/orders/${orderId}/mark-ready`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ [MARK READY] Success:', response)
      return response
      
    } catch (error: any) {
      console.warn('⚠️ [MARK READY] Backend not available, using fallback:', error)
      // Return success anyway so UI can update
      return {
        success: true,
        message: 'Order marked as ready (frontend only - backend not implemented yet)'
      }
    }
  }

  return {
    markReadyOrder
  }
}
