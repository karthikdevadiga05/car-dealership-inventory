export default function Navbar({ role, onLogout }) {
  return (
    <header className="bg-slate-900 text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold">🚗 Car Dealership</h1>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            {role}
          </span>
          <button
            onClick={onLogout}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}