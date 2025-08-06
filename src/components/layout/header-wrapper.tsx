'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BusinessHeader } from './business-header';
import { CreatorHeader } from './creator-header';

export function HeaderWrapper() {
  const pathname = usePathname();
  const [audience, setAudience] = useState<'business' | 'creator'>('business');

  useEffect(() => {
    // Determine audience based on pathname
    if (pathname.includes('/creator')) {
      setAudience('creator');
    } else {
      setAudience('business');
    }
  }, [pathname]);

  // Don't show header on sign-in/sign-up pages
  if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
    return null;
  }

  return audience === 'business' ? <BusinessHeader /> : <CreatorHeader />;
}