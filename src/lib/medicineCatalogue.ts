export const MEDICINE_CATEGORIES = [
  "Tablets / Capsules",
  "Syrups / Suspensions",
  "Ointments / Gels",
  "Mouthwashes",
  "Toothpastes",
  "Kids' Products",
  "Brushes",
] as const;

export type MedicineCategory = (typeof MEDICINE_CATEGORIES)[number];

export interface CatalogueMedicineDefinition {
  name: string;
  category: MedicineCategory;
  dosage_form: string;
  stock_unit: string;
  spellingNote?: string;
}

export const INITIAL_MEDICINES_CATALOGUE: CatalogueMedicineDefinition[] = [
  // A. Tablets / Capsules (19)
  { name: "Rabross DSR", category: "Tablets / Capsules", dosage_form: "Capsule", stock_unit: "capsules" },
  { name: "Moxclav 625 mg", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Metrogyl 600 mg", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Hifenac D", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Zymoflam D", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Wynox 300 mg", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Rexfix 200 mg", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Ketof-DT", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Paracetamol 650 mg", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Paracetamol 500 mg", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Paracetamol 250 mg", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Moxclav 375 mg", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Isolin Junior", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets", spellingNote: "Flagged: uncertain spelling, needs confirmation" },
  { name: "Hifenac TH", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Chymerol Forte", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Ultracet", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "Zilo", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "SM Fibro", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },
  { name: "DoxT-SL", category: "Tablets / Capsules", dosage_form: "Tablet", stock_unit: "tablets" },

  // B. Syrups / Suspensions (2)
  { name: "Augmentin Duo", category: "Syrups / Suspensions", dosage_form: "Syrup", stock_unit: "bottles" },
  { name: "Flexon Suspension", category: "Syrups / Suspensions", dosage_form: "Suspension", stock_unit: "bottles" },

  // C. Ointments / Gels (4)
  { name: "Dentogel", category: "Ointments / Gels", dosage_form: "Gel", stock_unit: "tubes" },
  { name: "Kenacort Gel", category: "Ointments / Gels", dosage_form: "Gel", stock_unit: "tubes" },
  { name: "Gumloc", category: "Ointments / Gels", dosage_form: "Gel / Ointment", stock_unit: "tubes" },
  { name: "Multident", category: "Ointments / Gels", dosage_form: "Gel / Ointment", stock_unit: "tubes" },

  // D. Mouthwashes (2)
  { name: "Senquel-AD", category: "Mouthwashes", dosage_form: "Mouthwash", stock_unit: "bottles", spellingNote: "Flagged: uncertain spelling (Sangue… AD / Senquel-AD), needs confirmation" },
  { name: "Chlorhex ADS", category: "Mouthwashes", dosage_form: "Mouthwash", stock_unit: "bottles" },

  // E. Toothpastes (3)
  { name: "Vantej", category: "Toothpastes", dosage_form: "Toothpaste", stock_unit: "tubes" },
  { name: "Hydent Pro", category: "Toothpastes", dosage_form: "Toothpaste", stock_unit: "tubes" },
  { name: "Stolin R", category: "Toothpastes", dosage_form: "Toothpaste", stock_unit: "tubes" },

  // F. Kids' Products (3)
  { name: "Cheerio Gel", category: "Kids' Products", dosage_form: "Gel", stock_unit: "tubes" },
  { name: "Oro Champ", category: "Kids' Products", dosage_form: "Syrup / Gel", stock_unit: "bottles" },
  { name: "Kidodent", category: "Kids' Products", dosage_form: "Toothpaste / Gel", stock_unit: "tubes" },

  // G. Brushes (2)
  { name: "Thermoseal Proxa NS/WS Interdental Brushes", category: "Brushes", dosage_form: "Interdental Brush", stock_unit: "packs" },
  { name: "Colgate Slim Soft", category: "Brushes", dosage_form: "Toothbrush", stock_unit: "pieces" },
];

/**
 * Old 11 mock medicine names that must be explicitly excluded from default catalogue
 */
export const OLD_MOCK_MEDICINE_NAMES = new Set([
  "roles-d",
  "taxim-o 200",
  "acecloren",
  "zerodol-mr",
  "flagyl 400",
  "zerodol-sp",
  "orahex-dg",
  "sensodent-k",
  "orohealth toothpaste",
  "ornigreat gel",
  "flagyl gel",
]);

/**
 * Helper to check if a medicine name was part of the legacy 11 mocks
 */
export function isOldMockMedicine(name: string): boolean {
  if (!name) return false;
  return OLD_MOCK_MEDICINE_NAMES.has(name.trim().toLowerCase());
}

/**
 * Returns category for a known medicine, defaulting to "Tablets / Capsules"
 */
export function getCategoryForMedicine(name: string, fallbackCategory?: string): MedicineCategory {
  if (fallbackCategory && (MEDICINE_CATEGORIES as readonly string[]).includes(fallbackCategory)) {
    return fallbackCategory as MedicineCategory;
  }
  const clean = name.trim().toLowerCase();
  const match = INITIAL_MEDICINES_CATALOGUE.find((m) => m.name.toLowerCase() === clean);
  return match ? match.category : "Tablets / Capsules";
}
