import { NextResponse } from 'next/server';

// ============================================
// API: VENDOR ACCOUNT MANAGEMENT
// ============================================
// Endpoints untuk mengelola akun vendor:
// - GET: List all vendor accounts
// - POST: Create vendor account (saat kontrak dibuat)
// - PUT: Activate/Deactivate vendor account
// - DELETE: Remove vendor account

// GET: Fetch all vendor accounts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const isActive = searchParams.get('isActive');

    let accounts = getMockVendorAccounts();

    if (contractId) {
      accounts = accounts.filter(a => a.contractId === contractId);
    }
    if (isActive !== null && isActive !== undefined) {
      accounts = accounts.filter(a => a.isActive === (isActive === 'true'));
    }

    return NextResponse.json({ data: accounts });
  } catch (error) {
    console.error('Error fetching vendor accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor accounts' }, { status: 500 });
  }
}

// POST: Create new vendor account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      vendorName, 
      vendorCompany, 
      contractId, 
      contractTitle,
      tanggalPerjanjian,
      tanggalBerakhir,
      sendEmail = true,
    } = body;

    if (!email || !vendorName || !contractId || !tanggalBerakhir) {
      return NextResponse.json(
        { error: 'Missing required fields: email, vendorName, contractId, tanggalBerakhir' },
        { status: 400 }
      );
    }

    // Generate credentials
    const username = `vendor.${vendorName.toLowerCase().replace(/\s+/g, '').slice(0, 10)}`;
    const temporaryPassword = generatePassword();

    const newAccount = {
      id: `VA-${Date.now()}`,
      userId: `USR-VENDOR-${Date.now()}`,
      username,
      email,
      vendorName,
      vendorCompany: vendorCompany || '',
      contractId,
      isActive: false, // Requires admin activation
      activatedAt: null,
      expiresAt: tanggalBerakhir,
      createdAt: new Date().toISOString(),
    };

    // Send email if requested
    if (sendEmail) {
      try {
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-vendor-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorEmail: email,
            vendorName,
            vendorCompany,
            contractId,
            contractTitle,
            tanggalPerjanjian,
            tanggalBerakhir,
            temporaryUsername: username,
            temporaryPassword,
          }),
        });

        if (!emailResponse.ok) {
          console.warn('Failed to send vendor email, but account was created');
        }
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
      }
    }

    // In production, save to database
    console.log('👤 Vendor account created:', newAccount);

    return NextResponse.json({ 
      data: {
        ...newAccount,
        temporaryPassword, // Only returned once during creation
      },
      message: sendEmail 
        ? `Akun vendor berhasil dibuat dan email dikirim ke ${email}` 
        : 'Akun vendor berhasil dibuat',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor account:', error);
    return NextResponse.json({ error: 'Failed to create vendor account' }, { status: 500 });
  }
}

// PUT: Activate/Deactivate/Update vendor account
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action, expiresAt } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: id, action' },
        { status: 400 }
      );
    }

    const validActions = ['activate', 'deactivate', 'extend'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    let updatedAccount;

    switch (action) {
      case 'activate':
        updatedAccount = {
          id,
          isActive: true,
          activatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        break;
      case 'deactivate':
        updatedAccount = {
          id,
          isActive: false,
          updatedAt: new Date().toISOString(),
        };
        break;
      case 'extend':
        if (!expiresAt) {
          return NextResponse.json(
            { error: 'expiresAt is required for extend action' },
            { status: 400 }
          );
        }
        updatedAccount = {
          id,
          expiresAt,
          isActive: true, // Re-activate if extending
          updatedAt: new Date().toISOString(),
        };
        break;
    }

    // In production, update in database
    console.log('👤 Vendor account updated:', updatedAccount);

    return NextResponse.json({ 
      data: updatedAccount,
      message: `Akun vendor berhasil di-${action}`,
    });
  } catch (error) {
    console.error('Error updating vendor account:', error);
    return NextResponse.json({ error: 'Failed to update vendor account' }, { status: 500 });
  }
}

// Helper: Generate password
function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Mock data
function getMockVendorAccounts() {
  return [
    {
      id: 'VA-001',
      userId: 'USR-VENDOR-001',
      username: 'vendor.wijaya',
      email: 'andi.pratama@wijayakarya.co.id',
      vendorName: 'Andi Pratama',
      vendorCompany: 'PT Wijaya Karya',
      contractId: 'CTR-001',
      isActive: true,
      activatedAt: '2025-03-15T10:00:00Z',
      expiresAt: '2026-06-30',
      createdAt: '2025-03-15T08:00:00Z',
    },
    {
      id: 'VA-002',
      userId: 'USR-VENDOR-002',
      username: 'vendor.hutama',
      email: 'budi.setiawan@hutamakarya.co.id',
      vendorName: 'Budi Setiawan',
      vendorCompany: 'PT Hutama Karya',
      contractId: 'CTR-002',
      isActive: false,
      activatedAt: null,
      expiresAt: '2026-07-30',
      createdAt: '2025-04-01T08:00:00Z',
    },
  ];
}
