import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { FileCheck, ArrowLeft, AlertCircle, Clock, CreditCard, Stethoscope, Phone, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | V.R. Dental Care & Dental Implant Centre",
  description: "Terms of Service and patient consultation guidelines for V.R. Dental Care & Dental Implant Centre in Yanam.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28 pb-20 bg-[#f8fafc]">
        {/* Header Banner */}
        <section className="bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white py-14 px-6 md:px-12 lg:px-20 relative overflow-hidden">
          <div className="max-w-[1100px] mx-auto relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2 bg-white/20 backdrop-blur-xs rounded-lg inline-flex">
                <FileCheck className="w-6 h-6 text-white" />
              </span>
              <span className="text-xs md:text-sm uppercase tracking-widest font-bold text-white/90">
                Clinic Guidelines & Policies
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-3 text-white/90 text-sm sm:text-base max-w-2xl font-normal">
              Terms and conditions governing clinical appointments, treatments, and online consultations at V.R. Dental Care & Dental Implant Centre.
            </p>
            <p className="mt-2 text-xs text-white/70">
              Last Updated: September 2026 | Effective Date: September 2026
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 sm:p-12 space-y-10 text-[#1e293b]">
            
            {/* 1. Acceptance */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#0284c7] rounded-full inline-block" />
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                By visiting our clinic, booking appointments online, submitting information through our Quick Online Consultancy service, or using our website, you agree to comply with and be bound by these Terms of Service. If you do not agree with any portion of these terms, please consult our front desk team prior to receiving services.
              </p>
            </div>

            {/* 2. Dental Services & Consultations */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#0284c7] rounded-full inline-block" />
                2. Clinical Treatments & Scope of Care
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-4">
                <strong>V.R. Dental Care & Dental Implant Centre</strong> provides multidisciplinary dental healthcare including general dentistry, dental implants, root canal therapy, orthodontics, smile designing, laser surgeries, pediatric dental care, and oral rehabilitation.
              </p>
              <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-100 flex items-start gap-3">
                <Stethoscope className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  All treatments are performed by registered dental practitioners in accordance with standards established by the Dental Council of India (DCI). Specific clinical outcomes may vary depending on patient anatomy, bone density, periodontal health, and compliance with post-operative instructions.
                </p>
              </div>
            </div>

            {/* 3. Appointments & Punctuality */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#0284c7] rounded-full inline-block" />
                3. Appointments & Rescheduling
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h3 className="font-semibold text-sm text-[#0f2942] mb-1.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0284c7]" /> Punctuality
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Patients are requested to arrive 10 minutes prior to scheduled appointments to complete health screening and vital recording.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <h3 className="font-semibold text-sm text-[#0f2942] mb-1.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#0284c7]" /> Cancellations
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    If you must reschedule or cancel, please provide at least 24 hours notice so the operatory time slot can be made available for emergency patients.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Patient Medical Disclosure & Informed Consent */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#0284c7] rounded-full inline-block" />
                4. Patient Health Disclosure & Informed Consent
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-3">
                Patients must furnish accurate, complete medical and drug histories, including heart conditions, diabetes, bleeding disorders, pregnancy, and known drug allergies.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Prior to surgical treatments (such as dental implants, wisdom tooth extractions, and bone grafts), patients are provided with detailed informed consent forms explaining the nature, risks, benefits, and alternatives of the procedure.
              </p>
            </div>

            {/* 5. Online & WhatsApp Consultation Disclaimer */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#0284c7] rounded-full inline-block" />
                5. Online & WhatsApp Consultation Disclaimer
              </h2>
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200/70 text-amber-900 text-xs sm:text-sm leading-relaxed">
                <strong>Important Notice:</strong> Preliminary online consultations, inquiries via website forms, and WhatsApp chats are informational only and cannot substitute for an in-person physical clinical examination, dental probing, and diagnostic digital radiography (X-rays/CBCT). Final diagnoses and definitive treatment plans are issued only after in-clinic examination.
              </div>
            </div>

            {/* 6. Treatment Estimates & Payments */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#0284c7] rounded-full inline-block" />
                6. Treatment Estimates & Payment Policy
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-3">
                Written treatment plans and fee estimates are provided following initial diagnostic evaluation. Multi-visit treatments (such as customized prosthodontics, implants, and clear aligners) may involve staged milestone payments.
              </p>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                <CreditCard className="w-4 h-4 text-[#0284c7]" />
                <span>Accepted payment modes: Cash, UPI, Debit/Credit Cards, and Bank Transfer.</span>
              </div>
            </div>

            {/* 7. Governing Law */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] mb-4 flex items-center gap-2.5">
                <span className="w-2 h-6 bg-[#0284c7] rounded-full inline-block" />
                7. Governing Law & Jurisdiction
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                These Terms shall be governed by and interpreted in accordance with the laws of the Republic of India. Any disputes arising in connection with clinical services or website usage shall be subject to the exclusive jurisdiction of the competent courts in Yanam / Puducherry U.T.
              </p>
            </div>

            {/* Contact Box */}
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-base text-[#0f2942] mb-3">
                Clinic Administration Contact
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                For questions concerning our terms or treatment scheduling:
              </p>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span>3rd Cross St, opposite GMC Balayogi Stadium, Zicria Nagar, Yanam, Andhra Pradesh 533464</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span>098853 49798 / 087903 49798</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span>VRdental.yanam@gmail.com</span>
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
