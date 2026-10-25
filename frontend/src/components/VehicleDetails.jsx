import { imageSrc } from '../api';
import { formatPrice, primaryBtn, secondaryBtn } from '../ui';
import Modal from './Modal';
import VehicleImage from './VehicleImage';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

/** Popup with the full photo and details of one vehicle, with a way to start a purchase. */
export default function VehicleDetails({ vehicle, onPurchase, onClose }) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <Modal eyebrow={vehicle.make} title={vehicle.model} onClose={onClose}>
      <VehicleImage
        src={imageSrc(vehicle.imagePath)}
        alt={`${vehicle.make} ${vehicle.model}`}
        className="h-52 rounded-xl"
      />

      <dl className="mt-4 divide-y divide-line text-sm">
        <Row label="Category" value={vehicle.category} />
        <Row label="Price" value={formatPrice(vehicle.price)} />
        <Row label="Availability" value={outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`} />
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={onClose} className={secondaryBtn}>
          Back to list
        </button>
        <button
          type="button"
          onClick={() => onPurchase(vehicle)}
          disabled={outOfStock}
          className={`${primaryBtn} disabled:bg-sunken disabled:text-muted disabled:opacity-100`}
        >
          {outOfStock ? 'Unavailable' : 'Purchase'}
        </button>
      </div>
    </Modal>
  );
}