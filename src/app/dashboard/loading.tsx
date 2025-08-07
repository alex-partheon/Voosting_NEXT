import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="h-16 w-16 rounded-full bg-primary/20" />
          </div>
          <Loader2 className="relative h-16 w-16 animate-spin text-primary" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold">Preparing your dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Loading your campaigns and analytics...
          </p>
        </div>
      </div>
    </div>
  );
}