import { Report, ReportPoint } from "../data";


export type useState<T> = React.Dispatch<React.SetStateAction<T>>

export type TagsWithReports = Map<Tag, Report[]>;

export type DataStateContext = {
    tagsWithReports: TagsWithReports;
    refreshData: () => void;

    seeingReports: ReportPoint[];
    setSeeingReports: useState<ReportPoint[]>;

    clickedReports: ReportPoint[];
    setClickedReports: useState<ReportPoint[]>;
};

export interface Key {
    tag_id: number;
    public_key: string;
    hashed_public_key: string;
}

export interface PrivateKey extends Key {
    private_key: string;
}

export interface Tag {
    id: number;
    name: string;
    color: string;
    icon: string;
    keys: Key[];
}