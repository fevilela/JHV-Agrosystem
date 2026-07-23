"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function WeightEvolutionChart({
  data,
  locale = "pt-BR",
}: {
  data: { month: string; avgWeight: number }[];
  locale?: string;
}) {
  const formatMonthLabel = (value: string) =>
    new Date(`${value}-01T00:00:00`).toLocaleDateString(locale, { month: "short", year: "2-digit" });
  const formatWeightLabel = (value: number) => `${value.toFixed(1)} kg`;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
        <XAxis dataKey="month" tickFormatter={formatMonthLabel} tick={{ fontSize: 11, fill: "#737373" }} />
        <YAxis tickFormatter={formatWeightLabel} tick={{ fontSize: 11, fill: "#737373" }} width={70} />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "#e5e5e5", fontSize: 12 }}
          labelStyle={{ color: "#171717" }}
          labelFormatter={(value) => formatMonthLabel(String(value))}
          formatter={(value) => formatWeightLabel(Number(value))}
        />
        <Line
          type="monotone"
          dataKey="avgWeight"
          name="Peso médio (kg)"
          stroke="#21374f"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
