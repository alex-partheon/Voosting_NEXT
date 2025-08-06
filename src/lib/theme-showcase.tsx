'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  enhancedThemeConfig, 
  getAnimationConfig, 
  getComponentTheme,
  generateNeonTextCSS,
  generateGlassmorphismCSS,
  oklch
} from './theme'

/**
 * Theme Showcase Component
 * Demonstrates the enhanced theme system features
 */
export function ThemeShowcase() {
  const [domain, setDomain] = useState<'creator' | 'business' | 'admin'>('creator')
  const [isDark, setIsDark] = useState(false)

  const domainTheme = enhancedThemeConfig.domains[domain]
  const magneticConfig = getComponentTheme('magneticButton')
  const springBouncy = getAnimationConfig('springBouncy')

  // Generate dynamic colors
  const primaryColor = domainTheme.primary
  const [analogousColors] = useState(() => oklch.analogous(primaryColor))
  const mixedColor = oklch.mix(domainTheme.primary, domainTheme.secondary, 0.5)

  return (
    <div className="p-8 space-y-8">
      {/* Theme Selector */}
      <div className="flex gap-4">
        <button onClick={() => setDomain('creator')} className="px-4 py-2 rounded">
          Creator Theme
        </button>
        <button onClick={() => setDomain('business')} className="px-4 py-2 rounded">
          Business Theme
        </button>
        <button onClick={() => setDomain('admin')} className="px-4 py-2 rounded">
          Admin Theme
        </button>
        <button onClick={() => setIsDark(!isDark)} className="px-4 py-2 rounded">
          {isDark ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {/* Gradient Showcase */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Gradients</h2>
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="h-32 rounded-lg"
            style={{ background: enhancedThemeConfig.gradients.linearAurora }}
          />
          <div 
            className="h-32 rounded-lg"
            style={{ background: enhancedThemeConfig.gradients.radialGlow }}
          />
          <div 
            className="h-32 rounded-lg"
            style={{ background: enhancedThemeConfig.gradients.conicRainbow }}
          />
        </div>
      </section>

      {/* Domain-Specific Colors */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Domain Colors</h2>
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            className="h-20 rounded"
            style={{ backgroundColor: domainTheme.primary }}
            whileHover={{ scale: 1.05 }}
            transition={springBouncy}
          />
          <motion.div
            className="h-20 rounded"
            style={{ backgroundColor: domainTheme.secondary }}
            whileHover={{ scale: 1.05 }}
            transition={springBouncy}
          />
          <motion.div
            className="h-20 rounded"
            style={{ backgroundColor: domainTheme.accent }}
            whileHover={{ scale: 1.05 }}
            transition={springBouncy}
          />
          <motion.div
            className="h-20 rounded"
            style={{ backgroundColor: mixedColor }}
            whileHover={{ scale: 1.05 }}
            transition={springBouncy}
          />
        </div>
      </section>

      {/* Effects Showcase */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Effects</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Glow Effect */}
          <div 
            className="h-32 rounded-lg bg-background flex items-center justify-center"
            style={{ 
              boxShadow: enhancedThemeConfig.effects.glowMedium.replace(
                'var(--glow-l, 0.70) var(--glow-c, 0.25) var(--glow-h, 220)',
                oklch.parse(domainTheme.primary) 
                  ? `${oklch.parse(domainTheme.primary)!.l} ${oklch.parse(domainTheme.primary)!.c} ${oklch.parse(domainTheme.primary)!.h}`
                  : '0.70 0.25 220'
              )
            }}
          >
            <span className="text-sm">Glow Effect</span>
          </div>

          {/* Glassmorphism */}
          <div 
            className="h-32 rounded-lg flex items-center justify-center"
            style={{ 
              ...generateGlassmorphismCSS(isDark).split(';').reduce((acc, rule) => {
                const [key, value] = rule.split(':').map(s => s.trim())
                if (key && value) {
                  acc[key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = value
                }
                return acc
              }, {} as any)
            }}
          >
            <span className="text-sm">Glassmorphism</span>
          </div>

          {/* Neon Text */}
          <div className="h-32 rounded-lg bg-gray-900 flex items-center justify-center">
            <h3 
              className="text-2xl font-bold"
              style={{ 
                color: domainTheme.primary,
                ...generateNeonTextCSS(domainTheme.primary).split(';').reduce((acc, rule) => {
                  const [key, value] = rule.split(':').map(s => s.trim())
                  if (key && value) {
                    acc[key.replace(/-([a-z])/g, (g) => g[1].toUpperCase())] = value
                  }
                  return acc
                }, {} as any)
              }}
            >
              NEON
            </h3>
          </div>
        </div>
      </section>

      {/* Creator-Specific Features */}
      {domain === 'creator' && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Creator Theme Features</h2>
          <div className="space-y-4">
            {/* Aurora Colors */}
            <div className="flex gap-2">
              <div className="w-20 h-20 rounded" style={{ backgroundColor: domainTheme.aurora1 }} />
              <div className="w-20 h-20 rounded" style={{ backgroundColor: domainTheme.aurora2 }} />
              <div className="w-20 h-20 rounded" style={{ backgroundColor: domainTheme.aurora3 }} />
            </div>
            {/* Neon Colors */}
            <div className="flex gap-2">
              <div className="w-20 h-20 rounded bg-gray-900 flex items-center justify-center">
                <span style={{ color: domainTheme.neonPink, textShadow: `0 0 10px ${domainTheme.neonPink}` }}>
                  Pink
                </span>
              </div>
              <div className="w-20 h-20 rounded bg-gray-900 flex items-center justify-center">
                <span style={{ color: domainTheme.neonMint, textShadow: `0 0 10px ${domainTheme.neonMint}` }}>
                  Mint
                </span>
              </div>
              <div className="w-20 h-20 rounded bg-gray-900 flex items-center justify-center">
                <span style={{ color: domainTheme.neonPurple, textShadow: `0 0 10px ${domainTheme.neonPurple}` }}>
                  Purple
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Business-Specific Features */}
      {domain === 'business' && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Business Theme Features</h2>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="h-32 rounded-lg p-4"
              style={{ 
                background: domainTheme.glassOverlay,
                backdropFilter: 'blur(10px)',
                border: '1px solid oklch(1 0 0 / 0.2)'
              }}
            >
              <h3 className="font-semibold" style={{ color: domainTheme.trustBlue }}>
                Trust Blue
              </h3>
              <p className="text-sm mt-2">Professional and reliable</p>
            </div>
            <div 
              className="h-32 rounded-lg p-4"
              style={{ 
                background: domainTheme.glassOverlay,
                backdropFilter: 'blur(10px)',
                border: '1px solid oklch(1 0 0 / 0.2)'
              }}
            >
              <h3 className="font-semibold" style={{ color: domainTheme.sophisticatedTeal }}>
                Sophisticated Teal
              </h3>
              <p className="text-sm mt-2">Modern and elegant</p>
            </div>
          </div>
        </section>
      )}

      {/* Admin-Specific Features */}
      {domain === 'admin' && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Admin Theme Features</h2>
          <div className="space-y-2">
            <div 
              className="p-3 rounded"
              style={{ 
                backgroundColor: oklch.alpha(domainTheme.statusSuccess, 0.1),
                border: `1px solid ${domainTheme.statusSuccess}`
              }}
            >
              Success Status
            </div>
            <div 
              className="p-3 rounded"
              style={{ 
                backgroundColor: oklch.alpha(domainTheme.statusWarning, 0.1),
                border: `1px solid ${domainTheme.statusWarning}`
              }}
            >
              Warning Status
            </div>
            <div 
              className="p-3 rounded"
              style={{ 
                backgroundColor: oklch.alpha(domainTheme.statusError, 0.1),
                border: `1px solid ${domainTheme.statusError}`
              }}
            >
              Error Status
            </div>
            <div 
              className="p-3 rounded"
              style={{ 
                backgroundColor: oklch.alpha(domainTheme.statusInfo, 0.1),
                border: `1px solid ${domainTheme.statusInfo}`
              }}
            >
              Info Status
            </div>
          </div>
        </section>
      )}

      {/* Animation Durations */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Animation Timings</h2>
        <div className="flex gap-4">
          <motion.div
            className="w-20 h-20 rounded bg-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: enhancedThemeConfig.animations.durationFast, repeat: Infinity }}
          />
          <motion.div
            className="w-20 h-20 rounded bg-secondary"
            animate={{ rotate: 360 }}
            transition={{ duration: enhancedThemeConfig.animations.durationNormal, repeat: Infinity }}
          />
          <motion.div
            className="w-20 h-20 rounded bg-accent"
            animate={{ rotate: 360 }}
            transition={{ duration: enhancedThemeConfig.animations.durationSlow, repeat: Infinity }}
          />
        </div>
      </section>
    </div>
  )
}