import {
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { loadingDispatcher } from '../../utils/dispatchers/loading.dispatcher';

export const requestLoadingIdInterceptor = async (config: InternalAxiosRequestConfig) => {
  config.loadingId = Math.random().toString(36).substring(2, 15);
  return config;
}

export const requestLoadingInterceptor = async (config: InternalAxiosRequestConfig) => {
  if (!config.loadingId || !config.loadingString) return config;

  loadingDispatcher.next({
    type: 'loading.show',
    id: config.loadingId,
    message: config.loadingString,
  });

  return config;
}

export const responseLoadingInterceptor = async (response: AxiosResponse) => {
  if (!response.config.loadingId) return response;

  loadingDispatcher.next({
    type: 'loading.hide',
    id: response.config.loadingId,
  });

  return response;
}

export const responseLoadingInterceptorError = async (error: any) => {
  if (!error.config || !error.config.loadingId) return error;

  loadingDispatcher.next({
    type: 'loading.hide',
    id: error.config.loadingId,
  });

  return Promise.reject(error);
}
