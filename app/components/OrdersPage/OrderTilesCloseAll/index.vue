<script setup lang="ts">
defineProps<{
  expandedOrderIds: string[]
}>()

const emit = defineEmits<{
  closeAll: []
}>()

const closeAll = () => {
  emit('closeAll')
}
</script>

<template>
    <UButton
            v-if="expandedOrderIds.length > 0"
            @click="closeAll"
            color="neutral"
            variant="solid"
            class="flex items-center gap-2"
        >
            <UIcon name="material-symbols:close"/>
            Zamknij wszystkie
        </UButton>
</template>    