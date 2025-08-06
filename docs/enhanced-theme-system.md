# Enhanced Theme System for Voosting

A beautiful, fancy, and stylish theme system built on OKLCH color space with advanced effects, animations, and domain-specific enhancements.

## Features

### 1. **OKLCH Color System**
- Perceptually uniform color space
- Dynamic color manipulation utilities
- Color mixing, complementary, triadic, and analogous color generation

### 2. **Gradient Presets**
```typescript
// Linear gradients
linearPrimary    // Primary color gradient
linearAccent     // Accent color gradient
linearAurora     // Aurora-like gradient effect
linearSunset     // Sunset color transitions
linearOcean      // Ocean-inspired gradient

// Radial gradients
radialGlow       // Soft glow effect
radialPulse      // Pulsing light effect
radialSpotlight  // Spotlight illumination

// Conic gradients
conicRainbow     // Full spectrum rainbow
conicHalo        // Halo light effect
conicSpiral      // Spiral color transition
```

### 3. **Effect Variables**
```typescript
// Glow effects
glowSoft         // Subtle glow
glowMedium       // Standard glow
glowIntense      // Strong glow
glowNeon         // Neon-style glow

// Shadow effects
shadowElevation1 // Subtle elevation
shadowElevation2 // Medium elevation
shadowElevation3 // High elevation
shadowInset      // Inset shadow

// Glassmorphism
glassBackground  // Glass-like background
glassBlur        // Backdrop blur
glassBorder      // Translucent border
glassShadow      // Glass shadow effect

// Neon effects
neonText         // Neon text glow
neonBorder       // Neon border effect
neonGlow         // Intense neon glow
```

### 4. **Animation System**
```typescript
// Spring configurations
springGentle     // Smooth, gentle motion
springBouncy     // Playful bounce
springStiff      // Quick, snappy motion
springElastic    // Elastic overshoot

// Timing functions
easeElastic      // Elastic easing
easeBack         // Back easing
easeExpo         // Exponential easing
easeBounce       // Bounce easing

// Durations
durationFast     // 0.2s
durationNormal   // 0.4s
durationSlow     // 0.8s
durationVerySlow // 1.5s

// Parallax speeds
parallaxSlow     // 0.5x speed
parallaxMedium   // 1x speed
parallaxFast     // 2x speed
```

## Domain-Specific Themes

### Creator Theme (Vibrant Mint + Purple)
- **Colors**: Vibrant mint primary, playful purple secondary, pink accent
- **Special Effects**: Aurora gradients, particle colors, neon effects
- **Animations**: Bouncy, playful animations with higher energy

```typescript
// Unique creator variables
aurora1, aurora2, aurora3     // Aurora color palette
particleMain, particleAccent  // Particle system colors
neonPink, neonMint, neonPurple // Neon color effects
```

### Business Theme (Professional Blue + Teal)
- **Colors**: Professional blue primary, sophisticated teal secondary
- **Special Effects**: Glass morphism, subtle shadows, trust colors
- **Animations**: Smooth, professional transitions

```typescript
// Unique business variables
glassOverlay      // Glass overlay effect
glassTint         // Subtle glass tint
trustBlue         // Trust-building blue
sophisticatedTeal // Professional teal
```

### Admin Theme (Sophisticated Purple + Gray)
- **Colors**: Deep purple primary, muted purple-gray secondary
- **Special Effects**: Minimal shadows, status colors
- **Animations**: Minimal, functional animations

```typescript
// Unique admin variables
shadowSubtle      // Minimal shadow
borderSubtle      // Subtle borders
statusSuccess     // Success state color
statusWarning     // Warning state color
statusError       // Error state color
statusInfo        // Info state color
```

## Component Integration

### MagneticButton
```typescript
magneticButton: {
  hoverScale: 1.05,
  hoverGlow: 'var(--glow-medium)',
  magnetStrength: 0.2,
  springConfig: { stiffness: 150, damping: 15 }
}
```

### LiquidTransition
```typescript
liquidTransition: {
  duration: 1.2,
  ease: 'easeInOut',
  fillColor: 'var(--primary)',
  borderRadius: '150%'
}
```

### ParticleBackground
```typescript
particleBackground: {
  particleCount: 100,
  connectionDistance: 150,
  particleSpeed: 0.5,
  colorRange: ['var(--particle-1)', '--particle-2', '--particle-3'],
  opacity: 0.3
}
```

### CursorEffect
```typescript
cursorEffect: {
  innerSize: 16,
  outerSize: 40,
  blendMode: 'difference',
  springInner: { stiffness: 500, damping: 28 },
  springOuter: { stiffness: 200, damping: 20 }
}
```

### Chart3D
```typescript
chart3D: {
  barMetalness: 0.3,
  barRoughness: 0.3,
  floorColor: 'oklch(0.20 0.05 250 / 0.5)',
  ambientIntensity: 0.5,
  directionalIntensity: 1
}
```

## Usage Examples

### Basic Theme Application
```typescript
import { applyEnhancedThemeToElement } from '@/lib/theme'

// Apply theme with all effects
applyEnhancedThemeToElement(element, 'dark', 'creator', true)

// Apply theme without effects (backward compatible)
applyEnhancedThemeToElement(element, 'light', 'business', false)
```

### Using Animation Configurations
```typescript
import { getAnimationConfig } from '@/lib/theme'
import { motion } from 'framer-motion'

const springBouncy = getAnimationConfig('springBouncy')

<motion.div
  whileHover={{ scale: 1.1 }}
  transition={springBouncy}
>
  Bouncy Element
</motion.div>
```

### Color Manipulation
```typescript
import { oklch } from '@/lib/theme'

// Lighten a color
const lighter = oklch.lighten('oklch(0.5 0.2 240)', 0.1)

// Mix two colors
const mixed = oklch.mix(color1, color2, 0.5)

// Generate complementary color
const complement = oklch.complement(primaryColor)

// Generate triadic colors
const [color1, color2, color3] = oklch.triadic(baseColor)
```

### Generating Effects
```typescript
import { generateNeonTextCSS, generateGlassmorphismCSS } from '@/lib/theme'

// Neon text effect
const neonStyle = generateNeonTextCSS('oklch(0.78 0.35 320)')

// Glassmorphism
const glassStyle = generateGlassmorphismCSS(isDark)
```

## CSS Variables

The enhanced theme system generates numerous CSS variables that can be used directly in your styles:

```css
/* Base colors */
var(--primary)
var(--primary-light)
var(--primary-dark)
var(--secondary)
var(--accent)

/* Gradients */
var(--gradient-linearAurora)
var(--gradient-radialGlow)
var(--gradient-conicRainbow)

/* Effects */
var(--effect-glowMedium)
var(--effect-shadowElevation2)
var(--effect-glassBackground)

/* Animation durations */
var(--duration-fast)
var(--duration-normal)
var(--duration-slow)

/* Domain-specific */
var(--aurora-1)
var(--particle-1)
var(--neon-pink)
var(--status-success)
```

## Migration Guide

The enhanced theme system is backward compatible. Existing code using `themeConfig` will continue to work. To access new features:

1. Import from enhanced exports:
   ```typescript
   import { enhancedThemeConfig, getAnimationConfig } from '@/lib/theme'
   ```

2. Use enhanced CSS variable function:
   ```typescript
   getEnhancedThemeCSSVariables(mode, domain)
   ```

3. Apply theme with effects:
   ```typescript
   applyEnhancedThemeToElement(element, mode, domain, true)
   ```

## Best Practices

1. **Use domain-specific themes** to maintain brand consistency
2. **Leverage animation presets** for consistent motion design
3. **Apply effects sparingly** to maintain performance
4. **Use color manipulation utilities** for dynamic theming
5. **Test across light/dark modes** to ensure contrast and readability