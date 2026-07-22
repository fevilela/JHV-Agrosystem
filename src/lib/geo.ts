export type LatLng = { lat: number; lng: number };

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

export function latLngsToGeoJson(points: LatLng[]): GeoJsonPolygon | null {
  if (points.length < 3) return null;
  const ring: [number, number][] = points.map((p) => [p.lng, p.lat]);
  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

export function geoJsonToLatLngs(value: unknown): LatLng[] {
  if (!value || typeof value !== "object") return [];
  const polygon = value as Partial<GeoJsonPolygon>;
  const ring = polygon.coordinates?.[0];
  if (!Array.isArray(ring)) return [];
  const points = ring.map(([lng, lat]) => ({ lat, lng }));
  // remove ponto de fechamento duplicado (último == primeiro)
  if (
    points.length > 1 &&
    points[0].lat === points[points.length - 1].lat &&
    points[0].lng === points[points.length - 1].lng
  ) {
    points.pop();
  }
  return points;
}

// Área de polígono esférico (fórmula do excesso esférico aproximado) — precisa
// o bastante pra talhão/pasto/piquete sem depender de libs geoespaciais extras.
export function areaHectares(points: LatLng[]): number {
  if (points.length < 3) return 0;
  const R = 6378137;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += (toRad(p2.lng) - toRad(p1.lng)) * (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  area = Math.abs((area * R * R) / 2);
  return area / 10000;
}
