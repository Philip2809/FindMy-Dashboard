

export async function addKey(tagId: string, private_key?: string) {
    const response = await fetch('http://localhost:5000/keys/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag_id: tagId, private_key }),
    });
    const data = await response.json();
    return data;
}

export async function getPrivateKey(public_key: string) {
    const response = await fetch(`http://localhost:5000/keys?publicKey=${encodeURIComponent(public_key)}`);
    const data = await response.text();
    return data;
}

export async function fetchReports(tagId: string) {
    const response = await fetch(`http://localhost:5000/keys/fetch/${tagId}`);
    const data = await response.json();
    return data;
}

export async function deleteKey(public_key: string) {
    const response = await fetch(`http://localhost:5000/keys?publicKey=${encodeURIComponent(public_key)}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    return data;
}

