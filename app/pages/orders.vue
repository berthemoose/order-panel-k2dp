<template>
<div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold text-gray-900">Zamówienia oczekujące</h1>
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
        </div>
        <button
            v-if="expandedOrderIds.length > 0"
            @click="closeAll"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Zamknij wszystkie
        </button>
    </div>
    <div class="space-y-3">
        <div 
            v-for="order in orders" 
            :key="order._id" 
            @click="toggleExpand(order._id)"
            class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
            :class="{ 'ring-2 ring-blue-500': expandedOrderIds.includes(order._id) }"
        >
            <!-- Compact View -->
            <div class="p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 flex-1">
                        
                        <span 
                            v-if="order.isStudent" 
                            class="px-2 py-1 text-xs font-semibold bg-red-200 text-black rounded text-center flex items-center justify-center gap-2"
                        >
                            <UIcon class="text-xl" name="picon:student"/>
                            STUDENT
                        </span>
                        
                        <!-- Name -->
                        <h3 class="text-lg font-semibold text-gray-900">
                            {{ order.name }} {{ order.surname }}
                        </h3>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <!-- Copies -->
                        <div class="flex items-center gap-1 text-sm">
                            <span class="text-gray-500">Nakład:</span>
                            <span class="font-semibold text-gray-900">{{ order.copies }}</span>
                        </div>
                        
                        <!-- Status Badges -->
                        <div class="flex gap-2">
                            <span 
                                class="px-2 py-1 text-xs font-medium rounded"
                                :class="getStatusColor(order.upload_status)"
                            >
                                {{ order.upload_status }}
                            </span>
                            <span 
                                class="px-2 py-1 text-xs font-medium rounded"
                                :class="getOrderStatusColor(order.order_status)"
                            >
                                {{ order.order_status }}
                            </span>
                        </div>
                        
                        <!-- Expand Icon -->
                        <svg 
                            class="w-5 h-5 text-gray-400 transition-transform"
                            :class="{ 'rotate-180': expandedOrderIds.includes(order._id) }"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <!-- Expanded View -->
            <div 
                v-if="expandedOrderIds.includes(order._id)"
                class="border-t border-gray-200 bg-gray-50 p-4 space-y-4"
            >
                <!-- Contact Information -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs font-medium text-gray-500 uppercase mb-1">Adres e-mail</p>
                        <UButton 
                            :to="`mailto:${order.email}`"
                            color="info"
                            variant="soft"
                            icon="i-heroicons-envelope"
                            :label="order.email"
                            @click.stop
                            external
                        />
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 uppercase mb-1">Numer Telefonu</p>
                        <p class="text-sm text-gray-900">{{ order.phone }}</p>
                    </div>
                </div>
                
                <!-- Company -->
                <div v-if="order.company">
                    <p class="text-xs font-medium text-gray-500 uppercase mb-1">Firma</p>
                    <p class="text-sm text-gray-900">{{ order.company }}</p>
                </div>
                
                <!-- Specifications -->
                <div v-if="order.specs && order.specs.length > 0">
                    <p class="text-xs font-medium text-gray-500 uppercase mb-2">Specyfikacja</p>
                    <div class="bg-white p-3 rounded border border-gray-200 space-y-2">
                        <div v-for="(spec, index) in order.specs" :key="index" class="flex flex-wrap gap-x-4 gap-y-1">
                            <span 
                                v-for="(value, key) in spec" 
                                :key="key"
                                class="text-xs"
                            >
                                <span class="font-medium text-gray-700">{{ key }}:</span>
                                <span class="text-gray-600 ml-1">{{ value }}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Comments -->
                <div v-if="order.comments">
                    <p class="text-xs font-medium text-gray-500 uppercase mb-1">Uwagi</p>
                    <p class="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">{{ order.comments }}</p>
                </div>
                
                
                <!-- File URL -->
                <div>
                    <p class="text-xs font-medium text-gray-500 uppercase mb-1">Plik</p>
                    
                    <!-- File is ready -->
                    <a 
                        v-if="order.file_url && order.upload_status === 'uploaded'"
                        :href="order.file_url" 
                        target="_blank"
                        class="text-sm text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                        @click.stop
                    >
                        Pobierz plik
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                    
                    <!-- File is being uploaded -->
                    <div 
                        v-else-if="order.upload_status === 'pending' || order.upload_status === 'processing'"
                        class="text-sm text-gray-600 inline-flex items-center gap-2"
                    >
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Trwa przesyłanie pliku...
                    </div>
                    
                    <!-- File upload failed -->
                    <div 
                        v-else-if="order.upload_status === 'upload_failed'"
                        class="text-sm text-red-600 inline-flex items-center gap-1"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Błąd przesyłania pliku
                    </div>
                </div>
                
                <!-- Timestamp -->
                <div>
                    <p class="text-xs font-medium text-gray-500 uppercase mb-1">Data złożenia</p>
                    <p class="text-sm text-gray-700">{{ formatDate(order.submitted_at) }}</p>
                </div>
                
                <!-- Order ID -->
                <div>
                    <p class="text-xs font-medium text-gray-500 uppercase mb-1">Numer zamówienia</p>
                    <p class="text-xs text-gray-600 font-mono">{{ order._id }}</p>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {useGetOrderList} from "../../composables/useGetOrderList"
import type { Order } from '../../types/order'

const {data, error} = useGetOrderList()

// Create reactive orders array that we can modify
const ordersFromRest = computed(()=> data.value?.data?.orders || [])
const liveOrders = ref<Order[]>([])

// Combine REST orders with live orders, prioritizing live updates
const orders = computed(() => {
  if (liveOrders.value.length > 0) {
    return liveOrders.value
  }
  return ordersFromRest.value
})

// WebSocket connection
const ws = ref<WebSocket | null>(null)
const wsStatus = ref<'disconnected' | 'connected' | 'error'>('disconnected')

const expandedOrderIds = ref<string[]>([])

const toggleExpand = (orderId: string) => {
    const index = expandedOrderIds.value.indexOf(orderId)
    
    if (index !== -1) {
        // If already expanded, collapse it
        expandedOrderIds.value.splice(index, 1)
    } else {
        // If not expanded, add it
        if (expandedOrderIds.value.length >= 3) {
            // Remove the oldest (first) one if we're at max capacity
            expandedOrderIds.value.shift()
        }
        expandedOrderIds.value.push(orderId)
    }
}

const closeAll = () => {
    expandedOrderIds.value = []
}

const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
        'completed': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'processing': 'bg-blue-100 text-blue-800',
        'failed': 'bg-red-100 text-red-800',
    }
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const getOrderStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
        'completed': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'ready': 'bg-purple-100 text-purple-800',
        'cancelled': 'bg-red-100 text-red-800',
    }
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// WebSocket functionality
const connectWebSocket = () => {
  // Connect to WebSocket
  ws.value = new WebSocket('ws://localhost:8003/ws/orders')
  
  ws.value.onopen = () => {
    console.log('✅ Zainicjowałem połączenie z serwerem WebSocket - oczekuję na zamówienia')
    wsStatus.value = 'connected'
  }
  
  ws.value.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      
      if (message.type === 'new_order') {
        console.log('Mamy nowe zamówienie:', message.data)
        
        // Check if order already exists (deduplication)
        const exists = liveOrders.value.find(o => o._id === message.data._id)
        
        if (!exists) {
          // Add new order to the top of the list
          liveOrders.value = [message.data, ...liveOrders.value]
        }
      } else if (message.type === 'order_updated') {
        console.log('📝 Aktualizacja zamówienia:', message.data)
        
        // Find and update the specific order
        const orderIndex = liveOrders.value.findIndex(o => o._id === message.data._id)
        
        if (orderIndex !== -1) {
          // Update the order with new data (merge updates)
          liveOrders.value[orderIndex] = {
            ...liveOrders.value[orderIndex],
            ...message.data.updates
          }
          console.log('✅ Zaktualizowano zamówienie:', message.data._id)
        }
      }
    } catch (error) {
      console.error('Błąd przy wczytywaniu danych z serwera', error)
    }
  }
  
  ws.value.onerror = () => {
    console.error('❌ Błąd połączenia z serwerem WebSocket')
    wsStatus.value = 'error'
  }
  
  ws.value.onclose = () => {
    console.log('🔌 Rozłączono z serwerem WebSocket')
    wsStatus.value = 'disconnected'
  }
}

// Initialize on mount
onMounted(() => {
  console.log('📡 Otwieram nowe połączenie z serwerem odbioru zamówień')
  
  // Wait for initial REST data to load
  setTimeout(() => {
    // Set initial orders from REST
    liveOrders.value = [...ordersFromRest.value]
    console.log(`✅ Wczytałem ilość zamówień: ${liveOrders.value.length} z serwera `)
    
    // Connect to WebSocket for real-time updates
    connectWebSocket()
  }, 500)
})

// Cleanup on unmount
onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
    console.log('🧹 Połączenie z serwerem WebSocket zostało zamknięte')
  }
})
</script>
