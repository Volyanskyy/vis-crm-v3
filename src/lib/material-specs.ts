export type MaterialSpecType =
  | "cable"
  | "shield"
  | "automation"
  | "fittings"
  | "lighting"
  | "consumables"
  | "generic";

export type CableShape = "round" | "flat";

export type CableSpecParams = {
  shape?: CableShape;
  modifier?: string | null;
  conductors?: string | null;
  crossSection?: string | null;
  material?: "copper" | "aluminium" | null;
  construction?: "single" | "stranded" | "flexible" | null;
  shielding?: "utp" | "ftp" | "coax" | null;
  special?: "sip" | "armored" | "rubber" | null;
};

export type ShieldSpecParams = {
  modules?: string | null;
  rows?: string | null;
  mountType?: "flush" | "surface" | null;
  door?: "transparent" | "opaque" | null;
  ipRating?: string | null;
};

export type AutomationSpecParams = {
  type?: "MCB" | "RCD" | "RCBO" | null;
  poles?: string | null;
  current?: string | null;
  sensitivity?: string | null;
  curve?: "B" | "C" | "D" | null;
};

export type GenericSpecParams = Record<string, string | null | undefined>;

export type MaterialSpecParams =
  | CableSpecParams
  | ShieldSpecParams
  | AutomationSpecParams
  | GenericSpecParams;

const SPEC_TYPE_CATEGORY_MAP: Record<MaterialSpecType, string> = {
  cable: "Кабель, провід",
  shield: "Щит",
  automation: "Автоматика",
  fittings: "Фурнітура",
  lighting: "Освітлення",
  consumables: "Розхідні матеріали",
  generic: "Загальне",
};

export function getDefaultCategoryBySpecType(
  specType: MaterialSpecType | null | undefined,
): string | null {
  if (!specType) {
    return null;
  }

  return SPEC_TYPE_CATEGORY_MAP[specType] ?? null;
}

export function normalizeMaterialSpecType(
  value: string | null | undefined,
): MaterialSpecType | null {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (!normalized) return null;
  if (normalized === "cable") return "cable";
  if (normalized === "shield") return "shield";
  if (normalized === "automation") return "automation";
  if (normalized === "fittings") return "fittings";
  if (normalized === "lighting") return "lighting";
  if (normalized === "consumables") return "consumables";
  if (normalized === "generic") return "generic";

  return null;
}

export function inferMaterialSpecType(
  category: string | null | undefined,
): MaterialSpecType {
  const normalized = String(category ?? "").trim().toLowerCase();

  if (
    normalized.includes("кабел") ||
    normalized.includes("провід") ||
    normalized.includes("шнур") ||
    normalized.includes("wire") ||
    normalized.includes("cable")
  ) {
    return "cable";
  }

  if (
    normalized.includes("щит") ||
    normalized.includes("box") ||
    normalized.includes("panel")
  ) {
    return "shield";
  }

  if (
    normalized.includes("автомат") ||
    normalized.includes("узо") ||
    normalized.includes("пзв") ||
    normalized.includes("rcd") ||
    normalized.includes("rcbo") ||
    normalized.includes("mcb")
  ) {
    return "automation";
  }

  if (
    normalized.includes("фурнітур") ||
    normalized.includes("розет") ||
    normalized.includes("вимикач") ||
    normalized.includes("socket") ||
    normalized.includes("switch")
  ) {
    return "fittings";
  }

  if (
    normalized.includes("освіт") ||
    normalized.includes("світиль") ||
    normalized.includes("lighting") ||
    normalized.includes("light")
  ) {
    return "lighting";
  }

  if (
    normalized.includes("розхід") ||
    normalized.includes("витрат") ||
    normalized.includes("кріп") ||
    normalized.includes("стрічк") ||
    normalized.includes("гофр") ||
    normalized.includes("дюбел") ||
    normalized.includes("саморіз") ||
    normalized.includes("consumable")
  ) {
    return "consumables";
  }

  return "generic";
}

export function parseSpecParams(
  value: FormDataEntryValue | null,
): MaterialSpecParams | null {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as MaterialSpecParams;
  } catch {
    return null;
  }
}

function joinNameParts(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

export function buildMaterialDisplayName(input: {
  name: string;
  specType: MaterialSpecType;
  specParams: MaterialSpecParams | null;
}) {
  const baseName = input.name.trim();

  if (!baseName) {
    return "";
  }

  if (!input.specParams) {
    return baseName;
  }

  if (input.specType === "cable") {
    const spec = input.specParams as CableSpecParams;

    const normalizedBaseName = baseName.trim().toUpperCase();
    const shapeSuffix = spec.shape === "flat" ? "П" : null;
    const modifierSuffix = spec.modifier?.trim() || null;

    const markName = joinNameParts([normalizedBaseName, shapeSuffix]).trim();
    const markWithModifier = modifierSuffix
      ? `${markName}${modifierSuffix}`
      : markName;

    const normalizedCrossSection = spec.crossSection?.trim()
      ? spec.crossSection.trim().replace(/\./g, ",")
      : null;

    const size =
      spec.conductors?.trim() && normalizedCrossSection
        ? `${spec.conductors.trim()}х${normalizedCrossSection}`
        : normalizedCrossSection;

    const isSip = normalizedBaseName.includes("СІП");
    const isShnur = normalizedBaseName.includes("ШВВП");
    const isPvs = normalizedBaseName.includes("ПВС");
    const isPvSingle =
      normalizedBaseName.includes("ПВ-1") ||
      normalizedBaseName.includes("ПВ-3") ||
      normalizedBaseName === "ПВ1" ||
      normalizedBaseName === "ПВ3";

    if (isSip) {
      return joinNameParts([markWithModifier, size]);
    }

    if (isShnur) {
      return joinNameParts(["Шнур", markWithModifier, size]);
    }

    if (isPvs) {
      return joinNameParts(["Провід", markWithModifier, size]);
    }

    if (isPvSingle) {
      return joinNameParts(["Провід", normalizedBaseName, normalizedCrossSection]);
    }

    return joinNameParts(["Кабель", markWithModifier, size]);
  }


  if (input.specType === "shield") {
    const spec = input.specParams as ShieldSpecParams;

    return joinNameParts([
      baseName,
      spec.modules ? `${spec.modules}М` : null,
      spec.rows ? `${spec.rows}-рядний` : null,
    ]);
  }

  if (input.specType === "automation") {
    const spec = input.specParams as AutomationSpecParams;

    return joinNameParts([
      baseName,
      spec.current ? `${spec.current}А` : null,
      spec.sensitivity ? `${spec.sensitivity}мА` : null,
      spec.poles ? `${spec.poles}P` : null,
      spec.curve ?? null,
    ]);
  }

  return baseName;
}
