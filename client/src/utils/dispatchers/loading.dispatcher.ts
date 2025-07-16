import { Dispatcher } from "./dispatcher";

type ShowLoading = {
    type: 'loading.show';
    id: string;
    message: string;
};

type HideLoading = {
    type: 'loading.hide';
    id: string;
};

export type LoadingData = ShowLoading | HideLoading;    
export const loadingDispatcher = new Dispatcher<LoadingData>();
