"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polygon, CircleMarker, useMapEvents } from "react-leaflet";
import { Undo2, Trash2, Save } from "lucide-react";
import { type LatLng, latLngsToGeoJson, geoJsonToLatLngs, areaHectares } from "@/lib/geo";

const DEFAULT_CENTER: LatLng = { lat: -15.78, lng: -47.93 }; // centro do Brasil

function ClickCapture({ onClick }: { onClick: (point: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function PolygonEditor({
  initialBoundary,
  onSave,
  saving,
}: {
  initialBoundary?: unknown;
  onSave: (boundary: ReturnType<typeof latLngsToGeoJson>, areaHa: number) => void;
  saving?: boolean;
}) {
  const [points, setPoints] = useState<LatLng[]>(() => geoJsonToLatLngs(initialBoundary));

  const center = points[0] ?? DEFAULT_CENTER;
  const area = useMemo(() => areaHectares(points), [points]);

  const addPoint = useCallback((point: LatLng) => {
    setPoints((prev) => [...prev, point]);
  }, []);

  const undo = () => setPoints((prev) => prev.slice(0, -1));
  const clear = () => setPoints([]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <MapContainer center={[center.lat, center.lng]} zoom={points.length ? 16 : 4} style={{ height: 360 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCapture onClick={addPoint} />
          {points.map((p, i) => (
            <CircleMarker
              key={i}
              center={[p.lat, p.lng]}
              radius={5}
              pathOptions={{ color: "#21374f", fillColor: "#21374f", fillOpacity: 1 }}
            />
          ))}
          {points.length >= 2 && (
            <Polygon
              positions={points.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#21374f", fillOpacity: 0.15 }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-neutral-600">
          {points.length} ponto{points.length === 1 ? "" : "s"}
          {area > 0 && <> · área estimada: <strong>{area.toFixed(2)} ha</strong></>}
        </span>
        <button
          type="button"
          onClick={undo}
          disabled={points.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-40"
        >
          <Undo2 size={14} />
          Desfazer ponto
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={points.length === 0}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-40"
        >
          <Trash2 size={14} />
          Limpar
        </button>
        <button
          type="button"
          onClick={() => onSave(latLngsToGeoJson(points), area)}
          disabled={points.length < 3 || saving}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800 disabled:opacity-50"
        >
          <Save size={14} />
          {saving ? "Salvando..." : "Salvar contorno"}
        </button>
      </div>
      <p className="text-xs text-neutral-400">
        Clique no mapa pra marcar os cantos do talhão/pasto na ordem do contorno (mínimo 3 pontos).
      </p>
    </div>
  );
}
