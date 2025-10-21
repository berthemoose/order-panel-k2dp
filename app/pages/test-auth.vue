<template>
  <div class="mx-auto max-w-4xl px-4 py-12 text-black ">
    <h1 class="text-3xl font-bold mb-8">🔍 Authentication Endpoint Test</h1>
    
    <div class="space-y-6">
      <!-- Config Display -->
      <div class="bg-white rounded-lg border p-6">
        <h2 class="text-xl font-semibold mb-4">Configuration</h2>
        <div class="space-y-2 font-mono text-sm">
          <div><strong>CMS URL:</strong> {{ config.cmsUrl }}</div>
          <div><strong>Full Login URL:</strong> {{ loginUrl }}</div>
        </div>
      </div>

      <!-- Manual Test -->
      <div class="bg-white rounded-lg border p-6">
        <h2 class="text-xl font-semibold mb-4">Test Login Endpoint</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <input
              v-model="testEmail"
              type="email"
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Password</label>
            <input
              v-model="testPassword"
              type="password"
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="password"
            />
          </div>
          <UButton
            @click="testEndpoint"
            :disabled="isTesting"
            color="primary"
          >
            {{ isTesting ? 'Testing...' : 'Test Endpoint' }}
          </UButton>
        </div>
      </div>

      <!-- Results -->
      <div v-if="testResult" class="bg-white rounded-lg border p-6">
        <h2 class="text-xl font-semibold mb-4">Result</h2>
        <div class="space-y-4">
          <div>
            <strong>Status:</strong>
            <span
              :class="testResult.success ? 'text-green-600' : 'text-red-600'"
              class="ml-2 font-semibold"
            >
              {{ testResult.success ? '✅ SUCCESS' : '❌ FAILED' }}
            </span>
          </div>
          <div v-if="testResult.status">
            <strong>HTTP Status:</strong> {{ testResult.status }}
          </div>
          <div v-if="testResult.message">
            <strong>Message:</strong> {{ testResult.message }}
          </div>
          <div v-if="testResult.data">
            <strong>Response Data:</strong>
            <pre class="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
          </div>
          <div v-if="testResult.error">
            <strong>Error Details:</strong>
            <pre class="mt-2 p-4 bg-red-50 rounded overflow-auto text-xs text-red-800">{{ testResult.error }}</pre>
          </div>
        </div>
      </div>

      <!-- Quick Checks -->
      <div class="bg-white rounded-lg border p-6">
        <h2 class="text-xl font-semibold mb-4">Quick Checks</h2>
        <div class="space-y-2">
          <UButton
            @click="checkApiEndpoint"
            color="neutral"
            variant="soft"
            block
            class="w-full justify-start"
          >
            Check if {CMS_URL}/api is accessible
          </UButton>
          <UButton
            @click="checkAdminEndpoint"
            color="neutral"
            variant="soft"
            block
            class="w-full justify-start"
          >
            Check if {CMS_URL}/admin is accessible
          </UButton>
        </div>
      </div>

      <!-- Troubleshooting -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">💡 Common Issues</h2>
        <ul class="space-y-2 text-sm">
          <li><strong>404 Error:</strong> Payload CMS server might not be running on port 3000</li>
          <li><strong>CORS Error:</strong> Check server .env has CORS_ORIGINS=http://localhost:3001</li>
          <li><strong>Network Error:</strong> Check if CMS_URL in .env has no trailing slash</li>
          <li><strong>401 Error:</strong> Credentials are wrong (but endpoint exists! ✅)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApi } from '../../composables/useApi'

definePageMeta({
  layout: 'default'
})

const { cmsUrl: config } = useApi()
const loginUrl = computed(() => `${config}/users/login`)

const testEmail = ref('')
const testPassword = ref('')
const isTesting = ref(false)
const testResult = ref<any>(null)

const testEndpoint = async () => {
  isTesting.value = true
  testResult.value = null

  try {
    console.log('Testing endpoint:', loginUrl.value)
    
    const response = await $fetch(loginUrl.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        email: testEmail.value,
        password: testPassword.value
      }
    })

    testResult.value = {
      success: true,
      status: 200,
      message: 'Login endpoint is working! ✅',
      data: response
    }
  } catch (error: any) {
    console.error('Test error:', error)
    
    testResult.value = {
      success: false,
      status: error?.status || error?.statusCode || 'Unknown',
      message: error?.status === 404 
        ? '404: Endpoint not found. Check if Payload CMS is running.' 
        : error?.status === 401
        ? '401: Wrong credentials (but endpoint exists!)'
        : error?.message || 'Request failed',
      error: JSON.stringify({
        status: error?.status || error?.statusCode,
        message: error?.message,
        data: error?.data,
        url: loginUrl.value
      }, null, 2)
    }
  } finally {
    isTesting.value = false
  }
}

const checkApiEndpoint = async () => {
  window.open(config, '_blank')
}

const checkAdminEndpoint = async () => {
  window.open(config.replace('/api', '/admin'), '_blank')
}
</script>
