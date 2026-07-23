"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { MapContainer, TileLayer, Polygon, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import { Undo2, Trash2, Save, Search, LocateFixed } from "lucide-react";
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

// Recenters the map imperatively when a new search result comes in — the
// MapContainer's `center` prop only applies on mount, it doesn't react to
// later changes.
function FlyToLocation({ position }: { position: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], 16);
  }, [position, map]);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCenter, setSearchCenter] = useState<LatLng | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const center = points[0] ?? DEFAULT_CENTER;
  const area = useMemo(() => areaHectares(points), [points]);

  const addPoint = useCallback((point: LatLng) => {
    setPoints((prev) => [...prev, point]);
  }, []);

  const undo = () => setPoints((prev) => prev.slice(0, -1));
  const clear = () => setPoints([]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      );
      const results = (await res.json()) as { lat: string; lon: string }[];
      if (results.length === 0) {
        setSearchError("Endereço não encontrado.");
        return;
      }
      setSearchCenter({ lat: Number(results[0].lat), lng: Number(results[0].lon) });
    } catch {
      setSearchError("Não foi possível buscar o endereço agora.");
    } finally {
      setSearching(false);
    }
  }

  function handleUseMyLocation() {
    if (!("geolocation" in navigator)) {
      setSearchError("Este navegador não suporta localização.");
      return;
    }
    setLocating(true);
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSearchCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      (error) => {
        setSearchError(
          error.code === error.PERMISSION_DENIED
            ? "Permissão de localização negada. Habilite nas configurações do navegador."
            : "Não foi possível obter sua localização agora."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar endereço, cidade ou fazenda..."
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-shadow duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={searching}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          <Search size={14} />
          {searching ? "Buscando..." : "Buscar"}
        </button>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          title="Usar minha localização"
          className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          <LocateFixed size={14} />
          {locating ? "Localizando..." : "Minha localização"}
        </button>
      </form>
      {searchError && <p className="text-xs text-red-600">{searchError}</p>}

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <MapContainer center={[center.lat, center.lng]} zoom={points.length ? 16 : 4} style={{ height: 360 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FlyToLocation position={searchCenter} />
          <ClickCapture onClick={addPoint} />
          {searchCenter && (
            <CircleMarker
              center={[searchCenter.lat, searchCenter.lng]}
              radius={9}
              pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.5, weight: 2 }}
            />
          )}
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
