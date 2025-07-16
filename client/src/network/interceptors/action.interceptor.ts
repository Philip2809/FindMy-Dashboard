import {
  AxiosError,
  AxiosResponse,
} from 'axios'
import { actionDispatcher } from '../../utils/dispatchers/action.dispatcher';

export const actionInterceptor = async (response: AxiosResponse | AxiosError) => {
  console.log(response);
  const { action } = response.data;
  if (!action) return response;

  actionDispatcher.next(action);
  return response;
}

export const actionInterceptorError = async (error: AxiosError<{action: any}>) => {  
  console.log(error);
  if (!error?.response?.data) return error;
  if (!error.response.data.action) return error;


  actionDispatcher.next(error.response.data.action);
  return error;
}