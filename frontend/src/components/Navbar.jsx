import { secondaryBtn } from '../ui';
import Logo from './Logo';

export default function Navbar({ name, isAdmin, onLogout }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3">
        <Logo />

        <p className="hidden truncate text-center text-slate-600 md:block">
          Welcome, <span className="font-bold text-slate-900">{name}</span>
        </p>

        <div className="col-start-3 flex items-center gap-3">
          {isAdmin && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-900">
              Admin
            </span>
          )}
          <button onClick={onLogout} className={secondaryBtn}>
            Sign out
          </button>
        </div>
      </div>

      <p className="truncate px-4 pb-3 text-sm text-slate-600 md:hidden">
        Welcome, <span className="font-bold text-slate-900">{name}</span>
      </p>
    </header>
  );
}