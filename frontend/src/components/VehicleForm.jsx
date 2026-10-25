import { useEffect, useState } from 'react';
import { imageSrc } from '../api';
import { resizeImage } from '../resizeImage';
import { inputClass, primaryBtn, secondaryBtn } from '../ui';
import Modal from './Modal';
import VehicleImage from './VehicleImage';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PICK_BYTES = 20 * 1024 * 1024; // what the admin may pick
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // what is actually uploaded (after resizing)

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

/**
 * Popup used for both "add vehicle" (no id) and "edit vehicle" (has id).
 * onSubmit(values, { file, remove }) - file is a newly chosen photo, remove clears the saved one.
 */
export default function VehicleForm({ vehicle, onSubmit, onClose }) {
  const isEdit = Boolean(vehicle.id);
  const [values, setValues] = useState({
    make: vehicle.make ?? '',
    model: vehicle.model ?? '',
    category: vehicle.category ?? '',
    price: vehicle.price ?? '',
    quantity: vehicle.quantity ?? '',
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Free the temporary preview URL when it changes or the form closes.
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const set = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  const pickFile = async (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!ALLOWED_TYPES.includes(picked.type)) {
      setError('Photo must be a JPEG, PNG or WebP image');
      return;
    }
    if (picked.size > MAX_PICK_BYTES) {
      setError('Photo must be 20 MB or smaller');
      return;
    }
    setError('');
    setProcessing(true);
    const ready = await resizeImage(picked);
    setProcessing(false);
    if (ready.size > MAX_IMAGE_BYTES) {
      setError('Photo must be 2 MB or smaller');
      return;
    }
    setFile(ready);
    setRemoveImage(false);
    setPreviewUrl(URL.createObjectURL(ready));
  };

  const savedPhoto = isEdit && !removeImage ? imageSrc(vehicle.imagePath) : null;
  const shownPhoto = previewUrl ?? savedPhoto;

  const removePhoto = () => {
    if (previewUrl) {
      setFile(null);
      setPreviewUrl(null);
    } else {
      setRemoveImage(true);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onSubmit(
        { ...values, price: Number(values.price), quantity: Number(values.quantity) },
        { file, remove: removeImage && !file }
      );
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

        <Field id="v-photo" label="Photo (optional)">
          <VehicleImage src={shownPhoto} alt="Photo preview" className="mb-2 h-32 rounded-lg" />
          <input
            id="v-photo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={pickFile}
            className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-sunken file:px-3 file:py-1 file:font-semibold file:text-ink`}
          />
          <p className="mt-1 text-sm text-muted">
            {processing
              ? 'Preparing photo...'
              : 'JPEG, PNG or WebP, up to 20 MB. Large photos are shrunk automatically. Without a photo, the default car illustration is shown.'}
          </p>
          {shownPhoto && (
            <button
              type="button"
              onClick={removePhoto}
              className="mt-1 rounded text-sm font-semibold text-red-700 underline underline-offset-4 hover:text-red-900 focus-visible:outline-2 focus-visible:outline-red-700 dark:text-red-400"
            >
              Remove photo
            </button>
          )}
        </Field>

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
          <button type="submit" disabled={busy || processing} className={primaryBtn}>
            {busy ? 'Saving...' : isEdit ? 'Save changes' : 'Add vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
}