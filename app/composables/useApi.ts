import { useRuntimeConfig } from 'nuxt/app';

interface UseApiReturn {
  cmsUrl: string;
  orderUrl: string;
  wsUrl: string;
}

export const useApi = (): UseApiReturn => {
  const config = useRuntimeConfig();
  

  /* CMS URL */
  const cmsUrl = `${config.public.cmsUrl}/api`;

  const wsUrl = `${config.public.wsUrl}`;

  /* Order service URL */
  const orderUrl = `${config.public.orderUrl}`;

  return {
    cmsUrl,
    orderUrl,
    wsUrl
  };
};
