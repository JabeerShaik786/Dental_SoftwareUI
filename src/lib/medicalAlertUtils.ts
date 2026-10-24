export interface MedicalAlertPatientData {
  allergies?: string;
  medicalNotes?: string;
  medicalConditions?: string;
  medicalHistory?: string[];
  medicalHistoryOthers?: string;
}

const PLACEHOLDER_VALUES = new Set([
  "",
  "none",
  "n/a",
  "na",
  "nil",
  "no",
  "-",
  "--",
  "null",
  "undefined",
  "normal",
]);

function isPlaceholder(val: string): boolean {
  return PLACEHOLDER_VALUES.has(val.trim().toLowerCase());
}

/**
 * Strips redundant prefixes like "Conditions:", "Condition:", "Others:", "Allergies:", "Allergy:"
 * case-insensitively.
 */
function stripPrefix(str: string): string {
  let s = str.trim();
  // Strip "Conditions:" or "Condition:"
  s = s.replace(/^conditions?\s*:\s*/i, "").trim();
  // Strip "Others:" or "Other:"
  s = s.replace(/^others?\s*:\s*/i, "").trim();
  // Strip "Allergies:" or "Allergy:"
  s = s.replace(/^allergies?\s*:\s*/i, "").trim();
  return s;
}

/**
 * Resolves a clean, deduplicated medical alert string from patient clinical data.
 * - Removes the redundant "Conditions:" prefix.
 * - Strips redundant field labels like "Others:" and "Allergies:".
 * - Deduplicates alerts case-insensitively (e.g. "Diabetes, Thyroid, Diabetes, Thyroid" -> "Diabetes, Thyroid").
 * - Filters out empty/placeholder values like "None", "N/A", "-".
 * - Returns "" when there are no valid medical alerts.
 */
export function getCleanMedicalAlert(patient?: MedicalAlertPatientData | null): string {
  if (!patient) return "";

  const items: string[] = [];

  const processText = (text?: string) => {
    if (!text || typeof text !== "string") return;
    const trimmed = text.trim();
    if (isPlaceholder(trimmed)) return;

    // Handle pipe-separated segments (e.g. "Allergies: Sulfa | Conditions: Diabetes | Meds: Metformin")
    const segments = trimmed.includes("|") ? trimmed.split("|") : [trimmed];

    for (const seg of segments) {
      const cleanSeg = seg.trim();
      if (isPlaceholder(cleanSeg)) continue;

      // If segment is "Meds: None" or similar, skip
      const medsMatch = cleanSeg.match(/^meds?\s*:\s*(.*)$/i);
      if (medsMatch) {
        const medsVal = medsMatch[1].trim();
        if (isPlaceholder(medsVal)) continue;
        const cleanMeds = stripPrefix(medsVal);
        if (cleanMeds && !isPlaceholder(cleanMeds)) {
          items.push(cleanMeds);
        }
        continue;
      }

      // Strip redundant prefix e.g. "Conditions: Diabetes, Thyroid" -> "Diabetes, Thyroid"
      const unPrefixed = stripPrefix(cleanSeg);
      if (!unPrefixed || isPlaceholder(unPrefixed)) continue;

      // May contain comma-separated entries e.g. "Diabetes, Thyroid"
      const tokens = unPrefixed.split(",");
      for (const tok of tokens) {
        const cleanTok = stripPrefix(tok.trim());
        if (cleanTok && !isPlaceholder(cleanTok)) {
          items.push(cleanTok);
        }
      }
    }
  };

  // 1. Allergies
  if (patient.allergies) {
    processText(patient.allergies);
  }

  // 2. Medical Conditions
  if (patient.medicalConditions) {
    processText(patient.medicalConditions);
  }

  // 3. Medical History array
  if (Array.isArray(patient.medicalHistory)) {
    for (const hist of patient.medicalHistory) {
      processText(hist);
    }
  }

  // 4. Medical History Others
  if (patient.medicalHistoryOthers) {
    processText(patient.medicalHistoryOthers);
  }

  // 5. Medical Notes (e.g. "Conditions: Diabetes, Thyroid")
  if (patient.medicalNotes) {
    processText(patient.medicalNotes);
  }

  // Deduplicate case-insensitively while preserving first encounter's exact display casing
  const seen = new Set<string>();
  const deduplicated: string[] = [];

  for (const item of items) {
    const key = item.toLowerCase().trim();
    if (!key || isPlaceholder(key)) continue;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item.trim());
    }
  }

  return deduplicated.join(", ");
}
