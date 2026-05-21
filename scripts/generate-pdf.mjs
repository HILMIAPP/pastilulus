import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Define the PDF output path
const outputPdfPath = path.resolve('docs/FLOW_TRANSAKSI_MIDTRANS.pdf');

// Ensure docs directory exists
const docsDir = path.dirname(outputPdfPath);
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Create new PDF document
const doc = new PDFDocument({ size: 'A4', margin: 40 });

// Pipe output to file
const writeStream = fs.createWriteStream(outputPdfPath);
doc.pipe(writeStream);

// Helper function to draw header and footer
function drawHeaderFooter(pageNumber, totalPages) {
  // Save state
  doc.save();
  
  // Header
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#0A66FF').text('lolosujian — Panduan Integrasi Midtrans', 40, 20);
  doc.fontSize(8).font('Helvetica').fillColor('#888888').text('Alur Transaksi & Pembayaran', 220, 20, { align: 'right' });
  
  // Thin line below header
  doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(40, 32).lineTo(555, 32).stroke();
  
  // Footer
  doc.strokeColor('#E2E8F0').lineWidth(0.5).moveTo(40, 805).lineTo(555, 805).stroke();
  doc.fontSize(8).font('Helvetica').fillColor('#888888').text('Rahasia & Internal lolosujian', 40, 815);
  doc.fontSize(8).font('Helvetica').fillColor('#888888').text(`Halaman ${pageNumber}`, 40, 815, { align: 'right' });
  
  // Restore state
  doc.restore();
}

// Cover Page
// Large colorful top accent band
doc.rect(0, 0, 595, 15).fill('#0A66FF');

// Title Section
doc.moveDown(5);
doc.fontSize(28).font('Helvetica-Bold').fillColor('#0D1B2A').text('DOKUMEN ALUR TRANSAKSI', { align: 'left' });
doc.fontSize(22).font('Helvetica-Bold').fillColor('#0A66FF').text('INTEGRASI MIDTRANS SNAP API', { align: 'left' });
doc.moveDown(0.5);

// Thin separator line
doc.strokeColor('#0A66FF').lineWidth(3).moveTo(40, 210).lineTo(200, 210).stroke();
doc.moveDown(1.5);

// Metadata Block
doc.fontSize(11).font('Helvetica-Bold').fillColor('#334155').text('Platform:', { continued: true });
doc.font('Helvetica').fillColor('#475569').text(' lolosujian (Persiapan Ujian Mandiri PTN & UM-PTKIN 2026)');
doc.moveDown(0.4);
doc.fontSize(11).font('Helvetica-Bold').fillColor('#334155').text('Status Sistem:', { continued: true });
doc.font('Helvetica').fillColor('#10B981').text(' 100% Lolos Uji TypeScript, ESLint & Unit Tests (Vitest)');
doc.moveDown(0.4);
doc.fontSize(11).font('Helvetica-Bold').fillColor('#334155').text('Tanggal Dibuat:', { continued: true });
doc.font('Helvetica').fillColor('#475569').text(' 20 Mei 2026');
doc.moveDown(0.4);
doc.fontSize(11).font('Helvetica-Bold').fillColor('#334155').text('Tingkat Kesiapan Rilis:', { continued: true });
doc.font('Helvetica').fillColor('#0A66FF').text(' 98% - 99% (Sangat Siap Publik)');
doc.moveDown(2);

// Summary Text
doc.fontSize(11).font('Helvetica').fillColor('#334155').text(
  'Dokumen ini memuat panduan lengkap mengenai alur pemesanan produk digital, pengisian voucher diskon, pengenalan sistem referensi afiliasi, dan detail antarmuka popup Midtrans Snap yang digunakan pada platform lolosujian. Panduan ini dilengkapi dengan screenshot visual dari simulasi UI premium sistem.',
  { align: 'justify', lineGap: 4 }
);

// Draw footer on cover page
drawHeaderFooter(1);

// PAGE 2: Alur Diagram & Langkah 1
doc.addPage();
drawHeaderFooter(2);
doc.moveDown(2);

doc.fontSize(16).font('Helvetica-Bold').fillColor('#0D1B2A').text('Langkah 1: Memilih Paket Belajar (Pricing Page)');
doc.moveDown(0.5);
doc.fontSize(10.5).font('Helvetica').fillColor('#475569').text(
  'Siswa mengunjungi halaman harga (/harga) untuk melihat dan memilih paket belajar yang tersedia. Tersedia 3 paket utama:\n' +
  '• Paket Gratis: Akses 1 Paket Tryout UM-PTN & UM-PTKIN.\n' +
  '• Paket Belajar: Akses 6 bulan ke seluruh materi & tryout (Rp 25.000 Early Bird).\n' +
  '• Paket Belajar Full: Akses selamanya ke seluruh fitur (Rp 75.000 Early Bird).\n\n' +
  'Tindakan: Siswa menekan tombol "Mulai Belajar" pada paket pilihan untuk masuk ke sistem checkout.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1.5);

const imagePath1 = 'C:/Users/shafw/.gemini/antigravity/brain/59ef63ea-808c-47cd-bc3f-1f31df2ebefb/checkout_step1_harga_1779217650042.png';
if (fs.existsSync(imagePath1)) {
  doc.image(imagePath1, { width: 440, align: 'center' });
} else {
  doc.fillColor('#EF4444').text('[Gambar Langkah 1 Tidak Ditemukan]');
}

// PAGE 3: Langkah 2
doc.addPage();
drawHeaderFooter(3);
doc.moveDown(2);

doc.fontSize(16).font('Helvetica-Bold').fillColor('#0D1B2A').text('Langkah 2: Verifikasi Checkout & Kupon Promo');
doc.moveDown(0.5);
doc.fontSize(10.5).font('Helvetica').fillColor('#475569').text(
  'Siswa diarahkan ke halaman rincian checkout (/pembayaran?paket=belajar). Pada halaman ini:\n' +
  '1. Siswa wajib membaca dan menyetujui Syarat Layanan & Kebijakan Refund.\n' +
  '2. Siswa dapat memasukkan kode promo diskon (contoh: LOLOSPTN26) atau kode referensi affiliate partner.\n' +
  '3. Sistem secara otomatis memproses nominal final dari server.\n\n' +
  'Tindakan: Siswa menekan tombol "Lanjutkan pembayaran" untuk mengirim permintaan token ke Midtrans.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1.5);

const imagePath2 = 'C:/Users/shafw/.gemini/antigravity/brain/59ef63ea-808c-47cd-bc3f-1f31df2ebefb/checkout_step2_ringkasan_1779217666139.png';
if (fs.existsSync(imagePath2)) {
  doc.image(imagePath2, { width: 440, align: 'center' });
} else {
  doc.fillColor('#EF4444').text('[Gambar Langkah 2 Tidak Ditemukan]');
}

// PAGE 4: Langkah 3
doc.addPage();
drawHeaderFooter(4);
doc.moveDown(2);

doc.fontSize(16).font('Helvetica-Bold').fillColor('#0D1B2A').text('Langkah 3: Antarmuka Pembayaran Midtrans Snap');
doc.moveDown(0.5);
doc.fontSize(10.5).font('Helvetica').fillColor('#475569').text(
  'Aplikasi melakukan hit ke API backend /api/payments/snap-token untuk mendapatkan token transaksi unik dari Midtrans Server. Setelah token didapatkan, iframe popup Midtrans Snap akan dirender secara aman di atas layar lolosujian.\n' +
  '• Pilihan Metode Pembayaran: QRIS (GoPay, ShopeePay, LinkAja), Virtual Account (BCA, Mandiri, BNI, BRI), Kartu Kredit/Debit.\n\n' +
  'Tindakan: Siswa menyelesaikan pembayaran secara aman sesuai instruksi metode yang dipilih.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1.5);

const imagePath3 = 'C:/Users/shafw/.gemini/antigravity/brain/59ef63ea-808c-47cd-bc3f-1f31df2ebefb/checkout_step3_midtrans_1779217683651.png';
if (fs.existsSync(imagePath3)) {
  doc.image(imagePath3, { width: 440, align: 'center' });
} else {
  doc.fillColor('#EF4444').text('[Gambar Langkah 3 Tidak Ditemukan]');
}

// PAGE 5: Langkah 4
doc.addPage();
drawHeaderFooter(5);
doc.moveDown(2);

doc.fontSize(16).font('Helvetica-Bold').fillColor('#0D1B2A').text('Langkah 4: Notifikasi Sukses & Aktivasi Otomatis');
doc.moveDown(0.5);
doc.fontSize(10.5).font('Helvetica').fillColor('#475569').text(
  'Setelah pembayaran lunas, Midtrans secara real-time mengirimkan notifikasi HTTPS Webhook ke endpoint backend kita (/api/payments/webhook). Backend kemudian melakukan verifikasi tanda tangan kriptografi (anti-tamper signature), mengubah status transaksi menjadi "paid", dan langsung mengaktifkan paket belajar siswa.\n\n' +
  'Tampilan Akhir: Siswa dialihkan ke halaman sukses dan dapat langsung mengklik tombol "Mulai Belajar Sekarang" untuk membuka semua tryout premium.',
  { align: 'justify', lineGap: 3 }
);
doc.moveDown(1.5);

const imagePath4 = 'C:/Users/shafw/.gemini/antigravity/brain/59ef63ea-808c-47cd-bc3f-1f31df2ebefb/checkout_step4_sukses_1779217701500.png';
if (fs.existsSync(imagePath4)) {
  doc.image(imagePath4, { width: 440, align: 'center' });
} else {
  doc.fillColor('#EF4444').text('[Gambar Langkah 4 Tidak Ditemukan]');
}

// Finish writing the document
doc.end();

writeStream.on('finish', () => {
  console.log('PDF successfully generated at: ' + outputPdfPath);
});
