<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-4">
        Panel Zarządzania Zamówieniami
      </h1>
    
      <p>{{ wsUrl }}</p>
       </div>

    <!-- Auth Status Section -->
    <div v-if="!isAuthenticated" class="mb-12">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <div class="flex justify-center mb-4">
          <svg class="w-16 h-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Wymagane logowanie</h2>
        <p class="text-gray-600 mb-6">
          Aby uzyskać dostęp do panelu zamówień, musisz się zalogować przy użyciu konta administratora.
        </p>
        <NuxtLink 
          to="/login" 
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="mr-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Zaloguj się
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Section - Only shown when authenticated -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Witaj z powrotem</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">{{ user?.fullName || user?.email }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Status</p>
              <p class="text-2xl font-bold text-green-600 mt-2">Zalogowany</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Rola</p>
              <p class="text-2xl font-bold text-gray-900 mt-2 capitalize">{{ user?.role || 'User' }}</p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <svg class="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section for authenticated users -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Hej, witaj w Panelu Zamówień K2</h2>
        <p class="text-gray-600 mb-6">Przeglądaj i zarządzaj wszystkimi zamówieniami w jednym miejscu.</p>
        <NuxtLink 
          to="/orders" 
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Zobacz zamówienia
          <svg class="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useApi } from '../../composables/useApi'
import test from 'node:test'

const { user, isAuthenticated, initAuth } = useAuth()

const {wsUrl ,orderUrl} = useApi()

// Initialize auth state on mount
onMounted(() => {
  if (process.client) {
    initAuth()
  }
})
</script>
