export default defineNuxtRouteMiddleware((to, from) => {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/']
  
  // Check if current route is public
  if (publicRoutes.includes(to.path)) {
    return
  }

  // On server-side, block all protected routes (SSR security)
  if (process.server) {
    console.warn('⚠️ [AUTH SSR] Blocking server-side access to protected route:', to.path)
    return navigateTo('/login')
  }

  // Client-side auth check
  const token = localStorage.getItem('auth-token')
  const userStr = localStorage.getItem('auth-user')
  
  const isAuthenticated = !!(token && userStr)

  // If trying to access login page and already authenticated, redirect to orders
  if (to.path === '/login' && isAuthenticated) {
    console.log('✅ [AUTH] Already authenticated, redirecting to orders')
    return navigateTo('/orders')
  }

  // Protected routes require authentication
  if (!isAuthenticated) {
    console.warn('⚠️ [AUTH] Not authenticated, redirecting to login')
    return navigateTo('/login')
  }
})
