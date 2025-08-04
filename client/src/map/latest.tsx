import maplibregl from "maplibre-gl";
import { reportsToGeoJSON } from "../data";
import { Reports, Tags } from "../@types";
import { LatestMapLayers } from "./enums";
import { convertIconToImage } from "../icon";

type DEFAULT_FILTER = [
    'case',
    ['in', ['get', 'tagId'], string], false,
    ['in', ['get', 'confidence'], string], false,
    true
];

const DEFAULT_FILTER: DEFAULT_FILTER = [
    'case',
    ['in', ['get', 'tagId'], ''], false,
    ['in', ['get', 'confidence'], ''], false,
    true
];

const loadingImages: Set<string> = new Set();

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

            if (this.map.hasImage(tag.icon) || loadingImages.has(tag.icon)) return;
            loadingImages.add(tag.icon);
            convertIconToImage(tag.icon).then((icon) => {
                if (!icon) return;
                this.map.addImage(tag.icon, icon, { sdf: true });
                loadingImages.delete(tag.icon);
            });
        });

        (this.map.getSource(LatestMapLayers.main) as any).setData(allPoints);

        // console.log(allPoints.features.length, 'points');
        // if (allPoints.features.length > 1000) this.setDetailLevel(true);
        // else this.setDetailLevel(false);

        (this.map.getSource('line') as any).setData(allPoints);
    }



    // [
    //     'case',                                      // 0
    //     ['in', ['get', 'tagId'], ''], false,         // 1, 2
    //     ['in', ['get', 'confidence'], '' // 2], false,    // 3, 4
    //     true
    // ]
    confidenceFilter(confidence: number, enabled: boolean) {
        const filter = this.map.getFilter(LatestMapLayers.main) as DEFAULT_FILTER;
        if (!Array.isArray(filter)) return;
        let confidenceString = filter[3][2];
        if (confidenceString.includes(confidence.toString()) && !enabled)
            filter[3][2] = confidenceString.replace(confidence.toString(), '');
        else if (enabled)
            filter[3][2] = `${confidenceString}${confidence}`;

        this.map.setFilter(LatestMapLayers.main, filter);
        this.map.setFilter(LatestMapLayers.confidence, filter);
    }

    tagFilter(disabledTags: Set<string>) {
        const filter = this.map.getFilter(LatestMapLayers.main) as DEFAULT_FILTER;
        if (!Array.isArray(filter)) return;
        let disabledTagsString = '';
        disabledTags.forEach((tagId) => {
            disabledTagsString += `${tagId},`;
        });
        filter[1][2] = disabledTagsString.slice(0, -1); // Remove the last comma

        this.map.setFilter(LatestMapLayers.main, filter);
        this.map.setFilter(LatestMapLayers.confidence, filter);
        this.map.setFilter(LatestMapLayers.mainLowDetail, filter);
    }

    setDetailLevel(useLowDetail: boolean) {
        this.map.setLayoutProperty(LatestMapLayers.main, 'visibility', useLowDetail ? 'none' : 'visible');
        this.map.setLayoutProperty(LatestMapLayers.confidence, 'visibility', useLowDetail ? 'none' : 'visible');
        this.map.setLayoutProperty(LatestMapLayers.mainLowDetail, 'visibility', useLowDetail ? 'visible' : 'none');
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
            id: LatestMapLayers.confidence,
            type: 'circle',
            source: LatestMapLayers.main,
            filter: DEFAULT_FILTER,
            paint: {
                "circle-radius": 20, // 6

                "circle-color": [
                    "interpolate", ['linear'],
                    ["get", "confidence"],
                    1, "red",
                    2, "yellow",
                    3, "transparent",
                ],

                "circle-opacity": 0.2
            }
        });

        this.map.addLayer({
            id: LatestMapLayers.main,
            type: 'symbol',
            source: LatestMapLayers.main,
            filter: DEFAULT_FILTER,
            layout: {
                'icon-image': ['get', 'icon'],
                'icon-size': 1,
                'icon-allow-overlap': true,
                "visibility": "none"
            },
            paint: {
                'icon-color': ['get', 'color'],
                "icon-opacity": [
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
            id: LatestMapLayers.mainLowDetail,
            type: 'circle',
            source: LatestMapLayers.main,
            filter: DEFAULT_FILTER,
            layout:{
            },
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
    }
}