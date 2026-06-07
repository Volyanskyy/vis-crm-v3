export function slugCode(value: string | null | undefined, fallback: string) {
    const source = (value ?? fallback).trim().toLowerCase();
  
    return source
      .replace(/['’"]/g, "")
      .replace(/[^a-z0-9а-яіїєґ]+/giu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }
  
  export function normalizeStatus(value?: string | null) {
    const status = (value ?? "").trim().toLowerCase();
  
    if (["active", "published", "approved"].includes(status)) {
      return "ACTIVE" as const;
    }
  
    return "ARCHIVED" as const;
  }
  