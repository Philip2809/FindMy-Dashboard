export interface Tag {
    name: string;
    key: string;
    hashed_key: string;
    color: string;
    id: number;
    icon: string;
}

export const tags: Tag[] = [
    // Not a real key, just a placeholder to show, however moving to the backend asap
    { id: 1, name: 'Housekeys', key: 'WS00GggvXp6fbbH0/EncNFtzU0nmEQLycyM7CQ==', hashed_key: 'BOJmJmyKDy9AIOTIRhKrlCWE24cO+IEXqsp4RKVhZkc=', color: 'crimson', icon: 'gi/GiHouseKeys' },
]