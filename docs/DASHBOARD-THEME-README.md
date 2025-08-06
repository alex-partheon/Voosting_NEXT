# Voosting Dashboard Theme System - Quick Start Guide

## Overview

The Voosting Dashboard Theme System is built on OKLCH color space for perceptually uniform colors across light/dark modes and supports multi-domain theming for creator, business, and admin dashboards.

## Quick Start

### 1. Basic Setup

The theme system is already integrated into the project. To use it in your components:

```tsx
import { useTheme } from '@/components/theme/theme-provider';

export function MyComponent() {
  const { theme, domain, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Current domain: {domain}</p>
      <button onClick={toggleTheme}>Toggle theme</button>
    </div>
  );
}
```

### 2. Using Theme Colors

All colors are available as CSS custom properties:

```css
/* In your CSS */
.my-element {
  background-color: var(--background);
  color: var(--foreground);
  border-color: var(--border);
}

/* With Tailwind */
<div className="bg-background text-foreground border-border">
  Content
</div>
```

### 3. Domain-Specific Themes

The system automatically applies domain-specific colors based on the current route:

- `/creator/*` → Blue theme
- `/business/*` → Emerald theme  
- `/admin/*` → Indigo theme

### 4. Theme Components

Use the pre-built theme components:

```tsx
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { ThemedCard } from '@/components/dashboard/examples/themed-card';

export function Dashboard() {
  return (
    <>
      <ThemeSwitcher />
      
      <ThemedCard 
        title="Revenue" 
        variant="gradient"
      >
        <p>$45,231</p>
      </ThemedCard>
    </>
  );
}
```

## Available Theme Utilities

### Color Manipulation

```tsx
import { adjustLightness, getContrastColor } from '@/lib/theme';

// Make a color lighter/darker
const lighter = adjustLightness('oklch(0.6487 0.1538 150.3071)', 0.1);

// Get contrasting text color
const textColor = getContrastColor(backgroundColor);
```

### CSS Classes

```tsx
import { themeClasses } from '@/lib/theme';

<div className={themeClasses.glass}>
  Glass effect
</div>

<button className={themeClasses.hoverLift}>
  Hover me
</button>
```

## Color Reference

### Core Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| `--primary` | Green | Green | Primary actions, links |
| `--secondary` | Purple | Purple | Secondary actions |
| `--accent` | Light Blue | Purple-Blue | Highlights, badges |
| `--destructive` | Red | Red | Errors, delete actions |
| `--muted` | Yellow-Gray | Dark Gray | Disabled states |

### Domain Colors

| Domain | Primary | Secondary | Accent |
|--------|---------|-----------|---------|
| Creator | Blue | Light Blue | Pale Blue |
| Business | Emerald | Light Emerald | Pale Emerald |
| Admin | Indigo | Light Indigo | Pale Indigo |

## Typography

The system uses three font families:

- **Sans**: Plus Jakarta Sans (UI elements)
- **Serif**: Source Serif 4 (Editorial content)
- **Mono**: JetBrains Mono (Code, IDs)

```css
font-family: var(--font-sans);
font-family: var(--font-serif);
font-family: var(--font-mono);
```

## Demo Page

View the complete theme system demo at:
[http://localhost:3002/dashboard-theme-demo](http://localhost:3002/dashboard-theme-demo)

## Best Practices

1. **Always use theme tokens** instead of hard-coded colors
2. **Test in both light and dark modes** during development
3. **Use semantic color names** (e.g., `primary` not `green`)
4. **Leverage domain themes** for consistent branding
5. **Apply transitions** for smooth theme switching

## Examples

### Themed Button

```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</Button>
```

### Gradient Background

```tsx
<div className="bg-gradient-to-r from-primary to-secondary">
  Gradient content
</div>
```

### Glass Effect Card

```tsx
<Card className="bg-background/60 backdrop-blur-md border-border/50">
  Glass card content
</Card>
```

### Domain-Aware Component

```tsx
function DomainLogo() {
  const { domain } = useTheme();
  
  return (
    <div className={cn(
      'h-10 w-10 rounded-full',
      {
        'bg-blue-500': domain === 'creator',
        'bg-emerald-500': domain === 'business',
        'bg-indigo-500': domain === 'admin',
      }
    )}>
      {/* Logo */}
    </div>
  );
}
```

## Troubleshooting

### Theme not applying?

1. Ensure `ThemeProvider` wraps your app
2. Check that CSS variables are loaded in `globals.css`
3. Verify no conflicting styles override theme variables

### Colors look wrong?

1. OKLCH colors require modern browser support
2. Check browser console for CSS errors
3. Ensure Tailwind CSS v4 is properly configured

### Flash of unstyled content?

The theme system includes FOUC prevention. Ensure:
1. Theme is loaded in layout before components
2. `no-transition` class is applied during initial load

For more details, see the full documentation at `/docs/DASHBOARD-THEME.md`.