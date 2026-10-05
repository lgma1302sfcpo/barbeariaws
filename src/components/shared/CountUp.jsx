import { useEffect, useRef, useState } from 'react'

export default function CountUp({ value, duration = 1400 }) {
  const [displayValue, setDisplayValue] = useState(value)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return undefined

    let frameId = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        const startTime = performance.now()
        const animate = (now) => {
          const progress = Math.min((now - startTime) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplayValue(Math.floor(value * eased))

          if (progress < 1) {
            frameId = requestAnimationFrame(animate)
          }
        }

        frameId = requestAnimationFrame(animate)
        observer.unobserve(node)
      },
      { threshold: 0.35 },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frameId)
    }
  }, [duration, value])

  return <span ref={ref} className="inline-block tabular-nums" style={{ minWidth: `${String(value).length + 1}ch` }}>{displayValue.toLocaleString('pt-BR')}</span>
}
