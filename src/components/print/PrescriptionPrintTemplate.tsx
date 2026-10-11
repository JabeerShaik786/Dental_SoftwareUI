import React from "react";

export interface PrescriptionMedicineItem {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
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
  const displayDate = date || new Date().toISOString().split("T")[0];
  const ageSex = `${patient.age ? patient.age + " Yrs" : ""} ${patient.gender || ""}`.trim();

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 font-sans p-6 relative flex flex-col justify-between box-border leading-normal">
      {/* Background Tooth Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
        <svg className="w-[300mm] h-[300mm] text-blue-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.5 2 6 4 6 7c0 2.5 1.5 5 2 7.5C8.5 17 9 20 10.5 21.5 11.2 22.2 12 22 12 22s.8.2 1.5-.5C15 20 15.5 17 16 14.5c.5-2.5 2-5 2-7.5 0-3-2.5-5-6-5z" />
        </svg>
      </div>

      <div className="relative z-10 space-y-3">
        {/* TOP CLINIC HEADER (Image 2 reference) */}
        <div className="border-b-2 border-slate-900 pb-2 space-y-1">
          <div className="text-right text-[11px] font-bold text-slate-800">
            Clinic : 9885349798, 8790349798
          </div>

          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="h-12 w-12 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center text-center shrink-0">
              <svg className="h-6 w-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8.5 2 6 4 6 7c0 2.5 1.5 5 2 7.5C8.5 17 9 20 10.5 21.5 11.2 22.2 12 22 12 22s.8.2 1.5-.5C15 20 15.5 17 16 14.5c.5-2.5 2-5 2-7.5 0-3-2.5-5-6-5z" />
              </svg>
              <span className="text-[6.5px] font-bold text-slate-900 tracking-tighter -mt-0.5">ESTD. 2011</span>
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-black tracking-tight uppercase font-serif text-slate-950">
                V.R DENTAL CARE
              </h1>
              <h2 className="text-xs font-black tracking-widest uppercase text-slate-900">
                & DENTAL IMPLANT CENTRE
              </h2>
              <p className="text-[10.5px] font-semibold text-slate-800 mt-0.5">
                Opp. G.M.C. Balayogi Sports Complex, 3rd Cross, Zicriya Nagar, YANAM - 533 464
              </p>
            </div>
          </div>

          {/* Timings Bar */}
          <div className="border-y border-slate-800 py-0.5 px-2 flex justify-between items-center text-[11px] font-bold text-slate-900 mt-2">
            <span>సంప్రదించు వేళలు :</span>
            <span>9 A.M. to 1 P.M.</span>
            <span>4 P.M. to 8 P.M.</span>
            <span>Sunday Holiday</span>
          </div>
        </div>

        {/* TWO-COLUMN PHYSICAL PRESCRIPTION LAYOUT (Image 2 reference) */}
        <div className="grid grid-cols-12 gap-4 items-start min-h-[520px]">
          {/* LEFT COLUMN: DOCTORS & CONSULTANTS ROSTER */}
          <div className="col-span-4 border-r-2 border-slate-800 pr-3 space-y-3 text-[11px] text-slate-900 font-sans">
            {/* Lead Surgeon */}
            <div className="space-y-0.5">
              <h3 className="font-bold text-[12px] text-slate-950">Dr. M. Durga Praveen <span className="text-[9.5px] font-normal">B.D.S, FICOI</span></h3>
              <p className="font-semibold text-slate-800 text-[10px] leading-tight">Chief Dental Surgeon & Oral Implantologist</p>
              <p className="text-[10px] text-slate-700">Regd. No. - 19</p>
            </div>

            {/* Associate Surgeon */}
            <div className="space-y-0.5 pt-1">
              <h3 className="font-bold text-[11.5px] text-slate-950">Dr. P.chandra Keerthi <span className="text-[9.5px] font-normal">B.D.S, FCE</span></h3>
              <p className="font-semibold text-slate-800 text-[10px]">Associate Dental Surgeon</p>
            </div>

            {/* Consultants Section */}
            <div className="pt-2 space-y-2 border-t border-slate-300">
              <h4 className="font-bold text-xs uppercase tracking-wide text-slate-950 border-b border-slate-400 pb-0.5">
                Consultants :-
              </h4>

              <div className="space-y-2 text-[10px] leading-tight">
                <div>
                  <p className="font-bold text-slate-950">Dr. P. Naveen <span className="font-normal text-[9px]">M.D.S</span></p>
                  <p className="text-slate-700">Consultant Oral & Maxillofacial Surgeon & Implantologist</p>
                </div>

                <div>
                  <p className="font-bold text-slate-950">Dr. K. Anand Viswanadh <span className="font-normal text-[9px]">M.D.S</span></p>
                  <p className="text-slate-700">Consultant Orthodontist</p>
                </div>

                <div>
                  <p className="font-bold text-slate-950">Dr. P.S.S. Manikanta Kumar <span className="font-normal text-[9px]">M.D.S</span></p>
                  <p className="text-slate-700">Consultant Periodontist</p>
                </div>

                <div>
                  <p className="font-bold text-slate-950">Dr. L.Anish Kumar <span className="font-normal text-[9px]">M.D.S</span></p>
                  <p className="text-slate-700">Consultant Endodontist</p>
                </div>

                <div>
                  <p className="font-bold text-slate-950">Dr. Sekhar <span className="font-normal text-[9px]">M.D.S</span></p>
                  <p className="text-slate-700">Consultant Endodontist</p>
                </div>

                <div>
                  <p className="font-bold text-slate-950">Dr. B.S.R.S.V. Prasad <span className="font-normal text-[9px]">M.D.S</span></p>
                  <p className="text-slate-700">Consultant Prosthodontist</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PATIENT INFO & PRESCRIPTION CONTENT */}
          <div className="col-span-8 space-y-3 pl-1">
            {/* Patient Header Line (Physical Pad Style) */}
            <div className="space-y-1.5 text-xs font-medium border-b border-slate-400 pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">Name : </span>
                  <span className="font-bold text-slate-950 text-sm">{patient.name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Date : </span>
                  <span className="font-bold">{displayDate}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <div>
                  <span className="font-bold text-slate-900">Age / Sex : </span>
                  <span>{ageSex}</span>
                </div>
                {patient.medicalNotes && patient.medicalNotes !== "None" && (
                  <div>
                    <span className="font-bold text-red-700">Medical Alert : </span>
                    <span className="font-semibold text-red-900">{patient.medicalNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rx Symbol */}
            <div className="text-2xl font-bold font-serif text-slate-900">
              Rx
            </div>

            {/* Diagnosis Notes */}
            {diagnosis.trim() && (
              <div className="space-y-1">
                <strong className="text-xs uppercase text-slate-900 block font-bold border-b border-slate-300 pb-0.5">
                  Diagnosis / Clinical Notes
                </strong>
                <p className="text-xs text-slate-950 leading-relaxed font-medium pl-1">{diagnosis.trim()}</p>
              </div>
            )}

            {/* Medicines Table */}
            {medicines.length > 0 && (
              <div className="space-y-1">
                <strong className="text-xs uppercase text-slate-900 block font-bold border-b border-slate-300 pb-0.5">
                  Medicines Prescribed
                </strong>
                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-slate-950 font-bold border-b border-slate-400">
                      <th className="border border-slate-400 p-1.5 text-center w-7">#</th>
                      <th className="border border-slate-400 p-1.5 text-left">Medicine Name</th>
                      <th className="border border-slate-400 p-1.5 text-left">Dosage</th>
                      <th className="border border-slate-400 p-1.5 text-left">Meal</th>
                      <th className="border border-slate-400 p-1.5 text-left">Duration</th>
                      <th className="border border-slate-400 p-1.5 text-left">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med, idx) => {
                      let timeStr = "-";
                      let mealStr = "-";

                      if (parseDosageFn) {
                        const parsed = parseDosageFn(med.dosage);
                        const times: string[] = [];
                        if (parsed.morning) times.push("Morning");
                        if (parsed.afternoon) times.push("Afternoon");
                        if (parsed.night) times.push("Night");
                        timeStr = times.join(", ") || "-";

                        if (parsed.beforeMeals) mealStr = "Before Meals";
                        else if (parsed.afterMeals) mealStr = "After Meals";
                      }

                      return (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="border border-slate-300 p-1.5 text-center font-medium">{idx + 1}</td>
                          <td className="border border-slate-300 p-1.5 font-bold text-slate-950">{med.name}</td>
                          <td className="border border-slate-300 p-1.5">{timeStr !== "-" ? timeStr : med.dosage}</td>
                          <td className="border border-slate-300 p-1.5">{mealStr}</td>
                          <td className="border border-slate-300 p-1.5">{med.duration}</td>
                          <td className="border border-slate-300 p-1.5">{med.instructions}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Doctor Advice */}
            {advice.trim() && (
              <div className="space-y-1">
                <strong className="text-xs uppercase text-slate-900 block font-bold border-b border-slate-300 pb-0.5">
                  Doctor Advice
                </strong>
                <p className="text-xs text-slate-900 leading-relaxed pl-1">{advice.trim()}</p>
              </div>
            )}
          </div>
        </div>

        {/* POST-TREATMENT TELUGU PRECAUTIONS SECTION (Image 3 Reference) */}
        <div className="pt-2 border-t border-slate-400 space-y-1.5">
          <div className="flex justify-center">
            <div className="border border-slate-800 rounded-full px-4 py-0.5 text-xs font-bold text-slate-950 bg-slate-100">
              పన్ను తీసిన తర్వాత తీసుకోవలసిన జాగ్రత్తలు
            </div>
          </div>

          <div className="border border-slate-400 rounded-md p-2.5 bg-slate-50 text-[11px] font-semibold text-slate-950 leading-relaxed">
            <ol className="list-decimal pl-5 space-y-0.5">
              <li>దూదిని గంట వరకు పళ్ళ మధ్య వత్తి ఉంచవలెను.</li>
              <li>పన్ను తీసిన రోజున నోటితో పుక్కిలించరాదు</li>
              <li>చల్లని పానీయములే తీసుకొనవలెను</li>
              <li>ద్రవ పదార్థములు, మెత్తటి ఆహారములు తీసుకొనవలెను</li>
              <li>డాక్టరు గారు వ్రాసిన మందులు వాడవలెను</li>
              <li>రక్తము ఆగనిచో డాక్టరును సంప్రదించవలెను</li>
              <li>మరలా వచ్చినప్పుడు ఈ చీటీ తీసుకురావలెను.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* FOOTER: PHARMACY SHOP & SIGNATURE (Image 2 reference) */}
      <div className="relative z-10 mt-auto pt-3 border-t-2 border-slate-900 text-xs">
        <p className="text-center font-bold text-slate-950 text-[11px] mb-1">
          పై మందులు ఈ క్రింది షాపులో లభించును
        </p>

        <div className="flex justify-between items-end">
          <div className="space-y-0.5 text-[10.5px]">
            <h4 className="font-extrabold text-xs text-blue-950 uppercase">
              శ్రీ శ్రీనివాసా మెడికల్ స్టోర్స్
            </h4>
            <p className="font-semibold text-slate-800">
              ప్రొ॥ బెజవాడ వెంకట రామదాస్ (కన్నా)
            </p>
            <p className="text-slate-700">
              మార్కెట్ వద్ద, జైలు వీధి, యానాం - 533 464
            </p>
          </div>

          <div className="text-right space-y-6">
            <p className="text-[11px] font-bold text-slate-800">
              Cell : 94412 39556, 70139 48588
            </p>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-950">
                Doctor: {doctorName}
              </p>
              <p className="text-xs text-slate-700">
                Signature: __________________________
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
