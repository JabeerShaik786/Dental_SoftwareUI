"use client";

import Image from "next/image";
import { getAssetPath } from "@/lib/getAssetPath";

export default function Hero() {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector("#consultancy") || document.querySelector("#contact");
    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="home"
      className="relative w-full min-h-[580px] lg:min-h-[660px] flex items-center pt-28 pb-32 overflow-hidden bg-[#e0f1fe]"
    >
      {/* Background Image: Woman smiling with dentist instruments */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getAssetPath("/hero-bg.png")}
          alt="Perfect Smile Dental Treatment"
          fill
          className="object-cover object-[60%_center] md:object-[75%_center] lg:object-right"
          priority
          unoptimized
        />
        {/* Soft Blue/Sky Gradient Wash from left to right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#d9efff] via-[#e2f2ff]/95 md:via-[#e2f2ff]/85 via-45% to-transparent to-75% pointer-events-none" />
      </div>

      {/* Hero Content on Left (Positioned approx 80px from left on desktop) */}
      <div className="max-w-[1360px] mx-auto w-full px-6 md:px-12 lg:px-20 relative z-10">
        <div className="max-w-xl text-left flex flex-col items-start pt-6 sm:pt-10">
          
          {/* Small Uppercase Label with Blue Underline under "PERFECT" */}
          <div className="mb-4">
            <span className="relative inline-block text-xs md:text-sm font-bold tracking-[0.18em] text-[#0f2942] uppercase pb-1.5">
              <span className="relative">
                PERFECT
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#0284c7] rounded-full" />
              </span>
              <span className="ml-2 font-semibold text-[#1e293b]">SMILE</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#0f2942] tracking-tight leading-[1.12] mb-7">
            Your <span className="text-[#0284c7]">Journey</span> to a perfect<br />
            smile begins with us!
          </h1>

          {/* Blue Gradient Contact Us Button */}
          <div>
            <a
              href="#contact"
              onClick={scrollToContact}
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition-all duration-200"
            >
              Contact Us
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
