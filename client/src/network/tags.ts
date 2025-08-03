import { Tag, TagHttpUpdate } from "../@types";
import { httpClient } from "./client";


export async function getTags() {
    const tags = await httpClient.get<Tag[]>('/tags', { loadingString: 'Fetching tags' });
    return tags.data;
}

export async function addOrUpdateTag(tag: TagHttpUpdate) {
    const res = await httpClient.post<TagHttpUpdate>('/tags', tag, { loadingString: 'Saving tag' });
    return res.data;
}

export async function deleteTag(tagId: string, loadingString: string) {
    const res = await httpClient.delete(`/tags/${tagId}`, { loadingString });
    return res.data;
}

// This function should be in another file probobly, but its not the end of the world for now hehe
export async function clearAccount() {
    const res = await httpClient.delete('/login', { loadingString: 'Clearing account' });
    return res.data;
}
