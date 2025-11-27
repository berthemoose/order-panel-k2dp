<script setup lang="ts">
import { ref, toRef } from "vue";
import type { OrderData } from "../../../../types/order";
import DeclineOrderModal from "../DeclineOrderModal/index.vue";

const props = defineProps<{
  order: OrderData;
  isExpanded: boolean;
  sectionType?: "pending" | "in-progress" | "completed" | "rejected";
}>();



const emit = defineEmits<{
  toggleExpand: [orderId: string];
  acceptOrder: [orderId: string];
  declineOrder: [orderId: string];
  markReady: [orderId: string];
  notifyDelay: [orderId: string];
  archiveOrder: [orderId: string];
}>();

const isDeclineModalOpen = ref(false);

const getOrderStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    ready: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";
};

const translateOrderStatus = (status: string) => {
  const translations: Record<string, string> = {
    completed: "Zakończone",
    pending: "Oczekujące",
    in_progress: "W trakcie",
    ready: "Gotowe",
    cancelled: "Anulowane",
    placed: "Złożone",
    confirmed: "Potwierdzone",
    shipped: "Wysłane",
  };
  return translations[status.toLowerCase()] || status;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleToggle = () => {
  emit("toggleExpand", props.order._id);
};

const handleDecline = () => {
  emit("declineOrder", props.order._id);
};

const handleAccept = () => {
  emit("acceptOrder", props.order._id);
};


const handleMarkReady = () => {
  emit("markReady", props.order._id);
};
const handleNotifyDelay = () => {
  emit("notifyDelay", props.order._id);
};
const handleArchive = () => {
  emit("archiveOrder", props.order._id);
};

// const closeDeclineModal = () => {
//   isDeclineModalOpen.value = false;
// };
</script>

<template>

  <div
    @click="handleToggle()"
    class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
    :class="{ 'ring-2 ring-blue-500': isExpanded }"
  >
    <!-- Compact View -->
    <div class="p-4">
      <div class="flex items-center justify-between">
        <div class="flex gap-3 flex-1 justify-between p-2 my-6">
          <!-- ORDER INFO -->
          <div class="flex flex-col">
            <div>
              <p class="text-sm text-gray-600 font-mono">
                Identyfikator zamówienia: {{ order._id }}
              </p>
              <h3 class="text-lg font-semibold text-gray-900 uppercase">
                {{ order.customer_info.name }} {{ order.customer_info.surname }}
              </h3>
              <p class="text-gray-900" v-if="order.customer_info.company">
                Firma: {{ order.customer_info.company }}
              </p>
              <p class="text-sm text-gray-500 mt-0.5">
                {{ formatDate(order.submitted_at) }}
              </p>
            </div>

            <!-- Contact -->
            <div class="mt-4 flex gap-3">
              <div>
                <UButton
                  :to="`mailto:${order.customer_info.email}`"
                  color="info"
                  variant="soft"
                  icon="i-heroicons-envelope"
                  :label="order.customer_info.email"
                  @click.stop
                  external
                />
              </div>
              <div>
                <UButton
                  color="info"
                  variant="soft"
                  icon="i-heroicons-phone"
                  :label="order.customer_info.phone"
                  @click.stop
                  external
                />
              </div>
            </div>

            <!-- Quantity -->
            <div v-if="order.items && order.items.length > 0" class="mt-4">
              <h2 class="mt-2 mr-1 font-bold text-lg">Zamówienie:</h2>
              <p v-for="(item, index) in order.items">
                {{ index + 1 }}. {{ item.product_name }} (nakład:
                {{ item.values.copies }})
              </p>
            </div>
          </div>

          <!-- Price, status, etc. -->
          <div class="">
            <div class="w-full flex flex-col justify-end my-4">
              <div
                class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-700': 0,
                  'bg-yellow-100 text-yellow-700': 1,
                  'bg-red-100 text-red-700': 0,
                }"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-green-500': 0,
                    'bg-yellow-500 animate-pulse': 1,
                    'bg-red-500': 0,
                  }"
                ></span>
                <span>Oczekiwanie na płatność</span>

                <!-- TODO: change the gross val -->
                <!-- TODO: add a popover when hovered that makes a call to check the stripe payment intent -->
                <div class="flex flex-col items-center text-center p-2">
                  <h3 class="font-bold text-2xl">
                    {{
                      order.total.toLocaleString("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                      })
                    }}
                  </h3>
                  <p class="text-xs">
                    Cena brutto
                    {{
                      order.total.toLocaleString("pl-PL", {
                        style: "currency",
                        currency: "PLN",
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-[2px]">
              <span
                class="px-2 py-1 text-xs font-semibold bg-red-200 text-black rounded text-center flex items-center justify-center gap-2"
              >
                <UIcon class="text-xl" name="picon:student" />
                STUDENT
              </span>
              <span
                class="px-2 py-1 text-xs font-semibold bg-red-200 text-black rounded text-center flex items-center justify-center gap-2"
              >
                <UIcon class="text-xl" name="picon:student" />
                FIRMA
              </span>
              <span
                class="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded text-center flex items-center justify-center gap-2"
              >
                <UIcon class="text-xl" name="ic:round-cancel" />
                ZAMÓWIENIE ODRZUCONE
              </span>
            </div>

            <!-- Control buttons -->
            <div class="mt-16">
              <!-- Pending buttons -->
              <div
                class="flex flex-col gap-2"
                v-if="!sectionType || sectionType === 'pending'"
              >
                <div class="">
                  <UButton
                    color="success"
                    size="lg"
                    icon="i-heroicons-check-circle"
                    label="Wyślij do realizacji"
                    @click.stop="handleAccept"
                    class="flex-1 cursor-pointer"
                  />
                </div>
                <div class="">
                  <UButton
                    label="Odrzuć zamówienie"
                    size="lg"
                    icon="ic:round-do-not-disturb"
                    color="error"
                    variant="solid"
                    @click.stop="handleDecline"
                    class="cursor-pointer"
                  />
                </div>
              </div>

              <!-- In progress buttons -->
              <div v-else-if="sectionType === 'in-progress'">
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
                    disabled
                    icon="i-heroicons-exclamation-triangle"
                    color="warning"
                    @click.stop="handleNotifyDelay"
                    class="cursor-pointer"
                  />
                </div>
              </div>

              <!-- Completed buttons -->
              <div v-else-if="sectionType === 'completed'">
                <div class="">
                  <UButton
                    color="info"
                    variant="subtle"
                    size="lg"
                    icon="i-heroicons-archive-box"
                    label="Archiwizuj"
                    @click.stop="handleArchive"
                    class="cursor-pointer"
                  />
                </div>
              </div>

              <!-- Rejected buttons -->
               <div v-else-if="sectionType === 'rejected'">
                <div class="">
                  <UButton
                    color="info"
                    variant="subtle"
                    size="lg"
                    icon="i-heroicons-archive-box"
                    label="Archiwizuj"
                    @click.stop="handleArchive"
                    class="cursor-pointer"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <!-- Expand Icon -->
        <svg
          class="w-8 h-8 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <p class="text-sm text-gray-400">Szczegóły zamówienia</p>
      </div>

      <!-- SPECS -->
      <div
        v-if="isExpanded"
        class="border-t border-gray-200 bg-gray-50 p-4 space-y-4"
      >
        <div v-if="order.items && order.items.length > 0">
          <div class="">
            <h2 class="font-bold text-lg my-2">
              Specfyikacja produktów ({{ order.items.length }})
            </h2>
          </div>

          <!-- No. and title of product -->
          <div v-for="(item, index) in order.items">
            <div class="flex items-center p-1 justify-between">
              <div v-if="item.product_name">
                <h1>{{ index + 1 }}. {{ item.product_name }}</h1>
              </div>

              <div class="flex items-center gap-1">
                <span class="text-gray-500">Nakład:</span>
                <span class="font-semibold text-gray-900">{{
                  item.values.copies
                }}</span>
              </div>
            </div>

            <!-- Specifications -->
            <div
              class="bg-white p-3 my-3 rounded border border-gray-200 space-y-2"
            >
              <p class="text-xs font-medium text-gray-500 uppercase mb-2">
                Specyfikacja
              </p>
              <!-- Spec values -->
              
              

              <div v-for="(value, key) in item.values">
                {{ key }} : {{ value }}
              </div>
              <!-- Download button -->
              <!-- TODO: add file name, file size and display it in label -->
              <div class="my-4">
                <UButton
                  :label="
                    item.file_url ? `Pobierz plik` : 'Oczekiwanie na plik'
                  "
                  :loading="!item.file_url"
                  :to="item.file_url"
                  icon="i-heroicons-arrow-down-tray"
                  size="xl"
                  color="info"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
      </div>

      <div>
        <!-- Order ID -->

        <!-- Action Buttons -->
        <div
          class="flex w-full items-center justify-around pt-4 px-36 border-t border-gray-200"
        >
          <!-- Pending Order Buttons -->
          <!-- 
 -->
          <!-- In-Progress Order Buttons -->
          <!-- 
 -->
          <!-- Completed Order Buttons -->
          <!-- 
 -->
          <!-- Rejected Order Buttons -->
          <!--  -->
        </div>
      </div>
    </div>
  </div>
</template>
