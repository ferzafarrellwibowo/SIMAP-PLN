"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BudgetChartProps {
  data: {
    total: number;
    used: number;
    remaining: number;
    chartData: {
      name: string;
      value: number;
      color: string;
    }[];
  };
}

export function BudgetChart({ data }: BudgetChartProps) {
  const usedPercentage = (data.used / data.total) * 100;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {item.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(item.value)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {((item.value / data.total) * 100).toFixed(1)}% dari total
          </p>
        </div>
      );
    }
    return null;
  };

  const barData = [
    { name: "Total Anggaran", value: data.total, fill: "#e5e7eb" },
    { name: "Realisasi", value: data.used, fill: "#3b82f6" },
    { name: "Sisa", value: data.remaining, fill: "#10b981" },
  ];

  return (
    <Card className="h-full" hover={false}>
      <CardHeader>
        <CardTitle>Anggaran Global</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {data.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {usedPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Terpakai
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Anggaran
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(data.total)}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Realisasi
              </p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(data.used)}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Sisa Anggaran
              </p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(data.remaining)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
