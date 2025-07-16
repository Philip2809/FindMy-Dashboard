import { Tag } from "../@types";
import { httpClient } from "./client";

export async function login() {
    return await httpClient.post<Tag[]>(`/login`);
}

export async function select2FAMethod(method: number) {
    return await httpClient.post<Tag[]>(`/login/2fa-method/${method}`);
}

export async function submit2FACode(code: number) {
    return await httpClient.post<Tag[]>(`/login/2fa-code/${code}`);
}
