import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar domain="business" />
      <SidebarInset>
        <SiteHeader domain="business" />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}