# PowerShell Script for QA/QC Verification Pipeline
# Runs TypeScript Compiler check, ESLint checks, and Vitest tests sequentially.

$ErrorActionPreference = "Stop"

Write-Host "=== Memulai Alur QA/QC & Verifikasi Proyek ===" -ForegroundColor Cyan

Write-Host "`n[1/3] Menjalankan pemeriksaan tipe static TypeScript..." -ForegroundColor Yellow
cmd.exe /c "npx tsc --noEmit"
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript check GAGAL! Periksa kembali type declaration Anda."
    exit 1
}
Write-Host "TypeScript check SUKSES!" -ForegroundColor Green

Write-Host "`n[2/3] Menjalankan ESLint..." -ForegroundColor Yellow
cmd.exe /c "npm run lint"
if ($LASTEXITCODE -ne 0) {
    Write-Error "ESLint check GAGAL! Periksa warning/error penulisan kode Anda."
    exit 1
}
Write-Host "ESLint check SUKSES!" -ForegroundColor Green

Write-Host "`n[3/3] Menjalankan Unit/Integration Tests..." -ForegroundColor Yellow
cmd.exe /c "npm run test"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Unit testing GAGAL! Ada test yang tidak lolos."
    exit 1
}
Write-Host "Unit testing SUKSES!" -ForegroundColor Green

Write-Host "`n=== QA/QC SELESAI: PROYEK AMAN DAN LOLOS VERIFIKASI ===" -ForegroundColor Green
exit 0
