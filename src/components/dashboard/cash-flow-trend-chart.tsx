"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function CashFlowTrendChart({
  data,
  locale = "pt-BR",
}: {
  data: { date: string; balance: number }[];
  locale?: string;
}) {
  const formatDateLabel = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
  const formatCurrencyLabel = (value: number) =>
    value.toLocaleString(locale, { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateLabel}
          tick={{ fontSize: 11, fill: "#737373" }}
        />
        <YAxis
          tickFormatter={formatCurrencyLabel}
          tick={{ fontSize: 11, fill: "#737373" }}
          width={80}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "#e5e5e5", fontSize: 12 }}
          labelStyle={{ color: "#171717" }}
          labelFormatter={(value) => formatDateLabel(String(value))}
          formatter={(value) => formatCurrencyLabel(Number(value))}
        />
        <Line
          type="monotone"
          dataKey="balance"
          name="Saldo acumulado"
          stroke="#21374f"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
