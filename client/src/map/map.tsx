import { useContext, useEffect, useRef } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import DataContext from "../context/data";
import { LatestController } from "./latest-controller";
import { useState } from "../@types";
import { getOsmStyle } from "../utils";
import React from "react";
import { SettingsDialog } from "../components/dialog/Dialog";
import { FaCog, FaList, FaXmark } from "../components/icons/icons";

let firstWithData = true;

function Map({ displayReports, setDisplayReports }: { displayReports: boolean, setDisplayReports: useState<boolean> }) {
    const context = useContext(DataContext);
    if (!context) return null;
    const mapContainer = useRef(null) as any;
    const map = useRef(null) as any;
    const timeRangeRef = useRef<HTMLInputElement>(null);
    const reportsPerTagRef = useRef<HTMLInputElement>(null);

    const controller = useRef<LatestController>(new LatestController(context.setClickedReports, context.setSeeingReports));

    const [mapSettingsOpen, setMapSettingsOpen] = React.useState(false);

    const lng = 0;
    const lat = 0;
    const zoom = 1;
    const API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

    useEffect(() => {
        if (map.current) return; // Prevent initializing the map more than once

        const mapProvider = localStorage.getItem('mapProvider') || 'osm';
        const map2 = new maplibregl.Map({
            container: mapContainer.current,
            style: mapProvider === 'osm' ? getOsmStyle() : mapProvider,
            center: [lng, lat],
            zoom: zoom,
            attributionControl: { compact: true },
        });
        map.current = map2;


        map.current.on('load', () => {
            controller.current.setMap(map.current);
        });
    }, [API_KEY, lng, lat, zoom]);

    // Effect to update data when context changes
    useEffect(() => {
        if (context?.reports) {
            controller.current.setData(context.tags, context.reports);

            if (context.reports.size && firstWithData) {
                const bounds = new maplibregl.LngLatBounds();
                context.reports.forEach((reports) => {
                    reports.forEach((report) => {
                        bounds.extend([report.longitude, report.latitude]);
                    });
                });
                if (!bounds.isEmpty()) map.current.fitBounds(bounds, { padding: 100, animate: false });
                firstWithData = false;
            }
        }
    }, [context?.tags, context?.reports]);

    useEffect(() => {
        if (!context.selectedReport) return;
        context.setClickedReports([context.selectedReport]);

        map.current.flyTo({
            center: context.selectedReport.geometry.coordinates,
            zoom: 18
        });

        controller.current.accuracyCircle?.setAccuracy(
            context.selectedReport.geometry.coordinates,
            context.selectedReport.properties.horizontal_accuracy
        );
    }, [context.selectedReport]);

    useEffect(() => {
        controller.current.latestLayer?.tagFilter(context.disabledTags);
    }, [context.disabledTags]);

    const onRangeChange = () => {
        if (!timeRangeRef.current || !reportsPerTagRef.current) return;

        const timeRange = timeRangeRef.current.value || '';
        if (/^\d+[smhdwy]$/.test(timeRange)) context.setTimeRange(timeRange);

        const reportsPerTag = reportsPerTagRef.current.value || undefined;
        if (/^\d+$/.test(reportsPerTag || '')) context.setReportsPerTag(Number(reportsPerTag));
    }

    return (
        <>
            <div ref={mapContainer} className="map">
                <div className="popup-container">

                    <div className="popup showReports">
                        {displayReports ? (
                            <FaXmark className='displayReportsBtn' size={32} onClick={() => setDisplayReports(false)} />
                        ) : (
                            <FaList className='displayReportsBtn' size={32} onClick={() => setDisplayReports(true)} />
                        )}
                    </div>

                    <div className="popup mapSettings">
                        <FaCog className='mapSettingsBtn' size={32} onClick={() => setMapSettingsOpen(e => !e)} />
                    </div>

                    <div className="popup filterCheckboxes">
                        <input type="checkbox" className="filterCheckbox red" style={{ borderColor: 'red' }} defaultChecked onChange={(event) => controller.current.filter(1, !event.target.checked)} />
                        <input type="checkbox" className="filterCheckbox yellow" style={{ borderColor: 'yellow' }} defaultChecked onChange={(event) => controller.current.filter(2, !event.target.checked)} />
                        <input type="checkbox" className="filterCheckbox lightgreen" style={{ borderColor: 'lightgreen' }} defaultChecked onChange={(event) => controller.current.filter(3, !event.target.checked)} />
                    </div>

                    <div className="popup rangeSelector">
                        <input type="text" className="input" defaultValue={context.timeRange} ref={timeRangeRef} onChange={onRangeChange} title="Time range" />
                        <input type="text" className="input" defaultValue={context.reportsPerTag} ref={reportsPerTagRef} onChange={onRangeChange} title="Reports per tag" />
                    </div>
                </div>
            </div>

            {mapSettingsOpen && <SettingsDialog onClose={() => setMapSettingsOpen(false)} />}
        </>


    );
}

export default Map;
