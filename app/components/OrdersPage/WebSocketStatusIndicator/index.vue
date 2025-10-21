<script setup lang="ts">
defineProps<{
  wsStatus: 'disconnected' | 'connected' | 'error'
}>()
</script>

<template>
<!-- WebSocket Status Indicator -->
            <div class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" :class="{
                'bg-green-100 text-green-700': wsStatus === 'connected',
                'bg-yellow-100 text-yellow-700': wsStatus === 'disconnected',
                'bg-red-100 text-red-700': wsStatus === 'error'
            }">
                <span class="w-2 h-2 rounded-full" :class="{
                    'bg-green-500 animate-pulse': wsStatus === 'connected',
                    'bg-yellow-500': wsStatus === 'disconnected',
                    'bg-red-500': wsStatus === 'error'
                }"></span>
                <span v-if="wsStatus === 'connected'">Połączono z serwerem</span>
                <span v-else-if="wsStatus === 'error'">Serwer niedostępny</span>
                <span v-else>Łączenie...</span>
            </div>

</template>

