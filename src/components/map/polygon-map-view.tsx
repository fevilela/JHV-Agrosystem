"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polygon, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import { geoJsonToLatLngs } from "@/lib/geo";

const DEFAULT_CENTER: [number, number] = [-15.78, -47.93];

export type MapFeature = {
  id: string;
  label: string;
  detail?: string;
  boundary: unknown;
  href?: string;
};

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [24, 24] });
    }
  }, [map, points]);
  return null;
}

export function PolygonMapView({ features }: { features: MapFeature[] }) {
  const polygons = useMemo(
    () =>
      features
        .map((f) => ({ ...f, points: geoJsonToLatLngs(f.boundary) }))
        .filter((f) => f.points.length >= 3),
    [features]
  );

  const allPoints = useMemo(
    () => polygons.flatMap((p) => p.points.map((pt) => [pt.lat, pt.lng] as [number, number])),
    [polygons]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200">
      <MapContainer center={DEFAULT_CENTER} zoom={4} style={{ height: 480 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allPoints.length > 0 && <FitBounds points={allPoints} />}
        {polygons.map((p) => (
          <Polygon
            key={p.id}
            positions={p.points.map((pt) => [pt.lat, pt.lng])}
            pathOptions={{ color: "#21374f", fillOpacity: 0.2 }}
          >
            <Popup>
              <strong>{p.label}</strong>
              {p.detail && <div>{p.detail}</div>}
            </Popup>
          </Polygon>
        ))}
      </MapContainer>
    </div>
  );
}
