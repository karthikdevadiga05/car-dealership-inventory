import { secondaryBtn } from '../ui';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ name, onLogout }) {
  return (
    <header className="border-b border-line bg-surface">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Logo />

        <p className="hidden truncate text-center text-muted md:block">
          Welcome, <span className="font-bold text-ink">{name}</span>
        </p>

        <div className="col-start-3 flex items-center gap-2">
          <ThemeToggle />
          <button onClick={onLogout} className={secondaryBtn}>
            Sign out
          </button>
        </div>
      </div>

      <p className="truncate px-4 pb-3 text-sm text-muted md:hidden">
        Welcome, <span className="font-bold text-ink">{name}</span>
      </p>
    </header>
  );
}