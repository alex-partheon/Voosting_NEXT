/**
 * Enhanced Theme System for Voosting
 * Beautiful, fancy, and stylish theme configuration with OKLCH color space
 * Includes gradients, effects, animations, and domain-specific enhancements
 */

export interface ThemeColors {
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
  // Chart colors
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  // Sidebar colors
  sidebar: string
  sidebarForeground: string
  sidebarPrimary: string
  sidebarPrimaryForeground: string
  sidebarAccent: string
  sidebarAccentForeground: string
  sidebarBorder: string
  sidebarRing: string
}

// Gradient preset types
export interface GradientPresets {
  // Linear gradients
  linearPrimary: string
  linearAccent: string
  linearAurora: string
  linearSunset: string
  linearOcean: string
  // Radial gradients
  radialGlow: string
  radialPulse: string
  radialSpotlight: string
  // Conic gradients
  conicRainbow: string
  conicHalo: string
  conicSpiral: string
}

// Effect variables
export interface EffectVariables {
  // Glow effects
  glowSoft: string
  glowMedium: string
  glowIntense: string
  glowNeon: string
  // Shadow effects
  shadowElevation1: string
  shadowElevation2: string
  shadowElevation3: string
  shadowInset: string
  // Glassmorphism
  glassBackground: string
  glassBackgroundDark: string
  glassBlur: string
  glassBorder: string
  glassShadow: string
  // Neon effects
  neonText: string
  neonBorder: string
  neonGlow: string
  // Aurora effects
  auroraGradient: string
  auroraAnimation: string
}

// Animation configurations
export interface AnimationConfig {
  // Spring configurations
  springGentle: object
  springBouncy: object
  springStiff: object
  springElastic: object
  // Timing functions
  easeElastic: number[]
  easeBack: number[]
  easeExpo: number[]
  easeBounce: number[]
  // Durations
  durationFast: number
  durationNormal: number
  durationSlow: number
  durationVerySlow: number
  // Parallax speeds
  parallaxSlow: number
  parallaxMedium: number
  parallaxFast: number
}

// Component-specific themes
export interface ComponentThemes {
  magneticButton: {
    hoverScale: number
    hoverGlow: string
    magnetStrength: number
    springConfig: object
  }
  liquidTransition: {
    duration: number
    ease: string
    fillColor: string
    borderRadius: string
  }
  particleBackground: {
    particleCount: number
    connectionDistance: number
    particleSpeed: number
    colorRange: string[]
    opacity: number
  }
  cursorEffect: {
    innerSize: number
    outerSize: number
    innerColor: string
    outerColor: string
    blendMode: string
    springInner: object
    springOuter: object
  }
  chart3D: {
    barMetalness: number
    barRoughness: number
    floorColor: string
    ambientIntensity: number
    directionalIntensity: number
    shadowIntensity: number
  }
}

// Extended domain-specific theme
export interface DomainTheme extends Partial<ThemeColors> {
  // Extended color palette
  primaryLight?: string
  primaryDark?: string
  secondaryLight?: string
  secondaryDark?: string
  accentGlow?: string
  accentSubtle?: string
  // Special effects
  gradientPrimary?: string
  gradientAccent?: string
  glowColor?: string
  shadowColor?: string
}

export interface CreatorTheme extends DomainTheme {
  // Aurora colors
  aurora1: string
  aurora2: string
  aurora3: string
  // Particle colors
  particleMain: string
  particleAccent: string
  particleGlow: string
  // Playful elements
  neonPink: string
  neonMint: string
  neonPurple: string
}

export interface BusinessTheme extends DomainTheme {
  // Glass effects
  glassOverlay: string
  glassTint: string
  // Professional colors
  trustBlue: string
  sophisticatedTeal: string
  // Additional chart colors
  chart6?: string
  chart7?: string
  chart8?: string
}

export interface AdminTheme extends DomainTheme {
  // Minimal effects
  shadowSubtle: string
  borderSubtle: string
  // Status colors
  statusSuccess: string
  statusWarning: string
  statusError: string
  statusInfo: string
  // Muted palette
  mutedPurple: string
  mutedGray: string
}

export interface EnhancedThemeConfig {
  light: ThemeColors
  dark: ThemeColors
  gradients: GradientPresets
  effects: EffectVariables
  animations: AnimationConfig
  components: ComponentThemes
  domains: {
    creator: CreatorTheme
    business: BusinessTheme
    admin: AdminTheme
  }
}

// Enhanced theme configuration with beautiful OKLCH colors
export const enhancedThemeConfig: EnhancedThemeConfig = {
  light: {
    background: 'oklch(0.9824 0.0013 286.3757)',
    foreground: 'oklch(0.3211 0 0)',
    card: 'oklch(1.0000 0 0)',
    cardForeground: 'oklch(0.3211 0 0)',
    popover: 'oklch(1.0000 0 0)',
    popoverForeground: 'oklch(0.3211 0 0)',
    primary: 'oklch(0.6487 0.1538 150.3071)',
    primaryForeground: 'oklch(1.0000 0 0)',
    secondary: 'oklch(0.6746 0.1414 261.3380)',
    secondaryForeground: 'oklch(1.0000 0 0)',
    muted: 'oklch(0.8828 0.0285 98.1033)',
    mutedForeground: 'oklch(0.5382 0 0)',
    accent: 'oklch(0.8269 0.1080 211.9627)',
    accentForeground: 'oklch(0.3211 0 0)',
    destructive: 'oklch(0.6368 0.2078 25.3313)',
    destructiveForeground: 'oklch(1.0000 0 0)',
    border: 'oklch(0.8699 0 0)',
    input: 'oklch(0.8699 0 0)',
    ring: 'oklch(0.6487 0.1538 150.3071)',
    // Chart colors
    chart1: 'oklch(0.6487 0.1538 150.3071)',
    chart2: 'oklch(0.6746 0.1414 261.3380)',
    chart3: 'oklch(0.8269 0.1080 211.9627)',
    chart4: 'oklch(0.5880 0.0993 245.7394)',
    chart5: 'oklch(0.5905 0.1608 148.2409)',
    // Sidebar colors
    sidebar: 'oklch(0.9824 0.0013 286.3757)',
    sidebarForeground: 'oklch(0.3211 0 0)',
    sidebarPrimary: 'oklch(0.6487 0.1538 150.3071)',
    sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
    sidebarAccent: 'oklch(0.8269 0.1080 211.9627)',
    sidebarAccentForeground: 'oklch(0.3211 0 0)',
    sidebarBorder: 'oklch(0.8699 0 0)',
    sidebarRing: 'oklch(0.6487 0.1538 150.3071)',
  },
  dark: {
    background: 'oklch(0.2303 0.0125 264.2926)',
    foreground: 'oklch(0.9219 0 0)',
    card: 'oklch(0.3210 0.0078 223.6661)',
    cardForeground: 'oklch(0.9219 0 0)',
    popover: 'oklch(0.3210 0.0078 223.6661)',
    popoverForeground: 'oklch(0.9219 0 0)',
    primary: 'oklch(0.6487 0.1538 150.3071)',
    primaryForeground: 'oklch(1.0000 0 0)',
    secondary: 'oklch(0.5880 0.0993 245.7394)',
    secondaryForeground: 'oklch(0.9219 0 0)',
    muted: 'oklch(0.3867 0 0)',
    mutedForeground: 'oklch(0.7155 0 0)',
    accent: 'oklch(0.6746 0.1414 261.3380)',
    accentForeground: 'oklch(0.9219 0 0)',
    destructive: 'oklch(0.6368 0.2078 25.3313)',
    destructiveForeground: 'oklch(1.0000 0 0)',
    border: 'oklch(0.3867 0 0)',
    input: 'oklch(0.3867 0 0)',
    ring: 'oklch(0.6487 0.1538 150.3071)',
    // Chart colors
    chart1: 'oklch(0.6487 0.1538 150.3071)',
    chart2: 'oklch(0.5880 0.0993 245.7394)',
    chart3: 'oklch(0.6746 0.1414 261.3380)',
    chart4: 'oklch(0.8269 0.1080 211.9627)',
    chart5: 'oklch(0.5905 0.1608 148.2409)',
    // Sidebar colors
    sidebar: 'oklch(0.2303 0.0125 264.2926)',
    sidebarForeground: 'oklch(0.9219 0 0)',
    sidebarPrimary: 'oklch(0.6487 0.1538 150.3071)',
    sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
    sidebarAccent: 'oklch(0.6746 0.1414 261.3380)',
    sidebarAccentForeground: 'oklch(0.9219 0 0)',
    sidebarBorder: 'oklch(0.3867 0 0)',
    sidebarRing: 'oklch(0.6487 0.1538 150.3071)',
  },
  // Gradient presets
  gradients: {
    // Linear gradients
    linearPrimary: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light, oklch(0.75 0.20 150)) 100%)',
    linearAccent: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-glow, oklch(0.85 0.15 210)) 100%)',
    linearAurora: 'linear-gradient(45deg, var(--aurora-1, oklch(0.75 0.28 165)) 0%, var(--aurora-2, oklch(0.70 0.30 220)) 50%, var(--aurora-3, oklch(0.65 0.32 280)) 100%)',
    linearSunset: 'linear-gradient(135deg, oklch(0.75 0.35 30) 0%, oklch(0.65 0.30 350) 50%, oklch(0.55 0.25 270) 100%)',
    linearOcean: 'linear-gradient(180deg, oklch(0.65 0.20 200) 0%, oklch(0.55 0.25 220) 50%, oklch(0.45 0.30 240) 100%)',
    // Radial gradients
    radialGlow: 'radial-gradient(circle at center, var(--glow-inner, oklch(0.80 0.25 150 / 0.8)) 0%, transparent 70%)',
    radialPulse: 'radial-gradient(circle at center, var(--pulse-color, oklch(0.70 0.30 220 / 0.6)) 0%, transparent 50%)',
    radialSpotlight: 'radial-gradient(ellipse at top, oklch(0.90 0.10 60 / 0.4) 0%, transparent 50%)',
    // Conic gradients
    conicRainbow: 'conic-gradient(from 0deg, oklch(0.70 0.35 0), oklch(0.70 0.35 60), oklch(0.70 0.35 120), oklch(0.70 0.35 180), oklch(0.70 0.35 240), oklch(0.70 0.35 300), oklch(0.70 0.35 360))',
    conicHalo: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, var(--halo-color, oklch(0.80 0.20 220 / 0.5)) 60deg, transparent 120deg)',
    conicSpiral: 'conic-gradient(from 0deg at 50% 50%, var(--spiral-1, oklch(0.60 0.30 270)) 0deg, var(--spiral-2, oklch(0.70 0.25 180)) 180deg, var(--spiral-1, oklch(0.60 0.30 270)) 360deg)',
  },
  // Effect variables
  effects: {
    // Glow effects
    glowSoft: '0 0 20px oklch(var(--glow-l, 0.70) var(--glow-c, 0.25) var(--glow-h, 220) / 0.3)',
    glowMedium: '0 0 40px oklch(var(--glow-l, 0.70) var(--glow-c, 0.25) var(--glow-h, 220) / 0.5)',
    glowIntense: '0 0 60px oklch(var(--glow-l, 0.70) var(--glow-c, 0.25) var(--glow-h, 220) / 0.7)',
    glowNeon: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor, 0 0 80px currentColor',
    // Shadow effects
    shadowElevation1: '0 2px 4px -1px oklch(0.20 0 0 / 0.1), 0 1px 2px -1px oklch(0.20 0 0 / 0.06)',
    shadowElevation2: '0 4px 8px -2px oklch(0.20 0 0 / 0.15), 0 2px 4px -2px oklch(0.20 0 0 / 0.08)',
    shadowElevation3: '0 8px 16px -4px oklch(0.20 0 0 / 0.2), 0 4px 8px -4px oklch(0.20 0 0 / 0.1)',
    shadowInset: 'inset 0 2px 4px oklch(0.20 0 0 / 0.1)',
    // Glassmorphism
    glassBackground: 'oklch(0.95 0.01 0 / 0.7)',
    glassBackgroundDark: 'oklch(0.15 0.01 0 / 0.7)',
    glassBlur: 'blur(10px)',
    glassBorder: '1px solid oklch(1 0 0 / 0.2)',
    glassShadow: '0 8px 32px 0 oklch(0.20 0.10 220 / 0.37)',
    // Neon effects
    neonText: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
    neonBorder: '0 0 5px var(--neon-color), inset 0 0 5px var(--neon-color)',
    neonGlow: '0 0 20px var(--neon-color), 0 0 40px var(--neon-color), 0 0 60px var(--neon-color)',
    // Aurora effects
    auroraGradient: 'linear-gradient(45deg, oklch(0.75 0.30 280 / 0.3), oklch(0.70 0.35 165 / 0.3), oklch(0.65 0.30 100 / 0.3))',
    auroraAnimation: 'aurora 8s ease-in-out infinite',
  },
  // Animation configurations
  animations: {
    // Spring configurations
    springGentle: { type: 'spring', stiffness: 100, damping: 15 },
    springBouncy: { type: 'spring', stiffness: 200, damping: 10 },
    springStiff: { type: 'spring', stiffness: 400, damping: 25 },
    springElastic: { type: 'spring', stiffness: 150, damping: 8, mass: 0.5 },
    // Timing functions
    easeElastic: [0.68, -0.55, 0.265, 1.55],
    easeBack: [0.36, 0, 0.66, -0.56],
    easeExpo: [0.87, 0, 0.13, 1],
    easeBounce: [0.68, -0.55, 0.32, 1.55],
    // Durations
    durationFast: 0.2,
    durationNormal: 0.4,
    durationSlow: 0.8,
    durationVerySlow: 1.5,
    // Parallax speeds
    parallaxSlow: 0.5,
    parallaxMedium: 1,
    parallaxFast: 2,
  },
  // Component-specific themes
  components: {
    magneticButton: {
      hoverScale: 1.05,
      hoverGlow: 'var(--glow-medium)',
      magnetStrength: 0.2,
      springConfig: { stiffness: 150, damping: 15, mass: 0.1 },
    },
    liquidTransition: {
      duration: 1.2,
      ease: 'easeInOut',
      fillColor: 'var(--primary)',
      borderRadius: '150%',
    },
    particleBackground: {
      particleCount: 100,
      connectionDistance: 150,
      particleSpeed: 0.5,
      colorRange: ['var(--particle-1)', 'var(--particle-2)', 'var(--particle-3)'],
      opacity: 0.3,
    },
    cursorEffect: {
      innerSize: 16,
      outerSize: 40,
      innerColor: 'var(--cursor-inner)',
      outerColor: 'var(--cursor-outer)',
      blendMode: 'difference',
      springInner: { stiffness: 500, damping: 28 },
      springOuter: { stiffness: 200, damping: 20 },
    },
    chart3D: {
      barMetalness: 0.3,
      barRoughness: 0.3,
      floorColor: 'oklch(0.20 0.05 250 / 0.5)',
      ambientIntensity: 0.5,
      directionalIntensity: 1,
      shadowIntensity: 0.3,
    },
  },
  // Domain-specific themes
  domains: {
    creator: {
      // Vibrant mint + purple with playful animations
      primary: 'oklch(0.75 0.28 165)', // Vibrant mint
      primaryLight: 'oklch(0.85 0.20 165)',
      primaryDark: 'oklch(0.65 0.35 165)',
      secondary: 'oklch(0.65 0.32 280)', // Playful purple
      secondaryLight: 'oklch(0.75 0.25 280)',
      secondaryDark: 'oklch(0.55 0.38 280)',
      accent: 'oklch(0.78 0.25 320)', // Pink accent
      accentGlow: 'oklch(0.78 0.35 320)',
      accentSubtle: 'oklch(0.78 0.15 320)',
      // Sidebar
      sidebarPrimary: 'oklch(0.75 0.28 165)',
      sidebarAccent: 'oklch(0.78 0.25 320)',
      // Charts
      chart1: 'oklch(0.75 0.28 165)',
      chart2: 'oklch(0.65 0.32 280)',
      chart3: 'oklch(0.78 0.25 320)',
      chart4: 'oklch(0.70 0.30 200)',
      chart5: 'oklch(0.72 0.26 240)',
      // Aurora colors
      aurora1: 'oklch(0.75 0.28 165)',
      aurora2: 'oklch(0.70 0.30 220)',
      aurora3: 'oklch(0.65 0.32 280)',
      // Particle colors
      particleMain: 'oklch(0.75 0.28 165 / 0.6)',
      particleAccent: 'oklch(0.65 0.32 280 / 0.4)',
      particleGlow: 'oklch(0.85 0.20 165 / 0.8)',
      // Neon effects
      neonPink: 'oklch(0.78 0.35 320)',
      neonMint: 'oklch(0.85 0.30 165)',
      neonPurple: 'oklch(0.65 0.40 280)',
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, oklch(0.75 0.28 165) 0%, oklch(0.65 0.32 280) 100%)',
      gradientAccent: 'linear-gradient(45deg, oklch(0.78 0.25 320) 0%, oklch(0.75 0.28 165) 100%)',
      // Effects
      glowColor: 'oklch(0.75 0.35 280)',
      shadowColor: 'oklch(0.20 0.10 280)',
    },
    business: {
      // Professional blue + teal with subtle effects
      primary: 'oklch(0.55 0.25 220)', // Professional blue
      primaryLight: 'oklch(0.65 0.18 220)',
      primaryDark: 'oklch(0.45 0.30 220)',
      secondary: 'oklch(0.60 0.20 180)', // Sophisticated teal
      secondaryLight: 'oklch(0.70 0.15 180)',
      secondaryDark: 'oklch(0.50 0.25 180)',
      accent: 'oklch(0.72 0.18 150)', // Mint accent
      accentGlow: 'oklch(0.72 0.25 150)',
      accentSubtle: 'oklch(0.72 0.12 150)',
      // Sidebar
      sidebarPrimary: 'oklch(0.55 0.25 220)',
      sidebarAccent: 'oklch(0.72 0.18 150)',
      // Charts
      chart1: 'oklch(0.55 0.25 220)',
      chart2: 'oklch(0.60 0.20 180)',
      chart3: 'oklch(0.65 0.22 200)',
      chart4: 'oklch(0.70 0.18 160)',
      chart5: 'oklch(0.58 0.23 240)',
      chart6: 'oklch(0.62 0.21 190)',
      chart7: 'oklch(0.56 0.24 210)',
      chart8: 'oklch(0.68 0.19 170)',
      // Glass effects
      glassOverlay: 'oklch(0.95 0.02 220 / 0.8)',
      glassTint: 'oklch(0.55 0.10 220 / 0.1)',
      // Professional colors
      trustBlue: 'oklch(0.55 0.25 220)',
      sophisticatedTeal: 'oklch(0.60 0.20 180)',
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, oklch(0.55 0.25 220) 0%, oklch(0.60 0.20 180) 100%)',
      gradientAccent: 'linear-gradient(90deg, oklch(0.72 0.18 150) 0%, oklch(0.60 0.20 180) 100%)',
      // Effects
      glowColor: 'oklch(0.72 0.25 150)',
      shadowColor: 'oklch(0.20 0.05 220)',
    },
    admin: {
      // Sophisticated purple + gray with minimal animations
      primary: 'oklch(0.50 0.28 270)', // Deep purple
      primaryLight: 'oklch(0.60 0.22 270)',
      primaryDark: 'oklch(0.40 0.32 270)',
      secondary: 'oklch(0.55 0.08 270)', // Muted purple-gray
      secondaryLight: 'oklch(0.65 0.05 270)',
      secondaryDark: 'oklch(0.45 0.10 270)',
      accent: 'oklch(0.68 0.15 250)', // Lavender accent
      accentGlow: 'oklch(0.68 0.20 250)',
      accentSubtle: 'oklch(0.68 0.08 250)',
      // Sidebar
      sidebarPrimary: 'oklch(0.50 0.28 270)',
      sidebarAccent: 'oklch(0.68 0.15 250)',
      // Charts
      chart1: 'oklch(0.50 0.28 270)',
      chart2: 'oklch(0.55 0.08 270)',
      chart3: 'oklch(0.68 0.15 250)',
      chart4: 'oklch(0.60 0.20 260)',
      chart5: 'oklch(0.52 0.25 280)',
      // Minimal effects
      shadowSubtle: '0 1px 3px oklch(0.20 0 0 / 0.08)',
      borderSubtle: '1px solid oklch(0.50 0.05 270 / 0.2)',
      // Status colors
      statusSuccess: 'oklch(0.62 0.18 145)',
      statusWarning: 'oklch(0.70 0.20 85)',
      statusError: 'oklch(0.60 0.25 25)',
      statusInfo: 'oklch(0.55 0.20 220)',
      // Muted palette
      mutedPurple: 'oklch(0.55 0.08 270)',
      mutedGray: 'oklch(0.50 0.02 270)',
      // Gradients
      gradientPrimary: 'linear-gradient(135deg, oklch(0.50 0.28 270) 0%, oklch(0.55 0.08 270) 100%)',
      gradientAccent: 'linear-gradient(180deg, oklch(0.68 0.15 250) 0%, oklch(0.50 0.28 270) 100%)',
      // Effects
      glowColor: 'oklch(0.68 0.20 250)',
      shadowColor: 'oklch(0.20 0.02 270)',
    },
  },
}

// Backward compatibility - map to old structure
export const themeConfig: ThemeConfig = {
  light: enhancedThemeConfig.light,
  dark: enhancedThemeConfig.dark,
  domains: {
    creator: {
      primary: enhancedThemeConfig.domains.creator.primary,
      secondary: enhancedThemeConfig.domains.creator.secondary,
      accent: enhancedThemeConfig.domains.creator.accent,
      sidebarPrimary: enhancedThemeConfig.domains.creator.sidebarPrimary,
      sidebarAccent: enhancedThemeConfig.domains.creator.sidebarAccent,
      chart1: enhancedThemeConfig.domains.creator.chart1,
      chart2: enhancedThemeConfig.domains.creator.chart2,
    },
    business: {
      primary: enhancedThemeConfig.domains.business.primary,
      secondary: enhancedThemeConfig.domains.business.secondary,
      accent: enhancedThemeConfig.domains.business.accent,
      sidebarPrimary: enhancedThemeConfig.domains.business.sidebarPrimary,
      sidebarAccent: enhancedThemeConfig.domains.business.sidebarAccent,
      chart1: enhancedThemeConfig.domains.business.chart1,
      chart2: enhancedThemeConfig.domains.business.chart2,
    },
    admin: {
      primary: enhancedThemeConfig.domains.admin.primary,
      secondary: enhancedThemeConfig.domains.admin.secondary,
      accent: enhancedThemeConfig.domains.admin.accent,
      sidebarPrimary: enhancedThemeConfig.domains.admin.sidebarPrimary,
      sidebarAccent: enhancedThemeConfig.domains.admin.sidebarAccent,
      chart1: enhancedThemeConfig.domains.admin.chart1,
      chart2: enhancedThemeConfig.domains.admin.chart2,
    },
  },
}

// Add the old ThemeConfig interface for backward compatibility
export interface ThemeConfig {
  light: ThemeColors
  dark: ThemeColors
  domains: {
    creator: Partial<ThemeColors>
    business: Partial<ThemeColors>
    admin: Partial<ThemeColors>
  }
}

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeDomain = 'creator' | 'business' | 'admin'

/**
 * Get enhanced CSS variables for a specific theme configuration
 */
export function getEnhancedThemeCSSVariables(
  mode: ThemeMode,
  domain?: ThemeDomain
): Record<string, string> {
  const baseTheme = mode === 'dark' ? enhancedThemeConfig.dark : enhancedThemeConfig.light
  const domainTheme = domain ? enhancedThemeConfig.domains[domain] : null

  const theme = { ...baseTheme, ...(domainTheme || {}) }

  // Base theme variables
  const cssVariables: Record<string, string> = {
    '--background': theme.background,
    '--foreground': theme.foreground,
    '--card': theme.card,
    '--card-foreground': theme.cardForeground,
    '--popover': theme.popover,
    '--popover-foreground': theme.popoverForeground,
    '--primary': theme.primary,
    '--primary-foreground': theme.primaryForeground,
    '--secondary': theme.secondary,
    '--secondary-foreground': theme.secondaryForeground,
    '--muted': theme.muted,
    '--muted-foreground': theme.mutedForeground,
    '--accent': theme.accent,
    '--accent-foreground': theme.accentForeground,
    '--destructive': theme.destructive,
    '--destructive-foreground': theme.destructiveForeground,
    '--border': theme.border,
    '--input': theme.input,
    '--ring': theme.ring,
    '--chart-1': theme.chart1,
    '--chart-2': theme.chart2,
    '--chart-3': theme.chart3,
    '--chart-4': theme.chart4,
    '--chart-5': theme.chart5,
    '--sidebar': theme.sidebar,
    '--sidebar-foreground': theme.sidebarForeground,
    '--sidebar-primary': theme.sidebarPrimary,
    '--sidebar-primary-foreground': theme.sidebarPrimaryForeground,
    '--sidebar-accent': theme.sidebarAccent,
    '--sidebar-accent-foreground': theme.sidebarAccentForeground,
    '--sidebar-border': theme.sidebarBorder,
    '--sidebar-ring': theme.sidebarRing,
  }

  // Add domain-specific enhanced variables
  if (domain && domainTheme) {
    // Extended colors
    if ('primaryLight' in domainTheme && domainTheme.primaryLight) {
      cssVariables['--primary-light'] = domainTheme.primaryLight
    }
    if ('primaryDark' in domainTheme && domainTheme.primaryDark) {
      cssVariables['--primary-dark'] = domainTheme.primaryDark
    }
    if ('secondaryLight' in domainTheme && domainTheme.secondaryLight) {
      cssVariables['--secondary-light'] = domainTheme.secondaryLight
    }
    if ('secondaryDark' in domainTheme && domainTheme.secondaryDark) {
      cssVariables['--secondary-dark'] = domainTheme.secondaryDark
    }
    if ('accentGlow' in domainTheme && domainTheme.accentGlow) {
      cssVariables['--accent-glow'] = domainTheme.accentGlow
    }
    if ('accentSubtle' in domainTheme && domainTheme.accentSubtle) {
      cssVariables['--accent-subtle'] = domainTheme.accentSubtle
    }
    
    // Effects
    if ('glowColor' in domainTheme && domainTheme.glowColor) {
      cssVariables['--glow-color'] = domainTheme.glowColor
    }
    if ('shadowColor' in domainTheme && domainTheme.shadowColor) {
      cssVariables['--shadow-color'] = domainTheme.shadowColor
    }
    
    // Domain-specific variables
    if (domain === 'creator') {
      const creatorTheme = domainTheme as CreatorTheme
      cssVariables['--aurora-1'] = creatorTheme.aurora1
      cssVariables['--aurora-2'] = creatorTheme.aurora2
      cssVariables['--aurora-3'] = creatorTheme.aurora3
      cssVariables['--particle-1'] = creatorTheme.particleMain
      cssVariables['--particle-2'] = creatorTheme.particleAccent
      cssVariables['--particle-3'] = creatorTheme.particleGlow
      cssVariables['--neon-pink'] = creatorTheme.neonPink
      cssVariables['--neon-mint'] = creatorTheme.neonMint
      cssVariables['--neon-purple'] = creatorTheme.neonPurple
    } else if (domain === 'business') {
      const businessTheme = domainTheme as BusinessTheme
      cssVariables['--glass-overlay'] = businessTheme.glassOverlay
      cssVariables['--glass-tint'] = businessTheme.glassTint
      cssVariables['--trust-blue'] = businessTheme.trustBlue
      cssVariables['--sophisticated-teal'] = businessTheme.sophisticatedTeal
      if (businessTheme.chart6) cssVariables['--chart-6'] = businessTheme.chart6
      if (businessTheme.chart7) cssVariables['--chart-7'] = businessTheme.chart7
      if (businessTheme.chart8) cssVariables['--chart-8'] = businessTheme.chart8
    } else if (domain === 'admin') {
      const adminTheme = domainTheme as AdminTheme
      cssVariables['--shadow-subtle'] = adminTheme.shadowSubtle
      cssVariables['--border-subtle'] = adminTheme.borderSubtle
      cssVariables['--status-success'] = adminTheme.statusSuccess
      cssVariables['--status-warning'] = adminTheme.statusWarning
      cssVariables['--status-error'] = adminTheme.statusError
      cssVariables['--status-info'] = adminTheme.statusInfo
      cssVariables['--muted-purple'] = adminTheme.mutedPurple
      cssVariables['--muted-gray'] = adminTheme.mutedGray
    }
  }

  // Extract OKLCH values for dynamic manipulation
  const primaryParsed = oklch.parse(theme.primary)
  if (primaryParsed) {
    cssVariables['--primary-l'] = primaryParsed.l.toString()
    cssVariables['--primary-c'] = primaryParsed.c.toString()
    cssVariables['--primary-h'] = primaryParsed.h.toString()
  }

  const accentParsed = oklch.parse(theme.accent)
  if (accentParsed) {
    cssVariables['--accent-l'] = accentParsed.l.toString()
    cssVariables['--accent-c'] = accentParsed.c.toString()
    cssVariables['--accent-h'] = accentParsed.h.toString()
  }

  return cssVariables
}

/**
 * Backward compatible function
 */
export function getThemeCSSVariables(
  mode: ThemeMode,
  domain?: ThemeDomain
): Record<string, string> {
  return getEnhancedThemeCSSVariables(mode, domain)
}

/**
 * Apply enhanced theme CSS variables to an element
 */
export function applyEnhancedThemeToElement(
  element: HTMLElement,
  mode: ThemeMode,
  domain?: ThemeDomain,
  includeEffects: boolean = true
): void {
  const cssVariables = getEnhancedThemeCSSVariables(mode, domain)
  
  // Apply base theme variables
  Object.entries(cssVariables).forEach(([key, value]) => {
    element.style.setProperty(key, value)
  })
  
  // Apply gradient variables
  if (includeEffects) {
    Object.entries(enhancedThemeConfig.gradients).forEach(([key, value]) => {
      element.style.setProperty(`--gradient-${key}`, value)
    })
    
    // Apply effect variables
    Object.entries(enhancedThemeConfig.effects).forEach(([key, value]) => {
      element.style.setProperty(`--effect-${key}`, value)
    })
    
    // Apply animation durations
    element.style.setProperty('--duration-fast', `${enhancedThemeConfig.animations.durationFast}s`)
    element.style.setProperty('--duration-normal', `${enhancedThemeConfig.animations.durationNormal}s`)
    element.style.setProperty('--duration-slow', `${enhancedThemeConfig.animations.durationSlow}s`)
    element.style.setProperty('--duration-very-slow', `${enhancedThemeConfig.animations.durationVerySlow}s`)
    
    // Apply parallax speeds
    element.style.setProperty('--parallax-slow', enhancedThemeConfig.animations.parallaxSlow.toString())
    element.style.setProperty('--parallax-medium', enhancedThemeConfig.animations.parallaxMedium.toString())
    element.style.setProperty('--parallax-fast', enhancedThemeConfig.animations.parallaxFast.toString())
  }
}

/**
 * Backward compatible function
 */
export function applyThemeToElement(
  element: HTMLElement,
  mode: ThemeMode,
  domain?: ThemeDomain
): void {
  applyEnhancedThemeToElement(element, mode, domain, false)
}

/**
 * Get theme preference from localStorage
 */
export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  
  const stored = localStorage.getItem('theme') as ThemeMode | null
  return stored || 'system'
}

/**
 * Store theme preference in localStorage
 */
export function storeTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('theme', theme)
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Get effective theme (resolving 'system' to actual theme)
 */
export function getEffectiveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

/**
 * OKLCH color manipulation utilities
 */
export const oklch = {
  /**
   * Parse OKLCH color string
   */
  parse(color: string): { l: number; c: number; h: number; a?: number } | null {
    const match = color.match(
      /oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\)/
    )
    
    if (!match) return null
    
    return {
      l: parseFloat(match[1]),
      c: parseFloat(match[2]),
      h: parseFloat(match[3]),
      a: match[4] ? parseFloat(match[4]) : undefined,
    }
  },
  
  /**
   * Format OKLCH color
   */
  format(l: number, c: number, h: number, a?: number): string {
    if (a !== undefined) {
      return `oklch(${l} ${c} ${h} / ${a})`
    }
    return `oklch(${l} ${c} ${h})`
  },
  
  /**
   * Adjust lightness
   */
  lighten(color: string, amount: number): string {
    const parsed = this.parse(color)
    if (!parsed) return color
    
    const newL = Math.min(1, parsed.l + amount)
    return this.format(newL, parsed.c, parsed.h, parsed.a)
  },
  
  /**
   * Adjust lightness
   */
  darken(color: string, amount: number): string {
    const parsed = this.parse(color)
    if (!parsed) return color
    
    const newL = Math.max(0, parsed.l - amount)
    return this.format(newL, parsed.c, parsed.h, parsed.a)
  },
  
  /**
   * Adjust chroma (saturation)
   */
  saturate(color: string, amount: number): string {
    const parsed = this.parse(color)
    if (!parsed) return color
    
    const newC = Math.min(0.5, parsed.c + amount)
    return this.format(parsed.l, newC, parsed.h, parsed.a)
  },
  
  /**
   * Adjust chroma (saturation)
   */
  desaturate(color: string, amount: number): string {
    const parsed = this.parse(color)
    if (!parsed) return color
    
    const newC = Math.max(0, parsed.c - amount)
    return this.format(parsed.l, newC, parsed.h, parsed.a)
  },
  
  /**
   * Set opacity
   */
  alpha(color: string, alpha: number): string {
    const parsed = this.parse(color)
    if (!parsed) return color
    
    return this.format(parsed.l, parsed.c, parsed.h, alpha)
  },
  
  /**
   * Mix two colors
   */
  mix(color1: string, color2: string, weight: number = 0.5): string {
    const parsed1 = this.parse(color1)
    const parsed2 = this.parse(color2)
    if (!parsed1 || !parsed2) return color1
    
    const l = parsed1.l * (1 - weight) + parsed2.l * weight
    const c = parsed1.c * (1 - weight) + parsed2.c * weight
    const h = parsed1.h * (1 - weight) + parsed2.h * weight
    const a = parsed1.a !== undefined && parsed2.a !== undefined
      ? parsed1.a * (1 - weight) + parsed2.a * weight
      : undefined
    
    return this.format(l, c, h, a)
  },
  
  /**
   * Generate complementary color
   */
  complement(color: string): string {
    const parsed = this.parse(color)
    if (!parsed) return color
    
    const newH = (parsed.h + 180) % 360
    return this.format(parsed.l, parsed.c, newH, parsed.a)
  },
  
  /**
   * Generate triadic colors
   */
  triadic(color: string): [string, string, string] {
    const parsed = this.parse(color)
    if (!parsed) return [color, color, color]
    
    const h1 = parsed.h
    const h2 = (parsed.h + 120) % 360
    const h3 = (parsed.h + 240) % 360
    
    return [
      this.format(parsed.l, parsed.c, h1, parsed.a),
      this.format(parsed.l, parsed.c, h2, parsed.a),
      this.format(parsed.l, parsed.c, h3, parsed.a),
    ]
  },
  
  /**
   * Generate analogous colors
   */
  analogous(color: string, angle: number = 30): [string, string, string] {
    const parsed = this.parse(color)
    if (!parsed) return [color, color, color]
    
    const h1 = (parsed.h - angle + 360) % 360
    const h2 = parsed.h
    const h3 = (parsed.h + angle) % 360
    
    return [
      this.format(parsed.l, parsed.c, h1, parsed.a),
      this.format(parsed.l, parsed.c, h2, parsed.a),
      this.format(parsed.l, parsed.c, h3, parsed.a),
    ]
  },
}

/**
 * Get animation configuration
 */
export function getAnimationConfig(name: keyof AnimationConfig) {
  return enhancedThemeConfig.animations[name]
}

/**
 * Get component theme configuration
 */
export function getComponentTheme<T extends keyof ComponentThemes>(
  component: T
): ComponentThemes[T] {
  return enhancedThemeConfig.components[component]
}

/**
 * Generate CSS keyframes for aurora animation
 */
export function generateAuroraKeyframes(): string {
  return `
    @keyframes aurora {
      0%, 100% {
        background-position: 50% 50%;
        filter: hue-rotate(0deg);
      }
      33% {
        background-position: 100% 50%;
        filter: hue-rotate(120deg);
      }
      66% {
        background-position: 0% 50%;
        filter: hue-rotate(240deg);
      }
    }
  `
}

/**
 * Generate CSS for neon text effect
 */
export function generateNeonTextCSS(color: string): string {
  const parsed = oklch.parse(color)
  if (!parsed) return ''
  
  const glow1 = oklch.format(parsed.l, parsed.c, parsed.h, 0.8)
  const glow2 = oklch.format(parsed.l * 0.8, parsed.c * 1.2, parsed.h, 0.6)
  const glow3 = oklch.format(parsed.l * 0.6, parsed.c * 1.4, parsed.h, 0.4)
  
  return `
    text-shadow:
      0 0 10px ${glow1},
      0 0 20px ${glow1},
      0 0 30px ${glow2},
      0 0 40px ${glow2},
      0 0 50px ${glow3},
      0 0 60px ${glow3};
  `
}

/**
 * Generate glassmorphism CSS
 */
export function generateGlassmorphismCSS(isDark: boolean = false): string {
  const config = enhancedThemeConfig.effects
  const bg = isDark ? config.glassBackgroundDark : config.glassBackground
  
  return `
    background: ${bg};
    backdrop-filter: ${config.glassBlur};
    -webkit-backdrop-filter: ${config.glassBlur};
    border: ${config.glassBorder};
    box-shadow: ${config.glassShadow};
  `
}