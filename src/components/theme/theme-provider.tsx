'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type TargetTheme = 'business' | 'creator';

interface ThemeContextType {
  target: TargetTheme;
  setTarget: (target: TargetTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [target, setTarget] = useState<TargetTheme>('business');

  // 경로에 따른 자동 테마 설정
  useEffect(() => {
    if (pathname.includes('/creators')) {
      setTarget('creator');
      document.documentElement.setAttribute('data-target', 'creator');
    } else {
      setTarget('business');
      document.documentElement.setAttribute('data-target', 'business');
    }
  }, [pathname]);

  // 테마 전환 시 부드러운 애니메이션
  const handleSetTarget = (newTarget: TargetTheme) => {
    setTarget(newTarget);
    document.documentElement.setAttribute('data-target', newTarget);
  };

  return (
    <ThemeContext.Provider value={{ target, setTarget: handleSetTarget }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
