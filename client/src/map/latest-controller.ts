import { TagsWithReports, useState } from "../@types";
import { ReportPoint } from "../data";
import { AccuracyCircle } from "./accuracy-circle";
import { LatestMapLayers } from "./enums";
import { LatestLayer } from "./latest";


export class LatestController {
    map?: maplibregl.Map;
    accuracyCircle?: AccuracyCircle;
    latestLayer?: LatestLayer;
    data?: TagsWithReports;

    constructor(
        public setClickedReports: useState<ReportPoint[]>,
        public setSeeingReports: useState<ReportPoint[]>
    ) {}

    setMap(map: maplibregl.Map) {
        this.map = map;

        this.accuracyCircle = new AccuracyCircle(map);
        this.latestLayer = new LatestLayer(map);

        this.setData();
        this.setListeners();
    }

    setData(tagsWithReports = this.data) {
        if (!tagsWithReports) return;
        this.latestLayer?.setData(tagsWithReports);

        this.data = new Map(tagsWithReports);
        this.map?.once('idle', this.refreshSeeingReports.bind(this));
    }

    filter(confidence: number, enabled: boolean) {
        this.latestLayer?.filter(confidence, enabled);
        this.map?.once('idle', this.refreshSeeingReports.bind(this));
    }

    refreshSeeingReports() {
        const features = this.map?.queryRenderedFeatures({ layers: [LatestMapLayers.main] }) as unknown as ReportPoint[] || [];
        features.sort((a, b) => b.properties.timestamp - a.properties.timestamp);
        this.setSeeingReports(features);
    }

    setListeners() {
        this.map?.on('click', (e) => {
            const features = this.map?.queryRenderedFeatures(e.point, { layers: [LatestMapLayers.main] }) as unknown as ReportPoint[];
            if (!features.length) {
                this.setClickedReports([]);
                this.accuracyCircle?.removeAccuracy();
                return;
            }
            this.setClickedReports(features);
            this.accuracyCircle?.setAccuracy(features[0].geometry.coordinates, features[0].properties.horizontal_accuracy);
        });

        this.map?.on('moveend', this.refreshSeeingReports.bind(this));
    }
}

