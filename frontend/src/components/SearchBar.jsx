const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

export default function SearchBar({ filters, categories, onChange, onReset }) {
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <div className="grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
      <input placeholder="Make" value={filters.make} onChange={set('make')} className={inputClass} />
      <input placeholder="Model" value={filters.model} onChange={set('model')} className={inputClass} />
      <select value={filters.category} onChange={set('category')} className={inputClass}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="number"
        min="0"
        placeholder="Min price"
        value={filters.minPrice}
        onChange={set('minPrice')}
        className={inputClass}
      />
      <input
        type="number"
        min="0"
        placeholder="Max price"
        value={filters.maxPrice}
        onChange={set('maxPrice')}
        className={inputClass}
      />
      <button
        onClick={onReset}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Reset
      </button>
    </div>
  );
}