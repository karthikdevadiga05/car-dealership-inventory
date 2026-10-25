import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { displayName, formatPrice, primaryBtn } from '../ui';
import Hero from './Hero';
import Navbar from './Navbar';
import QuantityModal from './QuantityModal';
import SearchBar from './SearchBar';
import VehicleCard from './VehicleCard';
import VehicleForm from './VehicleForm';

const EMPTY_FILTERS = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, vehicle = edit
  const [purchasing, setPurchasing] = useState(null);
  const [restocking, setRestocking] = useState(null);

  const stats = useMemo(
    () => ({
      total: vehicles.length,
      units: vehicles.reduce((sum, v) => sum + v.quantity, 0),
      soldOut: vehicles.filter((v) => v.quantity === 0).length,
    }),
    [vehicles]
  );

  const notify = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // An expired token logs the user out; every error is still re-thrown to the caller.
  const guarded = async (fn) => {
    try {
      await fn();
    } catch (err) {
      if (err.status === 401) logout();
      throw err;
    }
  };

  const load = async () => {
    try {
      const hasFilters = Object.values(filters).some((v) => v !== '');
      const data = hasFilters ? await api.searchVehicles(filters) : await api.listVehicles();
      setVehicles(data);
      setCategories((prev) => [...new Set([...prev, ...data.map((v) => v.category)])].sort());
    } catch (err) {
      if (err.status === 401) return logout();
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Re-query shortly after the filters stop changing (debounce).
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const confirmPurchase = (quantity) =>
    guarded(async () => {
      await api.purchase(purchasing.id, quantity);
      notify(`Purchased ${quantity} × ${purchasing.make} ${purchasing.model}`);
      setPurchasing(null);
      await load();
    });

  const confirmRestock = (quantity) =>
    guarded(async () => {
      await api.restock(restocking.id, quantity);
      notify(`Added ${quantity} × ${restocking.make} ${restocking.model}`);
      setRestocking(null);
      await load();
    });

  const save = (values, image) =>
    guarded(async () => {
      const isEdit = Boolean(editing.id);
      const saved = await (isEdit
        ? api.updateVehicle(editing.id, values)
        : api.createVehicle(values));

      // The vehicle is already saved at this point, so a photo failure must not
      // make the admin submit the form again (that would create a duplicate).
      let photoError = null;
      try {
        if (image.file) await api.uploadImage(saved.id, image.file);
        else if (image.remove) await api.removeImage(saved.id);
      } catch (err) {
        if (err.status === 401) throw err;
        photoError = err.message;
      }

      setEditing(null);
      await load();
      if (photoError) notify(`Saved, but the photo failed: ${photoError}`, 'error');
      else notify(isEdit ? 'Vehicle updated' : 'Vehicle added');
    });

  const remove = async (v) => {
    if (!window.confirm(`Delete ${v.make} ${v.model}?`)) return;
    try {
      await guarded(() => api.deleteVehicle(v.id));
      notify('Vehicle deleted');
      await load();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar name={displayName(user)} onLogout={logout} />

      <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Hero isAdmin={isAdmin} />

        <section aria-label="Inventory summary" className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Vehicles listed" value={stats.total} />
          <StatCard label="Units in stock" value={stats.units} />
          <StatCard label="Out of stock" value={stats.soldOut} />
        </section>

        <SearchBar
          filters={filters}
          categories={categories}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="inventory" className="scroll-mt-20 text-2xl font-bold">
            Inventory
          </h3>
          {isAdmin && (
            <button onClick={() => setEditing({})} className={primaryBtn}>
              + Add vehicle
            </button>
          )}
        </div>

        {loading ? (
          <p className="py-10 text-center text-muted">Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p className="py-10 text-center text-muted">No vehicles match your search.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin={isAdmin}
                onPurchase={setPurchasing}
                onEdit={setEditing}
                onDelete={remove}
                onRestock={setRestocking}
              />
            ))}
          </div>
        )}
      </main>

      {editing && (
        <VehicleForm vehicle={editing} onSubmit={save} onClose={() => setEditing(null)} />
      )}

      {purchasing && (
        <QuantityModal
          eyebrow="AutoYard collection"
          title="Confirm purchase"
          subtitle={`${purchasing.make} ${purchasing.model} · ${formatPrice(purchasing.price)}`}
          note="Confirming reduces the available stock. No payment is taken in this demo."
          hint={`Currently ${purchasing.quantity} in stock`}
          max={purchasing.quantity}
          confirmLabel="Confirm purchase"
          onConfirm={confirmPurchase}
          onClose={() => setPurchasing(null)}
        />
      )}

      {restocking && (
        <QuantityModal
          eyebrow="AutoYard inventory"
          title="Restock vehicle"
          subtitle={`${restocking.make} ${restocking.model}`}
          hint={`Currently ${restocking.quantity} in stock`}
          confirmLabel="Add stock"
          onConfirm={confirmRestock}
          onClose={() => setRestocking(null)}
        />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 left-4 right-4 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg sm:left-auto sm:right-5 sm:max-w-sm ${
            toast.type === 'error' ? 'bg-red-700' : 'bg-emerald-700'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}