/**
 * Path: src/app/layout.tsx
 *
 * Призначення:
 * Глобальний layout для VIS CRM V3.
 * Дає єдиний app shell: header, навігацію, контейнер сторінки.
 * Підходить для desktop + tablet + mobile.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIS CRM V3",
  description: "CRM for projects, estimates, field data and references",
};

const navItems = [
  { href: "/", label: "Головна" },
  { href: "/clients", label: "Клієнти" },
  { href: "/projects", label: "Проєкти" },
  { href: "/references", label: "Довідники" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
          <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-sm font-semibold text-white"
                >
                  VIS
                </Link>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight text-neutral-900">
                    VIS CRM V3
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    Проєкти, кошториси, довідники, польові дані
                  </p>
                </div>
              </div>

              <nav className="hidden items-center gap-2 md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-neutral-200 bg-white md:hidden">
              <nav className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto px-2 py-2 sm:px-4">
                {navItems.map((item) => (
                  <Link
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
