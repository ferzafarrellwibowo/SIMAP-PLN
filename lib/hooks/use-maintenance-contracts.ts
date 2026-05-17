"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { ContractMaintenance } from "../types-split";

// ============================================
// HOOK: useMaintenanceContracts
// Mengambil data contract_maintenance dari Supabase
// ============================================

export interface UseMaintenanceContractsResult {
  contracts: ContractMaintenance[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMaintenanceContracts(): UseMaintenanceContractsResult {
  const [contracts, setContracts] = useState<ContractMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("contract_maintenance")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Supabase error:", fetchError);
        setError(fetchError.message);
        return;
      }

      // Map database rows to TypeScript interface
      const mappedContracts: ContractMaintenance[] = (data || []).map((row) => ({
        id: row.id,
        no: row.no,
        kategori: "pemeliharaan" as const,
        
        // Field sesuai struktur tabel baru
        uraianKegiatan: row.uraian_kegiatan,
        noPerjanjian: row.no_perjanjian || "",
        tanggalPerjanjian: row.tanggal_perjanjian || "",
        tanggalBerakhir: row.tanggal_berakhir || "",
        judulPerjanjian: row.judul_perjanjian || "",
        nilaiPerjanjian: row.nilai_perjanjian || 0,
        namaVendor: row.nama_vendor || "",
        nilaiTagihanSTIPusat: row.nilai_tagihan_sti_pusat || 0,
        nilaiTagihanUnitInduk: row.nilai_tagihan_unit_induk || 0,
        noBeritaAcara: row.no_berita_acara,
        tanggalBeritaAcara: row.tanggal_berita_acara,
        noWBSPosAnggaran: row.no_wbs_pos_anggaran,
        noSKKISKKO: row.no_skki_skko,
        tanggalRequestSE: row.tanggal_request_se,
        tanggalSERilis: row.tanggal_se_rilis,
        noSE: row.no_se,
        noPO: row.no_po,
        submissionIdVIP: row.submission_id_vip,
        namaPekerjaan: row.nama_pekerjaan,
        msb: row.msb,
        bidang: row.bidang,
        statusVIP: row.status_vip,
        periodeAccrue: row.periode_accrue,
        requestedBy: row.requested_by,
        keterangan: row.keterangan,
        terbayarSTIPusat: row.terbayar_sti_pusat || 0,
        terbayarUnit: row.terbayar_unit || 0,
        statusTerbayar: row.status_terbayar,
        rutinNonRutin: row.rutin_non_rutin,
        
        // Metadata
        createdAt: row.created_at || new Date().toISOString(),
        createdBy: row.created_by,
        updatedAt: row.updated_at || new Date().toISOString(),
        updatedBy: row.updated_by,
      }));

      setContracts(mappedContracts);
      console.log(`✅ Loaded ${mappedContracts.length} maintenance contracts from Supabase`);
    } catch (err) {
      console.error("Error fetching maintenance contracts:", err);
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
// HOOK: useMaintenanceContract (single contract by ID)
// ============================================

export function useMaintenanceContract(id: string) {
  const [contract, setContract] = useState<ContractMaintenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContract() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("contract_maintenance")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("Supabase error:", fetchError);
          setError(fetchError.message);
          return;
        }

        if (data) {
          const mappedContract: ContractMaintenance = {
            id: data.id,
            no: data.no,
            kategori: "pemeliharaan",
            uraianKegiatan: data.uraian_kegiatan,
            noPerjanjian: data.no_perjanjian || "",
            tanggalPerjanjian: data.tanggal_perjanjian || "",
            tanggalBerakhir: data.tanggal_berakhir || "",
            judulPerjanjian: data.judul_perjanjian || "",
            nilaiPerjanjian: data.nilai_perjanjian || 0,
            namaVendor: data.nama_vendor || "",
            nilaiTagihanSTIPusat: data.nilai_tagihan_sti_pusat || 0,
            nilaiTagihanUnitInduk: data.nilai_tagihan_unit_induk || 0,
            noBeritaAcara: data.no_berita_acara,
            tanggalBeritaAcara: data.tanggal_berita_acara,
            noWBSPosAnggaran: data.no_wbs_pos_anggaran,
            noSKKISKKO: data.no_skki_skko,
            tanggalRequestSE: data.tanggal_request_se,
            tanggalSERilis: data.tanggal_se_rilis,
            noSE: data.no_se,
            noPO: data.no_po,
            submissionIdVIP: data.submission_id_vip,
            namaPekerjaan: data.nama_pekerjaan,
            msb: data.msb,
            bidang: data.bidang,
            statusVIP: data.status_vip,
            periodeAccrue: data.periode_accrue,
            requestedBy: data.requested_by,
            keterangan: data.keterangan,
            terbayarSTIPusat: data.terbayar_sti_pusat || 0,
            terbayarUnit: data.terbayar_unit || 0,
            statusTerbayar: data.status_terbayar,
            rutinNonRutin: data.rutin_non_rutin,
            createdAt: data.created_at || new Date().toISOString(),
            createdBy: data.created_by,
            updatedAt: data.updated_at || new Date().toISOString(),
            updatedBy: data.updated_by,
          };
          setContract(mappedContract);
        }
      } catch (err) {
        console.error("Error fetching maintenance contract:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchContract();
  }, [id]);

  return { contract, loading, error };
}
