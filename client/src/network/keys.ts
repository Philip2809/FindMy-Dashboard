import { Tag, TagHttpUpdate } from "../@types";
import { httpClient } from "./client";


export async function addKey(tagId: string, private_key: string, loadingString: string) {
    const res = await httpClient.post<TagHttpUpdate>(`/keys`, { tag_id: tagId, private_key }, { loadingString });
    return res.data;
}

export async function getPrivateKey(public_key: string, loadingString: string) {
    const res = await httpClient.get(`/keys?publicKey=${encodeURIComponent(public_key)}`, { loadingString });
    return res.data;
}

export async function downloadReports(tagId: string, loadingString: string) {
    const res = await httpClient.get(`/keys/fetch/${tagId}`, { loadingString });
    return res.data;
}

export async function getReports(query: string) {
    const res = await httpClient.post(`/api/v2/query?org=${import.meta.env.VITE_INFLUXDB_ORG}`,
        { query, type: "flux" },
        {
            baseURL: import.meta.env.VITE_INFLUXDB_URL,
            headers: { Authorization: `Token ${import.meta.env.VITE_INFLUXDB_TOKEN}` },
            loadingString: 'Fetching reports'
        }
    )
    return res.data;
}

export async function deleteKey(public_key: string, loadingString: string) {
    const res = await httpClient.delete(`/keys?publicKey=${encodeURIComponent(public_key)}`, { loadingString });
    return res.data;
}

