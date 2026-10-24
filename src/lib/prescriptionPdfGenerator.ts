import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAssetPath } from "./getAssetPath";
import { formatDbDateToUi, getTodayKolkataUiDate } from "./dateTimeUtils";

export interface GeneratePrescriptionPdfOptions {
  patient: {
    id: string;
    name: string;
    age?: number | string;
    gender?: string;
    phone?: string;
    medicalNotes?: string;
    allergies?: string;
    medicalConditions?: string;
    medicalHistory?: string[];
    medicalHistoryOthers?: string;
  };
  doctorName?: string;
  date?: string;
  diagnosis?: string;
  medicines: Array<{
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
    strength?: string;
  }>;
  advice?: string;
  parseDosageFn?: (dosageStr: string) => {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
    beforeMeals: boolean;
    afterMeals: boolean;
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

export async function generateAndDownloadPrescriptionPdf(options: GeneratePrescriptionPdfOptions): Promise<void> {
  const {
    patient,
    doctorName = "Dr. M. Durga Praveen",
    date = "",
    diagnosis = "",
    medicines = [],
    advice = "",
    parseDosageFn,
  } = options;

  // Custom dimensions 210mm x 280mm matches the authentic template's 768:1024 (3:4) aspect ratio perfectly
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [210, 280],
  });

  const templateUrl = getAssetPath("/vrprescription.jpg");
  try {
    const bgDataUrl = await getTemplateDataUrl(templateUrl);
    doc.addImage(bgDataUrl, "JPEG", 0, 0, 210, 280, undefined, "FAST");
  } catch (err) {
    console.error("Failed to load prescription template background image:", err);
  }

  const displayDate = date ? formatDbDateToUi(date) : getTodayKolkataUiDate();

  const ageSex = `${patient.age ? patient.age + " Yrs" : ""} ${patient.gender ? (patient.age ? "/ " : "") + patient.gender : ""}`.trim();

  // Resolve clean medical alert from patient allergies, notes, conditions, and history
  const getCleanMedicalAlert = (p: GeneratePrescriptionPdfOptions["patient"]): string => {
    const parts: string[] = [];
    const cleanVal = (val?: string) => {
      if (!val) return "";
      const trimmed = val.trim();
      const lower = trimmed.toLowerCase();
      if (lower === "none" || lower === "n/a" || lower === "-" || lower === "null" || lower === "undefined") {
        return "";
      }
      return trimmed;
    };

    const allergy = cleanVal(p.allergies);
    if (allergy) parts.push(allergy);

    const notes = cleanVal(p.medicalNotes);
    if (notes && !parts.includes(notes)) parts.push(notes);

    const cond = cleanVal(p.medicalConditions);
    if (cond && !parts.includes(cond)) parts.push(cond);

    if (Array.isArray(p.medicalHistory)) {
      p.medicalHistory.forEach((item) => {
        const cleanItem = cleanVal(item);
        if (cleanItem && !parts.includes(cleanItem)) {
          parts.push(cleanItem);
        }
      });
    }

    const others = cleanVal(p.medicalHistoryOthers);
    if (others && !parts.includes(others)) parts.push(others);

    return parts.join(", ");
  };

  const cleanMedAlert = getCleanMedicalAlert(patient);

  // 1. Overlay Patient Information (aligned with pre-printed dotted lines, enlarged font sizes)
  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(patient.name, 42.1, 62.0);

  // Date
  doc.setFontSize(12);
  doc.text(displayDate, 174.5, 62.0);

  // Age / Sex
  doc.setFontSize(12);
  doc.text(ageSex || "-", 42.1, 69.6);

  // Medical Alert
  if (cleanMedAlert) {
    doc.setTextColor(185, 28, 28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.text(cleanMedAlert, 42.1, 77.0);
  }

  // 2. Prescription Writing Area
  // Rx symbol
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42);
  doc.text("Rx", 10.5, 87.0);

  // Diagnosis note
  if (diagnosis && diagnosis.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Diagnosis: ", 25.0, 86.0);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(diagnosis.trim(), 46.0, 86.0);
  }

  let currentY = 89.0;

  // Medicines Table (Spans full available width 189mm, enlarged font sizes by 2-4px)
  if (medicines.length > 0) {
    const rows = medicines.map((med, idx) => {
      let timeStr = "-";
      let mealStr = "-";

      if (parseDosageFn) {
        const parsed = parseDosageFn(med.dosage);
        const times: string[] = [];
        if (parsed.morning) times.push("M");
        if (parsed.afternoon) times.push("A");
        if (parsed.night) times.push("N");
        timeStr = times.length > 0 ? times.join(" - ") : med.dosage || "-";

        if (parsed.beforeMeals) mealStr = "Before Food";
        else if (parsed.afterMeals) mealStr = "After Food";
      } else {
        timeStr = med.dosage || "-";
      }

      const medDisplayName = med.strength ? `${med.name} (${med.strength})` : med.name;

      return [
        (idx + 1).toString(),
        medDisplayName,
        timeStr,
        mealStr,
        med.duration || "-",
        med.instructions || "-",
      ];
    });

    autoTable(doc, {
      startY: 89.0,
      margin: { left: 10.5, right: 10.5 },
      head: [["#", "Medicine Name & Strength", "Dosage / Frequency", "Meal Timing", "Duration", "Special Instructions"]],
      body: rows,
      theme: "plain",
      styles: {
        textColor: [15, 23, 42],
        fontSize: 10,
        cellPadding: 2.4,
        font: "helvetica",
      },
      headStyles: {
        fontStyle: "bold",
        lineWidth: { bottom: 0.35 },
        lineColor: [51, 65, 85],
        textColor: [15, 23, 42],
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 54, fontStyle: "bold" },
        2: { cellWidth: 28 },
        3: { cellWidth: 28 },
        4: { cellWidth: 24 },
        5: { cellWidth: "auto" },
      },
    });

    currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 5 : 125;
  }

  // Doctor Advice / Follow-Up Instructions (Enlarged font sizes)
  if (advice && advice.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text("Doctor Advice & Follow-Up Instructions:", 10.5, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const splitAdvice = doc.splitTextToSize(advice.trim(), 189);
    doc.text(splitAdvice, 10.5, currentY + 4.5);
  }

  // Telugu Patient Instructions Card & Doctor Signature Block
  // Sits neatly in the lower portion above the pre-printed doctors horizontal line at y=208
  const instructionsUrl = getAssetPath("/templates/vr_telugu_post_op_instructions.png");
  const imgWidth = 73; // mm
  const imgHeight = 46; // mm (aspect ratio ~1.595)
  const imgX = 10.5; // aligns with left margin
  const imgY = Math.max(currentY + 4, 206 - imgHeight);

  try {
    const instructionsDataUrl = await getTemplateDataUrl(instructionsUrl);
    doc.addImage(instructionsDataUrl, "PNG", imgX, imgY, imgWidth, imgHeight, undefined, "FAST");
  } catch (err) {
    console.error("Failed to load Telugu post-op instructions image:", err);
  }

  // Doctor Signature Block (Right side of instructions card)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("* Please complete the prescribed course as directed.", 199.5, imgY + 22, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(doctorName || "Dr. M. Durga Praveen", 199.5, imgY + 38, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signature", 199.5, imgY + 43, { align: "right" });

  // Filename
  const safeName = (patient.name || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `Prescription_${safeName}_${displayDate.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  doc.save(filename);
}
