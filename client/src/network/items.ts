import { Tag, TagHttpUpdate } from "../@types";
import { httpClient } from "./client";

export const itemService = {
    getItems,
};

async function getItems() {
    const items = await httpClient.get<Tag[]>('/items', { loadingString: 'Fetching items' });
    return items.data;
}

export async function addOrUpdateTag(tag: TagHttpUpdate) {
    const res = await httpClient.post<TagHttpUpdate>('/items', tag, { loadingString: 'Saving tag' });
    return res.data;
}

export async function deleteTag(tagId: string, loadingString: string) {
    const res = await httpClient.delete(`/items/${tagId}`, { loadingString });
    return res.data;
}

// This function should be in another file probobly, but its not the end of the world for now hehe
export async function clearAccount() {
    const res = await httpClient.delete('/login', { loadingString: 'Clearing account' });
    return res.data;
}
