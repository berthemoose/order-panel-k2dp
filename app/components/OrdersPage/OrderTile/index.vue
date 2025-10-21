<script setup lang="ts">
import { ref } from 'vue'
import type { Order } from '../../../../types/order'
import DeclineOrderModal from '../DeclineOrderModal/index.vue';

const props = defineProps<{
  order: Order
  isExpanded: boolean
  sectionType?: 'pending' | 'in-progress' | 'completed' | 'rejected'
}>()

const emit = defineEmits<{
  toggleExpand: [orderId: string]
  acceptOrder: [orderId: string]
  declineOrder: [orderId: string, comment: string]
  markReady: [orderId: string]
  notifyDelay: [orderId: string]
  archiveOrder: [orderId: string]
}>()

const isDeclineModalOpen = ref(false)

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

const translateOrderStatus = (status: string) => {
    const translations: Record<string, string> = {
        'completed': 'Zakończone',
        'pending': 'Oczekujące',
        'in_progress': 'W trakcie',
        'ready': 'Gotowe',
        'cancelled': 'Anulowane',
        'placed': 'Złożone',
        'confirmed': 'Potwierdzone',
        'shipped': 'Wysłane',
    }
    return translations[status.toLowerCase()] || status
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const handleToggle = () => {
  emit('toggleExpand', props.order._id)
}

const handleAccept = () => {
  emit('acceptOrder', props.order._id)
}

const handleDecline = (comment: string) => {
  emit('declineOrder', props.order._id, comment)
  isDeclineModalOpen.value = false
}

const closeDeclineModal = () => {
  isDeclineModalOpen.value = false
}

const handleMarkReady = () => {
  emit('markReady', props.order._id)
}

const handleNotifyDelay = () => {
  emit('notifyDelay', props.order._id)
}

const handleArchive = () => {
  emit('archiveOrder', props.order._id)
}
</script>

<template>
    <div 
        @click="handleToggle"
        class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
        :class="{ 'ring-2 ring-blue-500': isExpanded }"
    >
        <!-- Compact View -->
        <div class="p-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1">
                    
                    <span 
                        v-if="order.isRejected" 
                        class="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded text-center flex items-center justify-center gap-2"
                    >
                        <UIcon class="text-xl" name="ic:round-cancel"/>
                        ZAMÓWIENIE ODRZUCONE
                    </span>
                    
                    <span 
                        v-if="order.isStudent" 
                        class="px-2 py-1 text-xs font-semibold bg-red-200 text-black rounded text-center flex items-center justify-center gap-2"
                    >
                        <UIcon class="text-xl" name="picon:student"/>
                        STUDENT
                    </span>
                    
                    <!-- Name and Date -->
                    <div class="flex flex-col">
                        <h3 class="text-lg font-semibold text-gray-900">
                            {{ order.name }} {{ order.surname }}
                        </h3>
                        <p v-if="order.product_name" class="text-sm text-blue-600 font-medium">
                            {{ order.product_name }}
                        </p>
                        <p class="text-xs text-gray-500 mt-0.5">
                            {{ formatDate(order.submitted_at) }}
                        </p>
                    </div>
                </div>
                
                <div class="flex items-center gap-4">
                    <!-- Copies -->
                    <div class="flex items-center gap-1 text-sm">
                        <span class="text-gray-500">Nakład:</span>
                        <span class="font-semibold text-gray-900">{{ order.copies }}</span>
                    </div>
                    
                    <!-- Status Badge -->
                    <div class="flex gap-2">
                        <span 
                            class="px-2 py-1 text-xs font-medium rounded"
                            :class="getOrderStatusColor(order.order_status)"
                        >
                            {{ translateOrderStatus(order.order_status) }}
                        </span>
                    </div>
                    
                    <!-- Expand Icon -->
                    <svg 
                        class="w-5 h-5 text-gray-400 transition-transform"
                        :class="{ 'rotate-180': isExpanded }"
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
            v-if="isExpanded"
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
                        class="cursor-pointer"
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
            
            
            <!-- Action Buttons -->
            <div class="flex  w-full items-center justify-around pt-4 px-36 border-t border-gray-200">
                <!-- Pending Order Buttons -->
                <template v-if="!sectionType || sectionType === 'pending'">
                    <div class="">
                        <UButton
                        color="success"
                        size="lg"
                        icon="i-heroicons-check-circle"
                        label="Akceptuj zamówienie"
                        @click.stop="handleAccept"
                        class="flex-1 cursor-pointer"
                        />
                    </div>
                    <div class="">
                        <DeclineOrderModal 
                            :is-open="isDeclineModalOpen"
                            :order="order"
                            @close="closeDeclineModal"
                            @decline="handleDecline"
                        >
                            <UButton 
                                label="Odrzuć zamówienie" 
                                size="lg" 
                                icon="ic:round-do-not-disturb" 
                                color="error" 
                                variant="solid" 
                                @click.stop="isDeclineModalOpen = true"
                                class="cursor-pointer" 
                            />
                        </DeclineOrderModal>
                    </div>
                </template>
                
                <!-- In-Progress Order Buttons -->
                <template v-else-if="sectionType === 'in-progress'">
                    <div class="">
                        <UButton
                        color="success"
                        size="lg"
                        icon="i-heroicons-check-badge"
                        label="Gotowe do odbioru"
                        @click.stop="handleMarkReady"
                        class="flex-1 cursor-pointer"
                        />
                    </div>
                    <div class="">
                        <UButton 
                            label="Powiadomienie o opóźnieniu" 
                            size="lg" 
                            icon="i-heroicons-exclamation-triangle" 
                            color="warning" 
                            variant="solid" 
                            @click.stop="handleNotifyDelay"
                            class="cursor-pointer" 
                        />
                    </div>
                </template>
                
                <!-- Completed Order Buttons -->
                <template v-else-if="sectionType === 'completed'">
                    <div class="">
                        <UButton
                        color="neutral"
                        size="lg"
                        icon="i-heroicons-archive-box"
                        label="Archiwizuj"
                        @click.stop="handleArchive"
                        class="cursor-pointer"
                        />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
