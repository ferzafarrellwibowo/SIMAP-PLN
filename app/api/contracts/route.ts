import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';

// GET - Ambil semua contracts
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Tambah contract baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Transform camelCase to snake_case untuk database
    const contractData = {
      no: body.no,
      uraian_kegiatan: body.uraianKegiatan,
      no_perjanjian: body.noPerjanjian,
      tanggal_perjanjian: body.tanggalPerjanjian,
      tanggal_berakhir: body.tanggalBerakhir,
      judul_pekerjaan: body.judulPekerjaan,
      nilai_kontrak: body.nilaiKontrak,
      vendor: body.vendor,
      nilai_tagihan_kontrak_pusat: body.nilaiTagihanKontrakPusat || 0,
      nilai_tagihan_unit_induk: body.nilaiTagihanUnitInduk || 0,
      nilai_berita_acara: body.nilaiBeritaAcara,
      no_berita_acara: body.noBeritaAcara,
      tanggal_berita_acara: body.tanggalBeritaAcara,
      no_berita_acara_sk_relasi: body.noBeritaAcaraSKRelasi,
      tanggal_arsip: body.tanggalArsip,
      no_xps: body.noXPS,
      tanggal_xps: body.tanggalXPS,
      kategori: body.kategori,
      jenis_anggaran: body.jenisAnggaran,
      unit: body.unit,
      unit_sektor_k: body.unitSektorK,
      no_sk_we: body.noSKWE,
      pos_angg: body.posAngg,
      no_sku_skko: body.noSKUSKKO,
      request_tanggal_se_relasi: body.requestTanggalSERelasi,
      no_se: body.noSE,
      no_po: body.noPO,
      submission_id: body.submissionId,
      jenis_pekerjaan: body.jenisPekerjaan,
      beban_tahun: body.bebanTahun,
      batas_pagu_terbayar: body.batasPaguTerbayar,
      unit_terbayar: body.unitTerbayar,
      konfirmasi_non_rutin: body.konfirmasiNonRutin,
      bidang: body.bidang,
      pic_id: body.picId,
      pic_name: body.picName,
      entry_by: body.entryBy,
      status: body.status || 'aktif',
      total_tagihan_dibayar: 0,
      sisa_anggaran: body.nilaiKontrak,
      persentase_realisasi: 0,
      old_flag: body.oldFlag,
      click_cb: body.clickCB || false,
      created_by: body.createdBy,
      keterangan: body.keterangan,
      dokumen_kontrak: body.dokumenKontrak,
    };

    const { data, error } = await supabaseServer
      .from('contracts')
      .insert([contractData])
      .select()
      .single();

    if (error) {
      console.error('Error creating contract:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update contract
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    // Transform camelCase to snake_case
    const updateData: any = {};
    Object.keys(updates).forEach((key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      updateData[snakeKey] = updates[key];
    });

    const { data, error } = await supabaseServer
      .from('contracts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contract:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Hapus contract
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contract:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
