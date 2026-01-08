"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AlertCircle, Clock, CreditCard, TrendingDown } from "lucide-react";

interface RiskIndicatorsProps {
  delayed: number;
  overBudget: number;
  noUpdate: number;
}

export function RiskIndicators({ delayed, overBudget, noUpdate }: RiskIndicatorsProps) {
  const indicators = [
    {
      label: "Terlambat > 10%",
      value: delayed,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-800",
      description: "Proyek dengan keterlambatan signifikan",
    },
    {
      label: "Anggaran > 85%",
      value: overBudget,
      icon: CreditCard,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-800",
      description: "Proyek hampir melebihi anggaran",
    },
    {
      label: "Tanpa Update > 7 Hari",
      value: noUpdate,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      description: "Proyek perlu update terbaru",
    },
  ];

  const totalRisks = delayed + overBudget + noUpdate;

  return (
    <Card hover={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Indikator Risiko
          {totalRisks > 0 && (
            <Badge variant="warning" className="ml-2">
              {totalRisks} Peringatan
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <motion.div
                    key={indicator.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22, delay: index * 0.06 }}
                    whileHover={undefined}
                    className={`
                      rounded-lg border p-4 transition-shadow duration-150
                      ${indicator.bgColor} ${indicator.borderColor}
                    `}
                  >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${indicator.color}`} />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {indicator.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {indicator.description}
                    </p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.3 }}
                    className={`
                      text-2xl font-bold rounded-full h-12 w-12 flex items-center justify-center
                      ${indicator.value > 0 ? indicator.color : "text-gray-400"}
                      ${indicator.value > 0 ? indicator.bgColor : "bg-gray-100 dark:bg-gray-800"}
                    `}
                  >
                    {indicator.value}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {totalRisks === 0 && (
          <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
            <div className="w-10 h-10 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-2">Tidak ada indikator risiko aktif</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
