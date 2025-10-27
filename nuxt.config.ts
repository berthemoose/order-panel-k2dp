import tailwindcss from "@tailwindcss/vite"
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    cmsUrl: process.env.CMS_URL,
    orderUrl: process.env.ORDER_URL,
    wsUrl:process.env.WS_URL,
    public: {
      cmsUrl: process.env.CMS_URL,
      orderUrl: process.env.ORDER_URL,
      wsUrl:process.env.WS_URL,
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ]
  }
})
