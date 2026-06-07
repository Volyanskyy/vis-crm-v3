export function isTruthyFlag(value?: string | null) {
    return value === "t" || value === "true" || value === "1";
  }
  
  export function nullable(value?: string | null) {
    const normalized = value?.trim() ?? "";
    return normalized.length > 0 ? normalized : null;
  }
  
  export function toInt(value?: string | null, fallback = 0) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  
  export function toDate(value?: string | null) {
    const normalized = nullable(value);
    return normalized ? new Date(normalized) : null;
  }
  