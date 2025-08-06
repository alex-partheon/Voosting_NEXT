# Voosting Dashboard Theme System

## Overview

The Voosting dashboard theme system is built on modern OKLCH color space for superior color accuracy and seamless theme transitions. It integrates with shadcn/ui components and supports multi-domain dashboards with light/dark modes.

## Architecture

### Core Principles

1. **OKLCH Color Space**: All colors use OKLCH for perceptually uniform color transitions
2. **CSS Variables**: Theme values are CSS custom properties for runtime switching
3. **Tailwind v4 Integration**: Uses `@theme inline` for optimal performance
4. **Multi-Domain Support**: Separate theme variants for creator, business, and admin dashboards
5. **Type Safety**: Full TypeScript support for theme configurations

### Theme Structure

```
theme-system/
├── Base Theme (Light/Dark)
├── Domain Variants
│   ├── Creator (Blue)
│   ├── Business (Emerald)
│   └── Admin (Indigo)
├── Component Themes
│   ├── Sidebar
│   ├── Charts
│   └── UI Components
└── Utilities
    ├── Color Functions
    ├── Theme Context
    └── Runtime Switching
```

## Color System

### Base Colors (OKLCH)

#### Light Mode
```css
:root {
  --background: oklch(0.9824 0.0013 286.3757);
  --foreground: oklch(0.3211 0 0);
  --card: oklch(1.0000 0 0);
  --card-foreground: oklch(0.3211 0 0);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.3211 0 0);
  --primary: oklch(0.6487 0.1538 150.3071);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.6746 0.1414 261.3380);
  --secondary-foreground: oklch(1.0000 0 0);
  --muted: oklch(0.8828 0.0285 98.1033);
  --muted-foreground: oklch(0.5382 0 0);
  --accent: oklch(0.8269 0.1080 211.9627);
  --accent-foreground: oklch(0.3211 0 0);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.8699 0 0);
  --input: oklch(0.8699 0 0);
  --ring: oklch(0.6487 0.1538 150.3071);
}
```

#### Dark Mode
```css
.dark {
  --background: oklch(0.2303 0.0125 264.2926);
  --foreground: oklch(0.9219 0 0);
  --card: oklch(0.3210 0.0078 223.6661);
  --card-foreground: oklch(0.9219 0 0);
  --popover: oklch(0.3210 0.0078 223.6661);
  --popover-foreground: oklch(0.9219 0 0);
  --primary: oklch(0.6487 0.1538 150.3071);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.5880 0.0993 245.7394);
  --secondary-foreground: oklch(0.9219 0 0);
  --muted: oklch(0.3867 0 0);
  --muted-foreground: oklch(0.7155 0 0);
  --accent: oklch(0.6746 0.1414 261.3380);
  --accent-foreground: oklch(0.9219 0 0);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.3867 0 0);
  --input: oklch(0.3867 0 0);
  --ring: oklch(0.6487 0.1538 150.3071);
}
```

### Chart Colors
```css
--chart-1: oklch(0.6487 0.1538 150.3071);  /* Primary Green */
--chart-2: oklch(0.6746 0.1414 261.3380);  /* Secondary Purple */
--chart-3: oklch(0.8269 0.1080 211.9627);  /* Accent Blue */
--chart-4: oklch(0.5880 0.0993 245.7394);  /* Blue */
--chart-5: oklch(0.5905 0.1608 148.2409);  /* Green */
```

### Sidebar Theme
```css
--sidebar: var(--background);
--sidebar-foreground: var(--foreground);
--sidebar-primary: var(--primary);
--sidebar-primary-foreground: var(--primary-foreground);
--sidebar-accent: var(--accent);
--sidebar-accent-foreground: var(--accent-foreground);
--sidebar-border: var(--border);
--sidebar-ring: var(--ring);
```

## Typography

### Font Families
```css
--font-sans: "Plus Jakarta Sans", sans-serif;
--font-serif: "Source Serif 4", serif;
--font-mono: "JetBrains Mono", monospace;
```

### Font Sizes
- `text-xs`: 0.75rem
- `text-sm`: 0.875rem
- `text-base`: 1rem
- `text-lg`: 1.125rem
- `text-xl`: 1.25rem
- `text-2xl`: 1.5rem
- `text-3xl`: 1.875rem
- `text-4xl`: 2.25rem
- `text-5xl`: 3rem

## Layout & Spacing

### Border Radius
```css
--radius: 0.5rem;
--radius-sm: calc(var(--radius) - 4px);  /* 0.25rem */
--radius-md: calc(var(--radius) - 2px);  /* 0.375rem */
--radius-lg: var(--radius);              /* 0.5rem */
--radius-xl: calc(var(--radius) + 4px);  /* 0.75rem */
```

### Shadows
```css
--shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
--shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
--shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
--shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
--shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
--shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
--shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
--shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
```

## Domain Variants

### Creator Dashboard (Blue Theme)
```css
[data-theme="creator"] {
  --primary: oklch(0.59 0.35 240);
  --secondary: oklch(0.69 0.30 240);
  --accent: oklch(0.92 0.12 240);
  --chart-1: oklch(0.59 0.35 240);
  --chart-2: oklch(0.69 0.30 240);
}
```

### Business Dashboard (Emerald Theme)
```css
[data-theme="business"] {
  --primary: oklch(0.58 0.34 158);
  --secondary: oklch(0.67 0.28 158);
  --accent: oklch(0.94 0.08 158);
  --chart-1: oklch(0.58 0.34 158);
  --chart-2: oklch(0.67 0.28 158);
}
```

### Admin Dashboard (Indigo Theme)
```css
[data-theme="admin"] {
  --primary: oklch(0.55 0.37 273);
  --secondary: oklch(0.65 0.32 273);
  --accent: oklch(0.93 0.10 273);
  --chart-1: oklch(0.55 0.37 273);
  --chart-2: oklch(0.65 0.32 273);
}
```

## Implementation Guide

### 1. Basic Setup

```tsx
// Import theme CSS
import '@/app/globals.css'

// Wrap app with theme provider
import { ThemeProvider } from '@/components/theme/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 2. Using Theme Colors

```tsx
// In components
<div className="bg-background text-foreground">
  <Card className="bg-card text-card-foreground">
    <Button className="bg-primary text-primary-foreground">
      Primary Action
    </Button>
  </Card>
</div>

// With Tailwind v4
<div className="bg-[--color-background] text-[--color-foreground]">
  <Card className="bg-[--color-card] text-[--color-card-foreground]">
    <Button className="bg-[--color-primary] text-[--color-primary-foreground]">
      Primary Action
    </Button>
  </Card>
</div>
```

### 3. Domain-Specific Theming

```tsx
// Set domain theme
<div data-theme="creator">
  {/* Creator dashboard with blue theme */}
</div>

<div data-theme="business">
  {/* Business dashboard with emerald theme */}
</div>

<div data-theme="admin">
  {/* Admin dashboard with indigo theme */}
</div>
```

### 4. Theme Switching

```tsx
import { useTheme } from '@/hooks/use-theme'

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

## Component Theming Patterns

### Card Component
```tsx
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-md hover:shadow-lg transition-shadow",
        ghost: "border-0 shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

### Button Component
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Utility Classes

### Glass Effects
```css
.glass {
  background-color: oklch(1 0 0 / 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid oklch(1 0 0 / 0.5);
}

.glass-dark {
  background-color: oklch(0.3210 0.0078 223.6661 / 0.7);
  backdrop-filter: blur(24px);
  border: 1px solid oklch(0.3867 0 0 / 0.5);
}
```

### Gradients
```css
.gradient-primary {
  background: linear-gradient(
    to right,
    oklch(0.6487 0.1538 150.3071),
    oklch(0.6746 0.1414 261.3380)
  );
}

.gradient-accent {
  background: linear-gradient(
    to right,
    oklch(0.8269 0.1080 211.9627),
    oklch(0.6746 0.1414 261.3380)
  );
}
```

### Animations
```css
.theme-transition {
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.hover-lift {
  transition: transform 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}
```

## Best Practices

1. **Always use CSS variables** for theme colors to enable runtime switching
2. **Prefer semantic color names** (primary, secondary) over specific colors
3. **Test in both light and dark modes** to ensure proper contrast
4. **Use OKLCH for custom colors** to maintain consistency
5. **Apply domain themes at container level** to scope changes properly
6. **Cache theme preference** in localStorage for persistence
7. **Provide theme context** through React Context API
8. **Use Tailwind's opacity modifiers** with OKLCH colors for transparency

## TypeScript Types

```typescript
interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
}

interface ThemeConfig {
  light: ThemeColors
  dark: ThemeColors
  domains: {
    creator: Partial<ThemeColors>
    business: Partial<ThemeColors>
    admin: Partial<ThemeColors>
  }
}

type ThemeMode = 'light' | 'dark' | 'system'
type ThemeDomain = 'creator' | 'business' | 'admin'
```

## Accessibility

- All color combinations meet WCAG AA standards for contrast
- Focus states use high-contrast ring colors
- Dark mode maintains proper contrast ratios
- Semantic color names aid screen reader users
- Theme transitions respect `prefers-reduced-motion`

## Performance

- CSS variables enable instant theme switching
- OKLCH colors render efficiently in modern browsers
- Tailwind v4's `@theme inline` reduces CSS size
- No JavaScript required for basic theme rendering
- Theme state persists without re-renders

## Migration Guide

### From HSL to OKLCH
```css
/* Old HSL */
--primary: hsl(142 71% 45%);

/* New OKLCH */
--primary: oklch(0.6487 0.1538 150.3071);
```

### Benefits of OKLCH
1. Perceptually uniform color space
2. Better color interpolation
3. Consistent lightness across hues
4. Superior color accuracy
5. Future-proof color system