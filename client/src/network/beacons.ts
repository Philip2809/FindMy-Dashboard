import { httpClient } from "./client";

export const beaconService = {
    addBeacon, // C
    getBeacons // R
}

async function addBeacon(item_id: string, label?: string) {
    const res = await httpClient.post(`/beacons/static`, { item_id, label }, { loadingString: 'Addning new beacon' });
    return res.data;
}

async function getBeacons(item_id: string, loadingString: string) {
    const res = await httpClient.get(`/beacons/${item_id}`, { loadingString });
    return res.data;
}

