import { NextResponse } from 'next/server';

// ============================================
// API: SEND VENDOR TEMPORARY ACCOUNT EMAIL
// ============================================
// Endpoint ini mengirim email ke vendor dengan informasi akun temporary
// Akun aktif selama waktu kontrak berlangsung

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      vendorEmail, 
      vendorName, 
      vendorCompany,
      contractId, 
      contractTitle,
      tanggalPerjanjian,
      tanggalBerakhir,
      temporaryUsername,
      temporaryPassword,
    } = body;

    // Validate required fields
    if (!vendorEmail || !vendorName || !contractId || !tanggalBerakhir) {
      return NextResponse.json(
        { error: 'Missing required fields: vendorEmail, vendorName, contractId, tanggalBerakhir' },
        { status: 400 }
      );
    }

    // Generate temporary credentials if not provided
    const username = temporaryUsername || `vendor.${vendorName.toLowerCase().replace(/\s+/g, '').slice(0, 10)}`;
    const password = temporaryPassword || generateTemporaryPassword();

    // Email content
    const emailContent = {
      to: vendorEmail,
      subject: `[PLN SIMAP] Akun Vendor Temporary - ${contractTitle || contractId}`,
      body: `
        Yth. ${vendorName},
        
        Anda telah terdaftar sebagai vendor pada Sistem Monitoring Proyek PLN (SIMAP).
        
        Berikut adalah informasi akun temporary Anda:
        
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        Username  : ${username}
        Password  : ${password}
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        Informasi Kontrak:
        - ID Kontrak    : ${contractId}
        - Judul         : ${contractTitle || '-'}
        - Perusahaan    : ${vendorCompany || '-'}
        - Periode       : ${tanggalPerjanjian || '-'} s/d ${tanggalBerakhir}
        
        PENTING:
        • Akun ini aktif selama periode kontrak berlangsung.
        • Akun akan otomatis non-aktif setelah tanggal ${tanggalBerakhir}.
        • Akun memerlukan aktivasi oleh Admin sebelum dapat digunakan.
        • Segera ganti password setelah login pertama kali.
        • Jangan bagikan informasi akun ini kepada pihak lain.
        
        Fitur yang tersedia untuk Vendor:
        1. Melihat detail kontrak Anda
        2. Mengajukan invoice/tagihan
        3. Update progress pekerjaan
        4. Mengajukan perpanjangan kontrak
        
        Untuk login, silakan akses: ${process.env.NEXT_PUBLIC_APP_URL || 'https://simap.pln.co.id'}/login
        
        Terima kasih,
        Tim SIMAP PLN
      `.trim(),
    };

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, we simulate the email sending
    console.log('📧 Sending vendor email to:', vendorEmail);
    console.log('📧 Email content:', emailContent);

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return success with account details
    return NextResponse.json({
      success: true,
      message: `Email berhasil dikirim ke ${vendorEmail}`,
      vendorAccount: {
        username,
        email: vendorEmail,
        vendorName,
        vendorCompany,
        contractId,
        expiresAt: tanggalBerakhir,
        isActive: false, // Requires admin activation
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending vendor email:', error);
    return NextResponse.json(
      { error: 'Gagal mengirim email ke vendor' },
      { status: 500 }
    );
  }
}

// Helper: Generate temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
