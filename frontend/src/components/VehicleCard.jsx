const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onDelete, onRestock }) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <div className="flex flex-col rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {vehicle.category}
          </span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            outOfStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">{money(vehicle.price)}</p>

      <button
        onClick={() => onPurchase(vehicle)}
        disabled={outOfStock}
        className="mt-4 rounded-lg bg-indigo-600 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {outOfStock ? 'Unavailable' : 'Purchase'}
      </button>

      {isAdmin && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-sm">
          <button onClick={() => onEdit(vehicle)} className="rounded-lg border border-slate-300 py-1.5 hover:bg-slate-50">
            Edit
          </button>
          <button onClick={() => onRestock(vehicle)} className="rounded-lg border border-slate-300 py-1.5 hover:bg-slate-50">
            Restock
          </button>
          <button onClick={() => onDelete(vehicle)} className="rounded-lg border border-red-200 py-1.5 text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}