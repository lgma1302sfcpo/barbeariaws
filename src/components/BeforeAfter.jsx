import { useEffect, useRef, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { comparison } from '../data/siteContent.js'

export default function BeforeAfter() {
  const [position, setPosition] = useState(54)
  const containerRef = useRef(null)
  const draggingRef = useRef(false)
  const frameRef = useRef(0)
  const positionRef = useRef(54)

  const applyPosition = (nextPosition) => {
    positionRef.current = nextPosition

    if (frameRef.current) return

    frameRef.current = requestAnimationFrame(() => {
      const container = containerRef.current
      if (container) {
        container.style.setProperty('--before-position', `${positionRef.current}%`)
      }
      frameRef.current = 0
    })
  }

  const updatePosition = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const next = ((clientX - rect.left) / rect.width) * 100
    applyPosition(Math.min(88, Math.max(12, next)))
  }

  const finishDrag = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setPosition(positionRef.current)
  }

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <section id="antes-depois" className="section-padding bg-ink-900">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div data-reveal>
            <p className="section-eyebrow">Antes e depois</p>
            <h2 className="section-title">Compare o cuidado que transforma o visual.</h2>
            <p className="section-copy">
              Arraste o controle para ver a diferença no corte, acabamento e alinhamento do visual.
            </p>
          </div>

          <div
            ref={containerRef}
            className="premium-card relative aspect-[3/4] select-none overflow-hidden sm:aspect-[4/3]"
            data-reveal
            style={{ '--before-position': `${position}%`, touchAction: 'none' }}
            onPointerDown={(event) => {
              draggingRef.current = true
              event.currentTarget.setPointerCapture?.(event.pointerId)
              updatePosition(event.clientX)
              event.preventDefault()
            }}
            onPointerMove={(event) => {
              if (!draggingRef.current) return
              updatePosition(event.clientX)
              event.preventDefault()
            }}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onPointerLeave={finishDrag}
          >
            <img
              src={comparison.afterImage}
              alt="Imagem de depois"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[54%_44%]"
              draggable="false"
            />
            <img
              src={comparison.beforeImage}
              alt="Imagem de antes"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[54%_44%]"
              style={{
                clipPath: 'inset(0 calc(100% - var(--before-position)) 0 0)',
                filter: 'grayscale(0.35) brightness(0.82)',
              }}
              draggable="false"
            />

            <div className="pointer-events-none absolute left-4 top-4 rounded-md bg-black/65 px-3 py-2 text-xs font-black uppercase text-zinc-100">
              {comparison.beforeLabel}
            </div>
            <div className="pointer-events-none absolute right-4 top-4 rounded-md bg-gold-300 px-3 py-2 text-xs font-black uppercase text-black">
              {comparison.afterLabel}
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 z-10 flex w-12 -translate-x-1/2 items-center justify-center"
              style={{ left: 'var(--before-position)' }}
            >
              <span className="h-full w-px bg-gold-300" />
              <span className="absolute inline-flex h-12 w-12 items-center justify-center rounded-md border border-gold-100 bg-gold-300 text-black shadow-gold">
                <GripVertical size={24} />
              </span>
            </div>

            <input
              aria-label="Controlar comparação antes e depois"
              type="range"
              min="12"
              max="88"
              value={Math.round(position)}
              onChange={(event) => {
                const next = Number(event.target.value)
                applyPosition(next)
                setPosition(next)
              }}
              className="absolute bottom-4 left-1/2 z-20 h-1 w-[calc(100%-2rem)] -translate-x-1/2 cursor-ew-resize accent-gold-300 opacity-0"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
