import { useApi } from './useApi'

interface LoginCredentials {
  email: string
  password: string
}

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  fullName?: string
}

interface AuthResponse {
  user: User
  token: string
  exp: number
  message?: string
}

export const useAuth = () => {
  const { cmsUrl } = useApi()
  const user = useState<User | null>('auth-user', () => null)
  const token = useState<string | null>('auth-token', () => null)

  // Initialize auth state from cookie/localStorage on client side
  const initAuth = () => {
    if (process.client) {
      const savedToken = localStorage.getItem('auth-token')
      const savedUser = localStorage.getItem('auth-user')
      
      if (savedToken && savedUser) {
        token.value = savedToken
        try {
          user.value = JSON.parse(savedUser)
        } catch (e) {
          console.error('Failed to parse saved user:', e)
          clearAuth()
        }
      }
    }
  }

  // Login function
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const loginUrl = `${cmsUrl}/users/login`
    
      const response = await $fetch<AuthResponse>(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: credentials
      })
      
      // Save auth data
      user.value = response.user
      token.value = response.token
      
      if (process.client) {
        localStorage.setItem('auth-token', response.token)
        localStorage.setItem('auth-user', JSON.stringify(response.user))
      }
      
      console.log('✅ [LOGIN] Success:', response.user.email)
      return response
      
    } catch (error: any) {
      console.error('❌ [LOGIN] Full error:', error)
      console.error('❌ [LOGIN] Error status:', error?.status || error?.statusCode)
      console.error('❌ [LOGIN] Error data:', error?.data)
      console.error('❌ [LOGIN] Error message:', error?.message)
      throw new Error(error?.data?.message || error?.message || 'Login failed')
    }
  }

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 [LOGOUT] Logging out user')
      
      // Call logout endpoint if token exists
      if (token.value) {
        await $fetch(`${cmsUrl}/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `JWT ${token.value}`
          }
        }).catch(() => {
          // Ignore logout endpoint errors, still clear local state
        })
      }
      
      clearAuth()
      console.log('✅ [LOGOUT] Success')
      
    } catch (error: any) {
      console.error('⚠️ [LOGOUT] Error:', error)
      // Still clear local state even if API call fails
      clearAuth()
    }
  }

  // Clear auth data
  const clearAuth = () => {
    user.value = null
    token.value = null
    
    if (process.client) {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('auth-user')
    }
  }

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value && !!token.value)

  // Check if user is admin
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Get current user
  const getCurrentUser = async (): Promise<User | null> => {
    try {
      if (!token.value) return null
      
      const response = await $fetch<{ user: User }>(`${cmsUrl}/users/me`, {
        headers: {
          'Authorization': `JWT ${token.value}`
        }
      })
      
      user.value = response.user
      
      if (process.client) {
        localStorage.setItem('auth-user', JSON.stringify(response.user))
      }
      
      return response.user
      
    } catch (error: any) {
      console.error('❌ [GET USER] Error:', error)
      // If token is invalid, clear auth
      if (error?.statusCode === 401 || error?.statusCode === 403) {
        clearAuth()
      }
      return null
    }
  }

  // Verify token is still valid
  const verifyAuth = async (): Promise<boolean> => {
    try {
      if (!token.value) return false
      
      const currentUser = await getCurrentUser()
      return !!currentUser
      
    } catch (error) {
      return false
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    isAdmin,
    login,
    logout,
    initAuth,
    getCurrentUser,
    verifyAuth,
    clearAuth
  }
}
