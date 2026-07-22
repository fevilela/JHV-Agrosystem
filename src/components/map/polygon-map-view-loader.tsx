"use client";

import dynamic from "next/dynamic";
import type { MapFeature } from "./polygon-map-view";

const PolygonMapView = dynamic(
  () => import("./polygon-map-view").then((m) => m.PolygonMapView),
  { ssr: false, loading: () => <div className="h-[480px] rounded-xl bg-neutral-50" /> }
);

export function PolygonMapViewLoader({ features }: { features: MapFeature[] }) {
  return <PolygonMapView features={features} />;
}
