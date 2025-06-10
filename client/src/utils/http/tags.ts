import { Tag, TagHttpUpdate } from "../../@types"


export async function getTags() {
    const response = await fetch('http://localhost:5000/tags');
    const data: Tag[] = await response.json();
    return data;
}

export async function addOrUpdateTag(tag: TagHttpUpdate) {
    const response = await fetch('http://localhost:5000/tags', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tag),
    });
    const data = await response.json();
    return data;
}

export async function deleteTag(tagId: string) {
    const response = await fetch(`http://localhost:5000/tags/${tagId}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    return data;
}
