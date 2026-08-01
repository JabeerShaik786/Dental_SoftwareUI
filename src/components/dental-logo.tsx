import React from "react";

interface DentalLogoProps {
  className?: string;
  showText?: boolean;
  collapsed?: boolean;
}

export function DentalLogo({ className = "", showText = true, collapsed = false }: DentalLogoProps) {
  return (
    <div className={`flex items-center transition-all duration-300 ${collapsed ? "gap-2" : "gap-2"} ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md shadow-blue-500/20 transition-all duration-300 ${
        collapsed ? "h-8 w-8" : "h-10 w-10"
      }`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-white transition-all duration-300 ${collapsed ? "h-4.5 w-4.5" : "h-5.5 w-5.5"}`}
        >
          {/* Modern flat healthcare medical plus icon */}
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <div className={`flex flex-col text-left transition-all duration-300 ease-in-out origin-left ${
        showText ? "opacity-100 w-auto min-w-0" : "opacity-0 max-w-0 overflow-hidden pointer-events-none"
      }`}>
        <span className="text-[18px] font-bold tracking-tight text-[#0F172A] dark:text-white leading-none whitespace-nowrap">
          Health OS
        </span>
      </div>
    </div>
  );
}
