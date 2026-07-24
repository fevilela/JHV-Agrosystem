import { describe, it, expect } from "vitest";
import { latLngsToGeoJson, geoJsonToLatLngs, areaHectares } from "./geo";

describe("latLngsToGeoJson", () => {
  it("returns null with fewer than 3 points", () => {
    expect(latLngsToGeoJson([])).toBeNull();
    expect(latLngsToGeoJson([{ lat: 0, lng: 0 }])).toBeNull();
    expect(latLngsToGeoJson([{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }])).toBeNull();
  });

  it("closes the ring by repeating the first point", () => {
    const points = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 1, lng: 1 },
    ];
    const geoJson = latLngsToGeoJson(points);
    expect(geoJson).not.toBeNull();
    const ring = geoJson!.coordinates[0];
    expect(ring).toHaveLength(4);
    expect(ring[0]).toEqual(ring[3]);
    // GeoJSON is [lng, lat], not [lat, lng]
    expect(ring[0]).toEqual([0, 0]);
    expect(ring[1]).toEqual([1, 0]);
  });
});

describe("geoJsonToLatLngs", () => {
  it("returns an empty array for invalid input", () => {
    expect(geoJsonToLatLngs(null)).toEqual([]);
    expect(geoJsonToLatLngs(undefined)).toEqual([]);
    expect(geoJsonToLatLngs("not an object")).toEqual([]);
    expect(geoJsonToLatLngs({ type: "Polygon" })).toEqual([]);
  });

  it("round-trips with latLngsToGeoJson, dropping the closing point", () => {
    const points = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 1, lng: 1 },
    ];
    const geoJson = latLngsToGeoJson(points);
    expect(geoJsonToLatLngs(geoJson)).toEqual(points);
  });
});

describe("areaHectares", () => {
  it("returns 0 for fewer than 3 points", () => {
    expect(areaHectares([])).toBe(0);
    expect(areaHectares([{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }])).toBe(0);
  });

  it("computes a plausible area for a small square near the equator", () => {
    // ~0.01deg square near (0,0) is roughly 1.11km x 1.11km ≈ 123 ha
    const points = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.01 },
      { lat: 0.01, lng: 0.01 },
      { lat: 0.01, lng: 0 },
    ];
    const area = areaHectares(points);
    expect(area).toBeGreaterThan(100);
    expect(area).toBeLessThan(140);
  });

  it("is independent of winding direction (clockwise vs counter-clockwise)", () => {
    const points = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.01 },
      { lat: 0.01, lng: 0.01 },
      { lat: 0.01, lng: 0 },
    ];
    const reversed = [...points].reverse();
    expect(areaHectares(points)).toBeCloseTo(areaHectares(reversed), 6);
  });
});
