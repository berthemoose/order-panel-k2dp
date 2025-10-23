<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between items-center">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-2xl font-bold text-black hover:text-slate-700 transition-colors">
            PANEL ZAMÓWIEŃ K2
          </NuxtLink>
        </div>
        
        <div class="hidden md:flex md:items-center md:space-x-8">
          <ClientOnly>
            <!-- Only show Orders link when authenticated -->
            <NuxtLink 
              v-if="isAuthenticated"
              to="/orders" 
              class="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              active-class="text-blue-600 font-semibold"
            >
              Zamówienia
            </NuxtLink>
            
            <!-- Archive link - only when authenticated -->
            <NuxtLink 
              v-if="isAuthenticated"
              to="/archive" 
              class="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              active-class="text-blue-600 font-semibold"
            >
              Archiwum
            </NuxtLink>
            
            <!-- Show Login button when not authenticated -->
            <NuxtLink 
              v-if="!isAuthenticated"
              to="/login" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Zaloguj się
            </NuxtLink>
            
            <!-- User menu - only when authenticated -->
            <div v-if="isAuthenticated" class="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {{ userInitials }}
                </div>
                <span class="text-sm font-medium text-gray-700">{{ user?.fullName || user?.email }}</span>
              </div>
              <UButton
                @click="handleLogout"
                color="error"
                variant="soft"
                size="sm"
                class="hover:cursor-pointer"
              >
                Wyloguj
              </UButton>
            </div>
            
            <template #fallback>
              <!-- Static placeholder to prevent layout shift -->
              <div class="h-10"></div>
            </template>
          </ClientOnly>
        </div>

        <!-- Mobile menu button -->
        <div class="flex md:hidden">
          <UButton 
            @click="mobileMenuOpen = !mobileMenuOpen"
            type="button"
            color="neutral"
            variant="ghost"
            square
          >
            <span class="sr-only">Open main menu</span>
            <svg v-if="!mobileMenuOpen" class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </UButton>
        </div>
      </div>
    </nav>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <NuxtLink 
          to="/" 
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          active-class="text-blue-600 bg-blue-50"
          @click="mobileMenuOpen = false"
        >
          Home
        </NuxtLink>
        
        <ClientOnly>
          <!-- Only show Orders link when authenticated -->
          <NuxtLink 
            v-if="isAuthenticated"
            to="/orders" 
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            active-class="text-blue-600 bg-blue-50"
            @click="mobileMenuOpen = false"
          >
            Zamówienia
          </NuxtLink>
          
          <!-- Archive link - only when authenticated -->
          <NuxtLink 
            v-if="isAuthenticated"
            to="/archive" 
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            active-class="text-blue-600 bg-blue-50"
            @click="mobileMenuOpen = false"
          >
            Archiwum
          </NuxtLink>
          
          <!-- Show Login button when not authenticated -->
          <NuxtLink 
            v-if="!isAuthenticated"
            to="/login" 
            class="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center"
            @click="mobileMenuOpen = false"
          >
            Zaloguj się
          </NuxtLink>
          
          <!-- User info and logout for mobile - only when authenticated -->
          <div v-if="isAuthenticated" class="border-t border-gray-200 pt-4 mt-4">
            <div class="px-3 py-2 flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {{ userInitials }}
              </div>
              <span class="text-sm font-medium text-gray-700">{{ user?.fullName || user?.email }}</span>
            </div>
            <UButton
              @click="handleLogout"
              color="error"
              variant="soft"
              block
              class="w-full"
            >
              Wyloguj
            </UButton>
          </div>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const mobileMenuOpen = ref(false)
const router = useRouter()
const { user, isAuthenticated, logout, initAuth } = useAuth()

// Initialize auth on component mount
if (process.client) {
  initAuth()
}

// Compute user initials
const userInitials = computed(() => {
  if (!user.value) return ''
  
  if (user.value.fullName) {
    const names = user.value.fullName.split(' ')
    if (names.length >= 2) {
      return (names[0]?.[0] + names[1]?.[0]).toUpperCase()
    }
    return names[0]?.[0]?.toUpperCase() || ''
  }
  
  return user.value.email?.[0]?.toUpperCase() || ''
})

// Handle logout
const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>
