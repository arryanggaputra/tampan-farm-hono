import { jsPDF } from "jspdf";
import type { Sale } from "../../src/types";
import { formatRupiah, formatDate } from "./utils";

export function generateReceipt(
  sale: Sale & { livestock_weight_kg?: number | null }
) {
  const doc = new jsPDF({ format: "a5", unit: "mm" });
  const W = 148;
  let y = 15;

  // Header
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 0, W, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Peternak Tampan", W / 2, 13, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Peternakan Kambing & Domba Premium", W / 2, 20, {
    align: "center",
  });
  doc.text("Hubungi: arry@peternaktampan.com", W / 2, 26, { align: "center" });

  y = 40;
  doc.setTextColor(0, 0, 0);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("KWITANSI PENJUALAN", W / 2, y, { align: "center" });
  y += 5;
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.5);
  doc.line(15, y, W - 15, y);
  y += 8;

  // Meta info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const receiptNo = `TF-${sale.id.slice(0, 8).toUpperCase()}`;
  doc.text(`No. Kwitansi : ${receiptNo}`, 15, y);
  doc.text(`Tanggal      : ${formatDate(sale.sale_date)}`, 15, y + 6);
  if (sale.delivery_date) {
    doc.text(`Tgl. Kirim   : ${formatDate(sale.delivery_date)}`, 15, y + 12);
    y += 12;
  } else {
    y += 6;
  }
  y += 10;

  // Buyer
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Telah diterima dari:", 15, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(sale.buyer_name, 15, y);
  y += 10;

  // Item section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Detail Hewan:", 15, y);
  y += 6;

  doc.setFillColor(240, 253, 244);
  doc.rect(15, y - 4, W - 30, 20, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const animalName = sale.livestock_name
    ? `${sale.livestock_name} (${sale.livestock_type})`
    : sale.livestock_type;
  doc.text(`Hewan   : ${animalName}`, 18, y + 2);
  if (sale.livestock_weight_kg) {
    doc.text(`Berat   : ${sale.livestock_weight_kg} kg`, 18, y + 8);
  }
  y += 24;

  // Payment
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, W - 15, y);
  y += 8;

  doc.setFontSize(10);
  const col2 = W - 15;
  doc.text("Harga Jual:", 15, y);
  doc.setFont("helvetica", "bold");
  doc.text(formatRupiah(sale.selling_price), col2, y, { align: "right" });

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text("Sudah Dibayar:", 15, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74);
  doc.text(formatRupiah(sale.amount_paid), col2, y, { align: "right" });

  const sisa = sale.selling_price - sale.amount_paid;
  if (sisa > 0) {
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Sisa Pembayaran:", 15, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(formatRupiah(sisa), col2, y, { align: "right" });
  }

  y += 4;
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1);
  doc.line(15, y, W - 15, y);
  y += 8;

  // Payment status badge
  const statusLabel =
    sale.payment_status === "lunas" ? "LUNAS" : "DP / BELUM LUNAS";
  const statusColor: [number, number, number] =
    sale.payment_status === "lunas" ? [22, 163, 74] : [245, 158, 11];
  doc.setFillColor(...statusColor);
  doc.roundedRect(W / 2 - 25, y - 5, 50, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(statusLabel, W / 2, y + 1.5, { align: "center" });
  y += 18;

  // Signature
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Hormat kami,", W - 15 - 30, y, { align: "center" });
  y += 5;

  // Add logo
  const logoWidth = 20;
  const logoHeight = 20;
  const logoX = W - 15 - 30 - logoWidth / 2;
  doc.addImage("/logo.png", "PNG", logoX, y, logoWidth, logoHeight);
  y += logoHeight + 5;

  doc.line(W - 15 - 50, y, W - 15, y);
  y += 5;

  // Footer
  y += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, W - 15, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Terima kasih atas kepercayaan Anda kepada Peternak Tampan.",
    W / 2,
    y,
    {
      align: "center",
    }
  );
  doc.text("Semoga hewan yang dibeli membawa keberkahan.", W / 2, y + 5, {
    align: "center",
  });

  const fileName = `kwitansi-${sale.buyer_name.replace(/\s+/g, "-")}-${
    sale.sale_date
  }.pdf`;
  doc.save(fileName);
}
