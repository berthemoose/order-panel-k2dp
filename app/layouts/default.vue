<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Header />
    
    <main class="flex-1">
      <slot />
    </main>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
// Layout components are auto-imported in Nuxt
</script>
