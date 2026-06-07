export default function ProjectEstimatePage() {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
        Кошторис
      </h2>

      <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base">
        Кошторис є окремим документним шаром проєкту. Він формується на основі
        вкладки “Роботи та матеріали”, довідників і менеджерських коригувань, а
        в межах одного проєкту може існувати кілька версій кошторису.
      </p>
    </section>
  );
}
