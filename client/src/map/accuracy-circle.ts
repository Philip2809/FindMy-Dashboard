import maplibregl, { GeoJSONSource } from "maplibre-gl";
import { circle } from '@turf/circle';


export class AccuracyCircle {

    static ID = 'accuracy-circle';

    constructor(public map: maplibregl.Map) {
        this.addLayer();
    }

    setAccuracy(coordinates: number[], radius: number) {
        const options = {
            steps: 64,
            units: 'meters' as const
        };
        const geojson = circle(coordinates, radius, options);

        (this.map.getSource(AccuracyCircle.ID) as GeoJSONSource).setData(geojson);
    }

    removeAccuracy() {
        (this.map.getSource(AccuracyCircle.ID) as GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: []
        });
    }

    addLayer() {
        this.map.addSource(AccuracyCircle.ID, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });

        this.map.addLayer({
            id: AccuracyCircle.ID,
            type: 'fill',
            source: AccuracyCircle.ID,
            paint: {
                'fill-color': '#8CCFFF',
                'fill-opacity': 0.3
            }
        });
    }
}