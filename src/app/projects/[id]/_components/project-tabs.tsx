"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ProjectTabsProps = {
  projectId: string;
};

const tabs = [
  { href: "", label: "Огляд" },
  { href: "/rooms", label: "Кімнати і точки" },
  { href: "/work-materials", label: "Роботи та матеріали" },
  { href: "/estimate", label: "Кошторис" },
  { href: "/shield", label: "Щит і лінії" },
  { href: "/procurement", label: "Закупівля" },
  { href: "/report", label: "Звіти" },
];

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname();
  const basePath = `/projects/${projectId}`;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto px-3 py-3">
        <nav className="flex min-w-max items-center gap-2">
          {tabs.map((tab) => {
            const href = `${basePath}${tab.href}`;

            const isActive =
              tab.href === ""
                ? pathname === basePath
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={[
                  "inline-flex items-center rounded-2xl border px-4 py-2.5 text-sm font-medium whitespace-nowrap transition",
                  isActive
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                    : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
