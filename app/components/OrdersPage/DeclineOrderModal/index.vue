<script setup lang="ts">
import { ref } from 'vue'
import type { Order } from '../../../../types/order'

const props = defineProps<{
  isOpen: boolean
  order: Order
}>()

const emit = defineEmits<{
  close: []
  decline: [comment: string]
}>()

const comment = ref('')

const handleDecline = () => {
  emit('decline', comment.value || 'Order declined by operator')
  comment.value = ''
}

const handleClose = () => {
  emit('close')
  comment.value = ''
}
</script>

<template>
    <UModal :model-value="isOpen" @update:model-value="handleClose">
        <slot />
        <template #content>
            <UCard class="bg-gray-50">
                <template #header>
                    <h3 class="text-lg font-semibold text-gray-800 bg-blue-50 -m-6 p-6 mb-0">
                        Potwierdzenie odrzucenia zamówienia
                    </h3>
                </template>
                
                <div class="py-4 bg-white rounded-lg px-4">
                    <p class="text-black">Czy na pewno chcesz odrzucić to zamówienie?</p>
                    <p class="text-sm text-gray-400 mt-2">Nr zamówienia: {{ order._id }}</p>
                    <p class="text-sm text-gray-400 mt-2">Imię i nazwisko: {{ order.name }} {{ order.surname }}</p>

                </div>

                <div class="w-full flex flex-col text-left justify-center">
                    <p class="text-sm text-black pt-3 pb-1">Komentarz</p>
                    <UTextarea 
                        v-model="comment"
                        class="w-full min-h-[200px]" 
                        :rows="16" 
                        placeholder="Dodaj komentarz (brak komentarza spowoduje wysłanie wiadomości domyślnej)" 
                        variant="outline"
                    />
                </div>
                
                <template #footer>
                    <div class="flex justify-end gap-3 bg-gray-50 -m-6 p-6 mt-0">
                        <UButton 
                            label="Nie" 
                            color="secondary" 
                            variant="outline"
                            @click="handleClose"
                        />
                        <UButton 
                            label="Tak" 
                            color="error" 
                            @click="handleDecline"
                        />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>
