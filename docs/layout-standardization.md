# Layout Component Standardization Guide

## Overview

This document outlines the standardized layout components based on shadcn/ui patterns for the Voosting platform.

## Standardized Components

### 1. Container Component

Located at: `/src/components/layout/container.tsx`

**Usage:**
```tsx
import { Container } from '@/components/layout';

// Size variants
<Container size="sm">...</Container>  // max-w-3xl (768px)
<Container size="md">...</Container>  // max-w-5xl (1024px)
<Container size="lg">...</Container>  // max-w-6xl (1152px) - default
<Container size="xl">...</Container>  // max-w-7xl (1280px)
<Container size="full">...</Container> // max-w-full (100%)

// With custom classes
<Container className="text-center">...</Container>
```

### 2. Section Component

Located at: `/src/components/layout/section.tsx`

**Usage:**
```tsx
import { Section } from '@/components/layout';

// Size variants
<Section size="sm">...</Section>  // py-8 md:py-12
<Section size="md">...</Section>  // py-12 md:py-20 - default
<Section size="lg">...</Section>  // py-16 md:py-24
<Section size="xl">...</Section>  // py-20 md:py-32

// With custom element
<Section as="article">...</Section>
<Section as="div">...</Section>

// With custom classes
<Section className="bg-muted/20">...</Section>
```

### 3. PageHeader Component

Located at: `/src/components/layout/page-header.tsx`

**Usage:**
```tsx
import { PageHeader } from '@/components/layout';

// Basic usage
<PageHeader 
  title="페이지 제목"
  description="페이지 설명"
/>

// With action buttons
<PageHeader 
  title="페이지 제목"
  description="페이지 설명"
>
  <Button>액션 1</Button>
  <Button variant="outline">액션 2</Button>
</PageHeader>

// With alignment
<PageHeader 
  title="제목"
  align="left" // left, center(default), right
/>

// With React nodes
<PageHeader 
  title={<>복잡한 <span className="text-primary">제목</span></>}
  description={<>여러 줄<br />설명</>}
/>
```

## Migration Guide

### From Complex Layout Components

**Before:**
```tsx
import { Container, Section } from '@/components/ui/layout-components';

<Section variant="spacious">
  <Container variant="standard">
    ...
  </Container>
</Section>
```

**After:**
```tsx
import { Container, Section } from '@/components/layout';

<Section size="xl">
  <Container size="lg">
    ...
  </Container>
</Section>
```

### Variant Mapping

**Container variants:**
- `narrow` → `size="sm"`
- `standard` → `size="lg"` (default)
- `wide` → `size="xl"`

**Section variants:**
- `compact` → `size="sm"`
- `base` → `size="md"` (default)
- `spacious` → `size="xl"`

## Best Practices

1. **Use semantic sizing:** Choose sizes based on content hierarchy, not arbitrary values
2. **Consistent spacing:** Use Section for vertical rhythm, Container for horizontal constraints
3. **Responsive by default:** All components are mobile-first and responsive
4. **Composition over complexity:** Combine simple components rather than creating complex ones

## Common Patterns

### Standard Page Layout
```tsx
<div className="min-h-screen">
  <Section size="xl">
    <Container>
      <PageHeader 
        title="페이지 제목"
        description="설명"
      />
    </Container>
  </Section>

  <Section>
    <Container>
      {/* Main content */}
    </Container>
  </Section>

  <Section size="lg" className="bg-muted/20">
    <Container>
      {/* Secondary content */}
    </Container>
  </Section>
</div>
```

### Feature Grid
```tsx
<Section size="lg">
  <Container>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Feature cards */}
    </div>
  </Container>
</Section>
```

### Hero Section
```tsx
<Section size="xl" className="relative overflow-hidden">
  {/* Background decorations */}
  <div className="absolute inset-0 -z-10">
    {/* ... */}
  </div>
  
  <Container>
    <PageHeader 
      title="Hero Title"
      description="Hero description"
    >
      <Button size="lg">CTA 1</Button>
      <Button size="lg" variant="outline">CTA 2</Button>
    </PageHeader>
  </Container>
</Section>
```

## Notes

- All layout components follow shadcn/ui's design philosophy: simple, composable, and customizable
- No external animation libraries (framer-motion, react-parallax-tilt) are used
- Components use Tailwind CSS classes exclusively
- All components support the `className` prop for customization
- Components are typed with TypeScript for better DX