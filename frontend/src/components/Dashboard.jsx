import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { displayName, formatPrice, primaryBtn } from '../ui';
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

  const save = (values) =>
    guarded(async () => {
      const isEdit = Boolean(editing.id);
      await (isEdit ? api.updateVehicle(editing.id, values) : api.createVehicle(values));
      setEditing(null);
      notify(isEdit ? 'Vehicle updated' : 'Vehicle added');
      await load();
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

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <section className="rounded-3xl bg-indigo-900 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-200">
            {isAdmin ? 'Inventory control' : 'Showroom'}
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            {isAdmin ? 'Keep your showroom stocked.' : 'Find the car that fits your life.'}
          </h2>
          <p className="mt-2 max-w-xl text-indigo-100">
            {isAdmin
              ? 'Add vehicles, update prices and restock the cars that sell fastest.'
              : 'Compare models, filter by price and buy straight from live stock.'}
          </p>
        </section>

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

        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Inventory</h3>
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          className={`fixed bottom-5 right-5 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            toast.type === 'error' ? 'bg-red-700' : 'bg-emerald-700'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}