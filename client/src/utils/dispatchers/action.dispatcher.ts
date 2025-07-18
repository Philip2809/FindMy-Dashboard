import { Dispatcher } from "./dispatcher";

type MessageActionPayload = {
    type: "dialogs.message";
    payload: {
        message: string;
    }
};

type TwoFAMethodPayLoad = {
    type: "dialogs.2fa-methods";
    payload: {
        methods: string[];
    }
};

type TwoFACodePayload = {
    type: "dialogs.2fa-code";
};

export type ActionPayload = MessageActionPayload | TwoFAMethodPayLoad | TwoFACodePayload;

export const actionDispatcher = new Dispatcher<ActionPayload>();
