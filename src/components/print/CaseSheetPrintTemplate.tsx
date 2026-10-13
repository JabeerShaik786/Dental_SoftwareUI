import React from "react";
import { getAssetPath } from "@/lib/getAssetPath";

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
  const templateUrl = getAssetPath("/templates/vr_case_sheet_template.png");
  const backPageUrl = getAssetPath("/templates/vr_post_op_instructions.jpg");

  // Format consultation date cleanly, stripping any duplicate time suffixes
  let rawDate = visitDate || "";
  if (rawDate && /^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      rawDate = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  } else if (rawDate && rawDate.includes(",")) {
    rawDate = rawDate.split(",")[0].trim();
  }

  const displayDate =
    rawDate ||
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

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

  return (
    <div className="flex flex-col items-center">
      {/* PAGE 1: EXACT V.R. DENTAL CARE CASE SHEET */}
      <div className="relative w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden shadow-md print:shadow-none">
        {/* Authentic Fixed Background Template Image (Header, Watermark, Address & Footer) */}
        <img
          src={templateUrl}
          alt="V.R Dental Care Official Case Sheet Template"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        />

        {/* Overlaid Clinical Form Content positioned between the authentic header and footer */}
        <div className="relative z-10 h-full flex flex-col justify-between pt-[37mm] pb-[46mm] px-[12mm] box-border">
          {/* Sub-header Bar: Case Sheet Title + ID only (Date removed from header beside ID) */}
          <div className="flex justify-between items-center border-b border-[#0f4c81]/40 pb-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black uppercase tracking-widest text-[#0f4c81] font-serif">
                DENTAL CASE SHEET
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-800 flex items-center">
              <span>
                <strong className="text-slate-600">ID:</strong> {patient.id}
              </span>
            </div>
          </div>

          {/* 1. PATIENT / CONTACT INFORMATION TABLE (Intended consultation date preserved here) */}
          <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/80 backdrop-blur-[0.5px] mb-2 shadow-2xs">
            <div className="bg-[#0f4c81] text-white px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider flex justify-between items-center">
              <span>PATIENT / CONTACT INFORMATION</span>
            </div>
            <table className="w-full text-[10.5px] border-collapse">
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
            <div className="p-2 space-y-1.5 text-[10.5px]">
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
                        <span className="font-bold text-slate-950 text-[10px]">
                          ({clean(medicalHistoryOthers)})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="pt-1 border-t border-slate-200 flex items-center gap-1.5 text-[10.5px]">
                <strong className="text-slate-700 shrink-0">Medications if any:</strong>
                <span className="font-semibold text-slate-900">{clean(currentMedications)}</span>
              </div>
            </div>
          </div>

          {/* 3. CLINICAL CASE DETAILS */}
          <div className="border border-[#0f4c81]/70 rounded-xs overflow-hidden bg-white/80 backdrop-blur-[0.5px] flex-1 flex flex-col justify-between shadow-2xs">
            <div className="bg-[#0f4c81] text-white px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider">
              CLINICAL CASE DETAILS
            </div>

            {/* 1. Chief Complaint & Past Dental History */}
            <div className="border-b border-slate-300 p-2 flex-1 min-h-[26mm] flex flex-col">
              <strong className="text-[10px] font-bold text-slate-900 uppercase tracking-wide block mb-0.5">
                1. Chief Complaint & Past Dental History
              </strong>
              <div className="text-[10.5px] text-slate-950 font-medium whitespace-pre-wrap leading-relaxed flex-1">
                {clean(chiefComplaint)}
              </div>
            </div>

            {/* 2. Intra Oral Examination */}
            <div className="border-b border-slate-300 p-2 flex-1 min-h-[34mm] flex flex-col">
              <strong className="text-[10px] font-bold text-slate-900 uppercase tracking-wide block mb-0.5">
                2. Intra Oral Examination
              </strong>
              <div className="text-[10.5px] text-slate-950 font-medium whitespace-pre-wrap leading-relaxed flex-1">
                {clean(intraOralExam)}
              </div>
            </div>

            {/* 3. Provisional Diagnosis */}
            <div className="border-b border-slate-300 p-2 flex-1 min-h-[18mm] flex flex-col">
              <strong className="text-[10px] font-bold text-slate-900 uppercase tracking-wide block mb-0.5">
                3. Provisional Diagnosis
              </strong>
              <div className="text-[10.5px] text-slate-950 font-medium whitespace-pre-wrap leading-relaxed flex-1">
                {clean(provisionalDiagnosis)}
              </div>
            </div>

            {/* 4. Treatment Advised */}
            <div className="p-2 flex-1 min-h-[24mm] flex flex-col">
              <strong className="text-[10px] font-bold text-slate-900 uppercase tracking-wide block mb-0.5">
                4. Treatment Advised
              </strong>
              <div className="text-[10.5px] text-slate-950 font-medium whitespace-pre-wrap leading-relaxed flex-1">
                {clean(treatmentAdvised)}
              </div>
            </div>

            {/* Signature Block */}
            <div className="border-t border-slate-200 px-3 py-1 flex justify-between items-center text-[10px] text-slate-700 bg-slate-50/60">
              <span className="font-semibold text-slate-600">V.R. Dental Care & Dental Implant Centre</span>
              <span className="font-semibold text-slate-900">Signature: __________________________</span>
            </div>
          </div>
        </div>

      </div>

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
