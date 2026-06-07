"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  addProjectTeamMemberAction,
  removeProjectTeamMemberAction,
  updateProjectTeamMemberAction,
} from "./actions";

type EmployeeOption = {
  id: string;
  fullName: string;
  email: string | null;
  positionTitle: string;
  isResponsible: boolean;
};

type TeamMemberValue = {
  id: string;
  userId: string;
  roleLabel: string;
  isLead: boolean;
};

type Props = {
  mode: "create" | "edit";
  projectId: string;
  triggerLabel: string;
  triggerClassName?: string;
  employees: EmployeeOption[];
  initialValue?: Partial<TeamMemberValue>;
  canRemove?: boolean;
};

const inputClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const selectClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-950";

const emptyValue: TeamMemberValue = {
  id: "",
  userId: "",
  roleLabel: "",
  isLead: false,
};

export function TeamMemberModal({
  mode,
  projectId,
  triggerLabel,
  triggerClassName,
  employees,
  initialValue,
  canRemove = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: TeamMemberValue = {
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
          await addProjectTeamMemberAction(formData);
        } else {
          await updateProjectTeamMemberAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося зберегти учасника команди.",
        );
      }
    });
  }

  function onRemove() {
    const formData = new FormData();
    formData.set("id", value.id);
    formData.set("projectId", projectId);

    setError(null);

    startTransition(async () => {
      try {
        await removeProjectTeamMemberAction(formData);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не вдалося видалити учасника команди.",
        );
      }
    });
  }

  const modal = open ? (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4">
      <div className="mx-auto flex min-h-full w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {mode === "create"
                  ? "Новий учасник команди"
                  : "Редагування учасника"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {mode === "create"
                  ? "Додати в команду проєкту"
                  : "Оновити учасника команди"}
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
            <input type="hidden" name="projectId" value={projectId} />

            <div className="grid gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Працівник *</span>
                <select
                  name="userId"
                  defaultValue={value.userId}
                  disabled={mode === "edit"}
                  required
                  className={selectClassName}
                >
                  <option value="">Оберіть працівника</option>

                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName}
                      {employee.positionTitle
                        ? ` — ${employee.positionTitle}`
                        : ""}
                      {employee.isResponsible ? " · відповідальний" : ""}
                    </option>
                  ))}
                </select>

                {mode === "edit" ? (
                  <span className="text-xs text-neutral-500">
                    Для редагування склад учасників не змінюється — тут
                    оновлюється лише роль і ознака lead.
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Роль у проєкті</span>
                <input
                  name="roleLabel"
                  defaultValue={value.roleLabel}
                  className={inputClassName}
                  placeholder="Бригадир, Монтажник, Виконроб, Інженер..."
                />
              </label>

              <label className="mt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isLead"
                  defaultChecked={value.isLead}
                  className="h-4 w-4 rounded border-neutral-400 accent-neutral-900"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Це lead / головний відповідальний у команді
                </span>
              </label>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2.5 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {mode === "edit" && canRemove ? (
                  <button
                    type="button"
                    onClick={onRemove}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Видалити з команди
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
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
                      ? "Додати в команду"
                      : "Зберегти зміни"}
                </button>
              </div>
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
