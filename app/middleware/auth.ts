export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.server) return

  // Check if user has auth token in localStorage
  const token = localStorage.getItem('auth-token')
  const userStr = localStorage.getItem('auth-user')
  
  const isAuthenticated = !!(token && userStr)

  // If trying to access login page and already authenticated, redirect to orders
  if (to.path === '/login' && isAuthenticated) {
    console.log('✅ [AUTH] Already authenticated, redirecting to orders')
    return navigateTo('/orders')
  }

  // If trying to access protected routes
  if (to.path !== '/login' && to.path !== '/' && to.path !== '/test-auth') {
    // Check if authenticated
    if (!isAuthenticated) {
      console.warn('⚠️ [AUTH] Not authenticated, redirecting to login')
      return navigateTo('/login')
    }
  }
})
