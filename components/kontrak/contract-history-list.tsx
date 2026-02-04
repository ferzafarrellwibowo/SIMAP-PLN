"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Contract } from "@/lib/types-new";

interface ContractHistoryListProps {
  history: Contract[];
  currentContract: Contract;
}

export default function ContractHistoryList({ history, currentContract }: ContractHistoryListProps) {
  // Calculate version numbers - exclude current contract from list
  const previousVersions = useMemo(() => {
    return history.map((contract, index) => ({
      ...contract,
      displayVersion: history.length - index,
    }));
  }, [history]);

  if (history.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Kontrak Sebelumnya</h2>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {previousVersions.length} versi lama
        </span>
      </div>

      <div className="space-y-2">
        {previousVersions.map((version) => (
          <Link
            key={version.id}
            href={`/kontrak/${version.id}`}
            className="block p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex-shrink-0">
                  {version.displayVersion}
                </span>
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">
                  {version.namaPekerjaan || version.judulPekerjaan || version.judulPerjanjian || version.judulPRK || "Kontrak"}
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
