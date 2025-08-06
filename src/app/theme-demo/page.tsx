'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { LiquidTransition } from '@/components/ui/liquid-transition'
import { ParticleBackground } from '@/components/ui/particle-background'
import { CursorEffect } from '@/components/ui/cursor-effect'
import { 
  enhancedThemeConfig, 
  getAnimationConfig,
  generateNeonTextCSS,
  generateGlassmorphismCSS,
  oklch,
  applyEnhancedThemeToElement,
  type ThemeDomain
} from '@/lib/theme'

export default function ThemeDemoPage() {
  const [currentDomain, setCurrentDomain] = useState<ThemeDomain>('creator')
  const [isDark, setIsDark] = useState(false)
  
  const domainTheme = enhancedThemeConfig.domains[currentDomain]
  const springBouncy = getAnimationConfig('springBouncy')
  const springElastic = getAnimationConfig('springElastic')

  // Apply theme to body
  if (typeof window !== 'undefined') {
    applyEnhancedThemeToElement(
      document.documentElement,
      isDark ? 'dark' : 'light',
      currentDomain,
      true
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Particle Background for Creator theme */}
      {currentDomain === 'creator' && <ParticleBackground />}
      
      {/* Cursor Effect */}
      <CursorEffect />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Theme Switcher */}
        <div className="flex gap-4 mb-12 flex-wrap">
          {(['creator', 'business', 'admin'] as ThemeDomain[]).map((domain) => (
            <MagneticButton
              key={domain}
              onClick={() => setCurrentDomain(domain)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentDomain === domain
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card hover:bg-accent'
              }`}
            >
              {domain.charAt(0).toUpperCase() + domain.slice(1)} Theme
            </MagneticButton>
          ))}
          <MagneticButton
            onClick={() => setIsDark(!isDark)}
            className="px-6 py-3 rounded-lg bg-card hover:bg-accent"
          >
            {isDark ? '🌙' : '☀️'} {isDark ? 'Dark' : 'Light'} Mode
          </MagneticButton>
        </div>

        {/* Hero Section with Liquid Transition */}
        <LiquidTransition delay={100}>
          <div className="text-center mb-16">
            <h1 
              className="text-6xl font-bold mb-4"
              style={{
                background: domainTheme.gradientPrimary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                ...generateNeonTextCSS(domainTheme.primary).split(';').reduce((acc, rule) => {
                  const [key, value] = rule.split(':').map(s => s.trim())
                  if (key && value && key !== 'text-shadow') {
                    acc[key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = value
                  }
                  return acc
                }, {} as any)
              }}
            >
              {currentDomain === 'creator' && 'Create. Inspire. Earn.'}
              {currentDomain === 'business' && 'Professional Marketing Solutions'}
              {currentDomain === 'admin' && 'System Administration'}
            </h1>
            <p className="text-xl text-muted-foreground">
              Experience the enhanced theme system
            </p>
          </div>
        </LiquidTransition>

        {/* Gradient Showcase */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Gradient Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              className="h-48 rounded-xl overflow-hidden"
              style={{ background: enhancedThemeConfig.gradients.linearAurora }}
              whileHover={{ scale: 1.02 }}
              transition={springElastic}
            />
            <motion.div
              className="h-48 rounded-xl overflow-hidden"
              style={{ background: enhancedThemeConfig.gradients.radialGlow }}
              whileHover={{ scale: 1.02 }}
              transition={springElastic}
            />
            <motion.div
              className="h-48 rounded-xl overflow-hidden"
              style={{ background: enhancedThemeConfig.gradients.conicRainbow }}
              whileHover={{ scale: 1.02 }}
              transition={springElastic}
            />
          </div>
        </section>

        {/* Glass Morphism Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Glass Morphism</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl"
                style={{
                  ...generateGlassmorphismCSS(isDark).split(';').reduce((acc, rule) => {
                    const [key, value] = rule.split(':').map(s => s.trim())
                    if (key && value) {
                      acc[key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = value
                    }
                    return acc
                  }, {} as any)
                }}
                whileHover={{ y: -5 }}
                transition={springBouncy}
              >
                <h3 className="text-xl font-semibold mb-2">Glass Card {i}</h3>
                <p className="text-muted-foreground">
                  Beautiful glassmorphism effect with backdrop blur
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Domain-Specific Features */}
        {currentDomain === 'creator' && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Creator Features</h2>
            <div className="space-y-6">
              {/* Neon Buttons */}
              <div className="flex gap-4 flex-wrap">
                <MagneticButton
                  className="px-6 py-3 rounded-lg font-bold"
                  style={{
                    color: domainTheme.neonPink,
                    border: `2px solid ${domainTheme.neonPink}`,
                    boxShadow: enhancedThemeConfig.effects.neonBorder.replace('var(--neon-color)', domainTheme.neonPink)
                  }}
                >
                  Neon Pink
                </MagneticButton>
                <MagneticButton
                  className="px-6 py-3 rounded-lg font-bold"
                  style={{
                    color: domainTheme.neonMint,
                    border: `2px solid ${domainTheme.neonMint}`,
                    boxShadow: enhancedThemeConfig.effects.neonBorder.replace('var(--neon-color)', domainTheme.neonMint)
                  }}
                >
                  Neon Mint
                </MagneticButton>
                <MagneticButton
                  className="px-6 py-3 rounded-lg font-bold"
                  style={{
                    color: domainTheme.neonPurple,
                    border: `2px solid ${domainTheme.neonPurple}`,
                    boxShadow: enhancedThemeConfig.effects.neonBorder.replace('var(--neon-color)', domainTheme.neonPurple)
                  }}
                >
                  Neon Purple
                </MagneticButton>
              </div>

              {/* Aurora Effect */}
              <div 
                className="h-32 rounded-xl flex items-center justify-center"
                style={{
                  background: enhancedThemeConfig.effects.auroraGradient,
                  animation: enhancedThemeConfig.effects.auroraAnimation
                }}
              >
                <h3 className="text-2xl font-bold text-white">Aurora Effect</h3>
              </div>
            </div>
          </section>
        )}

        {currentDomain === 'business' && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Business Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="p-8 rounded-xl"
                style={{
                  background: domainTheme.glassOverlay,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid oklch(1 0 0 / 0.2)'
                }}
              >
                <h3 className="text-2xl font-semibold mb-3" style={{ color: domainTheme.trustBlue }}>
                  Trust & Reliability
                </h3>
                <p className="text-muted-foreground">
                  Professional design that builds confidence and trust with your business partners.
                </p>
              </div>
              <div 
                className="p-8 rounded-xl"
                style={{
                  background: domainTheme.glassOverlay,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid oklch(1 0 0 / 0.2)'
                }}
              >
                <h3 className="text-2xl font-semibold mb-3" style={{ color: domainTheme.sophisticatedTeal }}>
                  Modern Excellence
                </h3>
                <p className="text-muted-foreground">
                  Sophisticated design language that represents innovation and forward thinking.
                </p>
              </div>
            </div>
          </section>
        )}

        {currentDomain === 'admin' && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Admin Features</h2>
            <div className="space-y-3">
              {[
                { status: 'success', label: 'All systems operational' },
                { status: 'warning', label: 'High memory usage detected' },
                { status: 'error', label: 'Database connection failed' },
                { status: 'info', label: 'System update available' }
              ].map(({ status, label }) => (
                <motion.div
                  key={status}
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: oklch.alpha(domainTheme[`status${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof domainTheme] as string, 0.1),
                    border: `1px solid ${domainTheme[`status${status.charAt(0).toUpperCase() + status.slice(1)}` as keyof typeof domainTheme]}`,
                    boxShadow: domainTheme.shadowSubtle
                  }}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {label}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Animation Speed Demo */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Animation Speeds</h2>
          <div className="flex gap-6 flex-wrap">
            {['Fast', 'Normal', 'Slow', 'VerySlow'].map((speed) => (
              <motion.div
                key={speed}
                className="w-24 h-24 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-medium"
                animate={{ rotate: 360 }}
                transition={{
                  duration: enhancedThemeConfig.animations[`duration${speed}` as keyof typeof enhancedThemeConfig.animations] as number,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                {speed}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Color Manipulation Demo */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Dynamic Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const baseColor = domainTheme.primary
              const colors = [
                { label: 'Original', color: baseColor },
                { label: 'Lighter', color: oklch.lighten(baseColor, 0.1) },
                { label: 'Darker', color: oklch.darken(baseColor, 0.1) },
                { label: 'Saturated', color: oklch.saturate(baseColor, 0.1) },
                { label: 'Desaturated', color: oklch.desaturate(baseColor, 0.1) },
                { label: 'Complement', color: oklch.complement(baseColor) },
                { label: 'Mixed', color: oklch.mix(baseColor, domainTheme.secondary, 0.5) },
                { label: 'Transparent', color: oklch.alpha(baseColor, 0.5) }
              ]
              return colors.map(({ label, color }) => (
                <div key={label} className="text-center">
                  <div
                    className="h-20 rounded-lg mb-2"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-sm">{label}</p>
                </div>
              ))
            })()}
          </div>
        </section>
      </div>
    </div>
  )
}