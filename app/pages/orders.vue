<template>
<div class="p-6 bg-gray-50 min-h-screen space-y-8">
    <!-- Loading state during auth verification -->
    <div v-if="isVerifyingAuth" class="flex items-center justify-center py-20">
        <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p class="text-gray-600">Weryfikacja dostępu...</p>
        </div>
    </div>

    <div v-else>
    <!-- Search Bar -->
    <div class="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
        <div class="flex gap-4">
            <div class="flex-1 relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Szukaj zamówień po nazwisku, email, telefonie, firmie..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                />
                <UButton
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    square
                    class="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </UButton>
            </div>
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                </svg>
                <select
                    v-model="sortOrder"
                    class="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black bg-white cursor-pointer"
                >
                    <option value="newest">Najnowsze</option>
                    <option value="oldest">Najstarsze</option>
                </select>
            </div>
        </div>
        <div v-if="searchQuery" class="mt-2 text-sm text-black">
            Znaleziono: <span class="font-semibold">{{ totalFilteredOrders }}</span> zamówień
        </div>
    </div>




    <draggable 
        v-model="sectionOrderWithData" 
        item-key="id"
        handle=".drag-handle"
        class="space-y-8"
        @end="saveSectionOrder"
    >
        <template #item="{element: section}">
            <div v-if="section.orders && section.orders.length > 0" :class="[
                'rounded-xl p-6 shadow-sm border transition-all duration-200',
                section.bgClass,
                section.borderClass
            ]">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <UButton class="drag-handle cursor-move" variant="ghost" size="xs" square>
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                            </svg>
                        </UButton>
                        <component :is="section.id === 'pending' ? 'h1' : 'h2'" :class="['text-3xl font-bold', section.textClass]">
                            {{ section.title }}
                        </component>
                        <OrdersPageWebSocketStatusIndicator v-if="section.id === 'pending'" :ws-status="wsStatus"/>
                        <OrdersPageOrderTilesCloseAll 
                            v-if="section.id === 'pending'"
                            :expanded-order-ids="expandedOrderIds"
                            @close-all="closeAll"
                        />
                    </div>
                </div>
                <div class="space-y-3">
                    <OrdersPageOrderTile 
                        v-for="order in section.orders" 
                        :key="order._id" 
                        :order="order"
                        :is-expanded="expandedOrderIds.includes(order._id)"
                        :section-type="section.id"
                        @toggle-expand="toggleExpand"
                        @accept-order="(orderId) => section.id === 'pending' && handleAcceptOrder(orderId)"
                        @decline-order="(orderId, comment) => section.id === 'pending' && handleDeclineOrder(orderId, comment)"
                        @mark-ready="(orderId) => section.id === 'in-progress' && handleMarkReady(orderId)"
                        @notify-delay="(orderId) => section.id === 'in-progress' && handleNotifyDelay(orderId)"
                        @archive-order="(orderId) => section.id === 'completed' && handleArchiveOrder(orderId)"
                    />
                </div>
            </div>
        </template>
    </draggable>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import draggable from 'vuedraggable'
import {useGetOrderList} from "../../composables/useGetOrderList"
import { useAcceptOrder } from '../../composables/useAcceptOrder'
import { useDeclineOrder } from '../../composables/useDeclineOrder'
import { useMarkReadyOrder } from '../../composables/useMarkReadyOrder'
import { useNotifyDelayOrder } from '../../composables/useNotifyDelayOrder'
import { useArchiveOrder } from '../../composables/useArchiveOrder'
import type { Order } from '../../types/order'

definePageMeta({
  middleware: ['auth']
})

interface Section {
  id: string
  title: string
  bgClass: string
  borderClass: string
  textClass: string
  orders?: Order[]
}

// Auth verification state
const isVerifyingAuth = ref(false)

const {data, error} = useGetOrderList()
const { acceptOrder } = useAcceptOrder()
const { declineOrder } = useDeclineOrder()
const { markReadyOrder } = useMarkReadyOrder()
const { notifyDelayOrder } = useNotifyDelayOrder()
const { archiveOrder } = useArchiveOrder()

// Create reactive orders array that we can modify
const ordersFromRest = computed(()=> data.value?.data?.orders || [])
const liveOrders = ref<Order[]>([])
const isLiveOrdersInitialized = ref(false)

// Orders in different stages (with static placeholders for now)
const ordersInProgress = ref<Order[]>([
  {
    _id: 'placeholder-in-progress-1',
    name: 'Jan',
    surname: 'Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '+48 123 456 789',
    company: 'Firma XYZ',
    comments: 'Placeholder zamówienie w trakcie realizacji',
    copies: 50,
    specs: [{ 'Format': 'A4', 'Kolor': 'Czarno-biały' }],
    upload_status: 'uploaded',
    order_status: 'in_progress',
    submitted_at: new Date().toISOString(),
    isStudent: false,
    id: 'placeholder-in-progress-1',
    file_url: 'https://example.com/file.pdf'
  }
])

const ordersCompleted = ref<Order[]>([
  {
    _id: 'placeholder-completed-1',
    name: 'Anna',
    surname: 'Nowak',
    email: 'anna.nowak@example.com',
    phone: '+48 987 654 321',
    company: '',
    comments: 'Placeholder zamówienie zakończone',
    copies: 100,
    specs: [{ 'Format': 'A4', 'Kolor': 'Kolorowy' }],
    upload_status: 'uploaded',
    order_status: 'completed',
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
    isStudent: true,
    id: 'placeholder-completed-1',
    file_url: 'https://example.com/file2.pdf'
  }
])

const ordersRejected = ref<Order[]>([
  {
    _id: 'placeholder-rejected-1',
    name: 'Piotr',
    surname: 'Wiśniewski',
    email: 'piotr.wisniewski@example.com',
    phone: '+48 555 666 777',
    company: 'ABC Sp. z o.o.',
    comments: 'Odrzucone - niewystarczająca jakość pliku',
    copies: 25,
    specs: [{ 'Format': 'A3', 'Kolor': 'Czarno-biały' }],
    upload_status: 'uploaded',
    order_status: 'cancelled',
    submitted_at: new Date(Date.now() - 172800000).toISOString(),
    isStudent: false,
    id: 'placeholder-rejected-1',
    file_url: 'https://example.com/file3.pdf',
    isRejected: true
  }
])

// Modal state
const isDeclineModalOpen = ref(false)
const declineReason = ref('')
const currentOrderIdForDecline = ref<string | null>(null)

// Combine REST orders with live orders, prioritizing live updates
const orders = computed(() => {
  // Once live orders are initialized, always use them even if empty
  if (isLiveOrdersInitialized.value) {
    return liveOrders.value
  }
  return ordersFromRest.value
})

// WebSocket connection
const ws = ref<WebSocket | null>(null)
const wsStatus = ref<'disconnected' | 'connected' | 'error'>('disconnected')

const expandedOrderIds = ref<string[]>([])
const searchQuery = ref('')
const sortOrder = ref<'newest' | 'oldest'>('newest')

// Section order management
const defaultSectionOrder: Section[] = [
  { id: 'pending', title: 'Zamówienia oczekujące', bgClass: 'bg-amber-50', borderClass: 'border-amber-200', textClass: 'text-amber-900' },
  { id: 'in-progress', title: 'Zamówienia w trakcie realizacji', bgClass: 'bg-blue-50', borderClass: 'border-blue-200', textClass: 'text-blue-900' },
  { id: 'completed', title: 'Zamówienia zakończone', bgClass: 'bg-green-50', borderClass: 'border-green-200', textClass: 'text-green-900' },
  { id: 'rejected', title: 'Zamówienia odrzucone', bgClass: 'bg-red-50', borderClass: 'border-red-200', textClass: 'text-red-900' }
]

const sectionOrder = ref<Section[]>(loadSectionOrder())

// Search filter function
const filterOrders = (ordersList: Order[]) => {
  if (!searchQuery.value.trim()) return ordersList
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return ordersList.filter(order => {
    const searchableFields = [
      order.name,
      order.surname,
      order.email,
      order.phone,
      order.company,
      order.comments,
      `${order.name} ${order.surname}`
    ].map(field => (field || '').toLowerCase())
    
    return searchableFields.some(field => field.includes(query))
  })
}

// Sort orders by date
const sortOrders = (ordersList: Order[]) => {
  return [...ordersList].sort((a, b) => {
    const dateA = new Date(a.submitted_at).getTime()
    const dateB = new Date(b.submitted_at).getTime()
    
    return sortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
  })
}

// Computed section data with orders
const sectionsWithOrders = computed(() => {
  return sectionOrder.value.map((section: Section) => {
    const sectionOrders = section.id === 'pending' ? orders.value
      : section.id === 'in-progress' ? ordersInProgress.value
      : section.id === 'completed' ? ordersCompleted.value
      : ordersRejected.value
    
    const filtered = filterOrders(sectionOrders)
    const sorted = sortOrders(filtered)
    
    return {
      ...section,
      orders: sorted
    }
  })
})

// Total filtered orders count
const totalFilteredOrders = computed(() => {
  return sectionsWithOrders.value.reduce((total, section) => 
    total + (section.orders?.length || 0), 0
  )
})

// Use computed sections for draggable
const sectionOrderWithData = computed({
  get: () => sectionsWithOrders.value,
  set: (newOrder: Section[]) => {
    sectionOrder.value = newOrder.map((s: Section) => ({
      id: s.id,
      title: s.title,
      bgClass: s.bgClass,
      borderClass: s.borderClass,
      textClass: s.textClass
    }))
  }
})

// Load section order from localStorage
function loadSectionOrder() {
  if (typeof window === 'undefined') return defaultSectionOrder
  const saved = localStorage.getItem('orderSectionOrder')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return defaultSectionOrder
    }
  }
  return defaultSectionOrder
}

// Save section order to localStorage
function saveSectionOrder() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('orderSectionOrder', JSON.stringify(sectionOrder.value))
  }
}

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
    isLiveOrdersInitialized.value = true
    console.log(`✅ Wczytałem ilość zamówień: ${liveOrders.value.length} z serwera `)
    
    // Connect to WebSocket for real-time updates
    connectWebSocket()
  }, 500)
})

// Order action handlers
const handleAcceptOrder = async (orderId: string) => {
  try {
    const result = await acceptOrder(orderId)
    console.log('Accept result:', result)
    
    // Move order from waiting to in-progress
    const orderIndex = liveOrders.value.findIndex(o => o._id === orderId)
    if (orderIndex !== -1) {
      const [order] = liveOrders.value.splice(orderIndex, 1)
      if (order) {
        order.order_status = 'in_progress'
        ordersInProgress.value.push(order)
      }
    }
  } catch (error) {
    console.error('Error accepting order:', error)
    // TODO: Show error notification
  }
}

//Decline modal
const openDeclineModal = (orderId: string) => {
  currentOrderIdForDecline.value = orderId
  isDeclineModalOpen.value = true
}

const closeDeclineModal = () => {
  isDeclineModalOpen.value = false
  currentOrderIdForDecline.value = null
}

const handleDeclineOrder = async (orderId: string, comment: string) => {
  try {
    const result = await declineOrder(orderId, comment)
    console.log('Decline result:', result)
    
    // Move order from waiting to rejected
    const orderIndex = liveOrders.value.findIndex(o => o._id === orderId)
    if (orderIndex !== -1) {
      const [order] = liveOrders.value.splice(orderIndex, 1)
      if (order) {
        order.order_status = 'cancelled'
        order.isRejected = true
        ordersRejected.value.push(order)
      }
    }
  } catch (error) {
    console.error('Error declining order:', error)
    // TODO: Show error notification
  }
}

// In-progress order handlers
const handleMarkReady = async (orderId: string) => {
  try {
    const result = await markReadyOrder(orderId)
    console.log('Mark ready result:', result)
    
    // Move order from in-progress to completed
    const orderIndex = ordersInProgress.value.findIndex(o => o._id === orderId)
    if (orderIndex !== -1) {
      const [order] = ordersInProgress.value.splice(orderIndex, 1)
      if (order) {
        order.order_status = 'ready'
        ordersCompleted.value.push(order)
      }
    }
  } catch (error) {
    console.error('Error marking order as ready:', error)
    // TODO: Show error notification
  }
}

const handleNotifyDelay = async (orderId: string) => {
  try {
    const result = await notifyDelayOrder(orderId)
    console.log('Notify delay result:', result)
    
    alert('Powiadomienie o opóźnieniu zostało wysłane do klienta')
  } catch (error) {
    console.error('Error sending delay notification:', error)
    alert('Błąd podczas wysyłania powiadomienia')
  }
}

const handleArchiveOrder = async (orderId: string) => {
  try {
    const result = await archiveOrder(orderId)
    console.log('Archive result:', result)
    
    // Remove order from completed list
    const orderIndex = ordersCompleted.value.findIndex(o => o._id === orderId)
    if (orderIndex !== -1) {
      ordersCompleted.value.splice(orderIndex, 1)
      console.log('✅ Zamówienie zostało zarchiwizowane')
    }
  } catch (error) {
    console.error('Error archiving order:', error)
    // TODO: Show error notification
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
    console.log('🧹 Połączenie z serwerem WebSocket zostało zamknięte')
  }
})
</script>
