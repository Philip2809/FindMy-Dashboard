import { Tag } from "./@types";
import { getTags } from "./utils/http/tags";

function getQuery(timeRange: string, latest?: number) {
    return `
    from(bucket: "${import.meta.env.VITE_INFLUXDB_BUCKET}")
        |> range(start: -${timeRange})
        ${latest ? `|> tail(n: ${latest})` : ""}
        |> keep(columns: ["_time", "_field", "_value", "_measurement"])
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> rename(columns: {_measurement: "hashed_public_key", "_time": "timestamp"})
        |> map(fn: (r) => ({ r with timestamp: int(v: r.timestamp) / 1000000 }))
        |> group()
    `
}

export interface Report {
    longitude: number;
    latitude: number;
    timestamp: number;
    published_at: number;
    hashed_public_key: string;
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

export class DataReceiver {
    static async getLatest(timeRange: string, reportsPerTag: number) {
        const tags = await getTags();
        const response = await DataReceiver.send(getQuery(timeRange, reportsPerTag));
        const data = await response.text();
        const reports = this.parseCsv(data);
        return this.formatByTag(tags, reports);
    }

    static formatByTag(tags: Tag[], reports?: Report[]) {
        if (!reports) return;
        reports.sort((a, b) => b.timestamp - a.timestamp);

        const mappedTags = new Map(tags.map((tag) => [tag.id, tag]));
        const mappedReports = new Map(tags.map((tag) => 
            [tag.id, reports.filter((report) => tag.keys.some((key) => key.hashed_public_key === report.hashed_public_key))]
        ));

        return { mappedTags, mappedReports };
    }

    static parseValue(value: string) {
        if (!isNaN(Number(value))) return Number(value);
        return value;
    }

    static parseCsv(data: string) {
        const lines = data.split("\r\n");
        const keys = lines.shift()?.split(",");
        if (!keys) return;
        const result: Report[] = [];
        for (const line of lines) {
            const values = line.split(",");
            const obj: any = {};
            for (let i = 0; i < keys.length; i++) {
                obj[keys[i]] = DataReceiver.parseValue(values[i]);
            }
            result.push(obj);
        }
        return result;
    }


    static send(query: string) {
        // TODO: clean this up...
        return fetch(import.meta.env.VITE_INFLUXDB_URL + "/api/v2/query?org=" + import.meta.env.VITE_INFLUXDB_ORG, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Token " + import.meta.env.VITE_INFLUXDB_TOKEN,
            },
            body: JSON.stringify({
                query,
                type: "flux",
            })
        });
    }
}

