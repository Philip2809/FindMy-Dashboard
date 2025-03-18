import { Report, ReportPoint } from "../data";
import { Tag } from "../temp";


export type useState<T> = React.Dispatch<React.SetStateAction<T>>

export type TagsWithReports = Map<Tag, Report[]>;

export type DataStateContext = {
    tagsWithReports: TagsWithReports;

    seeingReports: ReportPoint[];
    setSeeingReports: useState<ReportPoint[]>;
};
