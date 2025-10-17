<template>
  <div class="container mx-auto p-8 max-w-2xl text-black">
    <h1 class="text-3xl font-bold mb-6">WebSocket Test</h1>
    
    <!-- Connection Status -->
    <div class="mb-6 p-4 rounded-lg" :class="statusClass">
      <p class="font-semibold">
        Status: <span class="uppercase">{{ status }}</span>
      </p>
      <p class="text-sm mt-1">{{ statusMessage }}</p>
    </div>
    
    <!-- Connection Controls -->
    <div class="mb-6 space-x-4">
      <button 
        @click="connect" 
        :disabled="status === 'connected'"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Connect
      </button>
      <button 
        @click="disconnect" 
        :disabled="status === 'disconnected'"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Disconnect
      </button>
    </div>
    
    <!-- Send Message Form -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Send Message to Backend:</label>
      <div class="flex gap-2">
        <input 
          v-model="messageToSend"
          type="text" 
          placeholder="Type a message..."
          @keyup.enter="sendMessage"
          :disabled="status !== 'connected'"
          class="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button 
          @click="sendMessage"
          :disabled="status !== 'connected' || !messageToSend.trim()"
          class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
      <p class="text-sm text-gray-600 mt-2">
        This will be logged on the backend (check your FastAPI console)
      </p>
    </div>
    
    <!-- Received Messages Log -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold mb-3">Received Messages from Backend:</h2>
      <div class="bg-gray-100 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
        <div v-if="receivedMessages.length === 0" class="text-black">
          No messages received yet...
        </div>
        <div 
          v-for="(msg, index) in receivedMessages" 
          :key="index"
          class="mb-2 pb-2 border-b border-gray-300 last:border-0"
        >
          <span class="text-black">[{{ msg.time }}]</span>
          <span class="ml-2">{{ msg.text }}</span>
        </div>
      </div>
      <button 
        @click="clearMessages"
        class="mt-2 px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
      >
        Clear Log
      </button>
    </div>
    
    <!-- Instructions -->
    <div class="bg-blue-50 border-l-4 border-blue-500 p-4">
      <h3 class="font-semibold mb-2">How to Test:</h3>
      <ol class="list-decimal list-inside space-y-1 text-sm">
        <li>Make sure your FastAPI backend is running on port 8000</li>
        <li>Click "Connect" button to establish WebSocket connection</li>
        <li>Type a message and click "Send" (it will be logged in FastAPI console)</li>
        <li>When someone creates a new order, you'll see it here in real-time</li>
        <li>Check backend logs for: <code class="bg-white px-1 rounded">Received message from client: ...</code></li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

// WebSocket instance
const ws = ref<WebSocket | null>(null)

// Connection status
const status = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

// Message to send
const messageToSend = ref('')

// Received messages log
const receivedMessages = ref<Array<{ time: string; text: string }>>([])

// Status styling
const statusClass = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'bg-green-100 border border-green-400 text-green-800'
    case 'connecting':
      return 'bg-yellow-100 border border-yellow-400 text-yellow-800'
    case 'error':
      return 'bg-red-100 border border-red-400 text-red-800'
    default:
      return 'bg-gray-100 border border-gray-400 text-gray-800'
  }
})

const statusMessage = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'WebSocket connection established. You can send and receive messages.'
    case 'connecting':
      return 'Attempting to connect to WebSocket server...'
    case 'error':
      return 'Connection error. Check if backend is running on port 8000.'
    default:
      return 'Not connected. Click "Connect" to establish connection.'
  }
})

// Connect to WebSocket
const connect = () => {
  if (ws.value?.readyState === WebSocket.OPEN) {
    console.log('Already connected')
    return
  }
  
  status.value = 'connecting'
  
  // Create WebSocket connection
  // NOTE: Change this URL if your backend runs on a different port
  ws.value = new WebSocket('ws://localhost:8003/ws/orders')
  
  // Connection opened
  ws.value.onopen = () => {
    console.log('✅ WebSocket connected')
    status.value = 'connected'
    addReceivedMessage('✅ Connected to WebSocket server')
  }
  
  // Message received from server
  ws.value.onmessage = (event) => {
    console.log('📨 Message from server:', event.data)
    
    try {
      // Try to parse as JSON (for structured messages)
      const data = JSON.parse(event.data)
      addReceivedMessage(`📨 ${JSON.stringify(data, null, 2)}`)
    } catch {
      // If not JSON, just show raw text
      addReceivedMessage(`📨 ${event.data}`)
    }
  }
  
  // Connection closed
  ws.value.onclose = () => {
    console.log('🔌 WebSocket disconnected')
    status.value = 'disconnected'
    addReceivedMessage('🔌 Disconnected from server')
  }
  
  // Error occurred
  ws.value.onerror = (error) => {
    console.error('❌ WebSocket error:', error)
    status.value = 'error'
    addReceivedMessage('❌ Connection error - Is backend running?')
  }
}

// Disconnect from WebSocket
const disconnect = () => {
  if (ws.value) {
    ws.value.close()
    ws.value = null
    status.value = 'disconnected'
  }
}

// Send message to server
const sendMessage = () => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not connected')
    return
  }
  
  if (!messageToSend.value.trim()) {
    return
  }
  
  // Send message to backend
  ws.value.send(messageToSend.value)
  console.log('📤 Sent:', messageToSend.value)
  
  // Add to log
  addReceivedMessage(`📤 Sent: ${messageToSend.value}`)
  
  // Clear input
  messageToSend.value = ''
}

// Add message to received log
const addReceivedMessage = (text: string) => {
  const time = new Date().toLocaleTimeString()
  receivedMessages.value.unshift({ time, text })
  
  // Keep only last 50 messages
  if (receivedMessages.value.length > 50) {
    receivedMessages.value.pop()
  }
}

// Clear message log
const clearMessages = () => {
  receivedMessages.value = []
}

// Cleanup on unmount
onUnmounted(() => {
  if (ws.value) {
    ws.value.close()
  }
})
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
