"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getMounted = () => true;
const getMountedServer = () => false;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getMounted, getMountedServer);

  if (!mounted) return <span className="inline-block w-[4ch]" aria-hidden />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="font-mono text-[12px] tracking-wider text-muted hover:text-accent transition-colors duration-150 cursor-pointer"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      [{isDark ? "○●" : "●○"}]
    </button>
  );
}
