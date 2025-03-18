import { Tag, tags } from "./temp";

function getQuery(latest?: number) {
    return `
    from(bucket: "${import.meta.env.VITE_INFLUXDB_BUCKET}")
        |> range(start: -24h)
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

export type ReportPointProperties = Report & { color: string, index: number, tagId: number };
export type ReportPoint = GeoJSON.Feature<GeoJSON.Point, ReportPointProperties>;

export function reportsToGeoJSON(tag: Tag, data: Report[]): ReportPoint[] {
    return data.map((d, index) => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [d.longitude, d.latitude]
        },
        properties: {
            ...d,
            color: tag.color,
            tagId: tag.id,
            index
        }
    }))
}

export class DataReceiver {
    static getLatest() {
        return DataReceiver.send(getQuery(15))
            .then((response) => response.text())
            .then(this.parseCsv)
            .then(this.formatByTag);
    }

    static formatByTag(reports?: Report[]) {
        if (!reports) return;
        reports.sort((a, b) => b.timestamp - a.timestamp);

        const mappedData = new Map<Tag, Report[]>();

        tags.forEach(async (tag) => {
            // const hashed_public_key = await publicToHashed(tag.key);
            const reportsForTag = reports.filter((report) => report.hashed_public_key === tag.hashed_key);
            mappedData.set(tag, reportsForTag);
        });
        // await Promise.all(promises);

        return mappedData;
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
        })
    }
}

