"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuth, ROLE_LABELS } from "@/lib/auth";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username dan password harus diisi");
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError("Username atau password salah");
    }
  };

  const demoAccounts = [
    { username: "admin", role: "admin", name: "Administrator" },
    { username: "budi.pic", role: "pic", name: "Budi Santoso (PIC)" },
    { username: "siti.pic", role: "pic", name: "Siti Rahayu (PIC)" },
    { username: "dewi.keuangan", role: "keuangan", name: "Dewi Lestari (Keuangan)" },
    { username: "ahmad.manajer", role: "manajer", name: "Ahmad Wijaya (Manajer)" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/Logo_PLN.svg"
              alt="Logo PLN"
              width={80}
              height={80}
              className="h-20 w-20"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Sistem Monitoring Proyek
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            PT PLN (Persero) - Dashboard Monitoring Proyek & Anggaran
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username / Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Masukkan username atau email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Masukkan password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Demo Accounts Toggle */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showDemo ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Lihat Akun Demo
            </button>

            {showDemo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 space-y-2"
              >
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center mb-3">
                  Password untuk semua akun: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">password123</code>
                </p>
                {demoAccounts.map((account) => (
                  <button
                    key={account.username}
                    onClick={() => {
                      setUsername(account.username);
                      setPassword("password123");
                    }}
                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {account.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {account.username}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {ROLE_LABELS[account.role as keyof typeof ROLE_LABELS]}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-600 mt-6">
          © 2026 PT PLN (Persero) - Sistem Monitoring Proyek
        </p>
      </motion.div>
    </div>
  );
}
