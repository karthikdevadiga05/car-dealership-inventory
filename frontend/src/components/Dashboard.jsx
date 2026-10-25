import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Navbar from './Navbar';
import SearchBar from './SearchBar';
import VehicleCard from './VehicleCard';
import VehicleForm from './VehicleForm';

const EMPTY_FILTERS = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, vehicle = edit

  const notify = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleError = (err) => {
    if (err.status === 401) return logout(); // token expired
    notify(err.message, 'error');
  };

  const load = async () => {
    try {
      const hasFilters = Object.values(filters).some((v) => v !== '');
      const data = hasFilters ? await api.searchVehicles(filters) : await api.listVehicles();
      setVehicles(data);
      setCategories((prev) =>
        [...new Set([...prev, ...data.map((v) => v.category)])].sort()
      );
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // Re-query shortly after the filters stop changing (debounce).
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const run = async (action, message) => {
    try {
      await action();
      notify(message);
      await load();
    } catch (err) {
      handleError(err);
    }
  };

  const purchase = (v) => run(() => api.purchase(v.id), `Purchased ${v.make} ${v.model}`);

  const restock = (v) => {
    const raw = window.prompt(`How many units of ${v.make} ${v.model} to add?`, '5');
    if (raw === null) return;
    run(() => api.restock(v.id, Number(raw)), 'Stock updated');
  };

  const remove = (v) => {
    if (!window.confirm(`Delete ${v.make} ${v.model}?`)) return;
    run(() => api.deleteVehicle(v.id), 'Vehicle deleted');
  };

  const save = async (values) => {
    const isEdit = Boolean(editing.id);
    await (isEdit ? api.updateVehicle(editing.id, values) : api.createVehicle(values));
    setEditing(null);
    notify(isEdit ? 'Vehicle updated' : 'Vehicle added');
    await load();
  };

  return (
    <div className="min-h-screen">
      <Navbar role={user.role} onLogout={logout} />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available vehicles</h2>
          {isAdmin && (
            <button
              onClick={() => setEditing({})}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
            >
              + Add vehicle
            </button>
          )}
        </div>

        <SearchBar
          filters={filters}
          categories={categories}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />

        {loading ? (
          <p className="py-10 text-center text-slate-500">Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p className="py-10 text-center text-slate-500">No vehicles match your search.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isAdmin={isAdmin}
                onPurchase={purchase}
                onEdit={setEditing}
                onDelete={remove}
                onRestock={restock}
              />
            ))}
          </div>
        )}
      </main>

      {editing && (
        <VehicleForm vehicle={editing} onSubmit={save} onClose={() => setEditing(null)} />
      )}

      {toast && (
        <div
          className={`fixed bottom-5 right-5 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}