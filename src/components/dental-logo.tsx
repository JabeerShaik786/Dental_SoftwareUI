import React from "react";
import Image from "next/image";
import { getAssetPath } from "@/lib/getAssetPath";

interface DentalLogoProps {
  className?: string;
  showText?: boolean;
  collapsed?: boolean;
}

export function DentalLogo({ className = "", showText = true, collapsed = false }: DentalLogoProps) {
  return (
    <div className={`flex items-center transition-all duration-300 ${collapsed ? "gap-2" : "gap-2.5"} ${className}`}>
      <div className={`relative shrink-0 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 transition-all duration-300 ${
        collapsed ? "h-8 w-8" : "h-10 w-10"
      }`}>
        <Image
          src={getAssetPath("/dentpro-icon.png")}
          alt="DentPro OS Logo"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>
      <div className={`flex flex-col text-left transition-all duration-300 ease-in-out origin-left ${
        showText ? "opacity-100 w-auto min-w-0" : "opacity-0 max-w-0 overflow-hidden pointer-events-none"
      }`}>
        <span className="text-[18px] font-bold tracking-tight text-[#0F172A] dark:text-white leading-none whitespace-nowrap">
          DentPro OS
        </span>
      </div>
    </div>
  );
}
