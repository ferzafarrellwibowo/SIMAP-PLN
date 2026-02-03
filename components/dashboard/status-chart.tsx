"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface StatusChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export function StatusPieChart({ data }: StatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-medium text-gray-900">
            {item.name}
          </p>
          <p className="text-sm text-gray-600">
            {item.value} proyek ({((item.value / total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full" hover={false}>
      <CardHeader>
        <CardTitle>Status Proyek</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center rounded-lg bg-gray-100 p-2 border border-gray-200/50"
            >
              <div
                className="h-3 w-3 rounded-full mb-1"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-lg font-bold text-gray-900">
                {item.value}
              </span>
              <span className="text-xs text-gray-500 text-center">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
