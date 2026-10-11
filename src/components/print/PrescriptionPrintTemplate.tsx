import React from "react";
import { getAssetPath } from "@/lib/getAssetPath";

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
  const templateUrl = getAssetPath("/templates/vr_prescription_template.png");

  // Format date display: preserve explicit formatted date or format ISO date to readable en-GB
  let displayDate = date;
  if (!displayDate) {
    displayDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } else if (/^\d{4}-\d{2}-\d{2}/.test(displayDate)) {
    const d = new Date(displayDate);
    if (!isNaN(d.getTime())) {
      displayDate = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  // Patient age/sex format
  const ageSex = `${patient.age ? patient.age + " Yrs" : ""} ${patient.gender ? "/ " + patient.gender : ""}`.trim();

  // Medical Alert: ignore placeholder values like "None" or "N/A"
  const cleanMedAlert =
    patient.medicalNotes &&
    patient.medicalNotes !== "None" &&
    patient.medicalNotes !== "N/A" &&
    patient.medicalNotes.trim().length > 0
      ? patient.medicalNotes.trim()
      : "";

  const isOverflow = medicines.length > 7;

  return (
    <div className="flex flex-col items-center">
      {/* EXACT V.R. DENTAL CARE PRESCRIPTION A4 CONTAINER */}
      <div className="relative w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 font-sans box-border overflow-hidden print:w-[210mm] print:h-[297mm] print:overflow-hidden shadow-md print:shadow-none">
        {/* Authentic Fixed Background Template Image (Header, Timings, Doctor Column, Watermark, Footer) */}
        <img
          src={templateUrl}
          alt="V.R Dental Care Official Prescription Template"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        />

        {/* 1. OVERLAID PATIENT INFORMATION (Positioned exactly over template labels) */}

        {/* Patient Name: beside printed "Name :" */}
        <div
          className="absolute z-10 font-bold text-slate-950 text-[12px] truncate"
          style={{
            left: "46.5%",
            top: "23.0%",
            maxWidth: "30%",
          }}
          title={patient.name}
        >
          {patient.name}
        </div>

        {/* Date: beside printed "Date :" */}
        <div
          className="absolute z-10 font-bold text-slate-900 text-[11px] bg-white/95 px-1 rounded-xs"
          style={{
            left: "82.5%",
            top: "22.8%",
            maxWidth: "11%",
          }}
        >
          {displayDate}
        </div>

        {/* Age / Sex: beside printed "Age / Sex :" */}
        <div
          className="absolute z-10 font-bold text-slate-900 text-[11.5px]"
          style={{
            left: "49.5%",
            top: "25.6%",
            maxWidth: "40%",
          }}
        >
          {ageSex}
        </div>

        {/* Medical Alert: beside printed "Medical Alert:" */}
        {cleanMedAlert && (
          <div
            className="absolute z-10 font-bold text-red-700 text-[11px] truncate"
            style={{
              left: "51.8%",
              top: "28.2%",
              maxWidth: "40%",
            }}
            title={cleanMedAlert}
          >
            {cleanMedAlert}
          </div>
        )}

        {/* 2. PRESCRIPTION WRITING AREA (Positioned strictly inside the large blank area on the right) */}
        <div
          className="absolute z-10 flex flex-col justify-between"
          style={{
            left: "41.5%",
            right: "7.5%",
            top: "31.8%",
            bottom: "11.5%",
          }}
        >
          {/* Top of writing area: Rx symbol + Clinical diagnosis + Medicines table */}
          <div className="space-y-2">
            {/* Rx Glyph & Heading */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-serif text-slate-950 leading-none">
                Rx
              </span>
              {diagnosis && diagnosis.trim() && (
                <div className="text-[10px] text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">Diagnosis: </span>
                  <span className="italic">{diagnosis.trim()}</span>
                </div>
              )}
            </div>

            {/* Prescribed Medicines Table */}
            {medicines.length > 0 ? (
              <div className="w-full">
                <table className="w-full border-collapse text-left text-[10px] bg-transparent">
                  <thead>
                    <tr className="border-b-2 border-slate-700 text-slate-950 font-bold">
                      <th className="py-1 px-1 text-center w-6">#</th>
                      <th className="py-1 px-1">Medicine Name</th>
                      <th className="py-1 px-1 w-20">Dosage</th>
                      <th className="py-1 px-1 w-20">Meal</th>
                      <th className="py-1 px-1 w-16">Duration</th>
                      <th className="py-1 px-1">Instructions</th>
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
                          className="border-b border-slate-300/80 text-slate-900 font-medium align-middle"
                        >
                          <td className="py-1 px-1 text-center text-slate-600 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-1 font-bold text-slate-950">
                            {med.name}
                            {med.strength && (
                              <span className="ml-1 text-[9px] font-normal text-slate-600">
                                ({med.strength})
                              </span>
                            )}
                          </td>
                          <td className="py-1 px-1 font-semibold text-slate-800 whitespace-nowrap">
                            {timeStr}
                          </td>
                          <td className="py-1 px-1 text-slate-700 whitespace-nowrap">
                            {mealStr}
                          </td>
                          <td className="py-1 px-1 text-slate-800 whitespace-nowrap">
                            {med.duration || "-"}
                          </td>
                          <td className="py-1 px-1 text-slate-700">
                            {med.instructions || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs italic">
                Prescription writing area
              </div>
            )}

            {/* Doctor Advice / Post-medication Instructions */}
            {advice && advice.trim() && (
              <div className="pt-2 text-[10px] text-slate-900">
                <span className="font-bold uppercase tracking-wider text-slate-950 block text-[9.5px]">
                  Doctor Advice / Instructions:
                </span>
                <p className="mt-0.5 leading-relaxed text-slate-800 bg-transparent pl-1 font-medium">
                  {advice.trim()}
                </p>
              </div>
            )}
          </div>

          {/* Bottom of Writing Area: Warning (if overflow) & Authorized Doctor Signature */}
          <div className="pt-2">
            {isOverflow && (
              <div className="print:hidden p-1.5 mb-2 bg-amber-50 border border-amber-300 text-amber-800 text-[10px] rounded font-semibold text-center">
                Prescription contains {medicines.length} medicines. Physical template fits up to 7 medicines per sheet.
              </div>
            )}

            <div className="flex justify-between items-end border-t border-slate-300/50 pt-2">
              <div className="text-[9px] text-slate-500 italic max-w-[200px]">
                * Please complete the prescribed course as directed.
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-950">
                  {doctorName || "Dr. M. Durga Praveen"}
                </p>
                <p className="text-[9px] text-slate-600">
                  Authorized Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
