<template>
  <div>
    {{ props.order.payment_status }}

    <UPopover mode="">
      <div class="w-full flex flex-col justify-end my-4">
        <!-- Main price container -->
        <div
          class="flex items-center gap-2 px-3 py-1 hover:ring rounded-full text-xs font-medium"
          :class="{
            'bg-green-100 text-green-700': order.payment_status === 'succeeded',
            'bg-yellow-100 text-yellow-700':
              order.payment_status === 'pending' ||
              order.payment_status === 'processing',
            'bg-red-100 text-red-700': order.payment_status === 'failed',
          }"
        >
          <!-- Animated dot -->
          <span
            class="w-2 h-2 rounded-full"
            :class="{
              hidden: order.payment_status === 'succeeded',
              'bg-yellow-500 animate-pulse':
                order.payment_status === 'pending' ||
                order.payment_status === 'processing',
            }"
          ></span>
          <UIcon class="text-2xl" :name="paymentStatusIcon" />
          <span>{{
            order.payment_status === "succeeded"
              ? "Płatność zakończona sukcesem"
              : order.payment_status === "failed"
              ? "Płatność nieudana"
              : "Oczekiwanie na płatność"
          }}</span>
          <div class="flex flex-col items-center text-center p-2">
            <div class="font-bold text-2xl">
              {{
                order.total.toLocaleString("pl-PL", {
                  style: "currency",
                  currency: "PLN",
                })
              }}
            </div>
            <div class="text-xs">
              Cena brutto
              {{
                order.total.toLocaleString("pl-PL", {
                  style: "currency",
                  currency: "PLN",
                })
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- Popover content -->
      <template #content>
        <div
          v-if="order.payment_status"
          class="p-8 bg-white text-black rounded-xl"
        >
          <div class="flex items-center justify-center flex-col p-4">
            <span class="flex items-center gap-2">
              Status płatności
              <UIcon class="text-4xl" name="fa7-brands:stripe" />
            </span>

            <a
              v-if="order.payment"
              :href="`https://dashboard.stripe.com/payments/${order.payment_intent_id}`"
              target="_blank"
              class="text-xs text-center text-blue-600 hover:underline"
            >
              Kliknij aby przejść do płatności
            </a>
            <p v-else class="text-xs text-center text-gray-500"></p>
          </div>
          <UContainer>
            <div
              class="w-[30vw] border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                class="flex gap-12 px-4 py-3 bg-white hover:bg-gray-50 border-b last:border-b-0 border-gray-100 items-center transition-colors duration-150"
              >
                <p class="text-sm font-medium text-gray-500 w-1/3">
                  ID płatności
                </p>
                <p class="text-sm font-semibold text-gray-900 break-all">
                  {{ order.payment_intent_id }}
                </p>
              </div>

              <div
                class="flex gap-12 px-4 py-3 bg-gray-50 hover:bg-gray-100 border-b last:border-b-0 border-gray-100 items-center transition-colors duration-150"
              >
                <p class="text-sm font-medium text-gray-500 w-1/3">Status</p>
                <p
                  class="text-sm font-semibold"
                  :class="{
                    ' text-green-700': order.payment_status === 'succeeded',
                    'text-yellow-700 animate-pulse':
                      order.payment_status === 'pending' ||
                      order.payment_status === 'processing',
                    ' text-red-700': order.payment_status === 'failed',
                  }"
                >
                  {{
                    order.payment_status === "succeeded"
                      ? "Opłacone"
                      : order.payment_status === "failed"
                      ? "Nieopłacone"
                      : "Oczekiwanie"
                  }}
                </p>
              </div>

              <div
                class="flex gap-12 px-4 py-3 bg-white hover:bg-gray-50 border-b last:border-b-0 border-gray-100 items-center transition-colors duration-150"
              >
                <p class="text-sm font-medium text-gray-500 w-1/3">Data</p>
                <p
                  class="text-sm font-semibold text-gray-900"
                  v-if="order.payment"
                >
                  {{
                    order.payment.created ? order.payment.created : "Brak daty"
                  }}
                </p>
                <p v-else>Brak daty</p>
              </div>

              <div
                class="flex gap-12 px-4 py-3 bg-white hover:bg-gray-50 border-b last:border-b-0 border-gray-100 items-center transition-colors duration-150"
              >
                <p class="text-sm font-medium text-gray-500 w-1/3">
                  Pozostałe dane
                </p>

                <div v-if="order.payment" class="max-h-[200px] overflow-scroll">
                  <div v-for="(value, key) in order.payment" class="pt-4">
                    <p class="text-sm font-semibold text-gray-900">
                      {{ key }}
                    </p>
                    <p class="text-sm text-gray-900">
                      {{ value }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </UContainer>
        </div>
        <div v-else>
          <p>Oczekiwanie na realizację płatności o ID:</p>
          <p>
            {{ order.payment_intent_id }}
          </p>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script lang="ts" setup>
import { OrderData } from "../../../../../types/order";
import { computed } from "vue";
const props = defineProps<{
  order: OrderData;
}>();

const paymentStatusIcon = computed(() => {
  switch (props.order.payment_status) {
    case "failed":
      return "i-material-symbols-error";
    case "succeeded":
      return "i-healthicons-yes";
    default:
      return "";
  }
});

</script>
