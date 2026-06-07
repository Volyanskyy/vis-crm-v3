"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type ActionResult = { ok: boolean; message?: string } | void;

type AsyncActionButtonProps = {
  action: () => Promise<ActionResult>;
  label: string;
  confirmMessage?: string;
  className: string;
};

const baseClassName =
  "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

function AsyncActionButton({
  action,
  label,
  confirmMessage,
  className,
}: AsyncActionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className={`${baseClassName} ${className}`}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          return;
        }

        startTransition(async () => {
          const result = await action();

          if (result && "ok" in result && !result.ok) {
            window.alert(result.message || "Не вдалося виконати дію.");
            return;
          }

          router.refresh();
        });
      }}
    >
      {label}
    </button>
  );
}

export function PublishDraftButton({
  action,
}: {
  action: () => Promise<ActionResult>;
}) {
  return (
    <AsyncActionButton
      action={action}
      label="Активувати"
      className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
    />
  );
}

export function CreateDraftButton({
  action,
  label = "У чернетку",
}: {
  action: () => Promise<ActionResult>;
  label?: string;
}) {
  return (
    <AsyncActionButton
      action={action}
      label={label}
      className="border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
    />
  );
}

export function ArchiveWorkPriceListButton({
  action,
}: {
  action: () => Promise<ActionResult>;
}) {
  return (
    <AsyncActionButton
      action={action}
      label="В архів"
      confirmMessage="Перевести активний прайс в архів?"
      className="border border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
    />
  );
}

export function RestoreArchivedButton({
  action,
}: {
  action: () => Promise<ActionResult>;
}) {
  return (
    <AsyncActionButton
      action={action}
      label="Активувати"
      confirmMessage="Зробити архівний прайс активним?"
      className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
    />
  );
}
