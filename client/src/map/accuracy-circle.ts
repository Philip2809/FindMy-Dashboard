import maplibregl, { GeoJSONSource } from "maplibre-gl";
import { circle } from '@turf/circle';
import { LatestMapLayers } from "./enums";


export class AccuracyCircle {
    constructor(public map: maplibregl.Map) {
        this.addLayer();
    }

    setAccuracy(coordinates: number[], radius: number) {
        const options = {
            steps: 64,
            units: 'meters' as const
        };
        const geojson = circle(coordinates, radius, options);

        (this.map.getSource(LatestMapLayers.accuracy) as GeoJSONSource).setData(geojson);
    }

    removeAccuracy() {
        (this.map.getSource(LatestMapLayers.accuracy) as GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: []
        });
    }

    addLayer() {
        this.map.addSource(LatestMapLayers.accuracy, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });

        this.map.addLayer({
            id: LatestMapLayers.accuracy,
            type: 'fill',
            source: LatestMapLayers.accuracy,
            paint: {
                'fill-color': '#8CCFFF',
                'fill-opacity': 0.3
            }
        });
    }
}