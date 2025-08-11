import { Tag } from "./@types";

export interface Report {
    longitude: number;
    latitude: number;
    timestamp: number;
    // hashed_public_key: string;
    horizontal_accuracy: number;
    confidence: number;
    status: number;
}

export type ReportPointProperties = Report & { color: string, icon: string, index: number, tagId: string };
export type ReportPoint = GeoJSON.Feature<GeoJSON.Point, ReportPointProperties>;

export function reportsToGeoJSON(tag: Tag, reports: Report[]): ReportPoint[] {
    return reports.map((report, index) => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [report.longitude, report.latitude]
        },
        properties: {
            ...report,
            icon: tag.icon,
            color: tag.color,
            tagId: tag.id,
            index
        }
    }))
}

// export class DataReceiver {
//     static async getLatest(timeRange: string, reportsPerTag: number) {
//         const tags = await getTags();
//         // const data = await getReports(getQuery(timeRange, reportsPerTag));
//         // const reports = this.parseCsv(data);
//         return this.formatByTag(tags, []);
//     }

//     // static formatByTag(tags: Tag[], reports?: Report[]) {
//     //     if (!reports) return;
//     //     reports.sort((a, b) => b.timestamp - a.timestamp);

//     //     const mappedTags = new Map(tags.map((tag) => [tag.id, tag]));
//     //     const mappedReports = new Map(tags.map((tag) => 
//     //         [tag.id, reports.filter((report) => tag.keys.some((key) => key.hashed_public_key === report.hashed_public_key))]
//     //     ));

//     //     return { mappedTags, mappedReports };
//     // }

//     // static parseValue(value: string) {
//     //     if (!isNaN(Number(value))) return Number(value);
//     //     return value;
//     // }

//     // static parseCsv(data: string) {
//     //     const lines = data.split("\r\n");
//     //     const keys = lines.shift()?.split(",");
//     //     if (!keys) return;
//     //     const result: Report[] = [];
//     //     for (const line of lines) {
//     //         const values = line.split(",");
//     //         const obj: any = {};
//     //         for (let i = 0; i < keys.length; i++) {
//     //             obj[keys[i]] = DataReceiver.parseValue(values[i]);
//     //         }
//     //         result.push(obj);
//     //     }
//     //     return result;
//     // }
// }

