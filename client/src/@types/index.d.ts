import { Report, ReportPoint } from "../data";


export type useState<T> = React.Dispatch<React.SetStateAction<T>>

export type Tags = Map<string, Tag>; // Tag ID -> Tag
export type Reports = Map<string, Report[]>; // Tag ID -> Report[]

export type DataStateContext = {
    tags: Tags; 
    reports: Reports;
    refreshData: () => void;

    seeingReports: ReportPoint[];
    setSeeingReports: useState<ReportPoint[]>;

    clickedReports: ReportPoint[];
    setClickedReports: useState<ReportPoint[]>;

    selectedReport: ReportPoint | null;
    setSelectedReport: useState<ReportPoint | null>;

    disabledTags: Set<string>;
    toggleTag: (tagId: string) => void;

    timeRange: string;
    setTimeRange: useState<string>;
    reportsPerTag: number;
    setReportsPerTag: useState<number>;

    addLoading: (message: string) => number;
    removeLoading: (time: number) => void;
};

export interface Key {
    tag_id: string;
    public_key: string;
    hashed_public_key: string;
}

export interface PrivateKey extends Key {
    private_key: string;
}

export interface TagHttpUpdate {
    id?: string;
    icon: string;
    name: string;
    label: string;
    color: string;
}
export interface Tag extends TagHttpUpdate {
    id: string;
    keys: Key[];
}
