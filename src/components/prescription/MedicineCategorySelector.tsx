"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Check,
  X,
  Pill,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  MEDICINE_CATEGORIES,
  MedicineCategory,
  getCategoryForMedicine,
} from "@/lib/medicineCatalogue";

export interface MedicineSelectOption {
  id: string;
  name: string;
  category?: string;
  dosage_form?: string;
  stock_unit?: string;
  is_active?: boolean;
}

interface MedicineCategorySelectorProps {
  value: string;
  onChange: (medicineName: string, medicineOption?: MedicineSelectOption) => void;
  medicines: MedicineSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const MedicineCategorySelector: React.FC<MedicineCategorySelectorProps> = ({
  value,
  onChange,
  medicines,
  placeholder = "-- Select from Medicine Catalogue --",
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
      setSelectedCategory(null);
    }
  }, [isOpen]);

  // Active medicines only
  const activeMedicines = useMemo(() => {
    return medicines.filter((m) => m.is_active !== false);
  }, [medicines]);

  // Map medicines to categories
  const medicinesByCategory = useMemo(() => {
    const map: Record<MedicineCategory, MedicineSelectOption[]> = {
      "Tablets / Capsules": [],
      "Syrups / Suspensions": [],
      "Ointments / Gels": [],
      "Mouthwashes": [],
      "Toothpastes": [],
      "Kids' Products": [],
      "Brushes": [],
    };

    activeMedicines.forEach((med) => {
      const cat = getCategoryForMedicine(med.name, med.category);
      if (map[cat]) {
        map[cat].push(med);
      } else {
        // Fallback
        map["Tablets / Capsules"].push(med);
      }
    });

    // Sort medicines alphabetically within each category
    Object.keys(map).forEach((k) => {
      map[k as MedicineCategory].sort((a, b) => a.name.localeCompare(b.name));
    });

    return map;
  }, [activeMedicines]);

  // Search results across ALL categories
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return activeMedicines.filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(query);
      const catMatch = m.category?.toLowerCase().includes(query);
      const formMatch = m.dosage_form?.toLowerCase().includes(query);
      return nameMatch || catMatch || formMatch;
    });
  }, [activeMedicines, searchQuery]);

  const handleSelectMedicine = (med: MedicineSelectOption) => {
    onChange(med.name, med);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", undefined);
  };

  // Find currently selected medicine details
  const selectedMedObj = useMemo(() => {
    if (!value) return null;
    return medicines.find((m) => m.name.toLowerCase() === value.toLowerCase());
  }, [medicines, value]);

  const selectedCategoryName = selectedMedObj
    ? getCategoryForMedicine(selectedMedObj.name, selectedMedObj.category)
    : null;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`mt-1 flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-left shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer"
        } ${isOpen ? "ring-2 ring-blue-500/20 border-blue-500" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 overflow-hidden mr-1">
          {value ? (
            <>
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {value}
              </span>
              {selectedCategoryName && (
                <span className="shrink-0 text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedCategoryName}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange("", undefined);
                }
              }}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear selection"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-500" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 w-full min-w-[280px] sm:min-w-[340px] max-w-[420px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 dark:border-slate-800 dark:bg-slate-950"
          role="dialog"
        >
          {/* Top Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all medicines by name..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* VIEW A: Search Results Active */}
          {searchQuery.trim().length > 0 ? (
            <div className="max-h-60 overflow-y-auto scrollbar-thin space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                <span>Matching Medicines</span>
                <span>{searchResults.length} found</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                  <HelpCircle className="h-5 w-5 mx-auto text-slate-300 dark:text-slate-600" />
                  <p>No medicines match "{searchQuery}"</p>
                  <p className="text-[10px] text-slate-400">Try searching with a generic or brand keyword</p>
                </div>
              ) : (
                searchResults.map((med) => {
                  const isSelected = value.toLowerCase() === med.name.toLowerCase();
                  const cat = getCategoryForMedicine(med.name, med.category);
                  return (
                    <button
                      key={med.id || med.name}
                      type="button"
                      onClick={() => handleSelectMedicine(med)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate font-medium">{med.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {cat}
                          </span>
                          {med.dosage_form && (
                            <span className="text-[9px] text-slate-400">
                              • {med.dosage_form}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          ) : selectedCategory ? (
            /* VIEW B: Drilled Down into a Category */
            <div className="space-y-1">
              {/* Category Header with Back Button */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1 px-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Categories
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {selectedCategory}
                </span>
              </div>

              {/* Medicines in Selected Category */}
              <div className="max-h-60 overflow-y-auto scrollbar-thin space-y-1">
                {medicinesByCategory[selectedCategory].length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No medicines currently in this category.
                  </div>
                ) : (
                  medicinesByCategory[selectedCategory].map((med) => {
                    const isSelected = value.toLowerCase() === med.name.toLowerCase();
                    return (
                      <button
                        key={med.id || med.name}
                        type="button"
                        onClick={() => handleSelectMedicine(med)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="truncate font-medium">{med.name}</span>
                          {med.dosage_form && (
                            <span className="text-[10px] text-slate-400">
                              {med.dosage_form}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* VIEW C: Initial State - 7 Categories List */
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
                <span>Select Medicine Category</span>
                <span>{MEDICINE_CATEGORIES.length} Categories</span>
              </div>

              <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-0.5">
                {MEDICINE_CATEGORIES.map((cat) => {
                  const count = medicinesByCategory[cat]?.length || 0;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-blue-400 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Pill className="h-3.5 w-3.5 text-blue-500 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="truncate">{cat}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-normal bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {count}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
