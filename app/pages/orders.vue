<template>
<div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Zamówienia oczekujące</h1>
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
                <div v-if="order.file_url">
                    <p class="text-xs font-medium text-gray-500 uppercase mb-1">Plik</p>
                    <a 
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
import { ref, computed } from 'vue'
import { useApi } from "../../composables/useApi";
import {useGetOrderList} from "../../composables/useGetOrderList"
import type { Order } from '../../types/order'

const {data, error} = useGetOrderList()
const orders = computed(()=> data.value?.data?.orders || [])

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
</script>
