/**
 * Authenticated fetch wrapper that automatically includes JWT token in headers
 * Use this instead of raw $fetch or useFetch for protected API calls
 */
export const useAuthenticatedFetch = () => {
  const getAuthToken = (): string | null => {
    if (process.client) {
      return localStorage.getItem('auth-token')
    }
    return null
  }

  /**
   * Authenticated $fetch - for imperative API calls
   */
  const authenticatedFetch = async <T>(url: string, options: any = {}): Promise<T> => {
    const token = getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token found. Please login.')
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    return $fetch<T>(url, {
      ...options,
      headers
    })
  }

  /**
   * Authenticated useFetch - for reactive data fetching
   */
  const authenticatedUseFetch = <T>(url: string, options: any = {}) => {
    const token = getAuthToken()

    return useFetch<T>(url, {
      ...options,
      // Force client-side only for authenticated requests (security)
      server: false,
      onRequest({ options: requestOptions }) {
        // Add auth token to every request
        const currentToken = getAuthToken()
        if (!currentToken) {
          throw new Error('Authentication required')
        }
        
        // @ts-ignore - Nuxt headers typing issue
        requestOptions.headers = {
          ...(requestOptions.headers || {}),
          'Authorization': `Bearer ${currentToken}`
        }
      },
      onResponseError({ response }) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          console.error('🔒 [AUTH] Token invalid or expired, clearing auth')
          if (process.client) {
            localStorage.removeItem('auth-token')
            localStorage.removeItem('auth-user')
            navigateTo('/login')
          }
        }
      }
    })
  }

  return {
    authenticatedFetch,
    authenticatedUseFetch
  }
}
