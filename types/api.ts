declare module 'nuxt/schema' {
  interface RuntimeConfig {
    cmsUrl: string;
    orderUrl: string;
    siteKey: string;
  }
  
  interface PublicRuntimeConfig {
    cmsUrl: string;
    orderUrl: string;
    siteKey: string;
  }
}

export {}
