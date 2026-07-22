"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function PendenciasByCategoryChart({
  data,
}: {
  data: { category: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: "#737373" }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 11, fill: "#737373" }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "#e5e5e5", fontSize: 12 }}
          labelStyle={{ color: "#171717" }}
        />
        <Bar dataKey="count" name="Pendências" fill="#2d4d6a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
