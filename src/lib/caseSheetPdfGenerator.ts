import jsPDF from "jspdf";
import { getAssetPath } from "./getAssetPath";
import { formatDbDateToUi, getTodayKolkataUiDate } from "./dateTimeUtils";

export interface GenerateCaseSheetPdfOptions {
  patient: {
    id: string;
    name: string;
    age?: number | string;
    gender?: string;
    phone?: string;
    address?: string;
    email?: string;
    occupation?: string;
    reference?: string;
  };
  medicalHistoryConditions?: string[];
  medicalHistoryOthers?: string;
  currentMedications?: string;
  chiefComplaint?: string;
  intraOralExam?: string;
  provisionalDiagnosis?: string;
  treatmentAdvised?: string;
  visitDate?: string;
  doctorName?: string;
}

export const CASE_SHEET_PAGE1_TREATMENT_CAPACITY = 12;
export const CASE_SHEET_CONTINUATION_PAGE_CAPACITY = 36;

const generalConsentText =
  "I had given my consent for the diagnostic tests, Dental Treatment and Oral related disease treatment. I had given my consent for anesthesia. Doctor had explained me the problems and consequences of the diagnostic test and the treatment. I undersigned, declare that the information provided by me is true to the best of my knowledge and give consent for my dental treatment and also undertake to pay advance / deposit as & when required & agree that I will settle the bills as per the requirement of V.R. DENTAL CARE management.";

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

const clean = (val?: string) => {
  if (!val || val === "N/A" || val === "None" || val === "undefined" || val === "null") return "";
  return val;
};

const cleanTreatmentLine = (item: string) => {
  return item.replace(/^[•\-\*]\s*/, "").trim();
};

export async function generateAndDownloadCaseSheetPdf(options: GenerateCaseSheetPdfOptions): Promise<void> {
  const {
    patient,
    medicalHistoryConditions = [],
    medicalHistoryOthers = "",
    currentMedications = "",
    chiefComplaint = "",
    intraOralExam = "",
    provisionalDiagnosis = "",
    treatmentAdvised = "",
    visitDate = "",
  } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const templateUrl = getAssetPath("/vrcasesheet.jpeg");
  let bgDataUrl: string | null = null;
  try {
    bgDataUrl = await getTemplateDataUrl(templateUrl);
  } catch (err) {
    console.error("Failed to load case sheet template background image:", err);
  }

  const rawDate = visitDate ? (visitDate.includes(",") ? visitDate.split(",")[0].trim() : visitDate) : "";
  const displayDate = rawDate ? formatDbDateToUi(rawDate) : getTodayKolkataUiDate();
  const ageSex = `${patient.age ? patient.age + " Yrs" : ""} ${patient.gender || ""}`.trim();

  const medConditionsList = [
    "Diabetes",
    "B.P.",
    "Heart Complaint",
    "Allergies",
    "Bleeding Disorders",
    "Pregnancy",
    "Thyroid",
    "Others",
  ];

  const treatmentEntries = treatmentAdvised
    ? treatmentAdvised
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  const page1Entries = treatmentEntries.slice(0, CASE_SHEET_PAGE1_TREATMENT_CAPACITY);
  const overflowEntries = treatmentEntries.slice(CASE_SHEET_PAGE1_TREATMENT_CAPACITY);

  const continuationPages: string[][] = [];
  if (overflowEntries.length > 0) {
    for (let i = 0; i < overflowEntries.length; i += CASE_SHEET_CONTINUATION_PAGE_CAPACITY) {
      continuationPages.push(overflowEntries.slice(i, i + CASE_SHEET_CONTINUATION_PAGE_CAPACITY));
    }
  }

  // Helper to draw background image
  const drawBackground = () => {
    if (bgDataUrl) {
      doc.addImage(bgDataUrl, "JPEG", 0, 0, 210, 297, undefined, "FAST");
    }
  };

  // Helper to draw General Consent text
  const drawConsent = () => {
    // Crisp vector General Consent text inside the template's bordered General Consent box
    doc.setFillColor(255, 255, 255);
    doc.rect(9.5, 243.5, 191, 14.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(15, 23, 42);
    const splitText = doc.splitTextToSize(generalConsentText, 189);
    doc.text(splitText, 10.5, 246.5);
  };

  // =================== PAGE 1 ===================
  drawBackground();

  // 1. CASE SHEET SUB-HEADER
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 76, 129); // #0f4c81
  doc.text("CASE SHEET", 105, 41, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`OP No: ${patient.id}`, 198, 41, { align: "right" });

  doc.setDrawColor(15, 76, 129);
  doc.setLineWidth(0.5);
  doc.line(12, 43, 198, 43);

  // 2. PATIENT / CONTACT INFORMATION TABLE
  const tableX = 12;
  const tableY = 45;
  const tableW = 186;

  // Header banner
  doc.setFillColor(15, 76, 129);
  doc.rect(tableX, tableY, tableW, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("PATIENT / CONTACT INFORMATION", tableX + 3, tableY + 4);

  // Table border & cells
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, tableY + 5.5, tableW, 20, "F");
  doc.setDrawColor(15, 76, 129);
  doc.setLineWidth(0.3);
  doc.rect(tableX, tableY, tableW, 25.5, "S");

  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.2);

  // Row 1 (y: tableY + 5.5 to tableY + 12.2)
  doc.line(tableX, tableY + 12.2, tableX + tableW, tableY + 12.2);
  doc.line(tableX + 74.4, tableY + 5.5, tableX + 74.4, tableY + 12.2);
  doc.line(tableX + 130.2, tableY + 5.5, tableX + 130.2, tableY + 12.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Name: ", tableX + 2.5, tableY + 10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(clean(patient.name), tableX + 14, tableY + 10);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Age / Gender: ", tableX + 77, tableY + 10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(ageSex, tableX + 98, tableY + 10);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Date: ", tableX + 133, tableY + 10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(displayDate, tableX + 143, tableY + 10);

  // Row 2 (y: tableY + 12.2 to tableY + 18.9)
  doc.line(tableX, tableY + 18.9, tableX + tableW, tableY + 18.9);
  doc.line(tableX + 74.4, tableY + 12.2, tableX + 74.4, tableY + 18.9);
  doc.line(tableX + 130.2, tableY + 12.2, tableX + 130.2, tableY + 18.9);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Tel No.: ", tableX + 2.5, tableY + 16.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(clean(patient.phone), tableX + 16, tableY + 16.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Ref.: ", tableX + 77, tableY + 16.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(clean(patient.reference), tableX + 86, tableY + 16.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Occupation: ", tableX + 133, tableY + 16.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(clean(patient.occupation), tableX + 153, tableY + 16.5);

  // Row 3 (y: tableY + 18.9 to tableY + 25.5)
  doc.line(tableX + 130.2, tableY + 18.9, tableX + 130.2, tableY + 25.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Address: ", tableX + 2.5, tableY + 23.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(clean(patient.address), tableX + 18, tableY + 23.5);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Email: ", tableX + 133, tableY + 23.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(clean(patient.email), tableX + 144, tableY + 23.5);

  // 3. MEDICAL HISTORY CHECKBOXES
  const medY = tableY + 28;
  doc.setFillColor(15, 76, 129);
  doc.rect(tableX, medY, tableW, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("MEDICAL HISTORY", tableX + 3, medY + 4);

  const medBoxH = 22;
  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, medY + 5.5, tableW, medBoxH, "F");
  doc.setDrawColor(15, 76, 129);
  doc.setLineWidth(0.3);
  doc.rect(tableX, medY, tableW, 5.5 + medBoxH, "S");

  // Grid 4x2 for conditions
  const colW = tableW / 4;
  medConditionsList.forEach((cond, idx) => {
    const colIdx = idx % 4;
    const rowIdx = Math.floor(idx / 4);
    const cx = tableX + 3 + colIdx * colW;
    const cy = medY + 7.5 + rowIdx * 6;

    const isChecked = medicalHistoryConditions.includes(cond);

    // Box
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.2);
    doc.rect(cx, cy, 3.5, 3.5, "S");

    if (isChecked) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 76, 129);
      doc.text("✓", cx + 0.8, cy + 2.8);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    let label = cond;
    if (cond === "Others" && clean(medicalHistoryOthers)) {
      label = `Others (${clean(medicalHistoryOthers)})`;
    }
    doc.text(label, cx + 5, cy + 2.8);
  });

  // Medications line
  doc.setDrawColor(226, 232, 240);
  doc.line(tableX + 2, medY + 21, tableX + tableW - 2, medY + 21);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("Medications if any:", tableX + 3, medY + 25);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(clean(currentMedications) || "None", tableX + 31, medY + 25);

  // 4. CLINICAL CASE DETAILS
  const clinY = medY + 36;
  const clinH = 143; // Remaining available height before General Consent at y=243.5

  doc.setFillColor(15, 76, 129);
  doc.rect(tableX, clinY, tableW, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("CLINICAL CASE DETAILS", tableX + 3, clinY + 4);

  doc.setFillColor(255, 255, 255);
  doc.rect(tableX, clinY + 5.5, tableW, clinH - 5.5, "F");
  doc.setDrawColor(15, 76, 129);
  doc.setLineWidth(0.3);
  doc.rect(tableX, clinY, tableW, clinH, "S");

  // 1. Chief Complaint & Past Dental History
  let cyPos = clinY + 6.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("1. CHIEF COMPLAINT & PAST DENTAL HISTORY", tableX + 3, cyPos + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(clean(chiefComplaint) || "No chief complaint recorded.", tableX + 3, cyPos + 8);
  cyPos += 12;
  doc.setDrawColor(203, 213, 225);
  doc.line(tableX, cyPos, tableX + tableW, cyPos);

  // 2. Intra Oral Examination
  cyPos += 1.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("2. INTRA ORAL EXAMINATION", tableX + 3, cyPos + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const examSplit = doc.splitTextToSize(clean(intraOralExam) || "No examination notes recorded.", tableW - 6);
  doc.text(examSplit.slice(0, 3), tableX + 3, cyPos + 8);
  cyPos += 20;
  doc.setDrawColor(203, 213, 225);
  doc.line(tableX, cyPos, tableX + tableW, cyPos);

  // 3. Provisional Diagnosis
  cyPos += 1.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("3. PROVISIONAL DIAGNOSIS", tableX + 3, cyPos + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const diagSplit = doc.splitTextToSize(clean(provisionalDiagnosis) || "No provisional diagnosis recorded.", tableW - 6);
  doc.text(diagSplit.slice(0, 3), tableX + 3, cyPos + 8);
  cyPos += 20;
  doc.setDrawColor(203, 213, 225);
  doc.line(tableX, cyPos, tableX + tableW, cyPos);

  // 4. Treatment Advised (Two-Column Balanced Layout)
  cyPos += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("4. TREATMENT ADVISED", tableX + 3, cyPos + 3);
  cyPos += 7;

  const page1Mid = Math.ceil(page1Entries.length / 2);
  const col1 = page1Entries.slice(0, page1Mid);
  const col2 = page1Entries.slice(page1Mid);

  const tCol1X = tableX + 3;
  const tCol2X = tableX + tableW / 2 + 2;
  const colWidth = tableW / 2 - 5;

  let leftY = cyPos;
  col1.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 76, 129);
    doc.text("•", tCol1X, leftY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const cleaned = cleanTreatmentLine(item);
    const lines = doc.splitTextToSize(cleaned, colWidth - 4);
    doc.text(lines[0], tCol1X + 3.5, leftY);
    leftY += 6.5;
  });

  let rightY = cyPos;
  col2.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 76, 129);
    doc.text("•", tCol2X, rightY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const cleaned = cleanTreatmentLine(item);
    const lines = doc.splitTextToSize(cleaned, colWidth - 4);
    doc.text(lines[0], tCol2X + 3.5, rightY);
    rightY += 6.5;
  });

  if (page1Entries.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text("No treatment advised recorded.", tCol1X, cyPos);
  }

  // Draw consent on Page 1
  drawConsent();

  // =================== CONTINUATION PAGES ===================
  continuationPages.forEach((pageItems, pageIdx) => {
    doc.addPage();
    drawBackground();

    const pageNumSuffix = continuationPages.length > 1 ? ` (PAGE ${pageIdx + 2})` : "";

    // Sub-header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 76, 129);
    doc.text(`CASE SHEET (CONTINUATION${pageNumSuffix})`, 105, 41, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`OP No: ${patient.id}`, 198, 41, { align: "right" });

    doc.setDrawColor(15, 76, 129);
    doc.setLineWidth(0.5);
    doc.line(12, 43, 198, 43);

    // Patient reference strip
    doc.setFillColor(255, 255, 255);
    doc.rect(tableX, 46, tableW, 8, "F");
    doc.setDrawColor(15, 76, 129);
    doc.setLineWidth(0.3);
    doc.rect(tableX, 46, tableW, 8, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text("Patient: ", tableX + 3, 51.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(clean(patient.name), tableX + 17, 51.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("Age / Gender: ", tableX + 75, 51.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(ageSex, tableX + 97, 51.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("Date: ", tableX + 140, 51.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(displayDate, tableX + 150, 51.5);

    // Overflow treatment block
    const contY = 57;
    const contH = 175;
    doc.setFillColor(15, 76, 129);
    doc.rect(tableX, contY, tableW, 5.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("4. TREATMENT ADVISED (CONTINUED)", tableX + 3, contY + 4);

    doc.setFillColor(255, 255, 255);
    doc.rect(tableX, contY + 5.5, tableW, contH - 5.5, "F");
    doc.setDrawColor(15, 76, 129);
    doc.setLineWidth(0.3);
    doc.rect(tableX, contY, tableW, contH, "S");

    const cMid = Math.ceil(pageItems.length / 2);
    const cCol1 = pageItems.slice(0, cMid);
    const cCol2 = pageItems.slice(cMid);

    let cLeftY = contY + 11;
    cCol1.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 76, 129);
      doc.text("•", tCol1X, cLeftY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const cleaned = cleanTreatmentLine(item);
      const lines = doc.splitTextToSize(cleaned, colWidth - 4);
      doc.text(lines[0], tCol1X + 3.5, cLeftY);
      cLeftY += 7;
    });

    let cRightY = contY + 11;
    cCol2.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 76, 129);
      doc.text("•", tCol2X, cRightY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const cleaned = cleanTreatmentLine(item);
      const lines = doc.splitTextToSize(cleaned, colWidth - 4);
      doc.text(lines[0], tCol2X + 3.5, cRightY);
      cRightY += 7;
    });

    drawConsent();
  });

  // Save PDF
  const safeName = (patient.name || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `CaseSheet_${patient.id}_${safeName}.pdf`;
  doc.save(filename);
}
