<template>
<div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Archiwum zamówień</h1>
        <p class="text-gray-600">Przeglądaj i wyszukuj zarchiwizowane zamówienia</p>
    </div>

    <!-- Search and Filter Bar -->
    <div class="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
        <div class="flex gap-4 flex-wrap">
            <div class="flex-1 min-w-[300px] relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Szukaj po nazwisku, email, telefonie, firmie..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black"
                    @input="debouncedSearch"
                />
                <UButton
                    v-if="searchQuery"
                    @click="clearSearch"
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

            <div class="flex items-center gap-2">
                <label class="text-sm text-gray-600">Na stronę:</label>
                <select
                    v-model.number="pageSize"
                    @change="handlePageSizeChange"
                    class="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black bg-white cursor-pointer"
                >
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                </select>
            </div>
        </div>
        
        <div v-if="totalOrders > 0" class="mt-3 text-sm text-gray-600">
            <span v-if="filteredOrders.length > 0">
                Wyświetlanie {{ ((currentPage - 1) * pageSize) + 1 }} - {{ Math.min(currentPage * pageSize, filteredOrders.length) }} 
                z {{ filteredOrders.length }} {{ searchQuery ? 'znalezionych' : '' }} zamówień
                <span v-if="totalOrders !== filteredOrders.length" class="text-gray-500">(łącznie w archiwum: {{ totalOrders }})</span>
            </span>
            <span v-else class="text-orange-600">Nie znaleziono zamówień spełniających kryteria wyszukiwania</span>
        </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p class="text-gray-600">Ładowanie zamówień z archiwum...</p>
        </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && totalOrders === 0" class="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Brak zarchiwizowanych zamówień</h3>
        <p class="text-gray-600">Zarchiwizowane zamówienia pojawią się tutaj</p>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-3">
        <div
            v-for="order in paginatedOrders"
            :key="order._id"
            class="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                        {{ order.name }} {{ order.surname }}
                        <span v-if="order.isStudent" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Student</span>
                    </h3>
                    <p v-if="order.company" class="text-sm text-gray-600">{{ order.company }}</p>
                </div>
                <div class="text-right">
                    <span class="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">Zarchiwizowane</span>
                    <p class="text-xs text-gray-500 mt-1">
                        {{ formatDate(order.submitted_at) }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <p class="text-gray-600">Email:</p>
                    <p class="font-medium text-gray-900">{{ order.email }}</p>
                </div>
                <div>
                    <p class="text-gray-600">Telefon:</p>
                    <p class="font-medium text-gray-900">{{ order.phone }}</p>
                </div>
                <div>
                    <p class="text-gray-600">Liczba kopii:</p>
                    <p class="font-medium text-gray-900">{{ order.copies }}</p>
                </div>
            </div>

            <div v-if="order.comments" class="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p class="text-gray-600 font-medium mb-1">Komentarz:</p>
                <p class="text-gray-800">{{ order.comments }}</p>
            </div>

            <div v-if="order.file_url" class="mt-4">
                <a 
                    :href="order.file_url" 
                    target="_blank"
                    class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Pobierz plik
                </a>
            </div>
        </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center gap-2">
        <UButton
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            variant="outline"
            size="sm"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
        </UButton>

        <UButton
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            variant="outline"
            size="sm"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
        </UButton>

        <div class="flex gap-1">
            <UButton
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :variant="currentPage === page ? 'solid' : 'outline'"
                :color="currentPage === page ? 'primary' : 'neutral'"
                size="sm"
            >
                {{ page }}
            </UButton>
        </div>

        <UButton
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            variant="outline"
            size="sm"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
        </UButton>

        <UButton
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            variant="outline"
            size="sm"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
            </svg>
        </UButton>
    </div>

    <div v-if="totalPages > 1" class="mt-4 text-center text-sm text-gray-600">
        Strona {{ currentPage }} z {{ totalPages }}
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useGetArchivedOrderList } from '../../composables/useGetArchivedOrderList'

definePageMeta({
  middleware: ['auth']
})

// Pagination state
const currentPage = ref(1)
const pageSize = ref(50)
const searchQuery = ref('')
const sortOrder = ref<'newest' | 'oldest'>('newest')
const isLoading = ref(true)

// Fetch all archived orders (we'll do client-side pagination and filtering)
const { data, error, refresh } = useGetArchivedOrderList(500, 0)

// Total orders from API
const totalOrders = computed(() => {
  return (data.value?.data as any)?.pagination?.total || 0
})

// All fetched orders
const allOrders = computed(() => data.value?.data?.orders || [])

// Filter orders based on search query
const filteredOrders = computed(() => {
  let orders = [...allOrders.value]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    orders = orders.filter(order => {
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

  // Apply sorting
  orders.sort((a, b) => {
    const dateA = new Date(a.submitted_at).getTime()
    const dateB = new Date(b.submitted_at).getTime()
    return sortOrder.value === 'newest' ? dateB - dateA : dateA - dateB
  })

  return orders
})

// Calculate total pages based on filtered results
const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize.value))

// Get orders for current page
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

// Calculate visible page numbers for pagination
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 7
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage.value <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1) // ellipsis
      pages.push(totalPages.value)
    } else if (currentPage.value >= totalPages.value - 3) {
      pages.push(1)
      pages.push(-1) // ellipsis
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push(-1) // ellipsis
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) pages.push(i)
      pages.push(-1) // ellipsis
      pages.push(totalPages.value)
    }
  }
  
  return pages
})

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1 // Reset to first page on search
  }, 300)
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

// Page size change handler
const handlePageSizeChange = () => {
  currentPage.value = 1
}

// Navigate to page
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for data changes
watch(() => data.value, () => {
  isLoading.value = false
}, { immediate: true })

// Reset to page 1 when sort order changes
watch(sortOrder, () => {
  currentPage.value = 1
})

// Initial load
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>
