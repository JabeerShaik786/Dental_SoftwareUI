"use client";

import React, { useEffect } from "react";
import { ArrowLeft, X, Check, CheckCircle2 } from "lucide-react";
import { TreatmentCategoryDef } from "@/lib/treatmentCatalogue";

interface SubTreatmentModalProps {
  category: TreatmentCategoryDef;
  selectedSubTreatment?: string | null;
  onSelectSubTreatment: (subTreatment: string) => void;
  onClose: () => void;
  onSelectAllTeeth?: (subTreatment: string) => void;
  colorDotClass?: string;
}

/**
 * Compact modal/popover that displays the sub-treatments for a selected parent category.
 * Prevents clipping by using a fixed portal/overlay on top of the chart container,
 * with clear back navigation and mobile responsiveness.
 */
export const SubTreatmentModal: React.FC<SubTreatmentModalProps> = ({
  category,
  selectedSubTreatment,
  onSelectSubTreatment,
  onClose,
  onSelectAllTeeth,
  colorDotClass = "bg-blue-500 border-blue-600"
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const subTreatments = category.subTreatments || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transition-all duration-200 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sub-treatment-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1 -ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-3 h-3 rounded-full ${colorDotClass} shrink-0`} />
              <h3
                id="sub-treatment-title"
                className="text-sm font-bold text-slate-900 dark:text-white truncate"
              >
                {category.displayName}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Select a sub-treatment procedure to activate:
          </p>
        </div>

        {/* Sub-Treatments List */}
        <div className="p-3 space-y-1.5 max-h-[320px] overflow-y-auto scrollbar-thin">
          {subTreatments.map((sub) => {
            const isSelected = selectedSubTreatment === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  onSelectSubTreatment(sub);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <span className="truncate pr-2">{sub}</span>
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                ) : (
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Optional Footer: All Teeth quick action if provided */}
        {onSelectAllTeeth && (
          <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quick Assign:</span>
            <button
              type="button"
              onClick={() => {
                const defaultSub = selectedSubTreatment || subTreatments[0];
                onSelectAllTeeth(defaultSub);
                onClose();
              }}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Assign to All Teeth
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
