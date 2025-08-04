import { ThemeProvider } from '@/components/theme/theme-provider';
import { DualTargetNavigation } from '@/components/navigation/dual-target-navigation';
import { CommonFooter } from '@/components/navigation/common-footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <DualTargetNavigation />
        <main className="flex-1 pt-16 lg:pt-20">{children}</main>
        <CommonFooter />
      </div>
    </ThemeProvider>
  );
}
