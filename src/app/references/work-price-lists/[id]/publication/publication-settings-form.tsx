"use client";

import { useMemo, useState, useTransition } from "react";
import { upsertWorkPriceListPublicationSettingsAction } from "../../actions";

type PublicationSettingsFormProps = {
  workPriceListId: string;
  initialValue: {
    logoUrl: string;
    companyName: string;
    companySubtitle: string;
    headerServices: string;
    website: string;
    email: string;
    phones: string;
    contactsLabel: string;
    documentTitle: string;
    introText: string;
    footerText: string;
    noteText: string;
    showDescription: boolean;
    showCategory: boolean;
    showPeriod: boolean;
    showFooter: boolean;
    showContacts: boolean;
  };
};

type SaveState = {
  ok: boolean;
  message: string;
};

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-neutral-900">{label}</span>
      {children}
      {hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 ${
        props.className ?? ""
      }`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[96px] w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 ${
        props.className ?? ""
      }`}
    />
  );
}

function CheckboxField({
  name,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: (name: string, value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(name, event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
      />
      <span className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-900">{label}</span>
        {hint ? <span className="text-xs text-neutral-500">{hint}</span> : null}
      </span>
    </label>
  );
}

export function PublicationSettingsForm({
  workPriceListId,
  initialValue,
}: PublicationSettingsFormProps) {
  const [form, setForm] = useState(initialValue);
  const [saveState, setSaveState] = useState<SaveState | null>(null);
  const [isPending, startTransition] = useTransition();

  const previewPhones = useMemo(
    () =>
      form.phones
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.phones],
  );

  function setField(name: keyof typeof form, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await upsertWorkPriceListPublicationSettingsAction(formData);

        setSaveState({
          ok: true,
          message: "Налаштування публікації збережено.",
        });
      } catch (error) {
        setSaveState({
          ok: false,
          message:
            error instanceof Error
              ? error.message
              : "Сталася помилка під час збереження.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <input type="hidden" name="workPriceListId" value={workPriceListId} />

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
            Брендинг документа
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Логотип, назва компанії, шапка та контактні дані для друкованого
            шаблону прайсу.
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <Field
            label="URL логотипа"
            hint="Можна залишити порожнім, якщо тимчасово використовуєш текстовий блок замість зображення."
          >
            <Input
              name="logoUrl"
              value={form.logoUrl}
              onChange={(event) => setField("logoUrl", event.target.value)}
              placeholder="https://..."
            />
          </Field>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Назва компанії">
              <Input
                name="companyName"
                value={form.companyName}
                onChange={(event) => setField("companyName", event.target.value)}
                placeholder="Внутрішні інженерні системи"
              />
            </Field>

            <Field label="Підзаголовок">
              <Input
                name="companySubtitle"
                value={form.companySubtitle}
                onChange={(event) =>
                  setField("companySubtitle", event.target.value)
                }
                placeholder="Монтажна компанія"
              />
            </Field>
          </div>

          <Field
            label="Послуги в шапці"
            hint="Один рядок = один пункт або теза."
          >
            <Textarea
              name="headerServices"
              value={form.headerServices}
              onChange={(event) =>
                setField("headerServices", event.target.value)
              }
              placeholder={`електромонтаж\nелектрощити, проектування та розрахунок\nопалення\nводопостачання, водовідведення`}
            />
          </Field>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Сайт">
              <Input
                name="website"
                value={form.website}
                onChange={(event) => setField("website", event.target.value)}
                placeholder="www.vis-montag.com"
              />
            </Field>

            <Field label="Email">
              <Input
                name="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="info@vis-montag.com"
              />
            </Field>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Телефони" hint="Один номер на окремому рядку.">
              <Textarea
                name="phones"
                value={form.phones}
                onChange={(event) => setField("phones", event.target.value)}
                placeholder={`+38 097 124 64 06\n+38 067 709 27 66\n+38 067 350 07 00`}
              />
            </Field>

            <Field
              label="Підпис до контактів"
              hint="Наприклад: Контакти: Роман / Іван / Володимир"
            >
              <Textarea
                name="contactsLabel"
                value={form.contactsLabel}
                onChange={(event) =>
                  setField("contactsLabel", event.target.value)
                }
                placeholder="Контакти: Роман / Іван / Володимир"
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
            Текст документа
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Заголовок, вступний текст, примітка та футер друкованої версії.
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <Field label="Заголовок документа">
            <Input
              name="documentTitle"
              value={form.documentTitle}
              onChange={(event) => setField("documentTitle", event.target.value)}
              placeholder="Прайс робіт"
            />
          </Field>

          <Field label="Вступний текст">
            <Textarea
              name="introText"
              value={form.introText}
              onChange={(event) => setField("introText", event.target.value)}
              placeholder="Короткий вступний текст перед таблицею прайсу."
            />
          </Field>

          <Field label="Примітка">
            <Textarea
              name="noteText"
              value={form.noteText}
              onChange={(event) => setField("noteText", event.target.value)}
              placeholder="Вартість у прайсі наведена для попереднього розрахунку..."
            />
          </Field>

          <Field label="Футер">
            <Textarea
              name="footerText"
              value={form.footerText}
              onChange={(event) => setField("footerText", event.target.value)}
              placeholder="Документ сформовано для друку / PDF / відправлення"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
            Параметри відображення
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Керування видимістю блоків у publication view.
          </p>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <CheckboxField
            name="showDescription"
            checked={form.showDescription}
            onChange={setField}
            label="Показувати опис прайсу"
          />
          <CheckboxField
            name="showCategory"
            checked={form.showCategory}
            onChange={setField}
            label="Показувати категорію прайсу"
          />
          <CheckboxField
            name="showPeriod"
            checked={form.showPeriod}
            onChange={setField}
            label="Показувати період дії"
          />
          <CheckboxField
            name="showContacts"
            checked={form.showContacts}
            onChange={setField}
            label="Показувати контакти в шапці"
          />
          <CheckboxField
            name="showFooter"
            checked={form.showFooter}
            onChange={setField}
            label="Показувати футер документа"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
            Швидке прев’ю
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Попередній вигляд шапки, контактів і текстових блоків.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900">
                  {form.logoUrl ? "LOGO" : "VIS"}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-neutral-950">
                    {form.companyName || "Назва компанії"}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {form.companySubtitle || "Підзаголовок компанії"}
                  </p>
                </div>
              </div>

              {form.headerServices ? (
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-neutral-700">
                  {form.headerServices
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .map((item) => (
                      <span
                        key={item}
                        className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1"
                      >
                        {item}
                      </span>
                    ))}
                </div>
              ) : null}
            </div>

            {form.showContacts ? (
              <div className="grid gap-1 text-sm text-neutral-700 lg:text-right">
                {form.website ? <span>{form.website}</span> : null}
                {form.email ? <span>{form.email}</span> : null}
                {previewPhones.map((phone) => (
                  <span key={phone}>{phone}</span>
                ))}
                {form.contactsLabel ? (
                  <span className="mt-2 text-xs text-neutral-500">
                    {form.contactsLabel}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t border-neutral-200 pt-4">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">
              {form.documentTitle || "Прайс робіт"}
            </p>

            {form.introText ? (
              <p className="mt-2 text-sm leading-6 text-neutral-700">
                {form.introText}
              </p>
            ) : null}

            {form.noteText ? (
              <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-700">
                {form.noteText}
              </div>
            ) : null}

            {form.showFooter && form.footerText ? (
              <div className="mt-4 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
                {form.footerText}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {saveState ? (
            <p
              className={`text-sm ${
                saveState.ok ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {saveState.message}
            </p>
          ) : (
            <p className="text-sm text-neutral-500">
              Збереження оновлює publication-шаблон для друку та відправлення.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl border border-neutral-950 bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Збереження..." : "Зберегти налаштування"}
        </button>
      </div>
    </form>
  );
}
