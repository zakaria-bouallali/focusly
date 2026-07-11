import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * useScrollReveal — Intersection Observer hook for scroll animations.
 * Returns [refCallback, isVisible] — attach callback ref to the element you want animated.
 * Works perfectly on dynamically rendered/asynchronous components.
 * @param {Object} options
 * @param {number} options.threshold - 0..1, how much of element must be visible to trigger (default 0.15)
 * @param {string} options.rootMargin - CSS margin offset (default '0px 0px -60px 0px')
 * @param {boolean} options.once - if true, fires only once (default true)
 */
export function useScrollReveal({ threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef(null)

  const refCallback = useCallback((node) => {
    // If observer exists, disconnect it first
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) {
              observer.unobserve(node)
              observerRef.current = null
            }
          } else if (!once) {
            setIsVisible(false)
          }
        },
        { threshold, rootMargin }
      )
      observer.observe(node)
      observerRef.current = observer
    }
  }, [threshold, rootMargin, once])

  // Clean up observer when hook is unmounted
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return [refCallback, isVisible]
}

/**
 * useScrollProgress — tracks vertical scroll progress 0..1 for the full page.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0)
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return progress
}
