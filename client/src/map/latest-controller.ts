import maplibregl from "maplibre-gl";
import { Reports, Tags, useState } from "../@types";
import { ReportPoint } from "../data";
import { AccuracyCircle } from "./accuracy-circle";
import { LatestMapLayers } from "./enums";
import { LatestLayer } from "./latest";


export class LatestController {
    map?: maplibregl.Map;
    accuracyCircle?: AccuracyCircle;
    latestLayer?: LatestLayer;
    tags?: Tags;
    reports?: Reports;

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

    setData(tags = this.tags, reports = this.reports) {
        if (!tags || !reports) return;
        this.latestLayer?.setData(tags, reports);
        
        this.tags = tags;
        this.reports = reports;
        this.map?.once('idle', this.refreshSeeingReports.bind(this));
    }

    filter(confidence: number, enabled: boolean) {
        this.latestLayer?.confidenceFilter(confidence, enabled);
        this.map?.once('idle', this.refreshSeeingReports.bind(this));
    }

    refreshSeeingReports() {
        const features = this.map?.queryRenderedFeatures({ layers: [LatestMapLayers.main] }) as unknown as ReportPoint[] || [];
        // MAX 500 reports to show, if the users want to view so many reports at once (why?) they can click on the reports they want more info about
        if (features.length > 500) {
            this.setSeeingReports([]);
            return; // Too many reports to display, TODO: show error to user about this as well
        }
        features.sort((a, b) => b.properties.timestamp - a.properties.timestamp);
        this.setSeeingReports(features);
    }

    setListeners() {
        this.map?.on('click', (e) => {
            const features = this.map?.queryRenderedFeatures(e.point, { layers: [LatestMapLayers.main], }) as unknown as ReportPoint[];
            if (!features.length) {
                this.setClickedReports([]);
                this.accuracyCircle?.removeAccuracy();
                return;
            }

            if (features.length > 500) {
                this.setClickedReports([]);
                return; // Too many reports to display, TODO: show error to user about this as well
            }
            features.sort((a, b) => b.properties.timestamp - a.properties.timestamp);

            this.setClickedReports(features);

            if (features.length === 1)
                this.accuracyCircle?.setAccuracy(features[0].geometry.coordinates, features[0].properties.horizontal_accuracy);
            else
                this.accuracyCircle?.removeAccuracy();
        });

        this.map?.doubleClickZoom.disable();
        this.map?.on('dblclick', (e) => {
            const features = this.map?.queryRenderedFeatures(e.point, { layers: [LatestMapLayers.main], }) as unknown as ReportPoint[];
            if (!features.length) return

            const bounds = new maplibregl.LngLatBounds();
            features.forEach((feature) => {
                bounds.extend(feature.geometry.coordinates as any);
            });

            this.map?.fitBounds(bounds, { padding: 100, animate: true });
        });

        this.map?.on('moveend', this.refreshSeeingReports.bind(this));
    }
}

