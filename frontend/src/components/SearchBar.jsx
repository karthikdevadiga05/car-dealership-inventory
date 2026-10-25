import { inputClass, linkBtn } from '../ui';

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

export default function SearchBar({ filters, categories, onChange, onReset }) {
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <section
      aria-label="Search vehicles"
      className="rounded-2xl border border-line bg-surface p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Find the right vehicle</h3>
        <button type="button" onClick={onReset} className={linkBtn}>
          Clear filters
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field id="f-make" label="Make">
          <input id="f-make" placeholder="e.g. Toyota" value={filters.make} onChange={set('make')} className={inputClass} />
        </Field>
        <Field id="f-model" label="Model">
          <input id="f-model" placeholder="e.g. Camry" value={filters.model} onChange={set('model')} className={inputClass} />
        </Field>
        <Field id="f-category" label="Category">
          <select id="f-category" value={filters.category} onChange={set('category')} className={inputClass}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field id="f-min" label="Min price (₹)">
          <input id="f-min" type="number" min="0" placeholder="No minimum" value={filters.minPrice} onChange={set('minPrice')} className={inputClass} />
        </Field>
        <Field id="f-max" label="Max price (₹)">
          <input id="f-max" type="number" min="0" placeholder="No maximum" value={filters.maxPrice} onChange={set('maxPrice')} className={inputClass} />
        </Field>
      </div>
    </section>
  );
}