import { useEffect, useState } from 'react'
import { Camera, Expand, Play, X } from 'lucide-react'
import { galleryItems, videoHighlight } from '../data/siteContent.js'

export default function Gallery() {
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    if (!activeItem) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveItem(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeItem])

  return (
    <section id="galeria" className="section-padding bg-ink-950">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end" data-reveal>
          <div>
            <p className="section-eyebrow">Galeria</p>
            <h2 className="section-title">Fotos de cortes, acabamentos e estilos feitos na barbearia.</h2>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <Camera size={18} className="text-gold-300" />
            Toque nas imagens para ampliar
          </div>
        </div>

        <div className="premium-card mt-10 grid overflow-hidden lg:grid-cols-[0.86fr_1.14fr]" data-reveal>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md border border-gold-300/25 bg-gold-300/10 text-gold-300">
              <Play size={24} />
            </div>
            <p className="section-eyebrow mb-2">Vídeo</p>
            <h3 className="text-2xl font-black text-white sm:text-3xl">{videoHighlight.title}</h3>
            {videoHighlight.description && (
              <p className="mt-4 leading-7 text-zinc-300">{videoHighlight.description}</p>
            )}
          </div>
          <div className="bg-black">
            <video
              src={videoHighlight.src}
              className="aspect-video h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </div>

        <div className="mt-10 grid auto-rows-[230px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item, index) => (
            <button
              key={`${item.title}-${index}`}
              type="button"
              className={`group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] text-left shadow-glow transition duration-300 hover:-translate-y-1 hover:border-gold-300/45 ${
                index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
              } ${index === 1 ? 'lg:col-span-2' : ''}`}
              onClick={() => setActiveItem(item)}
              data-reveal
              style={{ transitionDelay: `${index * 45}ms` }}
            >
              <img
                src={item.src}
                alt={item.alt}
                className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${item.className || ''}`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-zinc-300">Foto</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-black/45 text-gold-300 backdrop-blur transition group-hover:bg-gold-300 group-hover:text-black">
                  <Expand size={19} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeItem && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-ink-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-black/70 text-white transition hover:text-gold-300"
              aria-label="Fechar galeria"
              onClick={() => setActiveItem(null)}
            >
              <X size={22} />
            </button>
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              className={`max-h-[88vh] w-full bg-black object-contain ${activeItem.className || ''}`}
            />
          </div>
        </div>
      )}
    </section>
  )
}
