"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ActionResult } from "./actions";
import {
  activateArchivedWorkPriceListAction,
  archiveWorkPriceListAction,
  deleteWorkPriceListAction,
  duplicateWorkPriceListToDraftAction,
  moveWorkPriceListToDraftAction,
  publishWorkPriceListDraftAction,
} from "./actions";

type WorkPriceListRowActionsProps = {
  id: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
};

const btn =
  "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

function IconOpen() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M5.75 4.5A2.25 2.25 0 0 0 3.5 6.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-2a.75.75 0 0 0-1.5 0v2A.75.75 0 0 1 13.25 15h-7.5a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 .75-.75h2a.75.75 0 0 0 0-1.5h-2Z" />
      <path d="M11 3.5a.75.75 0 0 0 0 1.5h2.44l-4.72 4.72a.75.75 0 1 0 1.06 1.06L14.5 6.06V8.5a.75.75 0 0 0 1.5 0V4.25a.75.75 0 0 0-.75-.75H11Z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M6.75 3.5A2.25 2.25 0 0 0 4.5 5.75v6.5a2.25 2.25 0 0 0 2.25 2.25h6.5a2.25 2.25 0 0 0 2.25-2.25v-6.5A2.25 2.25 0 0 0 13.25 3.5h-6.5Zm-.75 2.25c0-.414.336-.75.75-.75h6.5c.414 0 .75.336.75.75v6.5a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75v-6.5Z" />
      <path d="M5.5 15.5a.75.75 0 0 1 0 1.5h-.25A2.25 2.25 0 0 1 3 14.75V6.5a.75.75 0 0 1 1.5 0v8.25c0 .414.336.75.75.75h.25Z" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M4.75 13.5v1.75h1.75l7.9-7.9-1.75-1.75-7.9 7.9Zm9.83-9.08a1.24 1.24 0 0 0 0-1.76l-1.24-1.24a1.24 1.24 0 0 0-1.76 0l-.97.97 3 3 .97-.97Z" />
    </svg>
  );
}

function IconPublish() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M10 2.75a.75.75 0 0 1 .75.75v7.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V3.5A.75.75 0 0 1 10 2.75Z" />
      <path d="M4.5 13.25a.75.75 0 0 1 .75.75v.25c0 .69.56 1.25 1.25 1.25h7a1.25 1.25 0 0 0 1.25-1.25V14a.75.75 0 0 1 1.5 0v.25A2.75 2.75 0 0 1 13.5 17h-7a2.75 2.75 0 0 1-2.75-2.75V14a.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M3.5 5.75A2.25 2.25 0 0 1 5.75 3.5h8.5A2.25 2.25 0 0 1 16.5 5.75v8.5a2.25 2.25 0 0 1-2.25 2.25h-8.5A2.25 2.25 0 0 1 3.5 14.25v-8.5Zm2.25-.75a.75.75 0 0 0-.75.75v1.5h10v-1.5a.75.75 0 0 0-.75-.75h-8.5Zm9.25 3.75H5v5.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-5.5Zm-6.53 1.22a.75.75 0 0 1 1.06 0L10 10.44l.47-.47a.75.75 0 1 1 1.06 1.06l-1 1a.75.75 0 0 1-1.06 0l-1-1a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M16.704 5.29a.75.75 0 0 1 .006 1.06l-7.25 7.333a.75.75 0 0 1-1.072 0L3.29 8.529a.75.75 0 1 1 1.06-1.058l4.572 4.576 6.72-6.75a.75.75 0 0 1 1.061-.007Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconDelete() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M8.75 2.5a1 1 0 0 0-.8.4L7.2 4H4.5a.75.75 0 0 0 0 1.5h.34l.77 9.24A2 2 0 0 0 7.6 16.5h4.8a2 2 0 0 0 1.99-1.76l.77-9.24h.34a.75.75 0 0 0 0-1.5H12.8l-.75-1.1a1 1 0 0 0-.8-.4h-2.5Zm1.25 4.25a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75Zm-2.75.75a.75.75 0 0 1 1.5 0v5a.75.75 0 0 1-1.5 0v-5Zm5.5 0a.75.75 0 0 1 1.5 0v5a.75.75 0 0 1-1.5 0v-5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconDraft() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path d="M4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v8.5a2.25 2.25 0 0 0 2.25 2.25h5a.75.75 0 0 0 0-1.5h-5a.75.75 0 0 1-.75-.75v-8.5a.75.75 0 0 1 .75-.75h5.69a.75.75 0 0 0 .53-.22l.31-.31 3.94 3.94-.3.3a.75.75 0 1 0 1.06 1.06l.83-.83a.75.75 0 0 0 0-1.06l-5-5a.75.75 0 0 0-.53-.22H4.75Z" />
      <path d="M12.72 11.22a.75.75 0 0 1 1.06 0l2 2a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-.38.2l-2 .4a.75.75 0 0 1-.88-.88l.4-2a.75.75 0 0 1 .2-.38l3.75-3.75Zm.53 1.6-2.92 2.92-.2 1 1-.2 2.92-2.92-.8-.8Z" />
    </svg>
  );
}

export function WorkPriceListRowActions({
  id,
  status,
}: WorkPriceListRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<ActionResult>,
    confirmMessage?: string,
    onSuccess?: () => void,
  ) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    startTransition(async () => {
      const result = await action();

      if (!result.ok) {
        window.alert(result.message);
        return;
      }

      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => router.push(`/references/work-price-lists/${id}`)}
        className={`${btn} border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50`}
      >
        <IconOpen />
        <span className="ml-2">Відкрити</span>
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          run(
            () => duplicateWorkPriceListToDraftAction(id),
            "Створити чернетку-копію цього прайса з усіма позиціями?",
          )
        }
        className={`${btn} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
      >
        <IconCopy />
        <span className="ml-2">Копія в чернетку</span>
      </button>

      {status === "DRAFT" && (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={() => router.push(`/references/work-price-lists/${id}`)}
            className={`${btn} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
          >
            <IconEdit />
            <span className="ml-2">Редагувати</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => publishWorkPriceListDraftAction(id),
                "Активувати цю чернетку?",
              )
            }
            className={`${btn} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
          >
            <IconPublish />
            <span className="ml-2">Активувати</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => deleteWorkPriceListAction(id),
                "Видалити цю чернетку? Дію неможливо буде скасувати.",
              )
            }
            className={`${btn} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`}
          >
            <IconDelete />
            <span className="ml-2">Видалити</span>
          </button>
        </>
      )}

      {status === "ACTIVE" && (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => moveWorkPriceListToDraftAction(id),
                "Перевести цей прайс у чернетку?",
              )
            }
            className={`${btn} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
          >
            <IconDraft />
            <span className="ml-2">В чернетку</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => archiveWorkPriceListAction(id),
                "Перевести активний прайс в архів?",
              )
            }
            className={`${btn} border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-neutral-200`}
          >
            <IconArchive />
            <span className="ml-2">В архів</span>
          </button>
        </>
      )}

      {status === "ARCHIVED" && (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => moveWorkPriceListToDraftAction(id),
                "Перевести архівний прайс у чернетку?",
              )
            }
            className={`${btn} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
          >
            <IconDraft />
            <span className="ml-2">В чернетку</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => activateArchivedWorkPriceListAction(id),
                "Зробити архівний прайс активним?",
              )
            }
            className={`${btn} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
          >
            <IconCheck />
            <span className="ml-2">Активувати</span>
          </button>
        </>
      )}
    </div>
  );
}
