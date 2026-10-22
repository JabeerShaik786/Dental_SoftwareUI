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
  const templateUrl = getAssetPath("/VR_CaseSheet.jpg");
  const backPageUrl = getAssetPath("/templates/vr_post_op_instructions.jpg");

  // Format consultation date cleanly in Asia/Kolkata
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

  // Parse treatment advised entries line-by-line
  const treatmentEntries = treatmentAdvised
    ? treatmentAdvised
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  // Capacity per column on Page 1:
  // With 1 line for Chief Complaint, 2 lines for Intra Oral Exam, and 2 lines for Provisional Diagnosis,
  // Section 4 has ~100mm of vertical height. 12 entries per column fit cleanly without crowding or clipping.
  const PAGE1_COL_CAPACITY = 12;
  const PAGE1_TOTAL_CAPACITY = PAGE1_COL_CAPACITY * 2; // 24 items total on Page 1

  const page1Entries = treatmentEntries.slice(0, PAGE1_TOTAL_CAPACITY);
  const col1Entries = page1Entries.slice(0, PAGE1_COL_CAPACITY);
  const col2Entries = page1Entries.slice(PAGE1_COL_CAPACITY);

  // If treatment entries exceed the 2-column capacity of Page 1, handle safely via continuation page
  const overflowEntries = treatmentEntries.slice(PAGE1_TOTAL_CAPACITY);
  const overflowCol1 = overflowEntries.slice(0, 18);
  const overflowCol2 = overflowEntries.slice(18);

  return (
    <div className="flex flex-col items-center">
      {/* PAGE 1: OFFICIAL V.R. DENTAL CARE CASE SHEET */}
      <div className="relative w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden shadow-md print:shadow-none">
        {/* Authentic Fixed Background Template Image (Header, Watermark, General Consent, Signature Line & Address Footer) */}
        <img
          src={templateUrl}
          alt="V.R Dental Care Official Case Sheet Template"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        />

        {/* Overlaid Clinical Form Content: positioned strictly between the top header banner and the bottom General Consent block */}
        <div className="relative z-10 h-full flex flex-col justify-between pt-[37mm] pb-[60mm] px-[12mm] box-border">
          {/* Sub-header Bar: Horizontally centered, emphasized CASE SHEET heading + OP No. on right */}
          <div className="relative flex items-center justify-center border-b border-[#0f4c81]/40 pb-1.5 mb-2">
            <h1 className="text-[17px] font-black uppercase tracking-wider text-[#0f4c81] text-center font-sans">
              CASE SHEET
            </h1>
            <div className="absolute right-0 text-[10.5px] font-bold text-slate-800 flex items-center">
              <span>
                <strong className="text-slate-600">OP No:</strong> {patient.id}
              </span>
            </div>
          </div>

          {/* 1. PATIENT / CONTACT INFORMATION TABLE */}
          <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/80 backdrop-blur-[0.5px] mb-2 shadow-2xs">
            <div className="bg-[#0f4c81] text-white px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider flex justify-between items-center">
              <span>PATIENT / CONTACT INFORMATION</span>
            </div>
            <table className="w-full text-[10px] border-collapse">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="px-2 py-1 border-r border-slate-300 w-[40%]">
                    <strong className="text-slate-700">Name: </strong>
                    <span className="font-extrabold text-slate-950">{clean(patient.name)}</span>
                  </td>
                  <td className="px-2 py-1 border-r border-slate-300 w-[30%]">
                    <strong className="text-slate-700">Age / Gender: </strong>
                    <span className="font-semibold text-slate-900">{ageSex}</span>
                  </td>
                  <td className="px-2 py-1 w-[30%]">
                    <strong className="text-slate-700">Date: </strong>
                    <span className="font-semibold text-slate-900">{displayDate}</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="px-2 py-1 border-r border-slate-300">
                    <strong className="text-slate-700">Tel No.: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.phone)}</span>
                  </td>
                  <td className="px-2 py-1 border-r border-slate-300">
                    <strong className="text-slate-700">Ref.: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.reference)}</span>
                  </td>
                  <td className="px-2 py-1">
                    <strong className="text-slate-700">Occupation: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.occupation)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-1 border-r border-slate-300" colSpan={2}>
                    <strong className="text-slate-700">Address: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.address)}</span>
                  </td>
                  <td className="px-2 py-1">
                    <strong className="text-slate-700">Email: </strong>
                    <span className="font-semibold text-slate-900">{clean(patient.email)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. MEDICAL HISTORY CHECKBOXES */}
          <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/80 backdrop-blur-[0.5px] mb-2 shadow-2xs">
            <div className="bg-[#0f4c81] text-white px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider">
              MEDICAL HISTORY
            </div>
            <div className="p-2 space-y-1.5 text-[10px]">
              <div className="grid grid-cols-4 gap-x-2 gap-y-1">
                {medConditionsList.map((cond) => {
                  const isChecked = medicalHistoryConditions.includes(cond);
                  return (
                    <div key={cond} className="flex items-center gap-1.5">
                      <span
                        className={`w-3.5 h-3.5 border border-slate-700 bg-white inline-flex items-center justify-center font-bold text-[10px] leading-none shrink-0 ${
                          isChecked ? "text-[#0f4c81]" : "text-transparent"
                        }`}
                      >
                        {isChecked ? "✓" : ""}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">{cond}</span>
                      {cond === "Others" && clean(medicalHistoryOthers) && (
                        <span className="font-bold text-slate-950 text-[9.5px]">
                          ({clean(medicalHistoryOthers)})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="pt-1 border-t border-slate-200 flex items-center gap-1.5 text-[10px]">
                <strong className="text-slate-700 shrink-0">Medications if any:</strong>
                <span className="font-semibold text-slate-900">{clean(currentMedications)}</span>
              </div>
            </div>
          </div>

          {/* 3. CLINICAL CASE DETAILS */}
          <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/80 backdrop-blur-[0.5px] flex-1 flex flex-col justify-between shadow-2xs min-h-0">
            <div className="bg-[#0f4c81] text-white px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider shrink-0">
              CLINICAL CASE DETAILS
            </div>

            {/* 1. Chief Complaint & Past Dental History (Strictly 1 line of writing space) */}
            <div className="border-b border-slate-300 px-2.5 py-1 shrink-0">
              <strong className="text-[9.5px] font-bold text-slate-900 uppercase tracking-wide block leading-none mb-0.5">
                1. Chief Complaint & Past Dental History
              </strong>
              <div className="text-[10px] text-slate-950 font-medium leading-[16px] h-[16px] overflow-hidden truncate">
                {clean(chiefComplaint)}
              </div>
            </div>

            {/* 2. Intra Oral Examination (Strictly 2 lines of writing space) */}
            <div className="border-b border-slate-300 px-2.5 py-1 shrink-0">
              <strong className="text-[9.5px] font-bold text-slate-900 uppercase tracking-wide block leading-none mb-0.5">
                2. Intra Oral Examination
              </strong>
              <div className="text-[10px] text-slate-950 font-medium leading-[16px] h-[32px] overflow-hidden line-clamp-2">
                {clean(intraOralExam)}
              </div>
            </div>

            {/* 3. Provisional Diagnosis (Strictly 2 lines of writing space) */}
            <div className="border-b border-slate-300 px-2.5 py-1 shrink-0">
              <strong className="text-[9.5px] font-bold text-slate-900 uppercase tracking-wide block leading-none mb-0.5">
                3. Provisional Diagnosis
              </strong>
              <div className="text-[10px] text-slate-950 font-medium leading-[16px] h-[32px] overflow-hidden line-clamp-2">
                {clean(provisionalDiagnosis)}
              </div>
            </div>

            {/* 4. Treatment Advised (Two-Column Layout) */}
            <div className="p-2.5 flex-1 flex flex-col min-h-0 overflow-hidden">
              <strong className="text-[9.5px] font-bold text-slate-900 uppercase tracking-wide block leading-none mb-1.5 shrink-0">
                4. Treatment Advised
              </strong>
              <div className="grid grid-cols-2 gap-x-4 flex-1 text-[10px] text-slate-950 min-h-0">
                {/* Left Column */}
                <div className="space-y-1 min-h-0">
                  {col1Entries.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1 leading-snug">
                      <span className="text-[#0f4c81] font-bold shrink-0 mt-0.5">•</span>
                      <span className="font-semibold break-words">{item}</span>
                    </div>
                  ))}
                  {col1Entries.length === 0 && (
                    <div className="text-slate-400 italic text-[9.5px]">No treatment advised recorded.</div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-1 min-h-0">
                  {col2Entries.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1 leading-snug">
                      <span className="text-[#0f4c81] font-bold shrink-0 mt-0.5">•</span>
                      <span className="font-semibold break-words">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Date accurately aligned over the official template's "Date & Time" dotted line */}
        <div className="absolute bottom-[28.5mm] left-[16mm] text-[10px] font-bold text-slate-900 pointer-events-none select-none z-10">
          {displayDate}
        </div>
      </div>

      {/* PAGE 1.5 (CONTINUATION): IF TREATMENT ENTRIES EXCEED CAPACITY OF BOTH COLUMNS (SAFELY PREVENTS ANY TRUNCATION) */}
      {overflowEntries.length > 0 && (
        <div className="relative w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden break-before-page shadow-md print:shadow-none mt-6 print:mt-0">
          <img
            src={templateUrl}
            alt="V.R Dental Care Official Case Sheet Continuation"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
          />

          <div className="relative z-10 h-full flex flex-col justify-between pt-[37mm] pb-[60mm] px-[12mm] box-border">
            {/* Continuation Sub-header */}
            <div className="relative flex items-center justify-center border-b border-[#0f4c81]/40 pb-1.5 mb-2">
              <h1 className="text-[17px] font-black uppercase tracking-wider text-[#0f4c81] text-center font-sans">
                CASE SHEET (CONTINUATION)
              </h1>
              <div className="absolute right-0 text-[10.5px] font-bold text-slate-800 flex items-center">
                <span>
                  <strong className="text-slate-600">OP No:</strong> {patient.id}
                </span>
              </div>
            </div>

            {/* Continuation Patient Reference Strip */}
            <div className="border border-[#0f4c81]/70 rounded-xs px-3 py-1.5 bg-white/90 backdrop-blur-[0.5px] mb-3 text-[10px] flex justify-between items-center shadow-2xs">
              <div>
                <strong className="text-slate-700">Patient: </strong>
                <span className="font-extrabold text-slate-950">{clean(patient.name)}</span>
              </div>
              <div>
                <strong className="text-slate-700">Age / Gender: </strong>
                <span className="font-semibold text-slate-900">{ageSex}</span>
              </div>
              <div>
                <strong className="text-slate-700">Date: </strong>
                <span className="font-semibold text-slate-900">{displayDate}</span>
              </div>
            </div>

            {/* Continuation Two-Column Treatment Advised Block */}
            <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/80 backdrop-blur-[0.5px] flex-1 flex flex-col shadow-2xs min-h-0">
              <div className="bg-[#0f4c81] text-white px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider shrink-0">
                4. TREATMENT ADVISED (CONTINUED)
              </div>
              <div className="p-3 grid grid-cols-2 gap-x-4 flex-1 text-[10px] text-slate-950 min-h-0">
                {/* Overflow Column 1 */}
                <div className="space-y-1.5 min-h-0">
                  {overflowCol1.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1 leading-snug">
                      <span className="text-[#0f4c81] font-bold shrink-0 mt-0.5">•</span>
                      <span className="font-semibold break-words">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Overflow Column 2 */}
                <div className="space-y-1.5 min-h-0">
                  {overflowCol2.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1 leading-snug">
                      <span className="text-[#0f4c81] font-bold shrink-0 mt-0.5">•</span>
                      <span className="font-semibold break-words">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[28.5mm] left-[16mm] text-[10px] font-bold text-slate-900 pointer-events-none select-none z-10">
            {displayDate}
          </div>
        </div>
      )}

      {/* PAGE 2 (OPTIONAL): TELUGU POST-OP INSTRUCTIONS BACK PAGE */}
      {includeBackPage && (
        <div className="relative w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden break-before-page shadow-md print:shadow-none mt-6 print:mt-0">
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
