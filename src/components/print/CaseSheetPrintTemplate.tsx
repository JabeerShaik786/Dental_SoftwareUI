import React from "react";
import { getAssetPath } from "@/lib/getAssetPath";
import { formatDbDateToUi, getTodayKolkataUiDate } from "@/lib/dateTimeUtils";

export interface CaseSheetPrintData {
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
  includeBackPage?: boolean;
}

export const CASE_SHEET_PAGE1_TREATMENT_CAPACITY = 12;
export const CASE_SHEET_CONTINUATION_PAGE_CAPACITY = 36;

export function getCaseSheetTotalPages(
  treatmentAdvised: string | undefined | null,
  includeBackPage: boolean = false
): number {
  const entries = treatmentAdvised
    ? treatmentAdvised
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];
  const overflowCount = Math.max(0, entries.length - CASE_SHEET_PAGE1_TREATMENT_CAPACITY);
  const continuationPages = overflowCount > 0
    ? Math.ceil(overflowCount / CASE_SHEET_CONTINUATION_PAGE_CAPACITY)
    : 0;
  return 1 + continuationPages + (includeBackPage ? 1 : 0);
}

export const CaseSheetPrintTemplate: React.FC<CaseSheetPrintData> = ({
  patient,
  medicalHistoryConditions = [],
  medicalHistoryOthers = "",
  currentMedications = "",
  chiefComplaint = "",
  intraOralExam = "",
  provisionalDiagnosis = "",
  treatmentAdvised = "",
  visitDate = "",
  includeBackPage = false,
}) => {
  // Official V.R. Dental Care template image with authentic header, logo, watermark, General Consent, signature line, and footer
  const templateUrl = getAssetPath("/vrcasesheet.jpeg");
  const backPageUrl = getAssetPath("/templates/vr_post_op_instructions.jpg");

  // Format consultation date cleanly in Asia/Kolkata (displayed in the top Patient Information section)
  const rawDate = visitDate ? (visitDate.includes(",") ? visitDate.split(",")[0].trim() : visitDate) : "";
  const displayDate = rawDate ? formatDbDateToUi(rawDate) : getTodayKolkataUiDate();

  const ageSex = `${patient.age ? patient.age + " Yrs" : ""} ${patient.gender || ""}`.trim();

  // Suppress placeholder values such as "N/A" or "None"
  const clean = (val?: string) => {
    if (!val || val === "N/A" || val === "None" || val === "undefined" || val === "null") return "";
    return val;
  };

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

  // Clean redundant leading bullet/dash marks from user input
  const cleanTreatmentLine = (item: string) => {
    return item.replace(/^[•\-\*]\s*/, "").trim();
  };

  // Parse treatment advised entries line-by-line
  const treatmentEntries = treatmentAdvised
    ? treatmentAdvised
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  // Page 1 holds up to 12 treatments in a balanced 2-column layout (up to 6 per column)
  const page1Entries = treatmentEntries.slice(0, CASE_SHEET_PAGE1_TREATMENT_CAPACITY);
  const overflowEntries = treatmentEntries.slice(CASE_SHEET_PAGE1_TREATMENT_CAPACITY);

  // Balanced distribution across Column 1 and Column 2:
  // Math.ceil ensures that if there are an odd number of items, Column 1 has one more
  const page1Mid = Math.ceil(page1Entries.length / 2);
  const col1Entries = page1Entries.slice(0, page1Mid);
  const col2Entries = page1Entries.slice(page1Mid);

  // Dynamic layout & density classes to preserve font styling and spacing while preventing overflow
  const p1Count = page1Entries.length;
  const isCompact = p1Count > 8; // 9-12 items (5-6 per column)
  const isMedium = p1Count > 6 && p1Count <= 8; // 7-8 items (4 per column)
  // <= 6 items is standard spacious layout (1-3 per column)

  const containerPaddingClass = isCompact ? "px-2.5 py-1.5" : isMedium ? "px-2.5 py-2" : "p-2.5";
  const listSpacingClass = isCompact ? "space-y-1" : isMedium ? "space-y-1" : "space-y-1.5";
  const itemTextClass = isCompact
    ? "text-[11px] leading-[15px]"
    : isMedium
    ? "text-[11.5px] leading-snug"
    : "text-[12px] leading-snug";
  const bulletTextClass = isCompact
    ? "text-[11.5px]"
    : isMedium
    ? "text-[12.5px]"
    : "text-[13px]";

  // Chunk overflow entries into continuation pages
  const continuationPages: string[][] = [];
  if (overflowEntries.length > 0) {
    for (let i = 0; i < overflowEntries.length; i += CASE_SHEET_CONTINUATION_PAGE_CAPACITY) {
      continuationPages.push(overflowEntries.slice(i, i + CASE_SHEET_CONTINUATION_PAGE_CAPACITY));
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* PAGE 1: OFFICIAL V.R. DENTAL CARE CASE SHEET */}
      <div className="relative w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden shadow-md print:shadow-none">
        {/* Authentic Fixed Background Template Image (Header, Watermark, General Consent, Signature Line & Address Footer) */}
        <img
          src={templateUrl}
          alt="V.R Dental Care Official Case Sheet Template"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
        />

        {/* Overlaid Clinical Form Content: positioned strictly between the top header banner and the bottom General Consent block */}
        <div className="relative z-10 h-full flex flex-col justify-between pt-[38mm] pb-[62mm] px-[12mm] box-border">
          {/* Sub-header Bar: Horizontally centered, prominent CASE SHEET heading + OP No. on right */}
          <div className="relative flex items-center justify-center border-b-2 border-[#0f4c81]/50 pb-1 mb-2">
            <h1 className="text-[18px] font-black uppercase tracking-wider text-[#0f4c81] text-center font-sans">
              CASE SHEET
            </h1>
            <div className="absolute right-0 text-[12.5px] font-bold text-slate-800 flex items-center">
              <span>
                <strong className="text-slate-600">OP No:</strong> {patient.id}
              </span>
            </div>
          </div>

          {/* 1. PATIENT / CONTACT INFORMATION TABLE (Enlarged font sizes by 2-3px) */}
          <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/85 backdrop-blur-[0.5px] mb-2 shadow-2xs">
            <div className="bg-[#0f4c81] text-white px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider flex justify-between items-center">
              <span>PATIENT / CONTACT INFORMATION</span>
            </div>
            <table className="w-full text-[12px] border-collapse">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-2.5 py-1.5 border-r border-slate-300 w-[40%]">
                    <strong className="text-slate-700 font-bold">Name: </strong>
                    <span className="font-extrabold text-slate-950 text-[12.5px]">{clean(patient.name)}</span>
                  </td>
                  <td className="px-2.5 py-1.5 border-r border-slate-300 w-[30%]">
                    <strong className="text-slate-700 font-bold">Age / Gender: </strong>
                    <span className="font-semibold text-slate-900">{ageSex}</span>
                  </td>
                  <td className="px-2.5 py-1.5 w-[30%]">
                    <strong className="text-slate-700 font-bold">Date: </strong>
                    <span className="font-semibold text-slate-900">{displayDate}</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-2.5 py-1.5 border-r border-slate-300">
                    <strong className="text-slate-700 font-bold">Tel No.: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.phone)}</span>
                  </td>
                  <td className="px-2.5 py-1.5 border-r border-slate-300">
                    <strong className="text-slate-700 font-bold">Ref.: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.reference)}</span>
                  </td>
                  <td className="px-2.5 py-1.5">
                    <strong className="text-slate-700 font-bold">Occupation: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.occupation)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-2.5 py-1.5 border-r border-slate-300" colSpan={2}>
                    <strong className="text-slate-700 font-bold">Address: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.address)}</span>
                  </td>
                  <td className="px-2.5 py-1.5">
                    <strong className="text-slate-700 font-bold">Email: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.email)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. MEDICAL HISTORY CHECKBOXES (Enlarged font sizes by 2px) */}
          <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/85 backdrop-blur-[0.5px] mb-2 shadow-2xs">
            <div className="bg-[#0f4c81] text-white px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider">
              MEDICAL HISTORY
            </div>
            <div className="p-2.5 space-y-2 text-[12px]">
              <div className="grid grid-cols-4 gap-x-2.5 gap-y-1.5">
                {medConditionsList.map((cond) => {
                  const isChecked = medicalHistoryConditions.includes(cond);
                  return (
                    <div key={cond} className="flex items-center gap-1.5">
                      <span
                        className={`w-4 h-4 border border-slate-700 bg-white inline-flex items-center justify-center font-bold text-[11px] leading-none shrink-0 ${
                          isChecked ? "text-[#0f4c81]" : "text-transparent"
                        }`}
                      >
                        {isChecked ? "✓" : ""}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">{cond}</span>
                      {cond === "Others" && clean(medicalHistoryOthers) && (
                        <span className="font-bold text-slate-950 text-[11.5px]">
                          ({clean(medicalHistoryOthers)})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex items-center gap-2 text-[12px]">
                <strong className="text-slate-700 shrink-0 font-bold">Medications if any:</strong>
                <span className="font-semibold text-slate-900">{clean(currentMedications)}</span>
              </div>
            </div>
          </div>

          {/* 3. CLINICAL CASE DETAILS */}
          <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/85 backdrop-blur-[0.5px] flex-1 flex flex-col justify-between shadow-2xs min-h-0">
            <div className="bg-[#0f4c81] text-white px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider shrink-0">
              CLINICAL CASE DETAILS
            </div>

            {/* 1. Chief Complaint & Past Dental History (Strictly 1 line of writing space, text-[12px]) */}
            <div className="border-b border-slate-300 px-2.5 py-1.5 shrink-0">
              <strong className="text-[11.5px] font-bold text-slate-900 uppercase tracking-wide block leading-none mb-1">
                1. Chief Complaint & Past Dental History
              </strong>
              <div className="text-[12px] text-slate-950 font-medium leading-[18px] h-[18px] overflow-hidden truncate">
                {clean(chiefComplaint)}
              </div>
            </div>

            {/* 2. Intra Oral Examination (Expanded with +1 extra line: now 3 lines of writing space, text-[12px]) */}
            <div className="border-b border-slate-300 px-2.5 py-1.5 shrink-0">
              <strong className="text-[11.5px] font-bold text-slate-900 uppercase tracking-wide block leading-none mb-1">
                2. Intra Oral Examination
              </strong>
              <div className="text-[12px] text-slate-950 font-medium leading-[17px] h-[51px] overflow-hidden line-clamp-3">
                {clean(intraOralExam)}
              </div>
            </div>

            {/* 3. Provisional Diagnosis (Expanded with +1 extra line: now 3 lines of writing space, text-[12px]) */}
            <div className="border-b border-slate-300 px-2.5 py-1.5 shrink-0">
              <strong className="text-[11.5px] font-bold text-slate-900 uppercase tracking-wide block leading-none mb-1">
                3. Provisional Diagnosis
              </strong>
              <div className="text-[12px] text-slate-950 font-medium leading-[17px] h-[51px] overflow-hidden line-clamp-3">
                {clean(provisionalDiagnosis)}
              </div>
            </div>

            {/* 4. Treatment Advised (Two-Column Balanced Layout) */}
            <div className={`${containerPaddingClass} flex-1 flex flex-col min-h-0`}>
              <strong className="text-[11.5px] font-bold text-slate-900 uppercase tracking-wide block leading-none mb-1.5 shrink-0">
                4. Treatment Advised
              </strong>
              <div className="grid grid-cols-2 gap-x-4 flex-1 min-h-0">
                {/* Left Column */}
                <div className={`${listSpacingClass} min-h-0 min-w-0`}>
                  {col1Entries.map((item, idx) => (
                    <div key={idx} className={`flex items-start gap-1.5 ${itemTextClass} min-w-0 text-slate-950`}>
                      <span className={`text-[#0f4c81] font-bold ${bulletTextClass} shrink-0 mt-0.5 leading-none select-none`}>•</span>
                      <span className="font-semibold break-words min-w-0 flex-1">{cleanTreatmentLine(item)}</span>
                    </div>
                  ))}
                  {col1Entries.length === 0 && (
                    <div className="text-slate-400 italic text-[11px]">No treatment advised recorded.</div>
                  )}
                </div>

                {/* Right Column */}
                <div className={`${listSpacingClass} min-h-0 min-w-0`}>
                  {col2Entries.map((item, idx) => (
                    <div key={idx} className={`flex items-start gap-1.5 ${itemTextClass} min-w-0 text-slate-950`}>
                      <span className={`text-[#0f4c81] font-bold ${bulletTextClass} shrink-0 mt-0.5 leading-none select-none`}>•</span>
                      <span className="font-semibold break-words min-w-0 flex-1">{cleanTreatmentLine(item)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTE: General Consent date overlay removed so the template's designated "Date & Time" blank area remains clean for manual entry */}
      </div>

      {/* PAGE 1.5+ (CONTINUATION): IF TREATMENT ENTRIES EXCEED CAPACITY OF BOTH COLUMNS (SAFELY PREVENTS ANY TRUNCATION) */}
      {continuationPages.map((pageItems, pageIdx) => {
        const cMid = Math.ceil(pageItems.length / 2);
        const cCol1 = pageItems.slice(0, cMid);
        const cCol2 = pageItems.slice(cMid);
        const pageNumSuffix = continuationPages.length > 1 ? ` (PAGE ${pageIdx + 2})` : "";

        return (
          <div
            key={pageIdx}
            className="relative w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden break-before-page shadow-md print:shadow-none mt-6 print:mt-0"
            style={{ breakBefore: "page", pageBreakBefore: "always" }}
          >
            <img
              src={templateUrl}
              alt="V.R Dental Care Official Case Sheet Continuation"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
            />

            <div className="relative z-10 h-full flex flex-col justify-between pt-[38mm] pb-[62mm] px-[12mm] box-border">
              {/* Continuation Sub-header */}
              <div className="relative flex items-center justify-center border-b-2 border-[#0f4c81]/50 pb-1 mb-2">
                <h1 className="text-[18px] font-black uppercase tracking-wider text-[#0f4c81] text-center font-sans">
                  CASE SHEET (CONTINUATION{pageNumSuffix})
                </h1>
                <div className="absolute right-0 text-[12.5px] font-bold text-slate-800 flex items-center">
                  <span>
                    <strong className="text-slate-600">OP No:</strong> {patient.id}
                  </span>
                </div>
              </div>

              {/* Continuation Patient Reference Strip */}
              <div className="border border-[#0f4c81]/70 rounded-xs px-3 py-2 bg-white/90 backdrop-blur-[0.5px] mb-3 text-[12px] flex justify-between items-center shadow-2xs shrink-0">
                <div>
                  <strong className="text-slate-700 font-bold">Patient: </strong>
                  <span className="font-extrabold text-slate-950 text-[12.5px]">{clean(patient.name)}</span>
                </div>
                <div>
                  <strong className="text-slate-700 font-bold">Age / Gender: </strong>
                  <span className="font-semibold text-slate-900">{ageSex}</span>
                </div>
                <div>
                  <strong className="text-slate-700 font-bold">Date: </strong>
                  <span className="font-semibold text-slate-900">{displayDate}</span>
                </div>
              </div>

              {/* Continuation Two-Column Treatment Advised Block */}
              <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/85 backdrop-blur-[0.5px] flex-1 flex flex-col shadow-2xs min-h-0">
                <div className="bg-[#0f4c81] text-white px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider shrink-0">
                  4. TREATMENT ADVISED (CONTINUED)
                </div>
                <div className="p-3 grid grid-cols-2 gap-x-4 flex-1 text-[12px] text-slate-950 min-h-0">
                  {/* Overflow Column 1 */}
                  <div className="space-y-1.5 min-h-0 min-w-0">
                    {cCol1.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[12px] leading-snug min-w-0 text-slate-950">
                        <span className="text-[#0f4c81] font-bold text-[13px] shrink-0 mt-0.5 leading-none select-none">•</span>
                        <span className="font-semibold break-words min-w-0 flex-1">{cleanTreatmentLine(item)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Overflow Column 2 */}
                  <div className="space-y-1.5 min-h-0 min-w-0">
                    {cCol2.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[12px] leading-snug min-w-0 text-slate-950">
                        <span className="text-[#0f4c81] font-bold text-[13px] shrink-0 mt-0.5 leading-none select-none">•</span>
                        <span className="font-semibold break-words min-w-0 flex-1">{cleanTreatmentLine(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* PAGE 2 (OPTIONAL): TELUGU POST-OP INSTRUCTIONS BACK PAGE */}
      {includeBackPage && (
        <div
          className="relative w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden break-before-page shadow-md print:shadow-none mt-6 print:mt-0"
          style={{ breakBefore: "page", pageBreakBefore: "always" }}
        >
          <img
            src={backPageUrl}
            alt="V.R Dental Care Post Extraction Instructions"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          />
        </div>
      )}
    </div>
  );
};
