"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook to detect if the current device is mobile
 * @param breakpoint - The breakpoint in pixels to determine mobile (default: 768)
 * @returns boolean - true if the device is mobile, false otherwise
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === "undefined") {
      return
    }

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Set initial value
    setIsMobile(mediaQuery.matches)

    // Add event listener
    mediaQuery.addEventListener("change", handleChange)

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [breakpoint])

  return isMobile
}

// Export as default for convenience
export default useIsMobile