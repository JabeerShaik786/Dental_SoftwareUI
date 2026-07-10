import React from "react";

interface DentalLogoProps {
  className?: string;
  showText?: boolean;
  collapsed?: boolean;
}

export function DentalLogo({ className = "", showText = true, collapsed = false }: DentalLogoProps) {
  return (
    <div className={`flex items-center transition-all duration-300 ${collapsed ? "gap-2" : "gap-4.5"} ${className}`}>
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md shadow-blue-500/20 transition-all duration-300 ${
        collapsed ? "h-8 w-8 rounded-xl" : "h-12 w-12"
      }`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-white transition-all duration-300 ${collapsed ? "h-4.5 w-4.5" : "h-6.5 w-6.5"}`}
        >
          <path d="M12 2v20M2 12h20" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="4" fill="none" strokeWidth="1.5" className="stroke-cyan-300" />
        </svg>
        <div className={`absolute rounded-full bg-cyan-300 animate-pulse border-2 border-white transition-all duration-300 ${
          collapsed ? "-right-0.5 -top-0.5 h-2.5 w-2.5 border" : "-right-1 -top-1 h-3.5 w-3.5"
        }`} />
      </div>
      <div className={`flex flex-col text-left transition-all duration-300 ease-in-out origin-left ${
        showText ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 overflow-hidden pointer-events-none"
      }`}>
        <span className="text-[30px] font-bold tracking-[-0.02em] text-[#0F172A] dark:text-white leading-none whitespace-nowrap">
          Health <span className="text-blue-600 font-bold tracking-[-0.02em]">OS</span>
        </span>
        <span className="text-[11px] font-semibold tracking-wide text-slate-400 mt-1.5 whitespace-nowrap">
          Dental Practice Management Software
        </span>
      </div>
    </div>
  );
}
