import jsPDF from "jspdf";
import { getAssetPath } from "./getAssetPath";
import { formatDbDateToUi, getTodayKolkataUiDate } from "./dateTimeUtils";

export interface GenerateInvoicePdfOptions {
  patient?: {
    id?: string;
    patient_id?: string;
    name?: string;
    age?: number | string;
    gender?: string;
    phone?: string;
  } | null;
  invoice: {
    id: string;
    patientId?: string;
    patientName?: string;
    doctor?: string;
    treatment?: string;
    items?: Array<{
      description: string;
      quantity?: number;
      unitPrice?: number;
      amount: number;
    }>;
    subtotal: number;
    discount?: number;
    discountType?: "percentage" | "fixed";
    discountValue?: number;
    tax?: number;
    total: number;
    paidAmount: number;
    status: string;
    paymentDate?: string;
    paymentLogs?: { method: string; amount: number; date: string }[];
  };
}

// Convert image url to base64 Data URL
async function getTemplateDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateAndDownloadInvoicePdf(options: GenerateInvoicePdfOptions): Promise<void> {
  const { patient, invoice } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const templateUrl = getAssetPath("/vr_letterhead.png");
  try {
    const bgDataUrl = await getTemplateDataUrl(templateUrl);
    // Background fills A4 sheet edge-to-edge
    doc.addImage(bgDataUrl, "PNG", 0, 0, 210, 297, undefined, "FAST");
  } catch (err) {
    console.error("Failed to load invoice template background image:", err);
  }

  const displayDate = invoice.paymentDate
    ? formatDbDateToUi(invoice.paymentDate)
    : getTodayKolkataUiDate();

  const patientName = patient?.name || invoice.patientName || "Valued Patient";
  const patientId = patient?.patient_id || patient?.id || invoice.patientId || "-";
  const ageGenderStr = `${patient?.age ? patient.age + " Yrs" : ""} ${patient?.gender ? (patient.age ? "/ " : "") + patient.gender : ""}`.trim() || "-";

  // Treatment Items
  const items =
    Array.isArray(invoice.items) && invoice.items.length > 0
      ? invoice.items
      : [
          {
            description: invoice.treatment || "Dental Procedure / Consultation",
            quantity: 1,
            unitPrice: invoice.subtotal || invoice.total,
            amount: invoice.subtotal || invoice.total,
          },
        ];

  // Calculations
  const subtotal = invoice.subtotal || items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const discountAmount =
    invoice.discountType === "percentage"
      ? (subtotal * (Number(invoice.discountValue ?? invoice.discount) || 0)) / 100
      : Number(invoice.discountValue ?? invoice.discount) || 0;

  const total = invoice.total ?? Math.max(0, subtotal - discountAmount);
  const paid = Number(invoice.paidAmount) || 0;
  const balance = Math.max(0, total - paid);

  // 1. CENTERED INVOICE TITLE (Matching Sameeksha reference, no status badge, no extra badges)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("INVOICE", 105, 46, { align: "center" });

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(97, 47.5, 113, 47.5);

  // 2. PATIENT INFORMATION (Clean aligned document style with underlines, no boxes)
  // Left Column
  // Line 1: Patient name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Patient name :", 20, 56);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(patientName, 48, 56);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(47, 57.5, 105, 57.5);

  // Line 2: Age/Sex
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Age/Sex :", 20, 65);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(ageGenderStr, 48, 65);
  doc.line(47, 66.5, 105, 66.5);

  // Right Column
  // Line 1: OP No.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("OP No. :", 118, 56);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(patientId, 138, 56);
  doc.line(137, 57.5, 190, 57.5);

  // Line 2: Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Date :", 118, 65);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(displayDate, 138, 65);
  doc.line(137, 66.5, 190, 66.5);

  // 3. TREATMENT DETAILS (Numbered entries, right-aligned amount, clean divider line)
  let itemY = 78;
  items.forEach((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || ((Number(item.amount) || 0) / qty);
    const amt = Number(item.amount) || (qty * unitPrice);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}.  ${item.description}`, 20, itemY);

    const amtStr = `Rs. ${amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.text(amtStr, 190, itemY, { align: "right" });

    itemY += 7.5;
  });

  // Horizontal divider line beneath treatment list
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.4);
  doc.line(20, itemY + 2, 190, itemY + 2);

  // 4. TOTALS SECTION (Right-aligned beneath divider)
  let totY = itemY + 9;

  if (discountAmount > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Subtotal :", 145, totY);
    doc.text(`Rs. ${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, totY, { align: "right" });
    totY += 5.5;

    doc.setTextColor(190, 18, 60);
    const discLabel = invoice.discountType === "percentage" ? `Discount (${invoice.discountValue ?? invoice.discount}%) :` : "Discount :";
    doc.text(discLabel, 145, totY);
    doc.text(`-Rs. ${discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, totY, { align: "right" });
    totY += 5.5;
  }

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Total :", 142, totY);
  doc.text(`Rs. ${total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, totY, { align: "right" });
  totY += 6;

  // Amount Paid
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("Amount Paid :", 142, totY);
  doc.text(`Rs. ${paid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, totY, { align: "right" });

  // 5. SIGNATORY & FOOTER (Strictly above bottom blue letterhead banner at y=276)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Computer generated invoice. Retain for warranty & records.", 20, 269);

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(152, 264, 190, 264);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.doctor || "Dr. M. Durga Praveen", 190, 268, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signatory", 190, 271.5, { align: "right" });

  // Save PDF
  const safeName = (patientName || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `Invoice_${invoice.id}_${safeName}.pdf`;
  doc.save(filename);
}
