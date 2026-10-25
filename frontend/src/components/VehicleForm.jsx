import { useState } from 'react';
import { inputClass, primaryBtn, secondaryBtn } from '../ui';
import Modal from './Modal';

function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Popup used for both "add vehicle" (no id) and "edit vehicle" (has id). */
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
    <Modal
      eyebrow="AutoYard inventory"
      title={isEdit ? 'Edit vehicle' : 'Add a vehicle'}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field id="v-make" label="Make">
            <input id="v-make" required value={values.make} onChange={set('make')} className={inputClass} />
          </Field>
          <Field id="v-model" label="Model">
            <input id="v-model" required value={values.model} onChange={set('model')} className={inputClass} />
          </Field>
        </div>
        <Field id="v-category" label="Category">
          <input
            id="v-category"
            required
            placeholder="Sedan, SUV, Truck..."
            value={values.category}
            onChange={set('category')}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="v-price" label="Price (₹)">
            <input id="v-price" required type="number" min="0" step="0.01" value={values.price} onChange={set('price')} className={inputClass} />
          </Field>
          <Field id="v-quantity" label="Stock quantity">
            <input id="v-quantity" required type="number" min="0" step="1" value={values.quantity} onChange={set('quantity')} className={inputClass} />
          </Field>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
          >
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className={secondaryBtn}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? 'Saving...' : isEdit ? 'Save changes' : 'Add vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
}