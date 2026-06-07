"use client";

type PrintButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function PrintButton({
  className,
  children = "Друк / PDF",
}: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ??
        "inline-flex items-center justify-center rounded-xl border border-neutral-950 bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
      }
    >
      {children}
    </button>
  );
}
