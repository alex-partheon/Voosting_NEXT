/**
 * Theme type definitions for Voosting Dashboard
 */

export type Theme = 'light' | 'dark';
export type Domain = 'main' | 'creator' | 'business' | 'admin';
export type ColorScheme = 'default' | 'creator' | 'business' | 'admin';

/**
 * OKLCH Color representation
 */
export interface OKLCHColor {
  l: number; // Lightness (0-1)
  c: number; // Chroma (0-0.5)
  h: number; // Hue (0-360)
}

/**
 * Theme color tokens
 */
export interface ThemeColors {
  // Core colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  
  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  
  // Sidebar colors
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

/**
 * Typography configuration
 */
export interface ThemeTypography {
  fontSans: string;
  fontSerif: string;
  fontMono: string;
  
  // Font sizes
  textXs: string;
  textSm: string;
  textBase: string;
  textLg: string;
  textXl: string;
  text2xl: string;
  text3xl: string;
  text4xl: string;
  text5xl: string;
  
  // Line heights
  leadingNone: number;
  leadingTight: number;
  leadingSnug: number;
  leadingNormal: number;
  leadingRelaxed: number;
  leadingLoose: number;
  
  // Font weights
  fontThin: number;
  fontExtralight: number;
  fontLight: number;
  fontNormal: number;
  fontMedium: number;
  fontSemibold: number;
  fontBold: number;
  fontExtrabold: number;
  fontBlack: number;
}

/**
 * Spacing and sizing configuration
 */
export interface ThemeSpacing {
  // Border radius
  radiusNone: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radius2xl: string;
  radius3xl: string;
  radiusFull: string;
  
  // Shadows
  shadowNone: string;
  shadow2xs: string;
  shadowXs: string;
  shadowSm: string;
  shadow: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  shadow2xl: string;
  
  // Spacing scale
  space0: string;
  space0_5: string;
  space1: string;
  space1_5: string;
  space2: string;
  space2_5: string;
  space3: string;
  space3_5: string;
  space4: string;
  space5: string;
  space6: string;
  space7: string;
  space8: string;
  space9: string;
  space10: string;
  space11: string;
  space12: string;
  space14: string;
  space16: string;
  space20: string;
  space24: string;
  space28: string;
  space32: string;
  space36: string;
  space40: string;
  space44: string;
  space48: string;
  space52: string;
  space56: string;
  space60: string;
  space64: string;
  space72: string;
  space80: string;
  space96: string;
}

/**
 * Animation configuration
 */
export interface ThemeAnimation {
  // Durations
  durationInstant: string;
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
  durationSlower: string;
  
  // Easing functions
  easingDefault: string;
  easingLinear: string;
  easingIn: string;
  easingOut: string;
  easingInOut: string;
  
  // Transitions
  transitionNone: string;
  transitionAll: string;
  transitionColors: string;
  transitionOpacity: string;
  transitionShadow: string;
  transitionTransform: string;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  domains: {
    creator: Partial<ThemeColors>;
    business: Partial<ThemeColors>;
    admin: Partial<ThemeColors>;
  };
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  animation: ThemeAnimation;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  theme: Theme;
  domain: Domain;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  setDomain: (domain: Domain) => void;
  toggleTheme: () => void;
}

/**
 * Theme utility function types
 */
export type ThemeColorManipulator = (color: string, amount: number) => string;
export type ThemeColorGenerator = (baseColor: string, steps?: number) => string[];
export type ThemeGradientGenerator = (startColor: string, endColor: string, angle?: number) => string;

/**
 * Component theme variant types
 */
export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';
export type CardVariant = 'default' | 'gradient' | 'glass';

/**
 * Theme class name utilities
 */
export interface ThemeClasses {
  // Transitions
  transition: string;
  transitionAll: string;
  transitionNone: string;
  
  // Effects
  glass: string;
  glassSubtle: string;
  glow: string;
  
  // Gradients
  gradientText: string;
  gradientBg: string;
  gradientBorder: string;
  
  // Hover effects
  hoverLift: string;
  hoverGlow: string;
  hoverScale: string;
  
  // Focus styles
  focusRing: string;
  focusVisible: string;
  
  // Animation
  animate: string;
  animatePulse: string;
  animateSpin: string;
  animateBounce: string;
}