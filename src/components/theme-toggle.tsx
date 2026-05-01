'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getMounted = () => true;
const getMountedServer = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getMounted, getMountedServer);

  if (!mounted) return <span className="w-10" aria-hidden />;

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="font-mono text-[11px] uppercase tracking-[0.15em] hover:text-accent transition-colors duration-150 cursor-pointer"
      aria-label="Toggle theme"
    >
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
