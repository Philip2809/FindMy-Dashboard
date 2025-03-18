import { useContext, useEffect, useRef } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import { Checkbox } from "@mui/material";
import DataContext from "../context/data";
import { LatestController } from "./latest-controller";


const makeSx = (color: string) => ({
  color: color,
  '&.Mui-checked': {
    color: color,
  },
})

let firstWithData = true;

function Map() {
  const context = useContext(DataContext);
  if (!context) return null;
  const mapContainer = useRef(null) as any;
  const map = useRef(null) as any;

  // Use useRef to store the controller instance, so it's only created once
  const controller = useRef<LatestController>(new LatestController(context.setClickedReports, context.setSeeingReports));

  const lng = 0;
  const lat = 0;
  const zoom = 1;
  const API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

  useEffect(() => {
    if (map.current) return; // Prevent initializing the map more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
      attributionControl: { compact: true },
    });

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
    if (context?.tagsWithReports) {
      controller.current.setData(context.tagsWithReports);

      if (context.tagsWithReports.size && firstWithData) {
        const bounds = new maplibregl.LngLatBounds();
        context.tagsWithReports.forEach((reports) => {
          reports.forEach((report) => {
            bounds.extend([report.longitude, report.latitude]);
          });
        });
        if (!bounds.isEmpty()) map.current.fitBounds(bounds, { padding: 100, animate: false });
        firstWithData = false;
      }
    }
  }, [context?.tagsWithReports]); // Only re-run when the context changes

  return (
    <div ref={mapContainer} className="map">
      <div className="popup filter-types">
        <Checkbox defaultChecked sx={makeSx('red')} onChange={(event) => controller.current.filter(1, event.target.checked)} />
        <Checkbox defaultChecked sx={makeSx('yellow')} onChange={(event) => controller.current.filter(2, event.target.checked)} />
        <Checkbox defaultChecked sx={makeSx('lightgreen')} onChange={(event) => controller.current.filter(3, event.target.checked)} />
      </div>
    </div>
  );
}

export default Map;
