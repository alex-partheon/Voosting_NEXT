import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Container } from "@/components/layout/container"
import { Section } from "@/components/layout/section"
import { PageHeader } from "@/components/layout/page-header"

import data from "../dashboard-data.json"

export default function DashboardDemoPage() {
  return (
    <div data-theme="default">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <Container>
              <Section size="lg">
                <PageHeader
                  title="Dashboard 01 데모"
                  description="shadcn/ui dashboard-01 컴포넌트를 활용한 데모 페이지입니다."
                />
              </Section>
            </Container>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}