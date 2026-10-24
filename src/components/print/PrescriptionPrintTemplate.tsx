import React from "react";
import { getAssetPath } from "@/lib/getAssetPath";
import { formatDbDateToUi, getTodayKolkataUiDate } from "@/lib/dateTimeUtils";

export interface PrescriptionMedicineItem {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
  strength?: string;
  route?: string;
  frequency?: string;
  quantity?: number | string;
}

export interface PrescriptionPrintData {
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
  medicines?: PrescriptionMedicineItem[];
  advice?: string;
  parseDosageFn?: (dosageStr: string) => {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
    beforeMeals: boolean;
    afterMeals: boolean;
  };
}

export const PrescriptionPrintTemplate: React.FC<PrescriptionPrintData> = ({
  patient,
  doctorName = "Dr. M. Durga Praveen",
  date = "",
  diagnosis = "",
  medicines = [],
  advice = "",
  parseDosageFn,
}) => {
  // Exact authentic V.R. Dental Care & Dental Implant Centre stationery template
  const templateUrl = getAssetPath("/vrprescription.jpg");
  const teluguInstructionsUrl = getAssetPath("/templates/vr_telugu_post_op_instructions.png");

  // Format date display: preserve explicit formatted date or format ISO date to readable DD Mon YYYY in Asia/Kolkata
  const displayDate = date ? formatDbDateToUi(date) : getTodayKolkataUiDate();

  // Patient age/sex format
  const ageSex = `${patient.age ? patient.age + " Yrs" : ""} ${patient.gender ? (patient.age ? "/ " : "") + patient.gender : ""}`.trim();

  // Medical Alert: resolve from patient allergies, medical notes, medical conditions, and medical history
  const getCleanMedicalAlert = (p: PrescriptionPrintData["patient"]): string => {
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
  const isOverflow = medicines.length > 7;

  return (
    <div className="flex flex-col items-center">
      {/* EXACT V.R. DENTAL CARE PRESCRIPTION STATIONERY CONTAINER (768:1024 Aspect Ratio = 210mm x 280mm) */}
      <div className="relative w-[210mm] h-[280mm] min-h-[280mm] max-h-[280mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[280mm] print:max-h-[280mm] print:overflow-hidden shadow-md print:shadow-none mx-auto select-none">
        {/* Authentic Pre-Printed Background Template Image (Header, Timings, Tooth Watermark, Doctors Credentials, Footer) */}
        <img
          src={templateUrl}
          alt="V.R Dental Care Official Prescription Template"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        />

        {/* 1. OVERLAID DYNAMIC PATIENT INFORMATION (Enlarged by 2-4px, aligned over template dotted lines) */}

        {/* Patient Name: beside printed "Name :          :" */}
        <div
          className="absolute z-10 font-bold text-slate-950 text-[15px] truncate leading-tight select-text"
          style={{
            left: "20.1%",
            top: "20.6%",
            maxWidth: "56%",
          }}
          title={patient.name}
        >
          {patient.name}
        </div>

        {/* Date: beside printed "Date :" */}
        <div
          className="absolute z-10 font-bold text-slate-900 text-[14px] truncate leading-tight select-text"
          style={{
            left: "83.1%",
            top: "20.6%",
            maxWidth: "12%",
          }}
        >
          {displayDate}
        </div>

        {/* Age / Sex: beside printed "Age / Sex :     :" */}
        <div
          className="absolute z-10 font-bold text-slate-900 text-[14.5px] truncate leading-tight select-text"
          style={{
            left: "20.1%",
            top: "23.4%",
            maxWidth: "75%",
          }}
        >
          {ageSex || "-"}
        </div>

        {/* Medical Alert: beside printed "Medical Alert : :" */}
        {cleanMedAlert && (
          <div
            className="absolute z-10 font-bold text-red-700 text-[14px] truncate leading-tight select-text"
            style={{
              left: "20.1%",
              top: "26.1%",
              maxWidth: "75%",
            }}
            title={cleanMedAlert}
          >
            {cleanMedAlert}
          </div>
        )}

        {/* 2. PRESCRIPTION WRITING AREA (Positioned strictly inside wide central blank space above pre-printed doctors) */}
        <div
          className="absolute z-10 flex flex-col justify-between"
          style={{
            left: "4.9%",
            right: "4.9%",
            top: "29.8%",
            bottom: "25.8%",
          }}
        >
          {/* Top section: Rx glyph, Diagnosis & Medicines Table */}
          <div className="space-y-2">
            {/* Rx Glyph & Heading */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-300/40">
              <div className="flex items-center gap-3">
                <span className="text-[28px] font-black font-serif text-slate-950 leading-none select-none">
                  Rx
                </span>
                {diagnosis && diagnosis.trim() && (
                  <div className="text-[13.5px] text-slate-800 font-medium bg-white/70 px-2.5 py-0.5 rounded border border-slate-200/50">
                    <span className="font-bold text-slate-950">Diagnosis: </span>
                    <span className="italic">{diagnosis.trim()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Prescribed Medicines Table (Spans full available width, enlarged font sizes by 2-4px) */}
            {medicines.length > 0 ? (
              <div className="w-full mt-1 overflow-hidden rounded-xs border border-slate-300/60 bg-white/80 backdrop-blur-[0.5px]">
                <table className="w-full border-collapse text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-slate-950 font-bold bg-slate-100/70 text-[13px]">
                      <th className="py-1.5 px-2.5 text-center w-8">#</th>
                      <th className="py-1.5 px-2.5">Medicine Name & Strength</th>
                      <th className="py-1.5 px-2.5 w-32">Dosage / Frequency</th>
                      <th className="py-1.5 px-2.5 w-32">Meal Timing</th>
                      <th className="py-1.5 px-2.5 w-24">Duration</th>
                      <th className="py-1.5 px-2.5">Special Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med, idx) => {
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

                      return (
                        <tr
                          key={idx}
                          className="border-b border-slate-200/80 text-slate-900 font-medium align-middle"
                        >
                          <td className="py-1.5 px-2.5 text-center text-slate-600 font-bold text-[12.5px]">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-2.5 font-bold text-slate-950 text-[14px]">
                            {med.name}
                            {med.strength && (
                              <span className="ml-1 text-[12.5px] font-semibold text-slate-600">
                                ({med.strength})
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-2.5 font-semibold text-slate-800 whitespace-nowrap text-[13.5px]">
                            {timeStr}
                          </td>
                          <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap text-[13px]">
                            {mealStr}
                          </td>
                          <td className="py-1.5 px-2.5 text-slate-800 whitespace-nowrap font-medium text-[13px]">
                            {med.duration || "-"}
                          </td>
                          <td className="py-1.5 px-2.5 text-slate-700 text-[12.5px]">
                            {med.instructions || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm italic">
                Prescription writing area
              </div>
            )}

            {/* Doctor Advice / Clinical Instructions (Enlarged by 2-4px) */}
            {advice && advice.trim() && (
              <div className="pt-2 text-slate-900">
                <span className="font-bold uppercase tracking-wider text-slate-950 block text-[12px]">
                  Doctor Advice & Follow-Up Instructions:
                </span>
                <p className="mt-1 leading-relaxed text-slate-800 bg-white/75 p-2 rounded border border-slate-200/60 font-medium pl-2.5 whitespace-pre-line text-[13.5px]">
                  {advice.trim()}
                </p>
              </div>
            )}
          </div>

          {/* Bottom of Central Area: Overflow Warning & Doctor Signature (above pre-printed doctors horizontal line) */}
          <div className="pt-2">
            {isOverflow && (
              <div className="print:hidden p-1.5 mb-1 bg-amber-50 border border-amber-300 text-amber-800 text-[11px] rounded font-semibold text-center">
                Prescription contains {medicines.length} medicines. Physical template fits up to 7 medicines per sheet.
              </div>
            )}

            <div className="flex justify-between items-end border-t border-slate-300/60 pt-2">
              <div className="text-[11.5px] text-slate-500 italic max-w-[300px]">
                * Please complete the prescribed course as directed.
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-slate-950">
                  {doctorName || "Dr. M. Durga Praveen"}
                </p>
                <p className="text-[11.5px] text-slate-600 font-medium">
                  Authorized Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 2: TELUGU PATIENT POST-OP INSTRUCTIONS (BACK SIDE) */}
      <div
        className="relative w-[210mm] h-[280mm] min-h-[280mm] max-h-[280mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[280mm] print:max-h-[280mm] print:overflow-hidden break-before-page shadow-md print:shadow-none mx-auto mt-6 print:mt-0 flex flex-col items-center justify-start pt-[35mm] px-[20mm] select-none"
        style={{ breakBefore: "page", pageBreakBefore: "always" }}
      >
        <div className="w-full max-w-[155mm] flex flex-col items-center">
          <img
            src={teluguInstructionsUrl}
            alt="పన్ను తీసిన తర్వాత తీసుకోవలసిన జాగ్రత్తలు - Patient Instructions"
            className="w-full h-auto object-contain rounded-xs shadow-sm border border-slate-300/70 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
