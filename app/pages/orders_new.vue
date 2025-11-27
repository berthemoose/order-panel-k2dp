<template>
  <div class="p-6 m-6 text-black">
    <OrdersPageWebSocketStatusIndicator :ws-status="wsStatus" />
    <p>Is live orders initialized: {{ isLiveOrdersInitialized }}</p>
    <p>Is data initialized: {{ isDataInitialized }}</p>

    

    <!-- Testing sections -->
    <div v-for="section in sectionOrderWithData">
      <!-- only sectionOrders for now, change when implementing sorting -->
      <div
        v-if="section.sectionOrders && section.sectionOrders.length > 0"
        :class="[
          'rounded-xl p-6 shadow-sm border transition-all duration-200',
          section.bgClass,
          section.borderClass,
        ]"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <h1
              v-if="section.id === 'pending'"
              :class="['text-3xl font-bold', section.textClass]"
            >
              {{ section.title }}
            </h1>
            <h2 v-else :class="['text-3xl font-bold', section.textClass]">
              {{ section.title }}
            </h2>
            <!-- TODO: -->
            <!-- <OrdersPageOrderTilesCloseAll
              v-if="section.id === 'pending'"
              :expanded-order-ids="expandedOrderIds"
              @close-all="closeAll"
            /> -->
          </div>
        </div>

        <div class="space-y-3">
          <!-- OrderPage Order Tile -->
          <OrdersPageOrderTile
            v-for="order in section.sectionOrders"
            :key="order._id"
            :order="order"
            :is-expanded="expandedOrderIds.includes(order._id)"
            :section-type="section.id"
            @toggle-expand="toggleExpand"
            @accept-order="
              (orderId: string) =>
                section.id === 'pending' && handleAcceptOrder(orderId) 
            "
            @decline-order="(orderId: string) =>
                      section.id === 'pending' &&
                      handleDeclineOrder(orderId)"
            @mark-ready="(orderId: string) => section.id=== 'in-progress' && handleMarkReady(orderId) "
            @archive-order="(orderId:string) => (section.id === 'completed' && handleArchiveOrder(orderId)) || (section.id === 'rejected' && handleArchiveRejectedOrder(orderId))"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

import { useGetOrderList } from "../composables/useGetOrderList";
import { useGetPendingOrderList } from "../composables/useGetPendingOrderList";
import { useGetFinishedOrderList } from "../composables/useGetFinishedOrderList";
import { useGetCancelledOrderList } from "../composables/useGetCancelledOrderList";
import { useAcceptOrder } from "../composables/useAcceptOrder";
import { useDeclineOrder } from "../composables/useDeclineOrder";
import { useMarkReadyOrder } from "../composables/useMarkReadyOrder";
import { useNotifyDelayOrder } from "../composables/useNotifyDelayOrder";
import { useArchiveOrder } from "../composables/useArchiveOrder";
import { useArchiveRejectedOrder } from "../composables/useArchiveRejectedOrder";
import { useRuntimeConfig } from "nuxt/app";
import { useServerApis } from "../composables/useServerApis";

import type { OrderData } from "../../types/order";
import type { Section } from "../../types/section";

const config = useRuntimeConfig();

const { acceptOrder } = useAcceptOrder();
const { declineOrder } = useDeclineOrder();
const { markReadyOrder } = useMarkReadyOrder();
const { notifyDelayOrder } = useNotifyDelayOrder();
const { archiveOrder } = useArchiveOrder();
const { archiveRejectedOrder } = useArchiveRejectedOrder();

// TODO: Auth middleware

// WebSocket connection
const ws = ref<WebSocket | null>(null);
const wsStatus = ref<"disconnected" | "connected" | "error">("disconnected");
const { wsUrl } = useServerApis();

// WebSocket controller
const connectWebSocket = () => {
  ws.value = new WebSocket(`${wsUrl}/ws/orders`);

  ws.value.onopen = () => {
    console.log(
      "Zainicjowano połączenie z serwerem WebSocket - oczekuję na zamówienia..."
    );
    wsStatus.value = "connected";
  };

  // WebSocket handle new order
  ws.value.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Parsed WebSocket message", message);

      // Handle new order from WebSocket
      if (message.type === "new_order") {
        const orderData: OrderData = JSON.parse(message.data);

        console.log("Order data type:", typeof orderData, orderData);

        // Check if order already exists (deduplication)
        const exists = liveOrders.value.some((o) => o._id === orderData._id);
        if (!exists) {
          // Add new order to the top of the list
          liveOrders.value = [orderData, ...liveOrders.value];
          console.log("Dodano nowe zamówienie:", orderData._id);
          // TODO: Show toast notification for new order
        }
      } else if (message.type === "order_updated") {
        console.log("Aktualizacja zamówienia", message.data);

        // Ensure data is a proper object
        const updateData = message.data;
        console.log("update data", updateData);

        // Find and update the specific order
        const orderIndex = liveOrders.value.findIndex(
          (o) => o._id === updateData._id
        );

        liveOrders.value.forEach((order) => {
          const cartIndex = order.items.findIndex(
            (o) => o.cart_item_id === updateData.cart_item_id
          );
          order.items[cartIndex].file_url = updateData.updates.file_url;
          order.items[cartIndex].upload_status=updateData.updates.upload_status
        });

        console.log("TEST INDEX", orderIndex);

        if (orderIndex !== -1) {
          // Update the order with new data (merge updates)
          liveOrders.value[orderIndex] = {
            ...liveOrders.value[orderIndex],
            ...(updateData.updates || updateData), // Handle both formats: {updates: {...}} or direct update object
          };
          console.log("✅ Zaktualizowano zamówienie:", updateData._id);
        }
      }
    } catch (error) {
      console.error("Błąd przy przetwarzaniu wiadomości WebSocket:", error);
      console.error("Oryginalna wiadomość:", event.data);
    }
  };

  // WebSocket error
  ws.value.onerror = () => {
    console.error("❌ Błąd połączenia z serwerem WebSocket");
    wsStatus.value = "error";
  };

  // WebSocket gentle close
  ws.value.onclose = () => {
    console.log("🔌 Rozłączono z serwerem WebSocket");
    wsStatus.value = "disconnected";
  };
};

// Auth verification state
const isVeryfyingAuth = ref(false);

// Data initialization state
const isDataInitialized = ref(false);

// Get orders from backend api
const { data, error } = useGetOrderList();
const { data: pendingData, error: pendingError } = useGetPendingOrderList();
const { data: finishedData, error: finishedError } = useGetFinishedOrderList();
const { data: cancelledData, error: cancelledError } =
  useGetCancelledOrderList();

// - DB 'orders' collection -> Frontend: 'incoming' section (new orders)
const ordersFromRest = computed(() => data.value?.data?.orders || []);
const liveOrders = ref<OrderData[]>([]);
const isLiveOrdersInitialized = ref(false);

// - DB 'pending-orders' -> Frontend: 'pending' section (accepted orders)
const pendingOrdersFromRest = computed(
  () => pendingData.value?.data?.orders || []
);
const livePendingOrders = ref<OrderData[]>([]);
const isLivePendingOrdersInitialized = ref(false);

//  - DB 'finished-orders' collection -> Frontend: 'finished' section (finished orders)
const finishedOrdersFromRest = computed(
  () => finishedData.value?.data?.orders || []
);
const liveFinishedOrders = ref<OrderData[]>([]);
const isLiveFinishedOrdersInitialized = ref(false);

// TODO: Requires refunds in Stripe
//  - DB 'cancelled orders' collection -> Frontend: 'cancelled' section (cancelled/rejected orders)
const cancelledOrdersFromRest = computed(
  () => cancelledData.value?.data?.orders || []
);
const liveCancelledOrders = ref<OrderData[]>([]);
const isLiveCancelledOrdersInitialized = ref(false);

const toggleExpand = (orderId: string) => {
  const index = expandedOrderIds.value.indexOf(orderId);

  if (index !== -1) {
    // If already expanded, collapse it
    expandedOrderIds.value.splice(index, 1);
  } else {
    // If not expanded, add it
    if (expandedOrderIds.value.length >= 3) {
      // Remove the oldest (first) one if we're at max capacity
      expandedOrderIds.value.shift();
    }
    expandedOrderIds.value.push(orderId);
  }
};

// Combine REST orders with live orders, prioritizing live updates
const orders = computed(() => {
  // Once live orders are initialized, always use them even if empty
  if (isLiveOrdersInitialized.value) {
    return liveOrders.value;
  }
  return ordersFromRest.value;
});

// Pending orders computed
const pendingOrders = computed(() => {
  if (isLivePendingOrdersInitialized.value) {
    return livePendingOrders.value;
  }
  return pendingOrdersFromRest.value;
});

// Finished orders computed
const finishedOrders = computed(() => {
  if (isLiveFinishedOrdersInitialized.value) {
    return liveFinishedOrders.value;
  }
  return finishedOrdersFromRest.value;
});

// Cancelled orders computed
const cancelledOrders = computed(() => {
  if (isLiveCancelledOrdersInitialized.value) {
    return liveCancelledOrders.value;
  }
  return cancelledOrdersFromRest.value;
});

/* ACCEPT ORDER HANDLER */
const handleAcceptOrder = async (orderId: string) => {
  try {
    const result = await acceptOrder(orderId);
    console.log("Accept result:", result);

    // Move order from 'orders' DB (pending section) to 'pending-orders' DB (in-progress section)
    const orderIndex = liveOrders.value.findIndex((o) => o._id === orderId);
    if (orderIndex !== -1) {
      const [order] = liveOrders.value.splice(orderIndex, 1);
      if (order) {
        // order. = "in_progress"; TODO: ADD ORDER STATUS TO DB
        livePendingOrders.value.push(order);
      }
    }
  } catch (error) {
    console.error("Error accepting order:", error);
  }
};

/* MARK READY ORDER HANDLER */
const handleMarkReady = async (orderId: string) => {
  try {
    const result = await markReadyOrder(orderId);
    console.log("Mark ready result:", result);

    // Move order from 'pending-orders' DB (in-progress section) to 'finished-orders' DB (completed section)
    const orderIndex = livePendingOrders.value.findIndex(
      (o) => o._id === orderId
    );
    if (orderIndex !== -1) {
      const [order] = livePendingOrders.value.splice(orderIndex, 1);
      if (order) {
        // order.order_status = "ready"; TODO: ADD ORDER STATUS TO DB
        liveFinishedOrders.value.push(order);
      }
    }
  } catch (error) {
    console.error("Error marking order as ready:", error);
  }
};

/* ARCHIVE ORDER HANDLER */
const handleArchiveOrder = async (orderId: string) => {
  try {
    const result = await archiveOrder(orderId);
    console.log("Archive result:", result);

    // Remove order from 'finished-orders' DB (completed section)
    const orderIndex = liveFinishedOrders.value.findIndex(
      (o) => o._id === orderId
    );
    if (orderIndex !== -1) {
      liveFinishedOrders.value.splice(orderIndex, 1);
      console.log("✅ Zamówienie zostało zarchiwizowane");
    }
  } catch (error) {
    console.error("Error archiving order:", error);
  }
};

/* ARCHIVE REJECTED ORDER HANDLER */
const handleArchiveRejectedOrder = async (orderId: string) => {
  try {
    const result = await archiveRejectedOrder(orderId);
    console.log("Archive rejected order result:", result);

    // Remove order from 'cancelled-orders' DB (rejected section)
    const orderIndex = liveCancelledOrders.value.findIndex(
      (o) => o._id === orderId
    );
    if (orderIndex !== -1) {
      liveCancelledOrders.value.splice(orderIndex, 1);
      console.log("✅ Odrzucone zamówienie zostało zarchiwizowane");
    }
  } catch (error) {
    console.error("Error archiving rejected order:", error);
  }
};

/* DECLINE ORDER HANDLER */
const handleDeclineOrder = async (orderId: string) => {
  try {
    const result = await declineOrder(orderId);
    console.log("Decline result:", result);

    // Move order from 'orders' DB (pending section) to 'cancelled-orders' DB (rejected section)
    const orderIndex = liveOrders.value.findIndex((o) => o._id === orderId);
    if (orderIndex !== -1) {
      const [order] = liveOrders.value.splice(orderIndex, 1);
      if (order) {
        // order.order_status = "cancelled";
        // order.isRejected = true; TODO: ADD THESE TWO IN THE DB LIKE ABOVE!
        liveCancelledOrders.value.push(order);
      }
    }
  } catch (error) {
    console.error("Error declining order:", error);
  }
};

const expandedOrderIds = ref<string[]>([]);

// Section order management
const defaultSectionOrder: Section[] = [
  {
    id: "pending",
    title: "Zamówienia oczekujące",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    textClass: "text-amber-900",
  },
  {
    id: "in-progress",
    title: "Zamówienia w trakcie realizacji",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
    textClass: "text-blue-900",
  },
  {
    id: "completed",
    title: "Zamówienia zakończone",
    bgClass: "bg-green-50",
    borderClass: "border-green-200",
    textClass: "text-green-900",
  },
  {
    id: "rejected",
    title: "Zamówienia odrzucone",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    textClass: "text-red-900",
  },
];

// Load section order from localStorage
function loadSectionOrder() {
  if (typeof window === "undefined") return defaultSectionOrder;
  const saved = localStorage.getItem("orderSectionOrder");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultSectionOrder;
    }
  }
  return defaultSectionOrder;
}

const sectionOrder = ref<Section[]>(loadSectionOrder());

// Computed section data with orders
const sectionsWithOrders = computed(() => {
  return sectionOrder.value.map((section: Section) => {
    const sectionOrders =
      section.id === "pending"
        ? orders.value
        : section.id === "in-progress"
        ? pendingOrders.value
        : section.id === "completed"
        ? finishedOrders.value
        : cancelledOrders.value;

    // TODO: Filter sectionOrders
    return {
      ...section,
      sectionOrders,
    };
  });
});

const sectionOrderWithData = computed({
  get: () => sectionsWithOrders.value,
  set: (newOrder: Section[]) => {
    sectionOrder.value = newOrder.map((s: Section) => ({
      id: s.id,
      title: s.title,
      bgClass: s.bgClass,
      borderClass: s.borderClass,
      textClass: s.textClass,
    }));
  },
});

// Populate with DB orders
watch(
  data,
  (newData) => {
    if (newData && !isLiveOrdersInitialized.value) {
      const orders = newData.data?.orders || [];
      liveOrders.value = [...orders];
      isLiveOrdersInitialized.value = true;
      console.log(
        `Wczytano ilość zamówień: ${liveOrders.value.length} z serwera`
      );
    }
  },
  { immediate: true }
);

// Watch for all data sources to be initialized before connecting WebSocket
watch(
  [
    isLiveOrdersInitialized,
    isLivePendingOrdersInitialized,
    isLiveFinishedOrdersInitialized,
    isLiveCancelledOrdersInitialized,
  ],
  ([orders, pending, finished, cancelled]) => {
    if (
      orders &&
      pending &&
      finished &&
      cancelled &&
      !isDataInitialized.value
    ) {
      isDataInitialized.value = true;
      console.log("✅ Wszystkie dane zostały załadowane - łączę z WebSocket");
      connectWebSocket();
    }
  },
  { immediate: true }
);

watch(
  pendingData,
  (newData) => {
    if (newData && !isLivePendingOrdersInitialized.value) {
      const orders = newData.data?.orders || [];
      livePendingOrders.value = [...orders];
      isLivePendingOrdersInitialized.value = true;
      console.log(
        `✅ Wczytałem ilość zamówień oczekujących: ${livePendingOrders.value.length} z serwera`
      );
    }
  },
  { immediate: true }
);

watch(
  finishedData,
  (newData) => {
    if (newData && !isLiveFinishedOrdersInitialized.value) {
      const orders = newData.data?.orders || [];
      liveFinishedOrders.value = [...orders];
      isLiveFinishedOrdersInitialized.value = true;
      console.log(
        `✅ Wczytałem ilość zamówień zakończonych: ${liveFinishedOrders.value.length} z serwera`
      );
    }
  },
  { immediate: true }
);

// Watch for cancelled orders data (DB 'cancelled-orders' → Frontend 'rejected')
watch(
  cancelledData,
  (newData) => {
    if (newData && !isLiveCancelledOrdersInitialized.value) {
      const orders = newData.data?.orders || [];
      liveCancelledOrders.value = [...orders];
      isLiveCancelledOrdersInitialized.value = true;
      console.log(
        `✅ Wczytałem ilość zamówień odrzuconych: ${liveCancelledOrders.value.length} z serwera`
      );
    }
  },
  { immediate: true }
);

/* 
DEBUG LOGS:
will only log if the server is localhost
*/
onMounted(() => {
  const url = wsUrl ? String(wsUrl).toLowerCase() : "";
  if (url.includes("localhost")) {
    console.log(`Websocket endpoint: ${wsUrl}`);
  }
});

/* CLEANUP */
onUnmounted(() => {
  if (ws.value) {
    ws.value.close();
    console.log("Połączenie z serwerem WebSocket zostąło zamknięte");
  }
});
</script>
