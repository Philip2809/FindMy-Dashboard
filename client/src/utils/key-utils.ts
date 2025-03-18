export async function sha256(bytes: Uint8Array) {
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return new Uint8Array(hash);
}

export function b64ToBytes(b64: string) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

export function bytesToB64(bytes: Uint8Array) {
    return btoa(String.fromCharCode(...bytes));
}

export function getMacAddress(b64: string) {
    const bytes = b64ToBytes(b64);
    const firstByte = bytes[0] | 0b11000000;
    const macAddress = [firstByte, ...bytes.slice(1, 6)];
    return macAddress.map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join(':');
}

export async function publicToHashed(b64: string) {
    return bytesToB64(await sha256(b64ToBytes(b64)));
}
