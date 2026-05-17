import { NextResponse } from 'next/server';

// ============================================
// API: APPROVAL MANAGEMENT
// ============================================
// Endpoints untuk mengelola approval requests:
// - Approve Update Kontrak (Revisi Nilai / Negosiasi)
// - Kelola Invoice (Bayar/Tolak + Alasan + Bukti Pembayaran)
// - Approve Update Progress (Approve/Tolak + Alasan)
// - Review Perpanjangan Kontrak (Terima/Negosiasi/Tolak + Alasan + Negosiasi Tanggal)

// GET: Fetch all approval requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const contractId = searchParams.get('contractId');

    // In production, fetch from database
    // For now, return mock data
    let approvals = getMockApprovals();

    if (type) {
      approvals = approvals.filter(a => a.type === type);
    }
    if (status) {
      approvals = approvals.filter(a => a.status === status);
    }
    if (contractId) {
      approvals = approvals.filter(a => a.contractId === contractId);
    }

    return NextResponse.json({ data: approvals });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}

// POST: Create new approval request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, contractId, invoiceId, requestedBy, requestedByName, title, description, ...details } = body;

    if (!type || !contractId || !requestedBy || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: type, contractId, requestedBy, title' },
        { status: 400 }
      );
    }

    const newApproval = {
      id: `APR-${Date.now()}`,
      type,
      contractId,
      invoiceId,
      requestedBy,
      requestedByName: requestedByName || 'Unknown',
      requestedAt: new Date().toISOString(),
      status: 'pending',
      title,
      description: description || '',
      ...details,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In production, save to database
    console.log('📋 New approval request created:', newApproval);

    return NextResponse.json({ data: newApproval }, { status: 201 });
  } catch (error) {
    console.error('Error creating approval:', error);
    return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 });
  }
}

// PUT: Update approval status (Admin action)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      action, // 'approve' | 'reject' | 'negotiate'
      reviewedBy,
      reviewedByName,
      rejectionReason,
      negotiatedValue,
      negotiatedEndDate,
      paymentProof,
    } = body;

    if (!id || !action || !reviewedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: id, action, reviewedBy' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['approve', 'reject', 'negotiate'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      negotiate: 'negotiation',
    };

    const updatedApproval = {
      id,
      status: statusMap[action],
      reviewedBy,
      reviewedByName: reviewedByName || 'Admin',
      reviewedAt: new Date().toISOString(),
      rejectionReason: action === 'reject' ? rejectionReason : undefined,
      negotiatedValue: action === 'negotiate' ? negotiatedValue : undefined,
      negotiatedEndDate: action === 'negotiate' ? negotiatedEndDate : undefined,
      paymentProof: action === 'approve' ? paymentProof : undefined,
      updatedAt: new Date().toISOString(),
    };

    // In production, update in database
    console.log('📋 Approval updated:', updatedApproval);

    return NextResponse.json({ data: updatedApproval });
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
  }
}

// ============================================
// MOCK DATA
// ============================================

function getMockApprovals() {
  return [
    {
      id: 'APR-001',
      type: 'update_kontrak',
      contractId: 'CTR-001',
      requestedBy: 'USR-VENDOR-001',
      requestedByName: 'Andi Pratama (PT Wijaya Karya)',
      requestedAt: '2025-04-10T08:00:00Z',
      status: 'pending',
      title: 'Revisi Nilai Kontrak - Pengadaan Trafo 60 MVA',
      description: 'Pengajuan revisi nilai kontrak karena adanya perubahan spesifikasi material trafo.',
      proposedValue: 16500000000,
      currentValue: 15000000000,
      createdAt: '2025-04-10T08:00:00Z',
      updatedAt: '2025-04-10T08:00:00Z',
    },
    {
      id: 'APR-002',
      type: 'invoice_payment',
      contractId: 'CTR-002',
      invoiceId: 'INV-0005',
      requestedBy: 'USR-VENDOR-001',
      requestedByName: 'Andi Pratama (PT Wijaya Karya)',
      requestedAt: '2025-04-12T10:30:00Z',
      status: 'pending',
      title: 'Pembayaran Invoice Termin 3 - SUTT 150kV',
      description: 'Pengajuan pembayaran termin ke-3 sesuai progress pekerjaan 60%.',
      createdAt: '2025-04-12T10:30:00Z',
      updatedAt: '2025-04-12T10:30:00Z',
    },
    {
      id: 'APR-003',
      type: 'update_progress',
      contractId: 'CTR-001',
      requestedBy: 'USR-VENDOR-001',
      requestedByName: 'Andi Pratama (PT Wijaya Karya)',
      requestedAt: '2025-04-15T14:00:00Z',
      status: 'pending',
      title: 'Update Progress Pekerjaan - 75%',
      description: 'Pemasangan trafo telah selesai, sedang dalam tahap pengujian.',
      proposedProgress: 75,
      currentProgress: 55,
      createdAt: '2025-04-15T14:00:00Z',
      updatedAt: '2025-04-15T14:00:00Z',
    },
    {
      id: 'APR-004',
      type: 'perpanjangan_kontrak',
      contractId: 'CTR-003',
      requestedBy: 'USR-VENDOR-001',
      requestedByName: 'Andi Pratama (PT Wijaya Karya)',
      requestedAt: '2025-04-18T09:00:00Z',
      status: 'pending',
      title: 'Perpanjangan Kontrak - Pengadaan Kubikel 20kV',
      description: 'Pengajuan perpanjangan kontrak karena keterlambatan pengiriman material dari supplier.',
      proposedEndDate: '2026-12-31',
      currentEndDate: '2026-06-30',
      createdAt: '2025-04-18T09:00:00Z',
      updatedAt: '2025-04-18T09:00:00Z',
    },
    {
      id: 'APR-005',
      type: 'invoice_payment',
      contractId: 'CTR-001',
      invoiceId: 'INV-0003',
      requestedBy: 'USR-VENDOR-001',
      requestedByName: 'Andi Pratama (PT Wijaya Karya)',
      requestedAt: '2025-03-20T11:00:00Z',
      status: 'approved',
      reviewedBy: 'USR-001',
      reviewedByName: 'Ferza Farrell Wibowo',
      reviewedAt: '2025-03-22T09:00:00Z',
      title: 'Pembayaran Invoice Termin 2 - Trafo 60 MVA',
      description: 'Pembayaran termin ke-2 sesuai progress 40%.',
      paymentProof: '/uploads/bukti-bayar-inv0003.pdf',
      createdAt: '2025-03-20T11:00:00Z',
      updatedAt: '2025-03-22T09:00:00Z',
    },
  ];
}
