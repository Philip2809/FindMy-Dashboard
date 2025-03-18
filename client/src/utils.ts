import { useState } from "react";


export function formatTime(time: number) {
    const today = new Date();
    const date = new Date(time);

    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    if (today.getDate() === date.getDate()) {
        return `${hours}:${minutes}`;
    }

    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export const useForceUpdate = () => {
    const [_, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update state to force render
    // A function that increment 👆🏻 the previous state like here 
    // is better than directly setting `setValue(value + 1)`
  }
