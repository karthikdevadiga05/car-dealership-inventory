import { secondaryBtn } from '../ui';
import Logo from './Logo';

export default function Navbar({ name, onLogout }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3">
        <Logo />

        <p className="hidden truncate text-center text-slate-600 md:block">
          Welcome, <span className="font-bold text-slate-900">{name}</span>
        </p>

        <button onClick={onLogout} className={`${secondaryBtn} col-start-3`}>
          Sign out
        </button>
      </div>

      <p className="truncate px-4 pb-3 text-sm text-slate-600 md:hidden">
        Welcome, <span className="font-bold text-slate-900">{name}</span>
      </p>
    </header>
  );
}