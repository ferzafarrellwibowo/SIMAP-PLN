"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProgressChartProps {
  data: {
    month: string;
    rencana: number;
    realisasi: number;
  }[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-gray-900 mb-2">
            {label}
          </p>
          {payload.map((entry: any) => (
            <p
              key={entry.name}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {Number(entry.value).toFixed(1)}%
            </p>
          ))}
          <p className="mt-2 text-xs text-gray-500">
            Deviasi: {(payload[0]?.value - payload[1]?.value).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate averages
  const avgPlanned = data.reduce((sum, item) => sum + item.rencana, 0) / data.length;
  const avgActual = data.reduce((sum, item) => sum + item.realisasi, 0) / data.length;

  return (
    <Card className="h-full" hover={false}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Grafik Progress Global</span>
          <div className="flex gap-4 text-sm font-normal">
            <span className="text-blue-600">
              Rata-rata Rencana: {avgPlanned.toFixed(1)}%
            </span>
            <span className="text-emerald-600">
              Rata-rata Realisasi: {avgActual.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRencana" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRealisasi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-600">
                  {value === "rencana" ? "Rencana" : "Realisasi"}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="rencana"
              name="rencana"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRencana)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="realisasi"
              name="realisasi"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRealisasi)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
