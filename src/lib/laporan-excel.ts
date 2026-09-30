import ExcelJS from "exceljs";
import { SITE_NAME } from "@/lib/constants";
import { ringkas, type BarisLaporan, type FilterLaporan } from "@/lib/laporan";

const HEADER = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF0D9488" } };

export async function buatExcel(rows: BarisLaporan[], f: FilterLaporan, poliLabel: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = SITE_NAME;
  const ws = wb.addWorksheet("Pendaftaran");

  ws.addRow([`Laporan Pendaftaran Pasien - ${SITE_NAME}`]).font = { bold: true, size: 14 };
  ws.addRow([`Periode kunjungan: ${f.dari} s/d ${f.sampai}  |  Poli: ${poliLabel}  |  Status: ${f.status ?? "Semua"}`]);
  ws.addRow([]);

  const head = ws.addRow(["No", "Tgl Kunjungan", "Tgl Daftar", "Pasien", "NIK", "Dokter", "Poli", "Keluhan", "Status"]);
  head.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = HEADER;
  });

  rows.forEach((x, i) =>
    ws.addRow([
      i + 1,
      x.tgl_kunjungan,
      new Date(x.tgl_daftar).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      x.pasien.nama_pasien,
      x.pasien.nik ?? "",
      x.dokter.nama_dokter,
      x.dokter.poli?.nama_poli ?? "",
      x.keluhan ?? "",
      x.status,
    ])
  );
  // NIK sebagai teks agar 16 digit tidak berubah jadi notasi ilmiah.
  ws.getColumn(5).numFmt = "@";
  [6, 14, 20, 24, 20, 20, 20, 36, 14].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.views = [{ state: "frozen", ySplit: 4 }];

  const r = ringkas(rows);
  const rs = wb.addWorksheet("Ringkasan");
  rs.addRow(["Ringkasan"]).font = { bold: true, size: 14 };
  rs.addRow([]);
  rs.addRow(["Total pendaftaran", r.total]);
  rs.addRow([]);
  rs.addRow(["Per status", "Jumlah"]).font = { bold: true };
  Object.entries(r.perStatus).forEach(([k, v]) => rs.addRow([k, v]));
  rs.addRow([]);
  rs.addRow(["Per poli", "Jumlah"]).font = { bold: true };
  Object.entries(r.perPoli).forEach(([k, v]) => rs.addRow([k, v]));
  rs.getColumn(1).width = 26;

  return Buffer.from(await wb.xlsx.writeBuffer());
}
