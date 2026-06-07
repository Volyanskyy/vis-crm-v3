import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicationSettingsForm } from "./publication-settings-form";
import { PrintButton } from "./print-button";


type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: Date | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPeriod(validFrom: Date | null, validTo: Date | null) {
  if (!validFrom && !validTo) {
    return "Без обмеження періоду";
  }

  if (validFrom && !validTo) {
    return `від ${formatDate(validFrom)}`;
  }

  if (!validFrom && validTo) {
    return `до ${formatDate(validTo)}`;
  }

  return `${formatDate(validFrom)} — ${formatDate(validTo)}`;
}

function getStatusLabel(status: string) {
  if (status === "DRAFT") {
    return "Чернетка";
  }

  if (status === "ARCHIVED") {
    return "Архів";
  }

  return "Активний";
}

export default async function WorkPriceListPublicationPage({
  params,
}: PageProps) {
  const { id } = await params;

  const workPriceList = await prisma.workPriceList.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      },
      publicationSettings: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!workPriceList) {
    notFound();
  }

  const settings = workPriceList.publicationSettings;

  const formInitialValue = {
    logoUrl: settings?.logoUrl ?? "",
    companyName: settings?.companyName ?? "Внутрішні інженерні системи",
    companySubtitle: settings?.companySubtitle ?? "Монтажна компанія",
    headerServices:
      settings?.headerServices ??
      [
        "електромонтаж",
        "електрощити, проектування та розрахунок",
        "опалення",
        "водопостачання, водовідведення",
        "сервісне обслуговування",
      ].join("\n"),
    website: settings?.website ?? "www.vis-montag.com",
    email: settings?.email ?? "info@vis-montag.com",
    phones:
      settings?.phones ??
      ["+38 097 124 64 06", "+38 067 709 27 66", "+38 067 350 07 00"].join(
        "\n",
      ),
    contactsLabel: settings?.contactsLabel ?? "Контакти: Роман / Іван / Володимир",
    documentTitle: settings?.documentTitle ?? "Прайс робіт",
    introText: settings?.introText ?? "",
    footerText:
      settings?.footerText ?? "Документ сформовано для друку / PDF / відправлення",
    noteText:
      settings?.noteText ??
      "Вартість у прайсі наведена для попереднього розрахунку та може уточнюватися залежно від обсягів, специфіки об’єкта, матеріалів, доступу до зони виконання робіт і технічних умов.",
    showDescription: settings?.showDescription ?? true,
    showCategory: settings?.showCategory ?? true,
    showPeriod: settings?.showPeriod ?? true,
    showFooter: settings?.showFooter ?? true,
    showContacts: settings?.showContacts ?? true,
  };

  const items = workPriceList.items.map((item, index) => ({
    ...item,
    rowNumber: index + 1,
    description: item.description ?? "",
    category: item.category ?? "",
    subcategory: item.subcategory ?? "",
    unit: item.unit ?? "",
    basePrice: Number(item.basePrice),
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.basePrice, 0);

  const headerServices = formInitialValue.headerServices
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const phones = formInitialValue.phones
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 p-4 sm:p-6 print:max-w-none print:p-0">
        <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 print:hidden">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
                Publication / друк / PDF
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                {workPriceList.name}
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                Окремий режим оформлення клієнтської версії прайсу з редагованою
                шапкою, футером, контактами та друкованим шаблоном.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/references/work-price-lists/${workPriceList.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
              >
                Назад до прайсу
              </Link>
              <PrintButton />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[480px_minmax(0,1fr)] print:block">
          <div className="print:hidden">
            <PublicationSettingsForm
              workPriceListId={workPriceList.id}
              initialValue={formInitialValue}
            />
          </div>

          <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
            <div className="border-b border-neutral-200 px-6 py-6 sm:px-10 print:px-10 print:py-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-lg font-semibold text-neutral-900">
                      {formInitialValue.logoUrl ? "LOGO" : "VIS"}
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                        {formInitialValue.companyName}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-600">
                        {formInitialValue.companySubtitle}
                      </p>
                    </div>
                  </div>

                  {headerServices.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-700">
                      {headerServices.map((item) => (
                        <span key={item}>• {item}</span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {formInitialValue.showContacts ? (
                  <div className="grid gap-1 text-sm text-neutral-700 lg:text-right">
                    {formInitialValue.website ? (
                      <a
                        href={
                          formInitialValue.website.startsWith("http")
                            ? formInitialValue.website
                            : `https://${formInitialValue.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-neutral-900 hover:underline print:no-underline"
                      >
                        {formInitialValue.website}
                      </a>
                    ) : null}

                    {formInitialValue.email ? (
                      <a
                        href={`mailto:${formInitialValue.email}`}
                        className="hover:underline print:no-underline"
                      >
                        {formInitialValue.email}
                      </a>
                    ) : null}

                    {phones.map((phone) => (
                      <span key={phone}>{phone}</span>
                    ))}

                    {formInitialValue.contactsLabel ? (
                      <div className="mt-2 text-xs text-neutral-500">
                        {formInitialValue.contactsLabel}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="px-6 py-6 sm:px-10 print:px-10 print:py-8">
              <div className="flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
                    {formInitialValue.documentTitle || "Прайс робіт"}
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
                    {workPriceList.name}
                  </h3>

                  {formInitialValue.showDescription && workPriceList.description ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                      {workPriceList.description}
                    </p>
                  ) : null}

                  {formInitialValue.introText ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                      {formInitialValue.introText}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2 text-sm text-neutral-700 sm:text-right">
                  <div>
                    <span className="text-neutral-500">Статус:</span>{" "}
                    <span className="font-medium text-neutral-900">
                      {getStatusLabel(String(workPriceList.status))}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500">Версія:</span>{" "}
                    <span className="font-medium text-neutral-900">
                      {workPriceList.version}
                    </span>
                  </div>

                  {formInitialValue.showCategory ? (
                    <div>
                      <span className="text-neutral-500">Категорія:</span>{" "}
                      <span className="font-medium text-neutral-900">
                        {workPriceList.category || "—"}
                      </span>
                    </div>
                  ) : null}

                  {formInitialValue.showPeriod ? (
                    <div>
                      <span className="text-neutral-500">Період дії:</span>{" "}
                      <span className="font-medium text-neutral-900">
                        {formatPeriod(workPriceList.validFrom, workPriceList.validTo)}
                      </span>
                    </div>
                  ) : null}

                  <div>
                    <span className="text-neutral-500">Сформовано:</span>{" "}
                    <span className="font-medium text-neutral-900">
                      {formatDate(new Date())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="border-b border-neutral-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                          №
                        </th>
                        <th className="border-b border-neutral-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                          Найменування
                        </th>
                        <th className="border-b border-neutral-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                          Категорія
                        </th>
                        <th className="border-b border-neutral-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                          Одиниця
                        </th>
                        <th className="border-b border-neutral-200 px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                          Ціна
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-10 text-center text-sm text-neutral-500"
                          >
                            У цьому прайсі ще немає позицій для публікації.
                          </td>
                        </tr>
                      ) : (
                        items.map((item) => (
                          <tr key={item.id} className="align-top">
                            <td className="border-b border-neutral-200 px-4 py-4 text-sm text-neutral-500">
                              {item.rowNumber}
                            </td>

                            <td className="border-b border-neutral-200 px-4 py-4">
                              <div className="text-sm font-medium text-neutral-900">
                                {item.name}
                              </div>

                              {item.description ? (
                                <div className="mt-1 text-xs leading-5 text-neutral-500">
                                  {item.description}
                                </div>
                              ) : null}
                            </td>

                            <td className="border-b border-neutral-200 px-4 py-4 text-sm text-neutral-700">
                              {item.category || item.subcategory || "—"}
                            </td>

                            <td className="border-b border-neutral-200 px-4 py-4 text-sm text-neutral-700">
                              {item.unit || "—"}
                            </td>

                            <td className="border-b border-neutral-200 px-4 py-4 text-right text-sm font-semibold text-neutral-900">
                              {formatCurrency(item.basePrice)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>

                    {items.length > 0 ? (
                      <tfoot className="bg-neutral-50">
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-4 text-right text-sm font-semibold text-neutral-700"
                          >
                            Загальна сума позицій
                          </td>
                          <td className="px-4 py-4 text-right text-base font-semibold text-neutral-950">
                            {formatCurrency(totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    ) : null}
                  </table>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                {formInitialValue.noteText ? (
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      Примітка
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-700">
                      {formInitialValue.noteText}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                      Примітка
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Додай примітку в publication settings, якщо потрібно
                      пояснення для клієнта.
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    Параметри документа
                  </p>
                  <div className="mt-2 grid gap-2 text-sm text-neutral-700">
                    <div>
                      Кількість позицій:{" "}
                      <span className="font-medium text-neutral-900">
                        {workPriceList._count.items}
                      </span>
                    </div>
                    <div>
                      Код прайсу:{" "}
                      <span className="font-medium text-neutral-900">
                        {workPriceList.code || "—"}
                      </span>
                    </div>
                    <div>
                      Оновлено:{" "}
                      <span className="font-medium text-neutral-900">
                        {formatDate(workPriceList.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formInitialValue.showFooter ? (
              <div className="border-t border-neutral-200 px-6 py-5 text-sm text-neutral-500 sm:px-10 print:px-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    {formInitialValue.companyName} • {formInitialValue.website}
                  </p>
                  <p>{formInitialValue.footerText}</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
