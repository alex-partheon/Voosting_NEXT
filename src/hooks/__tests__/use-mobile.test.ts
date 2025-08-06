import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  const mockMediaQueryList = {
    matches,
    media: '',
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockMediaQueryList),
  })

  return mockMediaQueryList
}

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    jest.restoreAllMocks()
  })

  it('should return false when screen width is above default breakpoint (768px)', () => {
    const mockMediaQueryList = mockMatchMedia(false)
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should return true when screen width is below default breakpoint (768px)', () => {
    const mockMediaQueryList = mockMatchMedia(true)
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
  })

  it('should use custom breakpoint when provided', () => {
    const customBreakpoint = 1024
    const mockMediaQueryList = mockMatchMedia(false)
    
    const { result } = renderHook(() => useIsMobile(customBreakpoint))
    
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1023px)')
    expect(result.current).toBe(false)
  })

  it('should update state when media query changes', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | null = null
    
    const mockMediaQueryList = {
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event, handler) => {
        if (event === 'change') {
          changeHandler = handler
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => mockMediaQueryList),
    })

    const { result } = renderHook(() => useIsMobile())
    
    // Initial state should be false
    expect(result.current).toBe(false)
    
    // Simulate media query change
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent)
      }
    })
    
    // State should update to true
    expect(result.current).toBe(true)
  })

  it('should clean up event listener on unmount', () => {
    const mockMediaQueryList = mockMatchMedia(false)
    
    const { unmount } = renderHook(() => useIsMobile())
    
    unmount()
    
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should handle server-side rendering (no window object)', () => {
    // Mock server environment
    const originalWindow = global.window
    // @ts-ignore
    delete global.window
    
    const { result } = renderHook(() => useIsMobile())
    
    // Should return false in SSR environment
    expect(result.current).toBe(false)
    
    // Restore window object
    global.window = originalWindow
  })

  it('should re-initialize when breakpoint changes', () => {
    const mockMediaQueryList = mockMatchMedia(false)
    
    const { result, rerender } = renderHook(
      ({ breakpoint }) => useIsMobile(breakpoint),
      { initialProps: { breakpoint: 768 } }
    )
    
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    
    // Change breakpoint
    rerender({ breakpoint: 1024 })
    
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1023px)')
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalled()
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledTimes(2)
  })
})