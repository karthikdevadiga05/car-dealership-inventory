import { useState } from 'react';

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

/** Modal used for both "add vehicle" (no id) and "edit vehicle" (has id). */
export default function VehicleForm({ vehicle, onSubmit, onClose }) {
  const isEdit = Boolean(vehicle.id);
  const [values, setValues] = useState({
    make: vehicle.make ?? '',
    model: vehicle.model ?? '',
    category: vehicle.category ?? '',
    price: vehicle.price ?? '',
    quantity: vehicle.quantity ?? '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onSubmit({
        ...values,
        price: Number(values.price),
        quantity: Number(values.quantity),
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold">{isEdit ? 'Edit vehicle' : 'Add vehicle'}</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Make</label>
            <input required value={values.make} onChange={set('make')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Model</label>
            <input required value={values.model} onChange={set('model')} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <input
            required
            placeholder="Sedan, SUV, Truck..."
            value={values.category}
            onChange={set('category')}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Price ($)</label>
            <input required type="number" min="0" step="0.01" value={values.price} onChange={set('price')} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity</label>
            <input required type="number" min="0" step="1" value={values.quantity} onChange={set('quantity')} className={inputClass} />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}