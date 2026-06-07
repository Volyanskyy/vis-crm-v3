"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createProjectAction, updateProjectAction } from "./actions";

type ClientOption = {
  id: string;
  name: string;
  companyName: string | null;
};

type ManagerOption = {
  id: string;
  fullName: string;
  positionTitle: string;
};

type ProjectFormValue = {
  id: string;
  clientId: string;
  code: string;
  name: string;
  description: string;
  address: string;
  city: string;
  status: "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED" | "ARCHIVED";
  startDate: string;
  plannedEndDate: string;
  endDate: string;
  managerId: string;
};

const emptyValue: ProjectFormValue = {
  id: "",
  clientId: "",
  code: "",
  name: "",
  description: "",
  address: "",
  city: "",
  status: "DRAFT",
  startDate: "",
  plannedEndDate: "",
  endDate: "",
  managerId: "",
};

type Props = {
  mode: "create" | "edit";
  triggerLabel: string;
  triggerClassName?: string;
  clients: ClientOption[];
  managers: ManagerOption[];
  initialValue?: Partial<ProjectFormValue>;
};

const inputClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const selectClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-950";

export function ProjectFormModal({
  mode,
  triggerLabel,
  triggerClassName,
  clients,
  managers,
  initialValue,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: ProjectFormValue = {
    ...emptyValue,
    ...initialValue,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProjectAction(formData);
        } else {
          await updateProjectAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не вдалося зберегти проєкт.",
        );
      }
    });
  }

  const modal = open ? (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4">
      <div className="mx-auto flex min-h-full w-full max-w-4xl items-center justify-center">
        <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {mode === "create" ? "Новий проєкт" : "Редагування проєкту"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {mode === "create" ? "Створити проєкт" : "Оновити проєкт"}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-base text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
              aria-label="Закрити модалку"
            >
              ✕
            </button>
          </div>

          <form action={onSubmit} className="px-6 py-4">
            <input type="hidden" name="id" defaultValue={value.id} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Клієнт *</span>
                <select
                  name="clientId"
                  defaultValue={value.clientId}
                  required
                  className={selectClassName}
                >
                  <option value="">Оберіть клієнта</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.companyName || client.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Код проєкту</span>
                <input
                  name="code"
                  defaultValue={value.code}
                  className={inputClassName}
                  placeholder="PRJ-001"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Статус</span>
                <select
                  name="status"
                  defaultValue={value.status}
                  className={selectClassName}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_HOLD">ON_HOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Назва проєкту *</span>
                <input
                  name="name"
                  defaultValue={value.name}
                  required
                  className={inputClassName}
                  placeholder="ЖК Сонячний / Офіс / Приватний будинок"
                />
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Опис</span>
                <textarea
                  name="description"
                  defaultValue={value.description}
                  rows={3}
                  className={textareaClassName}
                  placeholder="Короткий опис обʼєкта, етапу або задач"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Місто</span>
                <input
                  name="city"
                  defaultValue={value.city}
                  className={inputClassName}
                  placeholder="Тернопіль"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Адреса</span>
                <input
                  name="address"
                  defaultValue={value.address}
                  className={inputClassName}
                  placeholder="вул. ..."
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Дата старту</span>
                <input
                  type="date"
                  name="startDate"
                  defaultValue={value.startDate}
                  className={inputClassName}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Планове завершення</span>
                <input
                  type="date"
                  name="plannedEndDate"
                  defaultValue={value.plannedEndDate}
                  className={inputClassName}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Фактичне завершення</span>
                <input
                  type="date"
                  name="endDate"
                  defaultValue={value.endDate}
                  className={inputClassName}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Менеджер проєкту</span>
                <select
                  name="managerId"
                  defaultValue={value.managerId}
                  className={selectClassName}
                >
                  <option value="">Не призначено</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.fullName}
                      {manager.positionTitle ? ` — ${manager.positionTitle}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2.5 border-t border-neutral-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Скасувати
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending
                  ? "Збереження..."
                  : mode === "create"
                    ? "Створити проєкт"
                    : "Зберегти зміни"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
        }
      >
        {triggerLabel}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
