export function sendCredentialEmail(to: string, password: string): void {
  console.log("==========================================");
  console.log("[MOCK EMAIL] Pengiriman kredensial akun (SMTP belum terintegrasi)");
  console.log(`Kepada     : ${to}`);
  console.log("Subjek     : Kredensial akun Beasiswa Pelatihan");
  console.log(`Isi        : Password sementara akun kamu adalah ${password}`);
  console.log("           Silakan ganti password setelah login.");
  console.log("==========================================");
}