import { formatPrice, primaryBtn, secondaryBtn } from '../ui';

const TINTS = [
  'bg-sky-100 text-sky-300 dark:bg-sky-950 dark:text-sky-700',
  'bg-amber-100 text-amber-300 dark:bg-amber-950 dark:text-amber-700',
  'bg-emerald-100 text-emerald-300 dark:bg-emerald-950 dark:text-emerald-700',
  'bg-violet-100 text-violet-300 dark:bg-violet-950 dark:text-violet-700',
];

function CarIllustration() {
  return (
    <svg viewBox="0 0 200 100" className="h-28 w-48" aria-hidden="true">
      <path
        d="M20 70 L30 52 Q34 46 42 44 L70 38 Q80 24 96 22 L128 22 Q142 24 150 38 L172 44 Q184 48 184 60 L184 70 Z"
        fill="currentColor"
      />
      <path d="M78 38 Q86 28 98 27 L126 27 Q136 28 142 38 Z" fill="#f8fafc" opacity="0.8" />
      <circle cx="56" cy="72" r="14" fill="#1e293b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx="56" cy="72" r="6" fill="#f8fafc" />
      <circle cx="148" cy="72" r="14" fill="#1e293b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx="148" cy="72" r="6" fill="#f8fafc" />
    </svg>
  );
}

export default function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onDelete, onRestock }) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:shadow-md">
      <div className={`relative flex items-center justify-center py-6 ${TINTS[vehicle.id % TINTS.length]}`}>
        <span className="absolute left-3 top-3 rounded-md bg-surface px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink">
          {vehicle.category}
        </span>
        <CarIllustration />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">{vehicle.make}</p>
            <h3 className="text-xl font-bold">{vehicle.model}</h3>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              outOfStock
                ? 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200'
                : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
            }`}
          >
            {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
          </span>
        </div>

        <p className="mt-4 text-2xl font-bold">{formatPrice(vehicle.price)}</p>

        {!isAdmin && (
          <button
            onClick={() => onPurchase(vehicle)}
            disabled={outOfStock}
            className={`${primaryBtn} mt-4 disabled:bg-sunken disabled:text-muted disabled:opacity-100`}
          >
            {outOfStock ? 'Unavailable' : 'Purchase'}
          </button>
        )}

        {isAdmin && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onEdit(vehicle)} className={secondaryBtn}>
                Edit
              </button>
              <button onClick={() => onRestock(vehicle)} className={primaryBtn}>
                Restock
              </button>
            </div>
            <button
              onClick={() => onDelete(vehicle)}
              className="rounded text-sm font-semibold text-red-700 underline underline-offset-4 hover:text-red-900 focus-visible:outline-2 focus-visible:outline-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}