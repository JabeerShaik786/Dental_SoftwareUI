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
    medicalNotes?: string;
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

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const templateUrl = getAssetPath("/templates/vr_prescription_template.png");
  try {
    const bgDataUrl = await getTemplateDataUrl(templateUrl);
    doc.addImage(bgDataUrl, "PNG", 0, 0, 210, 297, undefined, "FAST");
  } catch (err) {
    console.error("Failed to load prescription template background image:", err);
  }

  const displayDate = date ? formatDbDateToUi(date) : getTodayKolkataUiDate();

  const ageSex = `${patient.age ? patient.age + " Yrs" : ""} ${patient.gender ? "/ " + patient.gender : ""}`.trim();

  const cleanMedAlert =
    patient.medicalNotes &&
    patient.medicalNotes !== "None" &&
    patient.medicalNotes !== "N/A" &&
    patient.medicalNotes.trim().length > 0
      ? patient.medicalNotes.trim()
      : "";

  // 1. Overlay Patient Information
  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(patient.name, 98, 70.5);

  // Date
  doc.setFontSize(9.5);
  doc.text(displayDate, 173, 70.5);

  // Age / Sex
  doc.setFontSize(9.5);
  doc.text(ageSex || "-", 104, 78.5);

  // Medical Alert
  if (cleanMedAlert) {
    doc.setTextColor(185, 28, 28);
    doc.setFont("helvetica", "bold");
    doc.text(cleanMedAlert, 109, 86.5);
  }

  // 2. Prescription Writing Area
  // Rx symbol
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("Rx", 87, 98);

  let currentY = 100;

  // Diagnosis note
  if (diagnosis && diagnosis.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Diagnosis: ", 102, 97);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(diagnosis.trim(), 118, 97);
  }

  // Medicines Table
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
      startY: 102,
      margin: { left: 87, right: 16 },
      head: [["#", "Medicine Name", "Dosage", "Meal", "Duration", "Instructions"]],
      body: rows,
      theme: "plain",
      styles: {
        textColor: [15, 23, 42],
        fontSize: 8,
        cellPadding: 1.8,
        font: "helvetica",
      },
      headStyles: {
        fontStyle: "bold",
        lineWidth: { bottom: 0.3 },
        lineColor: [51, 65, 85],
        textColor: [15, 23, 42],
      },
      columnStyles: {
        0: { cellWidth: 7, halign: "center" },
        1: { cellWidth: 35, fontStyle: "bold" },
        2: { cellWidth: 15 },
        3: { cellWidth: 17 },
        4: { cellWidth: 14 },
        5: { cellWidth: "auto" },
      },
    });

    currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : 140;
  }

  // Doctor Advice
  if (advice && advice.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("Doctor Advice / Instructions:", 87, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitAdvice = doc.splitTextToSize(advice.trim(), 105);
    doc.text(splitAdvice, 87, currentY + 4.5);
  }

  // Doctor Signature Block (Bottom right of writing area, above footer line)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("* Please complete the prescribed course as directed.", 87, 258);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(doctorName || "Dr. M. Durga Praveen", 194, 253, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Signature", 194, 257.5, { align: "right" });

  // Filename
  const safeName = (patient.name || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `Prescription_${safeName}_${displayDate.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
  doc.save(filename);
}
