"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContractStore, CONTRACT_CATEGORY_LABELS } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";
import type { Contract, ContractCategory, JenisAnggaran, CRStatus } from "@/lib/types-new";

interface UpdateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onSuccess: (newContract: Contract) => void;
}

// Helper function to format currency to readable text
function formatCurrencyText(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return '';

  if (num >= 1000000000000) {
    const triliun = num / 1000000000000;
    return `Rp ${triliun.toLocaleString('id-ID', { maximumFractionDigits: 2 })} triliun`;
  } else if (num >= 1000000000) {
    const miliar = num / 1000000000;
    return `Rp ${miliar.toLocaleString('id-ID', { maximumFractionDigits: 2 })} miliar`;
  } else if (num >= 1000000) {
    const juta = num / 1000000;
    return `Rp ${juta.toLocaleString('id-ID', { maximumFractionDigits: 2 })} jt`;
  } else if (num >= 1000) {
    const ribu = num / 1000;
    return `Rp ${ribu.toLocaleString('id-ID', { maximumFractionDigits: 2 })} rb`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function UpdateContractModal({ isOpen, onClose, contract, onSuccess }: UpdateContractModalProps) {
  const { user } = useAuth();
  const { updateContractWithNewVersion } = useContractStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form data - initialized EMPTY like Tambah Kontrak form (konsep: kontrak baru di dalam kontrak)
  // Hanya kategori yang sama dengan kontrak induk
  const [formData, setFormData] = useState({
    // Common fields - KOSONG
    kategori: contract.kategori,
    tanggalPerjanjian: "",
    tanggalBerakhir: "",
    namaVendor: "",
    nilaiPerjanjian: "",
    unit: "",
    keterangan: "",
    
    // Investasi fields - KOSONG
    judulPRK: "",
    nilaiTagihan: "",
    namaPekerjaan: "",
    jenisAI: "AI" as JenisAnggaran,
    crNotCR: "Not CR" as CRStatus,
    
    // Pemeliharaan fields - KOSONG
    uraianKegiatan: "",
    judulPerjanjian: "",
    nilaiTagihanPusat: "",
    nilaiTagihanUnitInduk: "",
    tanggalBeritaAcara: "",
    tanggalRequestSE: "",
    tanggalSERilis: "",
    msb: "",
    bidang: "",
    statusVIP: "belum_lunas",
    periodeAccrueBulan: "",
    periodeAccrueTahun: String(new Date().getFullYear()),
    requestedBy: "",
    terbayarPusat: "",
    terbayarUnit: "",
    statusTerbayar: "Belum Terbayar",
    rutinNonRutin: "Rutin",
    
    // Administrasi fields - KOSONG
    nilaiTagihanKeseluruhan: "",
    nilaiTagihanKhususPusat: "",
    nilaiTagihanUnitSelainPusat: "",
    statusBayar: "Belum Dibayar",
    bebanTahun: String(new Date().getFullYear()),
    picName: "",
    entryBy: "",
  });

  // Reset form when modal opens - form KOSONG seperti Tambah Kontrak
  useEffect(() => {
    if (isOpen) {
      setFormData({
        kategori: contract.kategori,
        tanggalPerjanjian: "",
        tanggalBerakhir: "",
        namaVendor: "",
        nilaiPerjanjian: "",
        unit: "",
        keterangan: "",
        judulPRK: "",
        nilaiTagihan: "",
        namaPekerjaan: "",
        jenisAI: "AI" as JenisAnggaran,
        crNotCR: "Not CR" as CRStatus,
        uraianKegiatan: "",
        judulPerjanjian: "",
        nilaiTagihanPusat: "",
        nilaiTagihanUnitInduk: "",
        tanggalBeritaAcara: "",
        tanggalRequestSE: "",
        tanggalSERilis: "",
        msb: "",
        bidang: "",
        statusVIP: "belum_lunas",
        periodeAccrueBulan: "",
        periodeAccrueTahun: String(new Date().getFullYear()),
        requestedBy: "",
        terbayarPusat: "",
        terbayarUnit: "",
        statusTerbayar: "Belum Terbayar",
        rutinNonRutin: "Rutin",
        nilaiTagihanKeseluruhan: "",
        nilaiTagihanKhususPusat: "",
        nilaiTagihanUnitSelainPusat: "",
        statusBayar: "Belum Dibayar",
        bebanTahun: String(new Date().getFullYear()),
        picName: "",
        entryBy: "",
      });
      setErrorMessage(null);
    }
  }, [contract.kategori, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let updates: Partial<Contract> = {};

      if (contract.kategori === "investasi") {
        // Validation for Investasi
        if (!formData.tanggalPerjanjian || !formData.tanggalBerakhir || !formData.judulPRK ||
          !formData.nilaiPerjanjian || !formData.namaVendor || !formData.nilaiTagihan ||
          !formData.namaPekerjaan) {
          setErrorMessage("Mohon lengkapi field yang wajib diisi (ditandai dengan *)");
          setIsSubmitting(false);
          return;
        }

        updates = {
          tanggalPerjanjian: formData.tanggalPerjanjian,
          tanggalBerakhir: formData.tanggalBerakhir,
          judulPRK: formData.judulPRK,
          nilaiPerjanjian: parseFloat(formData.nilaiPerjanjian),
          namaVendor: formData.namaVendor,
          nilaiTagihan: parseFloat(formData.nilaiTagihan),
          namaPekerjaan: formData.namaPekerjaan,
          crNotCR: formData.crNotCR,
          unit: formData.unit || user?.unit || "",
          keterangan: formData.keterangan,
          // Map for compatibility
          uraianKegiatan: formData.judulPRK,
          judulPekerjaan: formData.namaPekerjaan,
          nilaiKontrak: parseFloat(formData.nilaiPerjanjian),
          vendor: formData.namaVendor,
        };
      } else if (contract.kategori === "pemeliharaan") {
        // Validation for Pemeliharaan
        if (!formData.judulPerjanjian || !formData.namaVendor || !formData.nilaiPerjanjian ||
          !formData.tanggalPerjanjian || !formData.tanggalBerakhir) {
          setErrorMessage("Mohon lengkapi field yang wajib diisi (ditandai dengan *)");
          setIsSubmitting(false);
          return;
        }

        const nilaiTagihanPusat = parseFloat(formData.nilaiTagihanPusat || "0");
        const nilaiTagihanUnitInduk = parseFloat(formData.nilaiTagihanUnitInduk || "0");

        updates = {
          uraianKegiatan: formData.uraianKegiatan,
          tanggalPerjanjian: formData.tanggalPerjanjian,
          tanggalBerakhir: formData.tanggalBerakhir,
          judulPerjanjian: formData.judulPerjanjian,
          nilaiPerjanjian: parseFloat(formData.nilaiPerjanjian),
          namaVendor: formData.namaVendor,
          nilaiTagihanKontrakPusat: nilaiTagihanPusat,
          nilaiTagihanUnitInduk: nilaiTagihanUnitInduk,
          tanggalBeritaAcara: formData.tanggalBeritaAcara || undefined,
          tanggalRequestSE: formData.tanggalRequestSE || undefined,
          tanggalSERilis: formData.tanggalSERilis || undefined,
          namaPekerjaan: formData.namaPekerjaan,
          msb: formData.msb,
          bidang: formData.bidang,
          statusVIP: formData.statusVIP as "lunas" | "belum_lunas" | "dokumen_tidak_lengkap",
          periodeAccrueBulan: formData.periodeAccrueBulan,
          periodeAccrueTahun: formData.periodeAccrueTahun,
          requestedBy: formData.requestedBy,
          terbayarPusat: parseFloat(formData.terbayarPusat || "0"),
          terbayarUnit: parseFloat(formData.terbayarUnit || "0"),
          statusTerbayar: formData.statusTerbayar,
          rutinNonRutin: formData.rutinNonRutin,
          unit: formData.unit || user?.unit || "",
          keterangan: formData.keterangan,
          // Map for compatibility
          judulPekerjaan: formData.judulPerjanjian,
          nilaiKontrak: parseFloat(formData.nilaiPerjanjian),
          vendor: formData.namaVendor,
        };
      } else {
        // Validation for Administrasi
        if (!formData.judulPerjanjian || !formData.namaVendor ||
          !formData.nilaiPerjanjian || !formData.tanggalPerjanjian || !formData.tanggalBerakhir) {
          setErrorMessage("Mohon lengkapi field yang wajib diisi (ditandai dengan *)");
          setIsSubmitting(false);
          return;
        }

        updates = {
          uraianKegiatan: formData.uraianKegiatan,
          tanggalPerjanjian: formData.tanggalPerjanjian,
          tanggalBerakhir: formData.tanggalBerakhir,
          judulPerjanjian: formData.judulPerjanjian,
          nilaiPerjanjian: parseFloat(formData.nilaiPerjanjian),
          namaVendor: formData.namaVendor,
          nilaiTagihanKeseluruhan: parseFloat(formData.nilaiTagihanKeseluruhan || "0"),
          nilaiTagihanKantorPusat: parseFloat(formData.nilaiTagihanKhususPusat || "0"),
          nilaiTagihanUnitSelainPusat: parseFloat(formData.nilaiTagihanUnitSelainPusat || "0"),
          tanggalBeritaAcara: formData.tanggalBeritaAcara || undefined,
          tanggalRequestSE: formData.tanggalRequestSE || undefined,
          tanggalSERilis: formData.tanggalSERilis || undefined,
          namaPekerjaan: formData.namaPekerjaan,
          bebanTahun: formData.bebanTahun,
          bidang: formData.bidang,
          picName: formData.picName,
          terbayarPusat: parseFloat(formData.terbayarPusat || "0"),
          statusBayar: formData.statusBayar as "belum_terbayar" | "sebagian_terbayar" | "lunas",
          rutinNonRutin: formData.rutinNonRutin,
          entryBy: formData.entryBy || user?.username || "Admin",
          unit: formData.unit || user?.unit || "",
          keterangan: formData.keterangan,
          // Map for compatibility
          judulPekerjaan: formData.judulPerjanjian,
          nilaiKontrak: parseFloat(formData.nilaiPerjanjian),
          vendor: formData.namaVendor,
        };
      }

      // Create new contract version (keeps noPRK, generates new noPerjanjian)
      const newContract = await updateContractWithNewVersion(contract.id, updates);
      onSuccess(newContract);
      onClose();
    } catch (error) {
      console.error("Error updating contract:", error);
      setErrorMessage("Terjadi kesalahan saat memperbarui kontrak. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form for Investasi
  const renderInvestasiForm = () => (
    <>
      {/* Informasi Perjanjian */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Informasi Perjanjian</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tanggal Perjanjian <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalPerjanjian"
              value={formData.tanggalPerjanjian}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tanggal Berakhir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalBerakhir"
              value={formData.tanggalBerakhir}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Judul PRK <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judulPRK"
              value={formData.judulPRK}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Nilai & Vendor */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Nilai & Vendor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nilai Perjanjian (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="nilaiPerjanjian"
              value={formData.nilaiPerjanjian}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.nilaiPerjanjian && (
              <p className="mt-1 text-xs text-gray-500">{formatCurrencyText(formData.nilaiPerjanjian)}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Vendor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaVendor"
              value={formData.namaVendor}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nilai Tagihan (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="nilaiTagihan"
              value={formData.nilaiTagihan}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.nilaiTagihan && (
              <p className="mt-1 text-xs text-gray-500">{formatCurrencyText(formData.nilaiTagihan)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Detail Pekerjaan */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Detail Pekerjaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Pekerjaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaPekerjaan"
              value={formData.namaPekerjaan}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">CR / Not CR</label>
            <select
              name="crNotCR"
              value={formData.crNotCR}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Not CR">Not CR</option>
              <option value="CR">CR</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </>
  );

  // Render form for Pemeliharaan
  const renderPemeliharaanForm = () => (
    <>
      {/* Informasi Perjanjian */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Informasi Perjanjian</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Uraian Kegiatan</label>
            <input
              type="text"
              name="uraianKegiatan"
              value={formData.uraianKegiatan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tanggal Perjanjian <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalPerjanjian"
              value={formData.tanggalPerjanjian}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tanggal Berakhir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalBerakhir"
              value={formData.tanggalBerakhir}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Judul Perjanjian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judulPerjanjian"
              value={formData.judulPerjanjian}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Nilai & Vendor */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Nilai & Vendor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nilai Perjanjian (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="nilaiPerjanjian"
              value={formData.nilaiPerjanjian}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.nilaiPerjanjian && (
              <p className="mt-1 text-xs text-gray-500">{formatCurrencyText(formData.nilaiPerjanjian)}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Vendor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaVendor"
              value={formData.namaVendor}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tagihan STI Pusat (Rp)</label>
            <input
              type="number"
              name="nilaiTagihanPusat"
              value={formData.nilaiTagihanPusat}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tagihan Unit Induk (Rp)</label>
            <input
              type="number"
              name="nilaiTagihanUnitInduk"
              value={formData.nilaiTagihanUnitInduk}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Detail Pekerjaan */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Detail Pekerjaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Pekerjaan</label>
            <input
              type="text"
              name="namaPekerjaan"
              value={formData.namaPekerjaan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">MSB</label>
            <input
              type="text"
              name="msb"
              value={formData.msb}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bidang</label>
            <input
              type="text"
              name="bidang"
              value={formData.bidang}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status VIP</label>
            <select
              name="statusVIP"
              value={formData.statusVIP}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="belum_lunas">Belum Lunas</option>
              <option value="lunas">Lunas</option>
              <option value="dokumen_tidak_lengkap">Dokumen Tidak Lengkap</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rutin/Non Rutin</label>
            <select
              name="rutinNonRutin"
              value={formData.rutinNonRutin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Rutin">Rutin</option>
              <option value="Non Rutin">Non Rutin</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );

  // Render form for Administrasi
  const renderAdministrasiForm = () => (
    <>
      {/* Informasi Perjanjian */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Informasi Perjanjian</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Uraian Kegiatan</label>
            <input
              type="text"
              name="uraianKegiatan"
              value={formData.uraianKegiatan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tanggal Perjanjian <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalPerjanjian"
              value={formData.tanggalPerjanjian}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tanggal Berakhir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalBerakhir"
              value={formData.tanggalBerakhir}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Judul Perjanjian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judulPerjanjian"
              value={formData.judulPerjanjian}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Nilai & Vendor */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Nilai & Vendor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nilai Perjanjian (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="nilaiPerjanjian"
              value={formData.nilaiPerjanjian}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.nilaiPerjanjian && (
              <p className="mt-1 text-xs text-gray-500">{formatCurrencyText(formData.nilaiPerjanjian)}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Vendor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaVendor"
              value={formData.namaVendor}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tagihan Keseluruhan (Rp)</label>
            <input
              type="number"
              name="nilaiTagihanKeseluruhan"
              value={formData.nilaiTagihanKeseluruhan}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tagihan Kantor Pusat (Rp)</label>
            <input
              type="number"
              name="nilaiTagihanKhususPusat"
              value={formData.nilaiTagihanKhususPusat}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Detail Pekerjaan */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Detail Pekerjaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Pekerjaan</label>
            <input
              type="text"
              name="namaPekerjaan"
              value={formData.namaPekerjaan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bidang</label>
            <input
              type="text"
              name="bidang"
              value={formData.bidang}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">PIC</label>
            <input
              type="text"
              name="picName"
              value={formData.picName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status Bayar</label>
            <select
              name="statusBayar"
              value={formData.statusBayar}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Belum Dibayar">Belum Dibayar</option>
              <option value="Sebagian Dibayar">Sebagian Dibayar</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rutin/Non Rutin</label>
            <select
              name="rutinNonRutin"
              value={formData.rutinNonRutin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Rutin">Rutin</option>
              <option value="Non Rutin">Non Rutin</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 text-center">Update Kontrak</h2>
                <p className="text-xs text-gray-500 text-center mt-1">Versi baru akan terhubung dengan No.PRK: <span className="font-mono font-medium">{contract.noPRK || "-"}</span></p>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                {/* Error Alert */}
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-red-800 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} id="update-contract-form">
                  {/* Render form based on category */}
                  {contract.kategori === "investasi" && renderInvestasiForm()}
                  {contract.kategori === "pemeliharaan" && renderPemeliharaanForm()}
                  {contract.kategori === "administrasi" && renderAdministrasiForm()}

                  {/* Keterangan */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Keterangan</label>
                    <textarea
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tambahkan catatan..."
                    />
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10">
                <button
                  type="submit"
                  form="update-contract-form"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
