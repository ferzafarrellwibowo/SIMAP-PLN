"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { SUBSCRIPTION_CATEGORY_COLORS } from "@/components/laporan/category-bar-charts";

interface SubscriptionCategoryData {
  kategori: string;
  label: string;
  totalSubs: number;
  activeSubs: number;
  totalAnggaranBulanan: number;
  totalTerbayar: number;
  avgProgress: number;
}

interface Props {
  subscriptionData: SubscriptionCategoryData[];
}

// Custom tooltip - professional styling for light/dark mode
const SubscriptionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-2xl dark:border-gray-600 dark:bg-gray-800">
        <p className="font-bold text-gray-800 dark:text-white mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">
          {label}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">Anggaran/Bulan:</span>
            <span className="font-semibold text-gray-800 dark:text-white">{formatCurrency(data.totalAnggaranBulanan)}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">Total Terbayar:</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(data.totalTerbayar)}</span>
          </div>
          <div className="flex justify-between items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Langganan:</span>
            <span className="font-semibold text-gray-800 dark:text-white">{data.totalSubs} <span className="text-xs text-gray-500 dark:text-gray-400">({data.activeSubs} aktif)</span></span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Legend Component for better dark mode support
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center gap-6 mt-2">
      {payload?.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SubscriptionBarChart({ subscriptionData }: Props) {
  const chartData = subscriptionData.map((cat) => ({
    name: cat.label,
    kategori: cat.kategori,
    totalAnggaranBulanan: cat.totalAnggaranBulanan,
    totalTerbayar: cat.totalTerbayar,
    totalSubs: cat.totalSubs,
    activeSubs: cat.activeSubs,
  }));

  return (
    <Card hover={false} className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Langganan per Kategori</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[320px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="anggaranGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cbd5e1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false}
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={false}
                  height={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontSize: 11, 
                    fill: '#9ca3af',
                  }}
                  className="dark:[&_text]:fill-gray-500"
                  tickFormatter={(value) => {
                    if (value >= 1000000000) return `${(value / 1000000000).toFixed(0)}M`;
                    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`;
                    return value.toString();
                  }}
                  width={50}
                />
                <Tooltip 
                  content={<SubscriptionTooltip />} 
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Legend content={<CustomLegend />} />
                <Bar 
                  dataKey="totalAnggaranBulanan" 
                  name="Anggaran/Bulan" 
                  fill="url(#anggaranGradient)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
                <Bar 
                  dataKey="totalTerbayar" 
                  name="Total Terbayar" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={SUBSCRIPTION_CATEGORY_COLORS[entry.kategori] || '#6b7280'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada data langganan</p>
              </div>
            </div>
          )}
        </div>


      </CardContent>
    </Card>
  );
}
