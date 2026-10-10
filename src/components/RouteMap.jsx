import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export function RouteMap({ points, extras = [] }) {
  const node = useRef(null);
  const signature = [...points, ...extras].map((point) => `${point.id || point.name}:${point.lat},${point.lng}`).join("|");

  useEffect(() => {
    if (!node.current || points.length === 0) return undefined;
    const map = L.map(node.current, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    const line = points.map((point) => [point.lat, point.lng]);
    const poly = L.polyline(line, { color: "#b85c38", weight: 4 }).addTo(map);
    points.forEach((point, index) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: index === 0 ? 9 : 7,
        color: index === 0 ? "#3f5138" : "#b85c38",
        fillColor: index === 0 ? "#3f5138" : "#f4efe4",
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
      marker.bindTooltip(`${index === 0 ? "Start" : index}. ${point.name}`, { permanent: false });
    });
    extras.forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 6,
        color: "#8a8478",
        fillColor: "#d9d3c7",
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
      marker.bindTooltip(`${point.name} · not on the route`);
    });
    const bounds = L.latLngBounds([...line, ...extras.map((point) => [point.lat, point.lng])]);
    map.fitBounds(bounds, { padding: [28, 28] });
    return () => {
      map.remove();
    };
  // signature already captures the coordinates, so the map is not rebuilt on unrelated renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return <div ref={node} className="route-map" role="img" aria-label="Map of the itinerary route" />;
}
