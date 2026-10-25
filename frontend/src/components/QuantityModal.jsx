import { useState } from 'react';
import { inputClass, primaryBtn, secondaryBtn } from '../ui';
import Modal from './Modal';

/** Popup that asks for a quantity. Used for both purchasing and restocking. */
export default function QuantityModal({
  eyebrow,
  title,
  subtitle,
  note,
  hint,
  max,
  confirmLabel,
  onConfirm,
  onClose,
}) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onConfirm(Number(quantity));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal eyebrow={eyebrow} title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="font-medium text-slate-900">{subtitle}</p>
        {note && <p className="text-sm text-slate-600">{note}</p>}

        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-slate-900">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            max={max}
            step="1"
            required
            autoFocus
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputClass}
          />
          {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} className={secondaryBtn}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}