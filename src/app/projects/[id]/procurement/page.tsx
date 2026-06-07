export default function ProjectProcurementPage() {
    return (
      <div className="space-y-6">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Закупівля
          </div>
  
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
            Модуль закупівлі в підготовці
          </h1>
  
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
            Тут буде окрема робоча сторінка для закупівлі матеріалів і фурнітури:
            списки на замовлення, постачальники, статуси закупівлі та контроль
            комплектації по об’єкту.
          </p>
  
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="text-sm font-medium text-neutral-900">
                Що тут буде
              </div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">
                Формування списків закупівлі, окремо по матеріалах, фурнітурі та
                позиціях під конкретні етапи монтажу.
              </div>
            </div>
  
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="text-sm font-medium text-neutral-900">
                Логіка роботи
              </div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">
                Позиції із проєкту будуть переходити в закупівлю, групуватися та
                отримувати статуси: до замовлення, замовлено, отримано, закрито.
              </div>
            </div>
  
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <div className="text-sm font-medium text-neutral-900">
                Поточний стан
              </div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">
                Маршрут активний як безпечна заглушка, щоб вкладка вже працювала і
                не ламала сторінку проєкту.
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
  