/**
 * DentPro OS — Treatment Catalogue Source of Truth
 * 
 * Defines canonical treatment categories, sub-treatments, color mappings,
 * parsing helpers, and clinical log formatters.
 */

export interface TreatmentCategoryDef {
  id: string;
  name: string;
  displayName: string;
  colorKey: string;
  aliases?: string[];
  subTreatments?: string[];
  colorDot?: string;
  colorBadge?: string;
  colorTooth?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ColorPaletteOption {
  key: string;
  label: string;
  hex: string;
  dotColor: string;
  badgeBg: string;
  toothFillClass: string;
}

export const TREATMENT_COLOR_PALETTES: ColorPaletteOption[] = [
  {
    key: "Orange",
    label: "Orange (Extractions)",
    hex: "#f97316",
    dotColor: "bg-orange-500 border-orange-600",
    badgeBg: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300",
    toothFillClass: "fill-orange-200/90 dark:fill-orange-900/60 stroke-orange-600 stroke-[1.5]",
  },
  {
    key: "Rose",
    label: "Rose / Red (Crowns)",
    hex: "#f43f5e",
    dotColor: "bg-rose-500 border-rose-600",
    badgeBg: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300",
    toothFillClass: "fill-rose-200/90 dark:fill-rose-900/60 stroke-rose-600 stroke-[1.5]",
  },
  {
    key: "Emerald",
    label: "Emerald (Scaling)",
    hex: "#10b981",
    dotColor: "bg-emerald-500 border-emerald-600",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-955/40 dark:border-emerald-800 dark:text-emerald-300",
    toothFillClass: "fill-emerald-200/90 dark:fill-emerald-900/60 stroke-emerald-600 stroke-[1.5]",
  },
  {
    key: "Fuchsia",
    label: "Fuchsia (Orthodontics / Braces)",
    hex: "#d946ef",
    dotColor: "bg-fuchsia-500 border-fuchsia-600",
    badgeBg: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-950/40 dark:border-fuchsia-800 dark:text-fuchsia-300",
    toothFillClass: "fill-fuchsia-200/90 dark:fill-fuchsia-900/60 stroke-fuchsia-600 stroke-[1.5]",
  },
  {
    key: "Indigo",
    label: "Indigo (Prosthodontics)",
    hex: "#6366f1",
    dotColor: "bg-indigo-500 border-indigo-600",
    badgeBg: "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300",
    toothFillClass: "fill-indigo-200/90 dark:fill-indigo-900/60 stroke-indigo-600 stroke-[1.5]",
  },
  {
    key: "Cyan",
    label: "Cyan (Implants)",
    hex: "#06b6d4",
    dotColor: "bg-cyan-500 border-cyan-600",
    badgeBg: "bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300",
    toothFillClass: "fill-cyan-200/90 dark:fill-cyan-900/60 stroke-cyan-600 stroke-[1.5]",
  },
  {
    key: "Amber",
    label: "Amber (Pediatric Dentistry)",
    hex: "#f59e0b",
    dotColor: "bg-amber-500 border-amber-600",
    badgeBg: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300",
    toothFillClass: "fill-amber-200/90 dark:fill-amber-900/60 stroke-amber-600 stroke-[1.5]",
  },
  {
    key: "Blue",
    label: "Blue (Root Canal)",
    hex: "#3b82f6",
    dotColor: "bg-blue-500 border-blue-600",
    badgeBg: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300",
    toothFillClass: "fill-blue-200/90 dark:fill-blue-900/60 stroke-blue-600 stroke-[1.5]",
  },
  {
    key: "Purple",
    label: "Purple (Filling)",
    hex: "#a855f7",
    dotColor: "bg-purple-500 border-purple-600",
    badgeBg: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300",
    toothFillClass: "fill-purple-200/90 dark:fill-purple-900/60 stroke-purple-600 stroke-[1.5]",
  },
  {
    key: "Sky",
    label: "Sky Blue (Consultation)",
    hex: "#0ea5e9",
    dotColor: "bg-sky-500 border-sky-600",
    badgeBg: "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300",
    toothFillClass: "fill-sky-200/90 dark:fill-sky-900/60 stroke-sky-600 stroke-[1.5]",
  },
  {
    key: "Teal",
    label: "Teal (Periodontics / Gum Care)",
    hex: "#14b8a6",
    dotColor: "bg-teal-500 border-teal-600",
    badgeBg: "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-300",
    toothFillClass: "fill-teal-200/90 dark:fill-teal-900/60 stroke-teal-600 stroke-[1.5]",
  },
  {
    key: "Violet",
    label: "Violet (Cosmetics / Veneers)",
    hex: "#8b5cf6",
    dotColor: "bg-violet-500 border-violet-600",
    badgeBg: "bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-300",
    toothFillClass: "fill-violet-200/90 dark:fill-violet-900/60 stroke-violet-600 stroke-[1.5]",
  },
  {
    key: "Pink",
    label: "Pink (Bleaching / Whitening)",
    hex: "#ec4899",
    dotColor: "bg-pink-500 border-pink-600",
    badgeBg: "bg-pink-50 border-pink-200 text-pink-800 dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-300",
    toothFillClass: "fill-pink-200/90 dark:fill-pink-900/60 stroke-pink-600 stroke-[1.5]",
  },
  {
    key: "Lime",
    label: "Lime (Preventive)",
    hex: "#84cc16",
    dotColor: "bg-lime-500 border-lime-600",
    badgeBg: "bg-lime-50 border-lime-200 text-lime-800 dark:bg-lime-950/40 dark:border-lime-800 dark:text-lime-300",
    toothFillClass: "fill-lime-200/90 dark:fill-lime-900/60 stroke-lime-600 stroke-[1.5]",
  },
  {
    key: "Red",
    label: "Red (Emergency / Trauma)",
    hex: "#ef4444",
    dotColor: "bg-red-500 border-red-600",
    badgeBg: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300",
    toothFillClass: "fill-red-200/90 dark:fill-red-900/60 stroke-red-600 stroke-[1.5]",
  },
  {
    key: "Slate",
    label: "Slate (Diagnostic / Radiology)",
    hex: "#64748b",
    dotColor: "bg-slate-500 border-slate-600",
    badgeBg: "bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
    toothFillClass: "fill-slate-200/90 dark:fill-slate-800/60 stroke-slate-600 stroke-[1.5]",
  },
];

export const TREATMENT_CATEGORIES: TreatmentCategoryDef[] = [
  {
    id: "extractions",
    name: "Extractions",
    displayName: "Extractions",
    colorKey: "Extraction",
    colorDot: "bg-orange-500 border-orange-600",
    colorBadge: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300",
    colorTooth: "fill-orange-200/90 dark:fill-orange-900/60 stroke-orange-600 stroke-[1.5]",
    aliases: ["Extraction"],
    subTreatments: [
      "Simple extraction",
      "Surgical extraction"
    ],
    sortOrder: 1,
    isActive: true
  },
  {
    id: "crowns",
    name: "Crowns",
    displayName: "Crowns",
    colorKey: "Crown",
    colorDot: "bg-rose-500 border-rose-600",
    colorBadge: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300",
    colorTooth: "fill-rose-200/90 dark:fill-rose-900/60 stroke-rose-600 stroke-[1.5]",
    aliases: ["Crown"],
    subTreatments: [
      "Temporary crown",
      "PFM (Porcelain Fused to Metal)",
      "MLS 5Y",
      "MLS 10Y",
      "E-max",
      "Zirconium / Zirconia",
      "Crown recementation"
    ],
    sortOrder: 2,
    isActive: true
  },
  {
    id: "scaling",
    name: "Scaling",
    displayName: "Scaling",
    colorKey: "Scaling",
    colorDot: "bg-emerald-500 border-emerald-600",
    colorBadge: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-955/40 dark:border-emerald-800 dark:text-emerald-300",
    colorTooth: "fill-emerald-200/90 dark:fill-emerald-900/60 stroke-emerald-600 stroke-[1.5]",
    subTreatments: [
      "Scaling — 1 sitting",
      "Scaling — 2 sittings"
    ],
    sortOrder: 3,
    isActive: true
  },
  {
    id: "orthodontics",
    name: "Orthodontic Treatments",
    displayName: "Orthodontic Treatments",
    colorKey: "Braces",
    colorDot: "bg-fuchsia-500 border-fuchsia-600",
    colorBadge: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-950/40 dark:border-fuchsia-800 dark:text-fuchsia-300",
    colorTooth: "fill-fuchsia-200/90 dark:fill-fuchsia-900/60 stroke-fuchsia-600 stroke-[1.5]",
    aliases: ["Braces", "Orthodontics"],
    subTreatments: [
      "Metal braces",
      "Ceramic braces",
      "Self-ligating braces",
      "Aligners"
    ],
    sortOrder: 4,
    isActive: true
  },
  {
    id: "prosthodontics",
    name: "Prosthodontic Treatments",
    displayName: "Prosthodontic Treatments",
    colorKey: "Prosthodontic Treatments",
    colorDot: "bg-indigo-500 border-indigo-600",
    colorBadge: "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300",
    colorTooth: "fill-indigo-200/90 dark:fill-indigo-900/60 stroke-indigo-600 stroke-[1.5]",
    aliases: ["Prosthodontics"],
    subTreatments: [
      "RPD (Removable Partial Denture)",
      "CD – Metal",
      "BPS (Biofunctional Prosthetic System denture)",
      "FPD — Metal",
      "FPD — Ceramic"
    ],
    sortOrder: 5,
    isActive: true
  },
  {
    id: "implants",
    name: "Implants",
    displayName: "Implants",
    colorKey: "Implant",
    colorDot: "bg-cyan-500 border-cyan-600",
    colorBadge: "bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300",
    colorTooth: "fill-cyan-200/90 dark:fill-cyan-900/60 stroke-cyan-600 stroke-[1.5]",
    aliases: ["Implant"],
    subTreatments: [
      "Full-mouth implants",
      "Single-tooth implant"
    ],
    sortOrder: 6,
    isActive: true
  },
  {
    id: "pediatric",
    name: "Pediatric Dentistry",
    displayName: "Pediatric Dentistry",
    colorKey: "Pediatric Dentistry",
    colorDot: "bg-amber-500 border-amber-600",
    colorBadge: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300",
    colorTooth: "fill-amber-200/90 dark:fill-amber-900/60 stroke-amber-600 stroke-[1.5]",
    aliases: ["Pediatric"],
    subTreatments: [
      "Pulpectomy"
    ],
    sortOrder: 7,
    isActive: true
  },
  {
    id: "root-canal",
    name: "Root Canal",
    displayName: "Root Canal",
    colorKey: "Root Canal",
    colorDot: "bg-blue-500 border-blue-600",
    colorBadge: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300",
    colorTooth: "fill-blue-200/90 dark:fill-blue-900/60 stroke-blue-600 stroke-[1.5]",
    sortOrder: 8,
    isActive: true
  },
  {
    id: "filling",
    name: "Filling",
    displayName: "Filling",
    colorKey: "Filling",
    colorDot: "bg-purple-500 border-purple-600",
    colorBadge: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300",
    colorTooth: "fill-purple-200/90 dark:fill-purple-900/60 stroke-purple-600 stroke-[1.5]",
    sortOrder: 9,
    isActive: true
  },
  {
    id: "consultation",
    name: "Consultation",
    displayName: "Consultation",
    colorKey: "Consultation",
    colorDot: "bg-sky-500 border-sky-600",
    colorBadge: "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300",
    colorTooth: "fill-sky-200/90 dark:fill-sky-900/60 stroke-sky-600 stroke-[1.5]",
    sortOrder: 10,
    isActive: true
  }
];

let dynamicCatalogue: TreatmentCategoryDef[] = [...TREATMENT_CATEGORIES];

export function setDynamicCatalogue(cats: TreatmentCategoryDef[]): void {
  if (Array.isArray(cats) && cats.length > 0) {
    dynamicCatalogue = cats;
  }
}

export function getDynamicCatalogue(): TreatmentCategoryDef[] {
  return dynamicCatalogue;
}

export function getColorPaletteByKey(key?: string): ColorPaletteOption {
  if (!key) return TREATMENT_COLOR_PALETTES[7]; // Default Blue
  const found = TREATMENT_COLOR_PALETTES.find(
    p => p.key.toLowerCase() === key.toLowerCase() || p.label.toLowerCase().includes(key.toLowerCase())
  );
  return found || TREATMENT_COLOR_PALETTES[7];
}

/**
 * Finds a category definition by category name, alias, or child sub-treatment.
 */
export function findCategory(nameOrSub: string, customList?: TreatmentCategoryDef[]): TreatmentCategoryDef | undefined {
  if (!nameOrSub) return undefined;
  const clean = nameOrSub.trim().toLowerCase();
  const list = customList && customList.length > 0 ? customList : dynamicCatalogue;

  // 1. Direct match by name or id
  const direct = list.find(c => c.name.toLowerCase() === clean || c.id.toLowerCase() === clean);
  if (direct) return direct;

  // 2. Match by alias
  const byAlias = list.find(c =>
    c.aliases?.some(a => a.toLowerCase() === clean)
  );
  if (byAlias) return byAlias;

  // 3. Match by sub-treatment item
  const bySub = list.find(c =>
    c.subTreatments?.some(s => s.toLowerCase() === clean)
  );
  if (bySub) return bySub;

  // 4. Substring / partial match
  const partial = list.find(c =>
    clean.includes(c.name.toLowerCase()) ||
    c.name.toLowerCase().includes(clean) ||
    c.aliases?.some(a => clean.includes(a.toLowerCase()))
  );
  if (partial) return partial;

  // 5. Fallback to default TREATMENT_CATEGORIES if not in dynamic list
  if (list !== TREATMENT_CATEGORIES) {
    return findCategory(nameOrSub, TREATMENT_CATEGORIES);
  }

  return undefined;
}

export interface ParsedTreatmentEntry {
  category: string;
  subTreatment?: string;
  status: "Planned" | "In Progress" | "Completed";
  colorKey: string;
  raw: string;
}

/**
 * Parses any treatment string stored on a tooth into structured category,
 * sub-treatment, status, and color mapping.
 */
export function parseTreatmentEntry(statusStr: string, customList?: TreatmentCategoryDef[]): ParsedTreatmentEntry {
  const raw = String(statusStr || "").trim();
  if (!raw) {
    return {
      category: "Unknown",
      status: "Planned",
      colorKey: "Consultation",
      raw
    };
  }

  // Extract status if enclosed in parentheses or at end of string
  let status: "Planned" | "In Progress" | "Completed" = "Planned";
  let content = raw;

  if (raw.includes("(Completed)") || raw.toLowerCase().includes("completed")) {
    status = "Completed";
    content = raw.replace(/\(Completed\)/gi, "").replace(/completed/gi, "").trim();
  } else if (raw.includes("(In Progress)") || raw.toLowerCase().includes("in progress")) {
    status = "In Progress";
    content = raw.replace(/\(In Progress\)/gi, "").replace(/in progress/gi, "").trim();
  } else if (raw.includes("(Planned)") || raw.toLowerCase().includes("planned")) {
    status = "Planned";
    content = raw.replace(/\(Planned\)/gi, "").replace(/planned/gi, "").trim();
  }

  content = content.replace(/\s*\([^)]*\)/g, "").trim();

  // Check if content has delimiter like " — " or " : " or " - "
  let catPart = "";
  let subPart = "";

  if (content.includes(" — ")) {
    const parts = content.split(" — ");
    catPart = parts[0].trim();
    subPart = parts.slice(1).join(" — ").trim();
  } else if (content.includes(" : ")) {
    const parts = content.split(" : ");
    catPart = parts[0].trim();
    subPart = parts.slice(1).join(" : ").trim();
  } else if (content.includes(": ")) {
    const parts = content.split(": ");
    catPart = parts[0].trim();
    subPart = parts.slice(1).join(": ").trim();
  } else {
    // Single term: check if it's a known sub-treatment
    const list = customList && customList.length > 0 ? customList : dynamicCatalogue;
    const catDefBySub = list.find(c =>
      c.subTreatments?.some(s => s.toLowerCase() === content.toLowerCase())
    );
    if (catDefBySub) {
      catPart = catDefBySub.name;
      subPart = content;
    } else {
      catPart = content;
    }
  }

  const categoryDef = findCategory(catPart, customList) || findCategory(subPart, customList);
  const finalCategory = categoryDef ? categoryDef.name : (catPart || "Treatment");
  const colorKey = categoryDef ? categoryDef.colorKey : finalCategory;

  return {
    category: finalCategory,
    subTreatment: subPart || undefined,
    status,
    colorKey,
    raw
  };
}

/**
 * Builds the canonical string representation for tooth storage and logs.
 */
export function buildTreatmentEntryString(
  categoryName: string,
  subTreatment?: string | null,
  status: string = "Planned"
): string {
  const cat = categoryName.trim();
  const sub = subTreatment?.trim();
  if (sub) {
    return `${cat} — ${sub} (${status})`;
  }
  return `${cat} (${status})`;
}
