"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Smile } from "lucide-react";
import Image from "next/image";
import { getAssetPath } from "@/lib/getAssetPath";

type TabType = "about" | "highlights" | "technology";

const CLINIC_IMAGES = [
  {
    src: getAssetPath("/dental1.2.png"),
    alt: "V.R. Dental Care Clinic Reception",
    title: "Clinic Reception",
    desc: "A warm, welcoming, and clean reception area designed for patient comfort."
  },
  {
    src: getAssetPath("/dental1.3.png"),
    alt: "V.R. Dental Care Dental Treatment Room",
    title: "Dental Treatment Room",
    desc: "Modern and hygienic operatory suites equipped for gentle treatments."
  },
  {
    src: getAssetPath("/dental1.4.png"),
    alt: "V.R. Dental Care Dental Equipment",
    title: "Dental Equipment",
    desc: "State-of-the-art diagnostic and clinical equipment for precise care."
  },
  {
    src: getAssetPath("/dental1.5.png"),
    alt: "V.R. Dental Care Sterilization Suite",
    title: "Sterilization Suite",
    desc: "Strict sterilization guidelines and clinical cleaning standards."
  },
  {
    src: getAssetPath("/dental1.6.png"),
    alt: "V.R. Dental Care Consultation Room",
    title: "Consultation Suite",
    desc: "Private consultation area for personalized treatment discussions."
  }
];

export default function AboutDoctor() {
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const tabs = [
    { id: "about", label: "About Clinic" },
    { id: "highlights", label: "Clinical Highlights" },
    { id: "technology", label: "Modern Technology" }
  ];

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-secondary/5 blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Interactive Facility Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 w-full flex flex-col items-center gap-6"
          >
            {/* Primary Display Frame */}
            <div className="relative rounded-[24px] overflow-hidden border border-white/60 shadow-[0_30px_80px_rgba(15,23,42,0.12)] aspect-[4/3] w-full max-w-[480px] bg-slate-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImgIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={CLINIC_IMAGES[activeImgIndex].src}
                    alt={CLINIC_IMAGES[activeImgIndex].alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Floating Facility Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-3.5 rounded-[16px] shadow-md border border-white/30 text-left">
                <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Facility Tour
                </span>
                <h4 className="text-sm font-extrabold text-slate-800 leading-snug mt-1.5">
                  {CLINIC_IMAGES[activeImgIndex].title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                  {CLINIC_IMAGES[activeImgIndex].desc}
                </p>
              </div>
            </div>

            {/* Thumbnail Selectors */}
            <div className="flex gap-3 justify-center">
              {CLINIC_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative w-20 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    activeImgIndex === idx
                      ? "border-primary scale-105 shadow-md shadow-primary/10"
                      : "border-transparent opacity-60 hover:opacity-100 hover:scale-102"
                  }`}
                  aria-label={`View ${img.title}`}
                >
                  <Image
                    src={img.src}
                    alt={`Thumbnail ${img.title}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Tabbed Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3">
              About Us
            </span>
            <h2 className="font-heading font-extrabold text-3xl md:text-[38px] text-dark-text tracking-tight leading-tight mb-6">
              V.R. Dental Care & Dental Implant Centre
            </h2>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-borders w-full pb-3 mb-8 text-left">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? "text-primary bg-primary/5"
                      : "text-gray-text hover:text-dark-text hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-[-13px] inset-x-0 h-[2px] bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="w-full min-h-[220px] relative text-left">
              <AnimatePresence mode="wait">
                {activeTab === "about" && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6 text-gray-text text-base md:text-lg leading-relaxed font-normal"
                  >
                    <p>
                      V.R. Dental Care is committed to providing exceptional dental services to our community. With our team of experienced professionals and modern dental technology, we strive to ensure that every patient receives personalized care and achieves a healthy, confident smile.
                    </p>
                    <p>
                      Our mission is to create a comfortable and welcoming environment where patients of all ages can receive quality dental care. We focus on preventive dentistry and provide a wide range of dental treatments to meet different oral health needs.
                    </p>
                  </motion.div>
                )}

                {activeTab === "highlights" && (
                  <motion.div
                    key="highlights"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {[
                      { title: "Experienced Staff", desc: "Our team of dental professionals brings experience and expertise to every patient interaction." },
                      { title: "Comfortable Environment", desc: "A welcoming, family-friendly atmosphere designed to reduce dental anxiety for all ages." },
                      { title: "Personalized Treatment", desc: "Care plans custom-tailored to your unique dental requirements and aesthetic goals." },
                      { title: "Preventive Care Focus", desc: "Active maintenance and early cavity inspection to preserve your natural smile." }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-borders/60 hover:border-primary/20 hover:bg-slate-50/50 transition-all duration-200 flex gap-3.5">
                        <Smile className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <h4 className="font-heading font-bold text-sm text-dark-text leading-snug">{item.title}</h4>
                          <p className="text-xs text-gray-text mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "technology" && (
                  <motion.div
                    key="technology"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    {[
                      {
                        title: "Modern Equipment",
                        desc: "We use modern dental technology to provide efficient, precise, and comfortable treatments.",
                      },
                      {
                        title: "Advanced Diagnostic Tools",
                        desc: "High-precision digital mapping and cavity inspection systems for early decay location.",
                      },
                      {
                        title: "Hygienic Sterilization Standards",
                        desc: "Rigorous sterilization and clinic cleaning guidelines to guarantee patient safety.",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          {idx !== 2 && <div className="w-[2px] h-12 bg-borders mt-1" />}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-base font-bold text-dark-text">{item.title}</span>
                          <span className="text-sm text-gray-text mt-0.5">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
