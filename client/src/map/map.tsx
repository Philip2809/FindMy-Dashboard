import { useContext, useEffect, useRef } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import { Checkbox } from "@mui/material";
import DataContext from "../context/data";
import { LatestController } from "./latest-controller";
import { useState } from "../@types";
import { FaList } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";


const makeSx = (color: string) => ({
    color: color,
    '&.Mui-checked': {
        color: color,
    },
})

let firstWithData = true;

function Map({ displayReports, setDisplayReports }: { displayReports: boolean, setDisplayReports: useState<boolean> }) {
    const context = useContext(DataContext);
    if (!context) return null;
    const mapContainer = useRef(null) as any;
    const map = useRef(null) as any;
    const timeRangeRef = useRef<HTMLInputElement>(null);
    const reportsPerTagRef = useRef<HTMLInputElement>(null);

    // Use useRef to store the controller instance, so it's only created once
    const controller = useRef<LatestController>(new LatestController(context.setClickedReports, context.setSeeingReports));

    const lng = 0;
    const lat = 0;
    const zoom = 1;
    const API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

    useEffect(() => {
        if (map.current) return; // Prevent initializing the map more than once

        const map2 = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
            center: [lng, lat],
            zoom: zoom,
            attributionControl: { compact: true },
        });
        map.current = map2;


        map.current.on('load', () => {
            // Initialize the controller only once
            // if (!controller.current) {
            //   controller.current = new LatestController(setClickedReports);
            // }
            controller.current.setMap(map.current);
        });

        // Cleanup function to ensure no memory leaks or multiple controllers
        // return () => {
        //   // controller.current = null;  // Nullify the controller on unmount
        // };
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
    }, [context?.tags, context?.reports]); // Only re-run when the context changes

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
        <div ref={mapContainer} className="map">
            <div className="popup-container">

                <div className="popup showReports">
                    {displayReports ? (
                        <FaXmark className='displayReportsBtn' size={32} onClick={() => setDisplayReports(false)} />
                    ) : (
                        <FaList className='displayReportsBtn' size={32} onClick={() => setDisplayReports(true)} />
                    )}
                </div>

                <div className="popup">
                    <Checkbox defaultChecked sx={makeSx('red')} onChange={(event) => controller.current.filter(1, !event.target.checked)} />
                    <Checkbox defaultChecked sx={makeSx('yellow')} onChange={(event) => controller.current.filter(2, !event.target.checked)} />
                    <Checkbox defaultChecked sx={makeSx('lightgreen')} onChange={(event) => controller.current.filter(3, !event.target.checked)} />
                </div>

                <div className="popup rangeSelector">
                    <input type="text" className="input" defaultValue={context.timeRange} ref={timeRangeRef} onChange={onRangeChange} title="Time range" />
                    <input type="text" className="input" defaultValue={context.reportsPerTag} ref={reportsPerTagRef} onChange={onRangeChange} title="Reports per tag" />
                </div>
            </div>
        </div>


    );
}

export default Map;
