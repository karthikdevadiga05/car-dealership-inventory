import { useState } from 'react';

/** Reads and flips the "dark" class on <html>, remembering the choice in localStorage. */
export function useTheme() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Storage can be blocked (private mode); the theme just won't persist.
    }
    setDark(next);
  };

  return [dark, toggle];
}