import { Tag } from "../../@types"


export async function getTags() {
    const response = await fetch('http://localhost:5000/tags');
    const data: Tag[] = await response.json();
    return data;
}

// export async function createTag(tag: Omit<Tag, 'id'>) {
//     // const response = await fetch('http://localhost:5000/tags');
// }

