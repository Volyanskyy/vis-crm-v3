"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  createMaterialItemAction,
  deleteMaterialItemAction,
  updateMaterialItemAction,
  type MaterialItemActionResult,
} from "./actions";
import {
  buildMaterialDisplayName,
  getDefaultCategoryBySpecType,
  inferMaterialSpecType,
  type MaterialSpecType,
} from "@/lib/material-specs";

type BrandOption = {
  id: string;
  name: string;
};

type MaterialItemFormValue = {
  id?: string;
  materialCatalogId: string;
  code: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  brandId: string;
  technicalSpec: string;
  unit: string;
  costPrice: string;
  recommendedRetail: string;
  description: string;
  sortOrder: number;
  isInactive: boolean;
  specType?: string;
  specParams?: string;
  displayName?: string;
};

type MaterialItemFormModalProps = {
  mode?: "create" | "edit";
  triggerLabel: string;
  triggerClassName?: string;
  materialCatalogId?: string;
  initialValue?: Partial<MaterialItemFormValue>;
  brands?: BrandOption[];
  onDeleted?: (id: string) => void;
  onCreated?: () => void;
  onUpdated?: () => void;
};

const defaultValue: MaterialItemFormValue = {
  materialCatalogId: "",
  code: "",
  sku: "",
  name: "",
  category: "",
  subcategory: "",
  brandId: "",
  technicalSpec: "",
  unit: "",
  costPrice: "0.00",
  recommendedRetail: "0.00",
  description: "",
  sortOrder: 0,
  isInactive: false,
  specType: "",
  specParams: "",
  displayName: "",
};

const initialActionState: MaterialItemActionResult = {
  ok: false,
};

const inputClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-950";
const selectClassName =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-950";
const labelClassName =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500";
const textareaClassName =
  "min-h-[96px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950";

const SPEC_TYPE_OPTIONS: Array<{ value: MaterialSpecType; label: string }> = [
  { value: "cable", label: "Кабель" },
  { value: "shield", label: "Щит" },
  { value: "automation", label: "Автоматика" },
  { value: "fittings", label: "Фурнітура" },
  { value: "lighting", label: "Освітлення" },
  { value: "consumables", label: "Розхідні матеріали" },
  { value: "generic", label: "Загальне" },
];

const CABLE_NAME_OPTIONS = [
  { value: "", label: "Оберіть марку" },
  { value: "ВВГ", label: "ВВГ" },
  { value: "АВВГ", label: "АВВГ" },
  { value: "ПВС", label: "ПВС" },
  { value: "ШВВП", label: "ШВВП" },
  { value: "ПВ-1", label: "ПВ-1" },
  { value: "ПВ-3", label: "ПВ-3" },
  { value: "СІП-5", label: "СІП-5" },
  { value: "КГ", label: "КГ" },
  { value: "UTP", label: "UTP" },
  { value: "FTP", label: "FTP" },
] as const;

const CABLE_SHAPE_OPTIONS = [
  { value: "", label: "Круглий" },
  { value: "flat", label: "Плоский (-П)" },
];

const CABLE_MODIFIER_OPTIONS = [
  { value: "", label: "Без модифікатора" },
  { value: "нг", label: "нг" },
  { value: "LS", label: "LS" },
  { value: "FRLS", label: "FRLS" },
  { value: "нг-LS", label: "нг-LS" },
  { value: "нг-FRLS", label: "нг-FRLS" },
];

const CABLE_CONDUCTOR_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "2", label: "2 жили" },
  { value: "3", label: "3 жили" },
  { value: "4", label: "4 жили" },
  { value: "5", label: "5 жил" },
];

const CABLE_CROSS_SECTION_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "0.75", label: "0.75" },
  { value: "1", label: "1" },
  { value: "1.5", label: "1.5" },
  { value: "2.5", label: "2.5" },
  { value: "4", label: "4" },
  { value: "6", label: "6" },
  { value: "10", label: "10" },
  { value: "16", label: "16" },
  { value: "25", label: "25" },
];

const SHIELD_MODULE_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "4", label: "4" },
  { value: "6", label: "6" },
  { value: "8", label: "8" },
  { value: "12", label: "12" },
  { value: "18", label: "18" },
  { value: "24", label: "24" },
  { value: "36", label: "36" },
  { value: "48", label: "48" },
];

const SHIELD_ROW_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "1", label: "1 ряд" },
  { value: "2", label: "2 ряди" },
  { value: "3", label: "3 ряди" },
  { value: "4", label: "4 ряди" },
];

const SHIELD_MOUNT_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "flush", label: "Вбудований" },
  { value: "surface", label: "Накладний" },
];

const AUTOMATION_TYPE_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "MCB", label: "Автомат (MCB)" },
  { value: "RCD", label: "ПЗВ / УЗО (RCD)" },
  { value: "RCBO", label: "Дифавтомат (RCBO)" },
];

const AUTOMATION_POLES_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "1", label: "1P" },
  { value: "2", label: "2P" },
  { value: "3", label: "3P" },
  { value: "4", label: "4P" },
];

const AUTOMATION_CURRENT_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "6", label: "6 A" },
  { value: "10", label: "10 A" },
  { value: "16", label: "16 A" },
  { value: "20", label: "20 A" },
  { value: "25", label: "25 A" },
  { value: "32", label: "32 A" },
  { value: "40", label: "40 A" },
  { value: "50", label: "50 A" },
  { value: "63", label: "63 A" },
];

const AUTOMATION_SENSITIVITY_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "10", label: "10 мА" },
  { value: "30", label: "30 мА" },
  { value: "100", label: "100 мА" },
  { value: "300", label: "300 мА" },
];

const AUTOMATION_CURVE_OPTIONS = [
  { value: "", label: "Не вибрано" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
];

function safeParseSpecParams(raw: string | undefined) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function extractBaseCableName(raw: string) {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+(НГ|LS|FRLS|НГ-LS|НГ-FRLS)$/i, "")
    .replace(/\s+\d+[ХX]\d+([.,]\d+)?$/i, "")
    .replace(/-П$/i, "")
    .trim();
}

function formatCableDisplayName(input: {
  baseName: string;
  shape: string;
  modifier: string;
  conductors: string;
  crossSection: string;
}) {
  const baseName = extractBaseCableName(input.baseName);
  if (!baseName) return "";

  const storedBase = input.shape === "flat" ? `${baseName}-П` : baseName;
  const modifierSuffix = input.modifier ? ` ${input.modifier}` : "";
  const sizeSuffix =
    input.conductors && input.crossSection
      ? ` ${input.conductors}х${String(input.crossSection).replace(".", ",")}`
      : "";

  return `${storedBase}${modifierSuffix}${sizeSuffix}`.trim();
}

function buildCableStoredName(input: {
  baseName: string;
  shape: string;
}) {
  const baseName = extractBaseCableName(input.baseName);
  if (!baseName) return "";
  return input.shape === "flat" ? `${baseName}-П` : baseName;
}

async function submitMaterialItemAction(
  _prevState: MaterialItemActionResult,
  formData: FormData,
): Promise<MaterialItemActionResult> {
  if (formData.get("intent") === "delete") {
    return deleteMaterialItemAction(formData);
  }

  if (formData.get("id")) {
    return updateMaterialItemAction(formData);
  }

  return createMaterialItemAction(formData);
}

export function MaterialItemFormModal({
  mode = "create",
  triggerLabel,
  triggerClassName,
  materialCatalogId,
  initialValue,
  brands = [],
  onDeleted,
  onCreated,
  onUpdated,
}: MaterialItemFormModalProps) {
  const [open, setOpen] = useState(false);
  const handledSuccessRef = useRef(false);
  const [state, formAction, pending] = useActionState(
    submitMaterialItemAction,
    initialActionState,
  );

  const value = useMemo<MaterialItemFormValue>(
    () => ({
      ...defaultValue,
      ...initialValue,
      materialCatalogId:
        initialValue?.materialCatalogId ?? materialCatalogId ?? "",
    }),
    [initialValue, materialCatalogId],
  );

  const initialSpec = useMemo(
    () => safeParseSpecParams(value.specParams),
    [value.specParams],
  );

  const initialResolvedSpecType =
    (value.specType as MaterialSpecType | "") ||
    inferMaterialSpecType(value.category);

  const [name, setName] = useState(
    initialResolvedSpecType === "cable"
      ? extractBaseCableName(value.name)
      : value.name,
  );
  const [category, setCategory] = useState(value.category);
  const [specType, setSpecType] = useState<MaterialSpecType | "">(
    initialResolvedSpecType,
  );

  const [shape, setShape] = useState(String(initialSpec.shape ?? ""));
  const [modifier, setModifier] = useState(String(initialSpec.modifier ?? ""));
  const [conductors, setConductors] = useState(
    String(initialSpec.conductors ?? ""),
  );
  const [crossSection, setCrossSection] = useState(
    String(initialSpec.crossSection ?? ""),
  );

  const [modules, setModules] = useState(String(initialSpec.modules ?? ""));
  const [rows, setRows] = useState(String(initialSpec.rows ?? ""));
  const [mountType, setMountType] = useState(String(initialSpec.mountType ?? ""));

  const [automationType, setAutomationType] = useState(
    String(initialSpec.type ?? ""),
  );
  const [poles, setPoles] = useState(String(initialSpec.poles ?? ""));
  const [current, setCurrent] = useState(String(initialSpec.current ?? ""));
  const [sensitivity, setSensitivity] = useState(
    String(initialSpec.sensitivity ?? ""),
  );
  const [curve, setCurve] = useState(String(initialSpec.curve ?? ""));

  useEffect(() => {
    if (!state.ok) {
      handledSuccessRef.current = false;
      return;
    }

    if (handledSuccessRef.current) {
      return;
    }

    handledSuccessRef.current = true;
    setOpen(false);

    if (mode === "create") {
      onCreated?.();
    }

    if (mode === "edit") {
      onUpdated?.();
    }
  }, [mode, onCreated, onUpdated, state.ok]);

  useEffect(() => {
    const nextSpec = safeParseSpecParams(value.specParams);
    const nextResolvedSpecType =
      (value.specType as MaterialSpecType | "") ||
      inferMaterialSpecType(value.category);

    setName(
      nextResolvedSpecType === "cable"
        ? extractBaseCableName(value.name)
        : value.name,
    );
    setCategory(value.category);
    setSpecType(nextResolvedSpecType);

    setShape(String(nextSpec.shape ?? ""));
    setModifier(String(nextSpec.modifier ?? ""));
    setConductors(String(nextSpec.conductors ?? ""));
    setCrossSection(String(nextSpec.crossSection ?? ""));

    setModules(String(nextSpec.modules ?? ""));
    setRows(String(nextSpec.rows ?? ""));
    setMountType(String(nextSpec.mountType ?? ""));

    setAutomationType(String(nextSpec.type ?? ""));
    setPoles(String(nextSpec.poles ?? ""));
    setCurrent(String(nextSpec.current ?? ""));
    setSensitivity(String(nextSpec.sensitivity ?? ""));
    setCurve(String(nextSpec.curve ?? ""));
  }, [value]);

  const computedSpecType =
    specType || inferMaterialSpecType(category) || "generic";

  const specParams = useMemo(() => {
    if (computedSpecType === "cable") {
      return JSON.stringify({
        shape: shape || null,
        modifier: modifier || null,
        conductors: conductors || null,
        crossSection: crossSection || null,
      });
    }

    if (computedSpecType === "shield") {
      return JSON.stringify({
        modules: modules || null,
        rows: rows || null,
        mountType: mountType || null,
      });
    }

    if (computedSpecType === "automation") {
      return JSON.stringify({
        type: automationType || null,
        poles: poles || null,
        current: current || null,
        sensitivity: sensitivity || null,
        curve: curve || null,
      });
    }

    return "";
  }, [
    computedSpecType,
    shape,
    modifier,
    conductors,
    crossSection,
    modules,
    rows,
    mountType,
    automationType,
    poles,
    current,
    sensitivity,
    curve,
  ]);

  const resolvedCategory = useMemo(() => {
    const trimmedCategory = category.trim();

    if (trimmedCategory) {
      return trimmedCategory;
    }

    return getDefaultCategoryBySpecType(computedSpecType) ?? "";
  }, [category, computedSpecType]);

  const displayName = useMemo(() => {
    if (computedSpecType === "cable") {
      return formatCableDisplayName({
        baseName: name,
        shape,
        modifier,
        conductors,
        crossSection,
      });
    }

    return buildMaterialDisplayName({
      name: name.trim(),
      specType: computedSpecType,
      specParams: specParams ? JSON.parse(specParams) : null,
    });
  }, [
    name,
    computedSpecType,
    specParams,
    shape,
    modifier,
    conductors,
    crossSection,
  ]);

  const storedName = useMemo(() => {
    if (computedSpecType === "cable") {
      return buildCableStoredName({
        baseName: name,
        shape,
      });
    }

    return name.trim();
  }, [computedSpecType, name, shape]);

  const selectedCableName = useMemo(() => {
    if (computedSpecType !== "cable") {
      return "";
    }

    const normalizedName = extractBaseCableName(name);

    const matchedOption = CABLE_NAME_OPTIONS.find(
      (option) => option.value && option.value === normalizedName,
    );

    return matchedOption?.value ?? "";
  }, [computedSpecType, name]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ||
          "inline-flex items-center justify-center rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
        }
      >
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-3 py-4 sm:py-6">
          <div className="flex min-h-full items-start justify-center">
            <div className="my-4 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:my-6">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <div>
                  <div className="text-lg font-semibold text-neutral-950">
                    {mode === "edit"
                      ? "Редагування матеріалу"
                      : "Новий матеріал"}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    Мінімальна форма для довідника матеріалів.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Закрити"
                >
                  ✕
                </button>
              </div>

              <form
                action={formAction}
                className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-h-[calc(100vh-3rem)]"
              >
                <input type="hidden" name="id" value={value.id ?? ""} />
                <input
                  type="hidden"
                  name="materialCatalogId"
                  value={value.materialCatalogId}
                />
                <input
                  type="hidden"
                  name="sortOrder"
                  value={String(value.sortOrder)}
                />
                <input type="hidden" name="specType" value={computedSpecType} />
                <input type="hidden" name="specParams" value={specParams} />
                <input type="hidden" name="category" value={resolvedCategory} />
                <input
                  type="hidden"
                  name="displayName"
                  value={displayName}
                />
                <input type="hidden" name="name" value={storedName} />

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-6">
                      <section className="rounded-2xl border border-neutral-200 p-5">
                        <div className="mb-4">
                          <div className="text-base font-semibold text-neutral-950">
                            Основні дані
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {computedSpecType !== "cable" ? (
                            <label className="space-y-2 md:col-span-2">
                              <span className={labelClassName}>Назва</span>
                              <input
                                value={name}
                                onChange={(event) =>
                                  setName(event.target.value)
                                }
                                className={inputClassName}
                                placeholder="Назва матеріалу"
                                required
                              />
                            </label>
                          ) : null}

                          <label className="space-y-2">
                            <span className={labelClassName}>
                              Тип специфікації
                            </span>
                            <select
                              value={specType}
                              onChange={(event) =>
                                setSpecType(
                                  event.target.value as MaterialSpecType,
                                )
                              }
                              className={selectClassName}
                            >
                              {SPEC_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="space-y-2">
                            <span className={labelClassName}>Категорія</span>
                            <input
                              value={resolvedCategory}
                              onChange={(event) =>
                                setCategory(event.target.value)
                              }
                              className={inputClassName}
                              placeholder="Категорія"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className={labelClassName}>Бренд</span>
                            <select
                              name="brandId"
                              defaultValue={value.brandId}
                              className={selectClassName}
                            >
                              <option value="">Не вибрано</option>
                              {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                  {brand.name}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="space-y-2">
                            <span className={labelClassName}>Одиниця</span>
                            <input
                              name="unit"
                              defaultValue={value.unit}
                              className={inputClassName}
                              placeholder="шт / м / компл"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className={labelClassName}>Собівартість</span>
                            <input
                              name="costPrice"
                              defaultValue={value.costPrice}
                              className={inputClassName}
                              placeholder="0.00"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className={labelClassName}>РРЦ</span>
                            <input
                              name="recommendedRetail"
                              defaultValue={value.recommendedRetail}
                              className={inputClassName}
                              placeholder="0.00"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className={labelClassName}>Код</span>
                            <input
                              name="code"
                              defaultValue={value.code}
                              className={inputClassName}
                              placeholder="Внутрішній код"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className={labelClassName}>SKU</span>
                            <input
                              name="sku"
                              defaultValue={value.sku}
                              className={inputClassName}
                              placeholder="SKU"
                            />
                          </label>

                          <label className="space-y-2 md:col-span-2">
                            <span className={labelClassName}>Підкатегорія</span>
                            <input
                              name="subcategory"
                              defaultValue={value.subcategory}
                              className={inputClassName}
                              placeholder="Підкатегорія"
                            />
                          </label>

                          <label className="space-y-2 md:col-span-2">
                            <span className={labelClassName}>
                              Технічна примітка
                            </span>
                            <input
                              name="technicalSpec"
                              defaultValue={value.technicalSpec}
                              className={inputClassName}
                              placeholder="Додаткова технічна примітка"
                            />
                          </label>
                        </div>
                      </section>

                      {computedSpecType === "cable" ? (
                        <section className="rounded-2xl border border-neutral-200 p-5">
                          <div className="mb-4">
                            <div className="text-base font-semibold text-neutral-950">
                              Кабель / провід
                            </div>
                            <div className="mt-1 text-sm text-neutral-500">
                              Назва формується автоматично, наприклад:
                              ВВГ-П 3х2,5
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 md:col-span-2">
                              <span className={labelClassName}>
                                Марка кабелю / проводу
                              </span>
                              <select
                                value={selectedCableName}
                                onChange={(event) =>
                                  setName(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {CABLE_NAME_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className={labelClassName}>Форма</span>
                              <select
                                value={shape}
                                onChange={(event) =>
                                  setShape(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {CABLE_SHAPE_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className={labelClassName}>Модифікатор</span>
                              <select
                                value={modifier}
                                onChange={(event) =>
                                  setModifier(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {CABLE_MODIFIER_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className={labelClassName}>
                                Кількість жил
                              </span>
                              <select
                                value={conductors}
                                onChange={(event) =>
                                  setConductors(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {CABLE_CONDUCTOR_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className={labelClassName}>Січення</span>
                              <select
                                value={crossSection}
                                onChange={(event) =>
                                  setCrossSection(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {CABLE_CROSS_SECTION_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </section>
                      ) : null}

                      {computedSpecType === "shield" ? (
                        <section className="rounded-2xl border border-neutral-200 p-5">
                          <div className="mb-4">
                            <div className="text-base font-semibold text-neutral-950">
                              Специфікація щита
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <label className="space-y-2">
                              <span className={labelClassName}>Модулі</span>
                              <select
                                value={modules}
                                onChange={(event) =>
                                  setModules(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {SHIELD_MODULE_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className={labelClassName}>Ряди</span>
                              <select
                                value={rows}
                                onChange={(event) =>
                                  setRows(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {SHIELD_ROW_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className={labelClassName}>Монтаж</span>
                              <select
                                value={mountType}
                                onChange={(event) =>
                                  setMountType(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {SHIELD_MOUNT_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </section>
                      ) : null}

                      {computedSpecType === "automation" ? (
                        <section className="rounded-2xl border border-neutral-200 p-5">
                          <div className="mb-4">
                            <div className="text-base font-semibold text-neutral-950">
                              Специфікація автоматики
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2">
                              <span className={labelClassName}>Тип</span>
                              <select
                                value={automationType}
                                onChange={(event) =>
                                  setAutomationType(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {AUTOMATION_TYPE_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className={labelClassName}>Полюси</span>
                              <select
                                value={poles}
                                onChange={(event) =>
                                  setPoles(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {AUTOMATION_POLES_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className={labelClassName}>Номінал</span>
                              <select
                                value={current}
                                onChange={(event) =>
                                  setCurrent(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {AUTOMATION_CURRENT_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2">
                              <span className={labelClassName}>Чутливість</span>
                              <select
                                value={sensitivity}
                                onChange={(event) =>
                                  setSensitivity(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {AUTOMATION_SENSITIVITY_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="space-y-2 md:col-span-2">
                              <span className={labelClassName}>Крива</span>
                              <select
                                value={curve}
                                onChange={(event) =>
                                  setCurve(event.target.value)
                                }
                                className={selectClassName}
                              >
                                {AUTOMATION_CURVE_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </section>
                      ) : null}
                    </div>

                    <aside className="space-y-6">
                      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                        <div className="text-base font-semibold text-neutral-950">
                          Попередній перегляд
                        </div>

                        <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white p-4">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                            displayName
                          </div>
                          <div className="mt-2 text-base font-semibold text-neutral-950">
                            {displayName || "Назва сформується автоматично"}
                          </div>

                          <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                            name
                          </div>
                          <div className="mt-2 text-sm text-neutral-700">
                            {storedName || "—"}
                          </div>

                          <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                            category
                          </div>
                          <div className="mt-2 text-sm text-neutral-700">
                            {resolvedCategory || "—"}
                          </div>
                        </div>
                      </section>

                      <section className="rounded-2xl border border-neutral-200 p-5">
                        <label className="space-y-2">
                          <span className={labelClassName}>Опис</span>
                          <textarea
                            name="description"
                            defaultValue={value.description}
                            className={textareaClassName}
                            placeholder="Додатковий опис або примітки"
                          />
                        </label>

                        <label className="mt-4 flex items-center gap-3">
                          <input
                            type="checkbox"
                            name="isInactive"
                            defaultChecked={value.isInactive}
                            className="h-4 w-4 rounded border-neutral-300 text-neutral-900"
                          />
                          <span className="text-sm text-neutral-700">
                            Позначити як неактивний
                          </span>
                        </label>

                        {state.error ? (
                          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {state.error}
                          </div>
                        ) : null}
                      </section>
                    </aside>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    {mode === "edit" && value.id ? (
                      <button
                        type="submit"
                        name="intent"
                        value="delete"
                        onClick={(event) => {
                          const confirmed = window.confirm(
                            "Видалити цей матеріал?",
                          );

                          if (!confirmed) {
                            event.preventDefault();
                          }
                        }}
                        className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Видалити
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Скасувати
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending
                      ? "Збереження..."
                      : mode === "edit"
                        ? "Зберегти зміни"
                        : "Створити матеріал"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
