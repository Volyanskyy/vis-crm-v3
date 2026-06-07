"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createEmployeeAction, updateEmployeeAction } from "./actions";

type RoleOption = {
  id: string;
  name: string;
  code: string;
};

type SkillTagOption = {
  id: string;
  name: string;
  code: string;
};

type EmployeeFormValue = {
  userId: string;
  employeeProfileId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "INVITED" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  employeeCode: string;
  positionTitle: string;
  isResponsible: boolean;
  skillsSummary: string;
  notes: string;
  hourlyRate: string;
  isArchived: boolean;
  roleIds: string[];
  skillTagIds: string[];
};

const emptyValue: EmployeeFormValue = {
  userId: "",
  employeeProfileId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: "INVITED",
  employeeCode: "",
  positionTitle: "",
  isResponsible: false,
  skillsSummary: "",
  notes: "",
  hourlyRate: "",
  isArchived: false,
  roleIds: [],
  skillTagIds: [],
};

type Props = {
  mode: "create" | "edit";
  triggerLabel: string;
  triggerClassName?: string;
  roles: RoleOption[];
  skillTags: SkillTagOption[];
  initialValue?: Partial<EmployeeFormValue>;
};

const inputClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const selectClassName =
  "w-full rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const textareaClassName =
  "w-full min-h-[88px] resize-y rounded-xl border border-neutral-400 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200";

const labelClassName =
  "text-sm font-semibold tracking-tight text-neutral-950";

export function EmployeeFormModal({
  mode,
  triggerLabel,
  triggerClassName,
  roles,
  skillTags,
  initialValue,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const value: EmployeeFormValue = {
    ...emptyValue,
    ...initialValue,
    roleIds: initialValue?.roleIds ?? [],
    skillTagIds: initialValue?.skillTagIds ?? [],
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
          await createEmployeeAction(formData);
        } else {
          await updateEmployeeAction(formData);
        }

        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Не вдалося зберегти працівника.",
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
                {mode === "create" ? "Новий працівник" : "Редагування працівника"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {mode === "create" ? "Створити працівника" : "Оновити працівника"}
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
            <input type="hidden" name="userId" defaultValue={value.userId} />
            <input
              type="hidden"
              name="employeeProfileId"
              defaultValue={value.employeeProfileId}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Імʼя *</span>
                <input
                  name="firstName"
                  defaultValue={value.firstName}
                  required
                  className={inputClassName}
                  placeholder="Іван"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Прізвище *</span>
                <input
                  name="lastName"
                  defaultValue={value.lastName}
                  required
                  className={inputClassName}
                  placeholder="Петренко"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Email *</span>
                <input
                  type="email"
                  name="email"
                  defaultValue={value.email}
                  required
                  className={inputClassName}
                  placeholder="user@example.com"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Телефон</span>
                <input
                  name="phone"
                  defaultValue={value.phone}
                  className={inputClassName}
                  placeholder="+380..."
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Статус акаунта</span>
                <select
                  name="status"
                  defaultValue={value.status}
                  className={selectClassName}
                >
                  <option value="INVITED">INVITED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Код працівника</span>
                <input
                  name="employeeCode"
                  defaultValue={value.employeeCode}
                  className={inputClassName}
                  placeholder="EMP-001"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Посада</span>
                <input
                  name="positionTitle"
                  defaultValue={value.positionTitle}
                  className={inputClassName}
                  placeholder="Електромонтажник / Менеджер / Майстер"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelClassName}>Погодинна ставка</span>
                <input
                  name="hourlyRate"
                  defaultValue={value.hourlyRate}
                  className={inputClassName}
                  placeholder="250"
                />
              </label>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Типи працівника / ролі</span>
                <div className="grid gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-2">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-start gap-2 rounded-xl bg-white px-3 py-2">
                      <input
                        type="checkbox"
                        name="roleIds"
                        value={role.id}
                        defaultChecked={value.roleIds.includes(role.id)}
                        className="mt-1 h-4 w-4 rounded border-neutral-400 accent-neutral-900"
                      />
                      <span className="text-sm text-neutral-800">
                        <span className="font-medium">{role.name}</span>
                        <span className="block text-xs text-neutral-500">
                          {role.code}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Навички</span>
                <div className="grid gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 sm:grid-cols-2">
                  {skillTags.map((skill) => (
                    <label key={skill.id} className="flex items-start gap-2 rounded-xl bg-white px-3 py-2">
                      <input
                        type="checkbox"
                        name="skillTagIds"
                        value={skill.id}
                        defaultChecked={value.skillTagIds.includes(skill.id)}
                        className="mt-1 h-4 w-4 rounded border-neutral-400 accent-neutral-900"
                      />
                      <span className="text-sm text-neutral-800">
                        <span className="font-medium">{skill.name}</span>
                        <span className="block text-xs text-neutral-500">
                          {skill.code}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Короткий опис навичок</span>
                <textarea
                  name="skillsSummary"
                  defaultValue={value.skillsSummary}
                  rows={3}
                  className={textareaClassName}
                  placeholder="Коротко: щити, автоматика, освітлення, пусконалагодження..."
                />
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelClassName}>Нотатки</span>
                <textarea
                  name="notes"
                  defaultValue={value.notes}
                  rows={3}
                  className={textareaClassName}
                  placeholder="Коментарі по працівнику"
                />
              </label>

              <label className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isResponsible"
                  defaultChecked={value.isResponsible}
                  className="h-4 w-4 rounded border-neutral-400 accent-neutral-900"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Відповідальний
                </span>
              </label>

              <label className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isArchived"
                  defaultChecked={value.isArchived}
                  className="h-4 w-4 rounded border-neutral-400 accent-neutral-900"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Профіль в архіві
                </span>
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
                    ? "Створити працівника"
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
