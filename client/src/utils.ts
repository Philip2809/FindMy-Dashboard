export function getOsmStyle(): maplibregl.StyleSpecification {
    return {
        "version": 8,
        "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        "sources": {
            "basemap": {
                "type": "raster" as const,
                "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
                "tileSize": 256,
                "attribution": "<a href='http://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a> <a href='https://maplibre.org' target='_blank'>© MapLibre</a>",
                "maxzoom": 19
            }
        },
        "layers": [
            {
                "id": "basemap",
                "type": "raster",
                "source": "basemap"
            }
        ]
    };
}

export function formatTime(time: number) {
    const today = new Date();
    const date = new Date(time);

    if (today.getDate() === date.getDate()) {
        return date.toLocaleTimeString();
    }

    return date.toLocaleString();

    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    if (today.getDate() === date.getDate()) {
        return `${hours}:${minutes}`;
    }

    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
