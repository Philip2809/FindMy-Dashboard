import { Tag } from "../@types";
import { httpClient } from "./client";

export async function login() {
    return await httpClient.post<Tag[]>(`/login`, undefined, { loadingString: 'Signing into account' });
}

export async function select2FAMethod(method: number) {
    return await httpClient.post<Tag[]>(`/login/2fa-method/${method}`, undefined, { loadingString: 'Submitting 2FA method' });
}

export async function submit2FACode(code: string) {
    return await httpClient.post<Tag[]>(`/login/2fa-code/${code}`, undefined, { loadingString: 'Submitting 2FA code' });
}
