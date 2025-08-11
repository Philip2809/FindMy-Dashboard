import { Report, ReportPoint } from "../data";

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type useState<T> = React.Dispatch<React.SetStateAction<T>>

export type Tags = Map<string, Tag>; // Tag ID -> Tag
export type Reports = Map<string, Report[]>; // Tag ID -> Report[]

export type DataStateContext = {
    tags: Tags; 
    reports: Reports;
    refreshData: () => void;

    seeingReports: ReportPoint[] | null; // null means too many reports to show
    setSeeingReports: useState<ReportPoint[]  | null>; // null means too many reports to show

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
};

export enum BeaconType {
    STATIC = "static",
    LIST = "list"
}

interface BaseBeacon {
    id: string;
    item_id: string;
    label?: string;
}

export interface StaticBeacon extends BaseBeacon {
    type: BeaconType.STATIC;
    public_key?: string;
}

export interface ListBeacon extends BaseBeacon {
    type: BeaconType.LIST;
    list_id: string;
}

export type Beacon = StaticBeacon | ListBeacon;


export interface Key {
    tag_id: string;
    label?: string;
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
    description?: string;
    color: string;
}
export interface Tag extends TagHttpUpdate {
    id: string;
    // keys: Key[];
}
