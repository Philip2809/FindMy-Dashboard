import axios from 'axios'
declare module 'axios' {
  export interface AxiosRequestConfig {
    loadingString?: string;
    loadingId?: string;
  }
}
import { actionInterceptor, actionInterceptorError } from './interceptors/action.interceptor'
import { requestLoadingIdInterceptor, requestLoadingInterceptor, responseLoadingInterceptor, responseLoadingInterceptorError } from './interceptors/loading.interceptor'

const httpClient = axios.create({
  baseURL: 'http://localhost:5000/api',
})


httpClient.interceptors.request.use(
  requestLoadingInterceptor
)

httpClient.interceptors.request.use(
  requestLoadingIdInterceptor
)

httpClient.interceptors.response.use(
  responseLoadingInterceptor,
  responseLoadingInterceptorError
)

httpClient.interceptors.response.use(
  actionInterceptor,
  actionInterceptorError
)

export { httpClient }
