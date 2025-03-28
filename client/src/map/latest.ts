import maplibregl from "maplibre-gl";
import { reportsToGeoJSON } from "../data";
import { Reports, Tags } from "../@types";
import { LatestMapLayers } from "./enums";

export class LatestLayer {
    constructor(
        public map: maplibregl.Map,
    ) {
        this.addLayer();
    }

    setData(tags: Tags, reports: Reports) {
        const allPoints = {
            type: 'FeatureCollection' as const,
            features: [] as any
        };

        const allLineTracks = {
            type: 'FeatureCollection' as const,
            features: [] as any
        };

        tags.forEach((tag, tagId) => {
            const features = reportsToGeoJSON(tag, reports.get(tagId) || []);
            allPoints.features.push(...features);
            allLineTracks.features.push({
                type: 'Feature' as const,
                geometry: {
                    type: 'LineString' as const,
                    coordinates: features.filter(f => f.properties.confidence < 180).map((feature: any) => feature.geometry.coordinates)
                },
            });
        });

        // allPoints.features.forEach((feature: any, index: any) => {
        //     console.log(index, feature.geometry.coordinates);
        // });

        (this.map.getSource(LatestMapLayers.main) as any).setData(allPoints);
        (this.map.getSource('line') as any).setData(allPoints);
    }

    filter(confidence: number, enabled: boolean) {
        const filter = this.map.getFilter(LatestMapLayers.main);
        if (!Array.isArray(filter)) return;
        const string = filter[2] as string;
        if (string.includes(confidence.toString())) {
            if (enabled) return;
            else filter[2] = string.replace(confidence.toString(), '');
        } else {
            if (enabled) filter[2] = string + confidence;
            else return;
        }

        this.map.setFilter(LatestMapLayers.main, filter);
        this.map.setFilter(LatestMapLayers.confidence, filter);
    }

    addLayer() {
        this.map.addSource(LatestMapLayers.main, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });

        this.map.addSource('line', {
            type: 'geojson',
            lineMetrics: true,
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });

        this.map.addLayer({
            id: 'line',
            type: 'line',
            source: 'line',
            paint: {
                'line-color': 'black',
                'line-gradient': [
                    "interpolate", ['linear'],
                    ['line-progress'],
                    0, "#0000FFFF",
                    1, "#0000FF11"
                ],
                'line-width': 4
            }
        })

        this.map.addLayer({
            id: LatestMapLayers.main,
            type: 'circle',
            source: LatestMapLayers.main,
            filter: ['in', ['get', 'confidence'], '123'],
            paint: {
                "circle-radius": 12,
                "circle-color": ["get", "color"],
                "circle-opacity": [
                    "match",
                    ["get", "index"],
                    0, 0.7,
                    1, 0.6,
                    2, 0.5,
                    0.2

                ]
            }
        });

        this.map.addLayer({
            id: LatestMapLayers.confidence,
            type: 'circle',
            source: LatestMapLayers.main,
            filter: ['in', ['get', 'confidence'], '123'],
            paint: {
                "circle-radius": 6,

                "circle-color": [
                    "interpolate", ['linear'],
                    ["get", "confidence"],
                    1, "red",
                    2, "yellow",
                    3, "lightgreen",
                ],

                "circle-opacity": 0.8
            }
        });
    }
}