import Lenis from 'lenis'

let lenis: Lenis | null = null
let rafId = 0

/** Initialize Lenis smooth scrolling once for the whole application. */
export function initSmoothScroll(): Lenis | null {
  if (lenis) return lenis
  if (typeof window === 'undefined') return null
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return null

  lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    anchors: true
  })

  const raf = (time: number) => {
    lenis?.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)
  return lenis
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Jump to the top instantly (used on route change). */
export function scrollToTopImmediate(): void {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true })
  } else {
    window.scrollTo(0, 0)
  }
}

export function destroySmoothScroll(): void {
  cancelAnimationFrame(rafId)
  lenis?.destroy()
  lenis = null
}
