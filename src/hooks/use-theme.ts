import { useTheme as useNextTheme } from 'next-themes'
import { ThemeDomain, ThemeMode } from '@/lib/theme'
import { useEffect, useState } from 'react'

export function useTheme() {
  const { theme, setTheme, systemTheme, ...rest } = useNextTheme()
  const [domain, setDomain] = useState<ThemeDomain | undefined>()

  useEffect(() => {
    // Get domain from data-theme attribute
    const root = document.documentElement
    const currentDomain = root.getAttribute('data-theme') as ThemeDomain | null
    if (currentDomain) {
      setDomain(currentDomain)
    }
  }, [])

  const setThemeWithDomain = (newTheme: ThemeMode) => {
    setTheme(newTheme)
  }

  const setThemeDomain = (newDomain: ThemeDomain | undefined) => {
    setDomain(newDomain)
    if (newDomain) {
      document.documentElement.setAttribute('data-theme', newDomain)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  return {
    theme: theme as ThemeMode,
    setTheme: setThemeWithDomain,
    systemTheme,
    domain,
    setDomain: setThemeDomain,
    ...rest,
  }
}