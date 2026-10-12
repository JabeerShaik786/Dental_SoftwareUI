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
}

export const TREATMENT_CATEGORIES: TreatmentCategoryDef[] = [
  {
    id: "extractions",
    name: "Extractions",
    displayName: "Extractions",
    colorKey: "Extraction",
    aliases: ["Extraction"],
    subTreatments: [
      "Simple extraction",
      "Surgical extraction"
    ]
  },
  {
    id: "crowns",
    name: "Crowns",
    displayName: "Crowns",
    colorKey: "Crown",
    aliases: ["Crown"],
    subTreatments: [
      "Temporary crown",
      "PFM (Porcelain Fused to Metal)",
      "MLS 5Y",
      "MLS 10Y",
      "E-max",
      "Zirconium / Zirconia",
      "Crown recementation"
    ]
  },
  {
    id: "scaling",
    name: "Scaling",
    displayName: "Scaling",
    colorKey: "Scaling",
    subTreatments: [
      "Scaling — 1 sitting",
      "Scaling — 2 sittings"
    ]
  },
  {
    id: "orthodontics",
    name: "Orthodontic Treatments",
    displayName: "Orthodontic Treatments",
    colorKey: "Braces",
    aliases: ["Braces", "Orthodontics"],
    subTreatments: [
      "Metal braces",
      "Ceramic braces",
      "Self-ligating braces",
      "Aligners"
    ]
  },
  {
    id: "prosthodontics",
    name: "Prosthodontic Treatments",
    displayName: "Prosthodontic Treatments",
    colorKey: "Prosthodontic Treatments",
    aliases: ["Prosthodontics"],
    subTreatments: [
      "RPD (Removable Partial Denture)",
      "CD – Metal",
      "BPS (Biofunctional Prosthetic System denture)",
      "FPD — Metal",
      "FPD — Ceramic"
    ]
  },
  {
    id: "implants",
    name: "Implants",
    displayName: "Implants",
    colorKey: "Implant",
    aliases: ["Implant"],
    subTreatments: [
      "Full-mouth implants",
      "Single-tooth implant"
    ]
  },
  {
    id: "pediatric",
    name: "Pediatric Dentistry",
    displayName: "Pediatric Dentistry",
    colorKey: "Pediatric Dentistry",
    aliases: ["Pediatric"],
    subTreatments: [
      "Pulpectomy"
    ]
  },
  // Categories without sub-treatments (preserved as-is)
  {
    id: "root-canal",
    name: "Root Canal",
    displayName: "Root Canal",
    colorKey: "Root Canal"
  },
  {
    id: "filling",
    name: "Filling",
    displayName: "Filling",
    colorKey: "Filling"
  },
  {
    id: "consultation",
    name: "Consultation",
    displayName: "Consultation",
    colorKey: "Consultation"
  }
];

/**
 * Finds a category definition by category name, alias, or child sub-treatment.
 */
export function findCategory(nameOrSub: string): TreatmentCategoryDef | undefined {
  if (!nameOrSub) return undefined;
  const clean = nameOrSub.trim().toLowerCase();

  // 1. Direct match by name
  const direct = TREATMENT_CATEGORIES.find(c => c.name.toLowerCase() === clean);
  if (direct) return direct;

  // 2. Match by alias
  const byAlias = TREATMENT_CATEGORIES.find(c =>
    c.aliases?.some(a => a.toLowerCase() === clean)
  );
  if (byAlias) return byAlias;

  // 3. Match by sub-treatment item
  const bySub = TREATMENT_CATEGORIES.find(c =>
    c.subTreatments?.some(s => s.toLowerCase() === clean)
  );
  if (bySub) return bySub;

  // 4. Substring / partial match
  return TREATMENT_CATEGORIES.find(c =>
    clean.includes(c.name.toLowerCase()) ||
    c.name.toLowerCase().includes(clean) ||
    c.aliases?.some(a => clean.includes(a.toLowerCase()))
  );
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
 * Handles:
 *  - "Crown — Temporary crown (Planned)"
 *  - "Crown: Temporary crown (Planned)"
 *  - "Temporary crown (Planned)"
 *  - "Root Canal (Planned)"
 *  - "Root Canal Completed"
 */
export function parseTreatmentEntry(statusStr: string): ParsedTreatmentEntry {
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
    const catDefBySub = TREATMENT_CATEGORIES.find(c =>
      c.subTreatments?.some(s => s.toLowerCase() === content.toLowerCase())
    );
    if (catDefBySub) {
      catPart = catDefBySub.name;
      subPart = content;
    } else {
      catPart = content;
    }
  }

  const categoryDef = findCategory(catPart) || findCategory(subPart);
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
