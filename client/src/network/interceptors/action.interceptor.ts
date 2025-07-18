import {
  AxiosError,
  AxiosResponse,
} from 'axios'
import { actionDispatcher, ActionPayload } from '../../utils/dispatchers/action.dispatcher';

const displatchAction = (data?: { action?: ActionPayload }) => {
  if (!data?.action) return;
  actionDispatcher.next(data.action);
}

export const actionInterceptor = async (response: AxiosResponse) => {
  displatchAction(response.data);
  return response;
}

export const actionInterceptorError = async (error: AxiosError<{action: any}>) => {
  displatchAction(error.response?.data);
  return Promise.reject(error);
}