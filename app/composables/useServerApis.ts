import { useRuntimeConfig } from "nuxt/app";

export const useServerApis = () => {
  const config = useRuntimeConfig();


  
  const wsUrl = config.public.wsUrl



  return {
    wsUrl
  }


};
