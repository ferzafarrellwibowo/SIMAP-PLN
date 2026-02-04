"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { ContractAdministration } from "../types-split";

// ============================================
// HOOK: useAdministrationContracts
// Mengambil data contract_administration dari Supabase
// ============================================

export interface UseAdministrationContractsResult {
  contracts: ContractAdministration[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdministrationContracts(): UseAdministrationContractsResult {
  const [contracts, setContracts] = useState<ContractAdministration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("contract_administration")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Supabase error:", fetchError);
        setError(fetchError.message);
        return;
      }

      // Map database rows to TypeScript interface
      const mappedContracts: ContractAdministration[] = (data || []).map((row) => ({
        id: row.id,
        no: row.no,
        kategori: "administrasi" as const,
        
        // 1. Uraian Kegiatan/Mata Anggaran
        uraianKegiatan: row.uraian_kegiatan,
        
        // 2. No. Perjanjian/Amandemen
        noPerjanjian: row.no_perjanjian || "",
        
        // 3. Tanggal Perjanjian/Amandemen
        tanggalPerjanjian: row.tanggal_perjanjian || "",
        
        // 4. Tanggal Berakhir
        tanggalBerakhir: row.tanggal_berakhir || "",
        
        // 5. Judul Perjanjian
        judulPerjanjian: row.judul_perjanjian || "",
        
        // 6. Nilai Perjanjian
        nilaiPerjanjian: row.nilai_perjanjian || 0,
        
        // 7. Nama Vendor
        namaVendor: row.nama_vendor || "",
        
        // 8. Nilai Tagihan Keseluruhan
        nilaiTagihanKeseluruhan: row.nilai_tagihan_keseluruhan || 0,
        
        // 9. Nilai Tagihan Khusus Kantor Pusat
        nilaiTagihanKantorPusat: row.nilai_tagihan_kantor_pusat || 0,
        
        // 10. Nilai Tagihan Unit selain Kantor Pusat
        nilaiTagihanUnitSelainPusat: row.nilai_tagihan_unit_selain_pusat || 0,
        
        // 11. No. Berita Acara
        noBeritaAcara: row.no_berita_acara,
        
        // 12. Tanggal Berita Acara
        tanggalBeritaAcara: row.tanggal_berita_acara,
        
        // 13. No. WBS/Pos Anggaran
        noWBSPosAnggaran: row.no_wbs_pos_anggaran,
        
        // 14. No. SKKI/SKKO
        noSKKISKKO: row.no_skki_skko,
        
        // 15. Tanggal Request
        tanggalRequest: row.tanggal_request,
        
        // 16. Tanggal SE release
        tanggalSERelease: row.tanggal_se_release,
        
        // 17. No. SE
        noSE: row.no_se,
        
        // 18. No. PO
        noPO: row.no_po,
        
        // 19. Submission ID
        submissionId: row.submission_id,
        
        // 20. Nama Pekerjaan
        namaPekerjaan: row.nama_pekerjaan,
        
        // 21. Beban Tahun
        bebanTahun: row.beban_tahun,
        
        // 22. Terbayar Pusat
        terbayarPusat: row.terbayar_pusat || 0,
        
        // 23. Status Bayar
        statusBayar: row.status_bayar,
        
        // 24. Keterangan
        keterangan: row.keterangan,
        
        // 25. Entry By
        entryBy: row.entry_by,
        
        // 26. Keterangan/Konfirmasi
        keteranganKonfirmasi: row.keterangan_konfirmasi,
        
        // 27. Rutin/Non Rutin
        rutinNonRutin: row.rutin_non_rutin,
        
        // 28. PIC
        pic: row.pic,
        
        // 29. Bidang
        bidang: row.bidang,
        
        // Metadata
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));

      setContracts(mappedContracts);
      console.log(`✅ Loaded ${mappedContracts.length} administration contracts from Supabase`);
    } catch (err) {
      console.error("Error fetching administration contracts:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    refetch: fetchContracts,
  };
}

// ============================================
// HOOK: useAdministrationContractById
// Mengambil single contract_administration dari Supabase by ID
// ============================================

export interface UseAdministrationContractByIdResult {
  contract: ContractAdministration | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdministrationContractById(id: string): UseAdministrationContractByIdResult {
  const [contract, setContract] = useState<ContractAdministration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContract = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("contract_administration")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Supabase error:", fetchError);
        setError(fetchError.message);
        setContract(null);
        return;
      }

      if (!data) {
        setContract(null);
        return;
      }

      // Map database row to TypeScript interface
      const mappedContract: ContractAdministration = {
        id: data.id,
        no: data.no,
        kategori: "administrasi" as const,
        
        // 1. Uraian Kegiatan/Mata Anggaran
        uraianKegiatan: data.uraian_kegiatan,
        
        // 2. No. Perjanjian/Amandemen
        noPerjanjian: data.no_perjanjian || "",
        
        // 3. Tanggal Perjanjian/Amandemen
        tanggalPerjanjian: data.tanggal_perjanjian || "",
        
        // 4. Tanggal Berakhir
        tanggalBerakhir: data.tanggal_berakhir || "",
        
        // 5. Judul Perjanjian
        judulPerjanjian: data.judul_perjanjian || "",
        
        // 6. Nilai Perjanjian
        nilaiPerjanjian: data.nilai_perjanjian || 0,
        
        // 7. Nama Vendor
        namaVendor: data.nama_vendor || "",
        
        // 8. Nilai Tagihan Keseluruhan
        nilaiTagihanKeseluruhan: data.nilai_tagihan_keseluruhan || 0,
        
        // 9. Nilai Tagihan Khusus Kantor Pusat
        nilaiTagihanKantorPusat: data.nilai_tagihan_kantor_pusat || 0,
        
        // 10. Nilai Tagihan Unit selain Kantor Pusat
        nilaiTagihanUnitSelainPusat: data.nilai_tagihan_unit_selain_pusat || 0,
        
        // 11. No. Berita Acara
        noBeritaAcara: data.no_berita_acara,
        
        // 12. Tanggal Berita Acara
        tanggalBeritaAcara: data.tanggal_berita_acara,
        
        // 13. No. WBS/Pos Anggaran
        noWBSPosAnggaran: data.no_wbs_pos_anggaran,
        
        // 14. No. SKKI/SKKO
        noSKKISKKO: data.no_skki_skko,
        
        // 15. Tanggal Request
        tanggalRequest: data.tanggal_request,
        
        // 16. Tanggal SE release
        tanggalSERelease: data.tanggal_se_release,
        
        // 17. No. SE
        noSE: data.no_se,
        
        // 18. No. PO
        noPO: data.no_po,
        
        // 19. Submission ID
        submissionId: data.submission_id,
        
        // 20. Nama Pekerjaan
        namaPekerjaan: data.nama_pekerjaan,
        
        // 21. Beban Tahun
        bebanTahun: data.beban_tahun,
        
        // 22. Terbayar Pusat
        terbayarPusat: data.terbayar_pusat || 0,
        
        // 23. Status Bayar
        statusBayar: data.status_bayar,
        
        // 24. Keterangan
        keterangan: data.keterangan,
        
        // 25. Entry By
        entryBy: data.entry_by,
        
        // 26. Keterangan/Konfirmasi
        keteranganKonfirmasi: data.keterangan_konfirmasi,
        
        // 27. Rutin/Non Rutin
        rutinNonRutin: data.rutin_non_rutin,
        
        // 28. PIC
        pic: data.pic,
        
        // 29. Bidang
        bidang: data.bidang,
        
        // Metadata
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };

      setContract(mappedContract);
    } catch (err) {
      console.error("Error fetching administration contract:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setContract(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  return {
    contract,
    loading,
    error,
    refetch: fetchContract,
  };
}
