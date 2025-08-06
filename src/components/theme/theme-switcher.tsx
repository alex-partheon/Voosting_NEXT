'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 h-9">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Alternative inline theme toggle button
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-16 items-center rounded-full bg-muted transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="Toggle theme"
    >
      <span
        className={`${
          theme === 'dark' ? 'translate-x-9' : 'translate-x-1'
        } inline-block h-7 w-7 transform rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out`}
      >
        {theme === 'dark' ? (
          <Moon className="h-full w-full p-1.5 text-muted-foreground" />
        ) : (
          <Sun className="h-full w-full p-1.5 text-muted-foreground" />
        )}
      </span>
    </button>
  );
}

/**
 * Domain theme switcher for dashboard
 */
export function DomainThemeSwitcher() {
  const { domain, setDomain } = useTheme();

  const domains = [
    { value: undefined, label: 'Default', color: 'bg-primary' },
    { value: 'creator' as const, label: 'Creator', color: 'bg-blue-500' },
    { value: 'business' as const, label: 'Business', color: 'bg-emerald-500' },
    { value: 'admin' as const, label: 'Admin', color: 'bg-indigo-500' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Theme:</span>
      <div className="flex gap-1">
        {domains.map((d) => (
          <button
            key={d.value}
            onClick={() => setDomain(d.value)}
            className={`group relative h-6 w-6 rounded-full transition-all ${d.color} ${
              domain === d.value ? 'ring-2 ring-offset-2 ring-ring' : 'hover:scale-110'
            }`}
            aria-label={`Switch to ${d.label} theme`}
          >
            <span className="sr-only">{d.label}</span>
            {domain === d.value && (
              <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}