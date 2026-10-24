import React from "react";
import { getAssetPath } from "@/lib/getAssetPath";
import { formatDbDateToUi, getTodayKolkataUiDate } from "@/lib/dateTimeUtils";

export interface InvoiceLineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
}

export interface VRDentalInvoicePrintData {
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
    items?: InvoiceLineItem[];
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
  className?: string;
}

export const VRDentalInvoicePrintTemplate: React.FC<VRDentalInvoicePrintData> = ({
  patient,
  invoice,
  className = "",
}) => {
  // Authentic V.R. Dental Care Letterhead Template Image
  const letterheadUrl = getAssetPath("/vr_letterhead.png");

  // Format date display
  const displayDate = invoice.paymentDate
    ? formatDbDateToUi(invoice.paymentDate)
    : getTodayKolkataUiDate();

  // Patient Details
  const patientName = patient?.name || invoice.patientName || "Valued Patient";
  const patientId = patient?.patient_id || patient?.id || invoice.patientId || "-";
  const ageGenderStr = `${patient?.age ? patient.age + " Yrs" : ""} ${patient?.gender ? (patient.age ? "/ " : "") + patient.gender : ""}`.trim() || "-";

  // Items List
  const items: InvoiceLineItem[] =
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

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* A4 INVOICE CONTAINER (210mm x 297mm) */}
      <div className="a4-print-page relative w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden shadow-md print:shadow-none mx-auto select-none">
        {/* Authentic Pre-Printed Letterhead Background Image (Header Logo & Deep Blue Footer) */}
        <img
          src={letterheadUrl}
          alt="V.R Dental Care Official Letterhead"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        />

        {/* OVERLAID DYNAMIC INVOICE CONTENT (Strictly aligned to Sameeksha document reference) */}
        <div
          className="absolute z-10 flex flex-col justify-between"
          style={{
            left: "9.0%",
            right: "9.0%",
            top: "14.2%",
            bottom: "8.5%",
          }}
        >
          {/* MAIN DOCUMENT BODY */}
          <div className="space-y-5">
            {/* 1. CENTERED INVOICE HEADING (Matching Sameeksha reference, no badge, no status) */}
            <div className="text-center pt-1 pb-1">
              <span className="text-[17px] font-black uppercase tracking-wider text-slate-950 border-b-[1.5px] border-slate-950 pb-0.5 px-2 inline-block">
                INVOICE
              </span>
            </div>

            {/* 2. PATIENT INFORMATION (Clean aligned document style with underlines, no boxes) */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-[13px] text-slate-900 pt-1">
              {/* Left Column */}
              <div className="space-y-3">
                {/* Patient Name */}
                <div className="flex items-baseline">
                  <span className="w-28 font-medium text-slate-800 shrink-0">Patient name :</span>
                  <div className="flex-1 border-b border-slate-600 font-bold text-slate-950 pb-0.5 px-1 min-h-[22px]">
                    {patientName}
                  </div>
                </div>

                {/* Age / Sex */}
                <div className="flex items-baseline">
                  <span className="w-28 font-medium text-slate-800 shrink-0">Age/Sex :</span>
                  <div className="flex-1 border-b border-slate-600 font-semibold text-slate-900 pb-0.5 px-1 min-h-[22px]">
                    {ageGenderStr}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                {/* OP No. */}
                <div className="flex items-baseline">
                  <span className="w-20 font-medium text-slate-800 shrink-0">OP No. :</span>
                  <div className="flex-1 border-b border-slate-600 font-bold text-slate-950 pb-0.5 px-1 min-h-[22px]">
                    {patientId}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-baseline">
                  <span className="w-20 font-medium text-slate-800 shrink-0">Date :</span>
                  <div className="flex-1 border-b border-slate-600 font-semibold text-slate-900 pb-0.5 px-1 min-h-[22px]">
                    {displayDate}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TREATMENT DETAILS (Numbered entries, right-aligned amount, clean horizontal divider) */}
            <div className="pt-5">
              <div className="space-y-3.5 min-h-[70px]">
                {items.map((item, idx) => {
                  const lineAmount =
                    Number(item.amount) ||
                    ((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0));

                  return (
                    <div key={idx} className="flex justify-between items-baseline text-[14px]">
                      <span className="font-bold text-slate-950">
                        {idx + 1}.&nbsp;&nbsp;{item.description}
                      </span>
                      <span className="font-bold text-slate-950 tabular-nums">
                        Rs. {lineAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Horizontal line divider directly beneath treatment list */}
              <div className="border-b-[1.5px] border-slate-800 my-4" />
            </div>

            {/* 4. TOTALS SECTION (Right-aligned, prominent Total and Amount Paid) */}
            <div className="flex justify-end pt-1">
              <div className="w-72 space-y-1.5 text-right">
                {discountAmount > 0 && (
                  <>
                    <div className="flex justify-between text-[13px] text-slate-700 font-medium">
                      <span>Subtotal :</span>
                      <span>Rs. {subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[13px] text-rose-700 font-semibold">
                      <span>Discount {invoice.discountType === "percentage" ? `(${invoice.discountValue ?? invoice.discount}%)` : ""} :</span>
                      <span>-Rs. {discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}

                {/* Total / Total Payable: Prominent bold text */}
                <div className="flex justify-between items-baseline text-[16px] font-black text-slate-950 pt-0.5">
                  <span>Total :</span>
                  <span className="tabular-nums">
                    Rs. {total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Amount Paid */}
                <div className="flex justify-between text-[13px] text-slate-800 font-semibold">
                  <span>Amount Paid :</span>
                  <span className="tabular-nums">
                    Rs. {paid.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. BOTTOM SECTION: Signatory and Disclaimer (Strictly above bottom blue letterhead banner) */}
          <div className="pt-2 flex justify-between items-end pb-1">
            <div className="text-[11px] text-slate-500 italic max-w-[320px] leading-relaxed">
              <p>Thank you for choosing V.R. Dental Care!</p>
              <p>Computer generated invoice. Retain for warranty & records.</p>
            </div>

            <div className="text-right">
              <div className="w-36 border-b border-slate-400 mb-1 ml-auto" />
              <p className="text-[12px] font-bold text-slate-900">
                {invoice.doctor || "Dr. M. Durga Praveen"}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
