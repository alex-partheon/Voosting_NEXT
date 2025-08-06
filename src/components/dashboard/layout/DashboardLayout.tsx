'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarTheme?: 'purple' | 'dark' | 'light';
  domainType?: 'creator' | 'business' | 'admin' | 'main';
}

export function DashboardLayout({ 
  children, 
  sidebarTheme = 'purple',
  domainType = 'main' 
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[hsl(240_9.0909%_97.8431%)]">
      <DashboardSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={sidebarTheme}
        domainType={domainType}
      />
      
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <DashboardHeader />
        
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}