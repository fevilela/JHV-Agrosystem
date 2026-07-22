"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import type { Prisma } from "@prisma/client";
import { updateTalhaoBoundaryAction } from "../actions";

const PolygonEditor = dynamic(
  () => import("@/components/map/polygon-editor").then((m) => m.PolygonEditor),
  { ssr: false, loading: () => <div className="h-[360px] rounded-xl bg-neutral-50" /> }
);

export function TalhaoBoundarySection({
  talhaoId,
  boundary,
}: {
  talhaoId: string;
  boundary: unknown;
}) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-neutral-700">Contorno no mapa</h2>
      <PolygonEditor
        initialBoundary={boundary}
        saving={isPending}
        onSave={(geoJson, areaHa) => {
          if (!geoJson) return;
          setSaved(false);
          startTransition(async () => {
            await updateTalhaoBoundaryAction(talhaoId, geoJson as Prisma.InputJsonValue, areaHa);
            setSaved(true);
          });
        }}
      />
      {saved && !isPending && (
        <p className="mt-2 text-xs font-medium text-green-700">Contorno salvo.</p>
      )}
    </div>
  );
}
