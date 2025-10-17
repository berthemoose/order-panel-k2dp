import { useRuntimeConfig } from 'nuxt/app';

interface UseApiReturn {
  cmsUrl: string;
  orderUrl: string;
}

export const useApi = (): UseApiReturn => {
  const config = useRuntimeConfig();
  
  if (!config.public.cmsUrl) {
    throw new Error('API configuration is missing. Please check your environment variables.');
  }
  
  /* CMS URL */
  const cmsUrl = `${config.public.cmsUrl}/api`;

  /* Order service URL */
  const orderUrl = `${config.public.orderUrl}`;

  return {
    cmsUrl,
    orderUrl
  };
};
