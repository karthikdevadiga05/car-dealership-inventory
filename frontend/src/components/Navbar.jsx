import { secondaryBtn } from '../ui';

export default function Navbar({ role, onLogout }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <p className="text-xl font-bold text-indigo-900">🚗 AutoYard</p>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-900">
            {role === 'admin' ? 'Administrator' : 'Customer'}
          </span>
          <button onClick={onLogout} className={secondaryBtn}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}