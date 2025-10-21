<template>
  <footer class="bg-gray-50 border-t border-gray-200 mt-auto">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-around gap-8">
        <!-- Company Info -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Panel zamówień K2</h3>
          <p class="text-gray-600 text-sm">
          </p>
        </div>

        
        
        <!-- Contact -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Pomoc Techniczna</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>Bartosz Przybyszewski</li>
            <li>Email: bartosz.janp@gmail.com</li>
            <li>Telefon: +48 608 689 231</li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-center text-sm text-gray-500">
          © {{ currentYear }} K2 Drukarnia Projektów. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
