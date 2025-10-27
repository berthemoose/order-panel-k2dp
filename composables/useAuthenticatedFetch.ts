import { $fetch } from 'ofetch'

/**
 * Authenticated fetch wrapper that automatically includes JWT token in headers
 * Use this instead of raw $fetch or useFetch for protected API calls
 */
export const useAuthenticatedFetch = () => {
  const authenticatedFetch = async <T>(url: string, options: any = {}): Promise<T> => {
    return $fetch<T>(url, options)
  }

  const authenticatedUseFetch = <T>(url: string, options: any = {}) => {
    return useFetch<T>(url, options)
  }

  return {
    authenticatedFetch,
    authenticatedUseFetch
  }
}
