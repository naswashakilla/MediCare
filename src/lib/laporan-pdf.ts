import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SITE_NAME } from "@/lib/constants";
import { tanggal } from "@/lib/jadwal";
import { ringkas, type BarisLaporan, type FilterLaporan } from "@/lib/laporan";

export function buatPdf(rows: BarisLaporan[], f: FilterLaporan, poliLabel: string, terpotong: boolean): ArrayBuffer {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const lebar = doc.internal.pageSize.getWidth();
  const r = ringkas(rows);

  doc.setFontSize(15).setFont("helvetica", "bold").text(`Laporan Pendaftaran Pasien - ${SITE_NAME}`, 14, 16);
  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text(`Periode kunjungan : ${tanggal(f.dari)} s/d ${tanggal(f.sampai)}`, 14, 23);
  doc.text(`Poli : ${poliLabel}    Status : ${f.status ?? "Semua"}`, 14, 28);
  doc.text(
    `Total ${r.total} pendaftaran  |  ` + Object.entries(r.perStatus).map(([s, n]) => `${s}: ${n}`).join(", "),
    14,
    33
  );
  if (terpotong) doc.setTextColor(180, 0, 0).text("Catatan: data dipotong pada batas maksimum baris laporan.", 14, 38).setTextColor(0);

  autoTable(doc, {
    startY: terpotong ? 42 : 37,
    head: [["No", "Tgl Kunjungan", "Pasien", "NIK", "Dokter", "Poli", "Keluhan", "Status"]],
    body: rows.map((x, i) => [
      i + 1,
      x.tgl_kunjungan,
      x.pasien.nama_pasien,
      x.pasien.nik ?? "-",
      x.dokter.nama_dokter,
      x.dokter.poli?.nama_poli ?? "-",
      x.keluhan ?? "-",
      x.status,
    ]),
    styles: { fontSize: 8, cellPadding: 1.8 },
    headStyles: { fillColor: [13, 148, 136] },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 24 }, 3: { cellWidth: 34 }, 7: { cellWidth: 24 } },
    didDrawPage: () => {
      const hal = doc.getNumberOfPages();
      doc.setFontSize(8).setTextColor(120);
      doc.text(`Dicetak: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`, 14, doc.internal.pageSize.getHeight() - 6);
      doc.text(`Halaman ${hal}`, lebar - 14, doc.internal.pageSize.getHeight() - 6, { align: "right" });
      doc.setTextColor(0);
    },
  });

  return doc.output("arraybuffer");
}
