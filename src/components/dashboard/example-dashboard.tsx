'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTheme } from '@/hooks/use-theme'
import { Moon, Sun, Monitor, Palette } from 'lucide-react'

export function ExampleDashboard() {
  const { theme, setTheme, domain, setDomain } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme controls */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Voosting Dashboard
            </h1>
            
            <div className="flex items-center gap-4">
              {/* Domain selector */}
              <Select value={domain || 'none'} onValueChange={(value) => setDomain(value === 'none' ? undefined : value as any)}>
                <SelectTrigger className="w-[180px]">
                  <Palette className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default Theme</SelectItem>
                  <SelectItem value="creator">Creator (Blue)</SelectItem>
                  <SelectItem value="business">Business (Emerald)</SelectItem>
                  <SelectItem value="admin">Admin (Indigo)</SelectItem>
                </SelectContent>
              </Select>

              {/* Theme mode selector */}
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[140px]">
                  {theme === 'light' && <Sun className="mr-2 h-4 w-4" />}
                  {theme === 'dark' && <Moon className="mr-2 h-4 w-4" />}
                  {theme === 'system' && <Monitor className="mr-2 h-4 w-4" />}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Color showcase cards */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Colors</CardTitle>
              <CardDescription>Main brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Primary</span>
                <div className="h-10 w-20 rounded bg-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Secondary</span>
                <div className="h-10 w-20 rounded bg-secondary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Accent</span>
                <div className="h-10 w-20 rounded bg-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UI Elements</CardTitle>
              <CardDescription>Component examples</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Primary Button</Button>
              <Button variant="secondary" className="w-full">Secondary</Button>
              <Button variant="outline" className="w-full">Outline</Button>
              <Button variant="ghost" className="w-full">Ghost</Button>
              <Button variant="destructive" className="w-full">Destructive</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart Colors</CardTitle>
              <CardDescription>Data visualization palette</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Chart 1</span>
                <div className="h-10 w-20 rounded bg-[--chart-1]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chart 2</span>
                <div className="h-10 w-20 rounded bg-[--chart-2]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chart 3</span>
                <div className="h-10 w-20 rounded bg-[--chart-3]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chart 4</span>
                <div className="h-10 w-20 rounded bg-[--chart-4]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chart 5</span>
                <div className="h-10 w-20 rounded bg-[--chart-5]" />
              </div>
            </CardContent>
          </Card>

          {/* Gradient examples */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Gradient Effects</CardTitle>
              <CardDescription>OKLCH-based gradients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-20 rounded-lg gradient-primary" />
              <div className="h-20 rounded-lg gradient-accent" />
              <div className="h-20 rounded-lg bg-gradient-to-r from-primary to-secondary" />
            </CardContent>
          </Card>

          {/* Glass effect */}
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle>Glass Effect</CardTitle>
              <CardDescription>Glassmorphism with backdrop blur</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card uses the glass effect utility class for a modern, translucent appearance.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Theme information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current Theme Configuration</CardTitle>
            <CardDescription>Active theme settings and domain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Theme Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Current: <span className="font-medium text-foreground">{theme}</span>
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Domain Theme</h3>
                <p className="text-sm text-muted-foreground">
                  Current: <span className="font-medium text-foreground">{domain || 'Default'}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}