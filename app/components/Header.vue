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
          <NuxtLink 
            to="/" 
            class="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            active-class="text-blue-600 font-semibold"
          >
            Home
          </NuxtLink>
          <NuxtLink 
            to="/orders" 
            class="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            active-class="text-blue-600 font-semibold"
          >
            Orders
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            active-class="text-blue-600 font-semibold"
          >
            About
          </NuxtLink>
        </div>

        <!-- Mobile menu button -->
        <div class="flex md:hidden">
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            type="button" 
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            <span class="sr-only">Open main menu</span>
            <svg v-if="!mobileMenuOpen" class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
        <NuxtLink 
          to="/orders" 
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          active-class="text-blue-600 bg-blue-50"
          @click="mobileMenuOpen = false"
        >
          Orders
        </NuxtLink>
        <NuxtLink 
          to="/about" 
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          active-class="text-blue-600 bg-blue-50"
          @click="mobileMenuOpen = false"
        >
          About
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileMenuOpen = ref(false)
</script>
