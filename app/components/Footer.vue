<template>
  <footer class="bg-gray-50 border-t border-gray-200 mt-auto">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Company Info -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Order Panel</h3>
          <p class="text-gray-600 text-sm">
            Manage your orders efficiently with our modern order management system.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Quick Links</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/" class="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Home
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/orders" class="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                Orders
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about" class="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                About
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Contact</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>Email: info@orderpanel.com</li>
            <li>Phone: +48 123 456 789</li>
            <li>Address: Warsaw, Poland</li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-center text-sm text-gray-500">
          © {{ currentYear }} Order Panel. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
