// Configuração central de ambiente
export const config = {
  // URLs base
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://proencalho.com',
  APP_URL: import.meta.env.VITE_APP_URL || 'https://proencalho.com',
  
  // Ambiente
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'production',
  
  // Verificações
  isDevelopment: () => import.meta.env.VITE_ENVIRONMENT === 'development',
  isProduction: () => import.meta.env.VITE_ENVIRONMENT === 'production',
  
  // URLs completas
  getApiUrl: (endpoint: string) => `${config.API_BASE_URL}${endpoint}`,
  getAppUrl: (path: string = '') => `${config.APP_URL}${path}`,
};

export default config;
