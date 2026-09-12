"use client";

import Image from "next/image";
import { getAssetPath } from "@/lib/getAssetPath";

export default function AboutSection() {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#contact") || document.querySelector("#consultancy");
    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="about" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Subtle oversized dental / wave watermark graphic in the background */}
      <div className="absolute right-[-10%] top-[10%] w-[600px] h-[600px] opacity-[0.035] pointer-events-none select-none">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-[#0284c7]" strokeWidth="2">
          <circle cx="100" cy="100" r="90" />
          <path d="M50 100 Q 100 20 150 100 T 250 100" />
          <path d="M40 120 C 70 60, 130 60, 160 120 C 130 180, 70 180, 40 120 Z" />
        </svg>
      </div>

      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Large Rounded Clinic Interior Image */}
          <div className="lg:col-span-6 w-full">
            <div className="relative w-full aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl shadow-slate-200/70 border border-slate-100">
              <Image
                src={getAssetPath("/about_reception.jpg")}
                alt="VR Dental Care Clinic Interior Reception"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* RIGHT: Typography & Content */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* 14 YEARS OF EXCELLENCE with underline under 14 YEARS */}
            <div className="mb-4">
              <span className="relative inline-block text-xs md:text-sm font-bold tracking-[0.16em] uppercase pb-1 text-[#0f2942]">
                <span className="relative text-[#0284c7]">
                  14 YEARS
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#0284c7] rounded-full" />
                </span>
                <span className="ml-2 font-bold text-[#0f2942]">OF EXCELLENCE</span>
              </span>
            </div>

            {/* Main Section Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0f2942] tracking-tight leading-[1.18] mb-6">
              Caring for Your Smile<br />
              <span className="text-[#0284c7]">Since 2011</span>
            </h2>

            {/* Description Paragraph */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal mb-8 max-w-xl">
              At VR Dental Care, we have been transforming smiles and enhancing oral health for over 14 years. Established in 2011, our clinic has been a trusted name in advanced dental care, providing high-quality treatments with a patient-first approach.
            </p>

            {/* Blue Gradient Read More Button */}
            <div>
              <a
                href="#contact"
                onClick={scrollToContact}
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Read More
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
