import { useState, useEffect, useRef, useCallback } from 'react'

const WEDDING_DATE = new Date('2027-06-12T13:00:00')

// ── Countdown hook ──────────────────────────────────────────────
function useCountdown() {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = WEDDING_DATE.getTime() - Date.now()
      if (diff <= 0) return setT({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

// ── Scroll reveal hook ──────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll('.reveal').forEach((r) => r.classList.add('visible'))
          obs.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

// ── Leaf SVG decorations ────────────────────────────────────────
function LeafLeft({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className} aria-hidden>
      <path d="M60 190 C20 150 0 100 10 40 C30 60 70 80 80 140 C85 110 70 60 40 20 C90 30 120 90 100 160 Z" fill="#c4ddbf" opacity="0.55" />
      <path d="M60 190 C40 160 35 120 45 80" stroke="#557a59" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

function LeafRight({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" fill="none" className={className} aria-hidden>
      <path d="M60 190 C100 150 120 100 110 40 C90 60 50 80 40 140 C35 110 50 60 80 20 C30 30 0 90 20 160 Z" fill="#c4ddbf" opacity="0.55" />
      <path d="M60 190 C80 160 85 120 75 80" stroke="#557a59" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

function FloralDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2" aria-hidden>
      <span className="text-[#8aad87] text-lg opacity-60">✦</span>
      <span className="block w-16 h-px bg-gradient-to-r from-transparent via-[#8aad87] to-transparent opacity-60" />
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#8aad87] opacity-80" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 20L9 8l4 6.5L15.5 10 21 20H3z" fill="currentColor" />
      </svg>
      <span className="block w-16 h-px bg-gradient-to-r from-transparent via-[#8aad87] to-transparent opacity-60" />
      <span className="text-[#8aad87] text-lg opacity-60">✦</span>
    </div>
  )
}

// ── Section wrapper ─────────────────────────────────────────────
function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  const ref = useReveal()
  return (
    <section id={id} ref={ref} className={`py-10 px-5 ${className}`}>
      {children}
    </section>
  )
}

function SectionTitle({ sub, title }: { sub: string; title: string }) {
  return (
    <div className="text-center mb-12 reveal">
      <p className="text-[#557a59] uppercase tracking-[0.25em] text-xs font-semibold mb-3">{sub}</p>
      <h2 className="font-display text-4xl md:text-5xl text-[#2a3d2c] font-light italic leading-tight">{title}</h2>
      <div className="section-divider mt-5" />
    </div>
  )
}

// ── Music Player ────────────────────────────────────────────────
function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setShowHint(false)
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }, [playing])

  // Pausa la música si otro elemento (ej. el vídeo) avisa que ha empezado a sonar
  useEffect(() => {
    const handlePauseMusic = () => {
      const audio = audioRef.current
      if (!audio) return
      audio.pause()
      setPlaying(false)
    }
    window.addEventListener('figma:pause-music', handlePauseMusic)
    return () => window.removeEventListener('figma:pause-music', handlePauseMusic)
  }, [])

  // Oculta el aviso "Dale al play" pasados unos segundos
  useEffect(() => {
    if (!showHint) return
    const id = setTimeout(() => setShowHint(false), 10000)
    return () => clearTimeout(id)
  }, [showHint])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/cancion.mp3`}
        loop
        preload="auto"
      />

      {/* Aviso "Dale al play" — solo antes de interactuar, se desvanece solo */}
      {!playing && showHint && (
          <div className="play-hint absolute bottom-16 right-0 whitespace-nowrap bg-white/90 backdrop-blur-sm text-[#557a59] text-xs px-3 py-1.5 rounded-full shadow-md">
            Dale al play ♪
          </div>
        )}

      <div className="relative w-12 h-12">
        {playing && <div className="music-pulse absolute inset-0 rounded-full" />}

        {/* Notas musicales flotando alrededor cuando suena*/}
        {playing && (
          <>
            <span className="music-note" style={{ left: '-6px', top: '4px', animationDelay: '0s' }}>♪</span>
            <span className="music-note" style={{ right: '-8px', top: '10px', animationDelay: '0.7s' }}>♫</span>
            <span className="music-note" style={{ left: '0px', bottom: '-6px', animationDelay: '1.4s' }}>♩</span>
            <span className="music-note" style={{ right: '2px', bottom: '-8px', animationDelay: '2.1s' }}>♬</span>
          </>
        )}

        <button
          onClick={toggle}
          title={playing ? 'Pausar música' : 'Reproducir música'}
          className="relative w-12 h-12 rounded-full bg-[#557a59] text-white shadow-lg border-2 border-white flex items-center justify-center hover:bg-[#3e5c41] transition-colors"
          style={{ cursor: 'pointer' }}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Hero ────────────────────────────────────────────────────────
function Hero() {
  return (
      <section className="relative min-h-[100svh] min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#f2f7f0]">      
      <div className="absolute inset-0">
      <img
  src={`${import.meta.env.BASE_URL}gallery/fotoPortada.jpg`}
  alt=""
  className="w-full h-full object-cover object-[65%_center] sm:object-center opacity-30"
  aria-hidden
/>
        <div className="absolute inset-0 bg-gradient-to-b from-[#f2f7f0]/60 via-transparent to-[#f2f7f0]/80" />
      </div>

      {/* <LeafLeft className="absolute left-0 top-1/4 w-28 md:w-44 animate-float pointer-events-none" />
      <LeafRight className="absolute right-0 top-1/3 w-28 md:w-44 animate-float-rev pointer-events-none" />
      <LeafLeft className="absolute left-4 bottom-20 w-20 md:w-32 animate-float-rev pointer-events-none opacity-60" />
      <LeafRight className="absolute right-4 bottom-20 w-20 md:w-32 animate-float pointer-events-none opacity-60" /> */}

<div className="relative z-10 text-center px-6 max-w-2xl mx-auto" style={{ animation: 'fade-up 1s ease-out both' }}>
  <div className="-translate-y-8 sm:translate-y-0">
    <p className="text-[#557a59] uppercase tracking-[0.4em] text-sm font-semibold mb-8">
      ¡Nos casamos!
    </p>
    <h1 className="font-display text-7xl md:text-9xl text-[#2a3d2c] font-light leading-none mb-2">Clara</h1>
    <p className="font-display italic text-[#557a59] text-4xl md:text-5xl mb-2">&amp;</p>
    <h1 className="font-display text-7xl md:text-9xl text-[#2a3d2c] font-light leading-none mb-10">Andrés</h1>
  </div>
  <div className="mt-22 sm:mt-0">
  <FloralDivider />
  <p className="mt-8 text-[#3e5c41] tracking-widest text-base font-medium uppercase">12 · Junio · 2027</p>
  <p className="text-[#557a59] text-base mt-1">Poza de la Sal, Burgos</p>
</div>
</div>

    <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 px-4">
  <p className="text-[#557a59] text-xs uppercase tracking-wide whitespace-nowrap">Te seguimos contando</p>
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#8aad87]">
    <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
</div>
    </section>
  )
}



// ── Countdown ───────────────────────────────────────────────────
function Countdown() {
  const { days, hours, minutes, seconds } = useCountdown()
  const ref = useReveal()
  const units = [
    { value: days, label: 'Días' },
    { value: hours, label: 'Horas' },
    { value: minutes, label: 'Minutos' },
    { value: seconds, label: 'Segundos' },
  ]
  return (
    <section ref={ref} className="relative py-16 md:py-20 px-5 bg-[#557a59]/95 overflow-hidden">
      {/* Decoración de fondo — hojas sutiles flotando */}
      <LeafLeft className="absolute -left-6 top-1/2 -translate-y-1/2 w-24 md:w-36 opacity-10 pointer-events-none" />
      <LeafRight className="absolute -right-6 top-1/2 -translate-y-1/2 w-24 md:w-36 opacity-10 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto text-center">
        <p className="reveal text-[#c4ddbf] uppercase tracking-[0.3em] text-xs mb-2">Faltan tan solo...</p>
        <FloralDivider />

        <div className="reveal reveal-delay-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8">
          {units.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div className="relative bg-white/10 backdrop-blur rounded-2xl px-3 py-5 md:px-6 md:py-6 w-full border border-white/20 shadow-lg overflow-hidden">
                {/* Brillo decorativo sutil en la esquina */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/10 blur-xl" />
                <span className="relative font-display text-4xl sm:text-5xl md:text-6xl text-white font-light tabular-nums">
                  {String(value).padStart(2, '0')}
                </span>
              </div>
              <p className="text-[#c4ddbf] text-[11px] sm:text-xs uppercase tracking-widest mt-3">{label}</p>
            </div>
          ))}
        </div>

        <p className="reveal reveal-delay-2 text-white/70 text-xs mt-10">12 de Junio de 2027 · 13:00h</p>
      </div>
    </section>
  )
}

// ── Photo Carousel ──────────────────────────────────────────────
function PhotoCarousel() {
  const sectionRef = useReveal()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const offsetRef = useRef(0)
  const singleSetWidthRef = useRef(0)
  const hoveredRef = useRef(false)
  const draggingRef = useRef(false)
  const dragStartX = useRef(0)
  const offsetAtDrag = useRef(0)
  const lastTimeRef = useRef<number>(performance.now())

  const SPEED_PX_PER_SEC = 55

  const photos = [
    'foto1.jpg', 'foto2.jpg', 'foto3.jpg',
    'foto4.jpg', 'foto5.jpg', 'foto6.jpg',
    'foto7.jpg', 'foto8.jpg', 'foto9.jpg', 'foto10.jpg',
  ]

  // Triplicado — suficiente margen para el bucle, con menos carga que x4
  const loopPhotos = [...photos, ...photos, ...photos]

  const applyOffset = (raw: number) => {
    const track = trackRef.current
    if (!track) return raw
    const singleWidth = singleSetWidthRef.current
    if (singleWidth === 0) return raw

    let o = raw
    // Con 3 copias, el rango válido de la copia "central" es [-singleWidth*2, 0]
    while (o <= -singleWidth * 2) o += singleWidth
    while (o >= 0) o -= singleWidth

    track.style.transform = `translate3d(${o}px, 0, 0)`
    return o
  }

  // Mide el ancho real cuando todas las imágenes han cargado (evita saltos por medir antes de tiempo)
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const updateWidth = () => {
      const children = track.children
      let measuredWidth = 0

      if (children.length >= photos.length * 2) {
        const firstItem = children[0] as HTMLElement
        const duplicateItem = children[photos.length] as HTMLElement
        if (firstItem && duplicateItem) {
          const diff = duplicateItem.offsetLeft - firstItem.offsetLeft
          if (diff > 0) measuredWidth = diff
        }
      }

      if (measuredWidth === 0 && track.scrollWidth > 0) {
        measuredWidth = track.scrollWidth / 3
      }

      if (measuredWidth > 0) {
        if (singleSetWidthRef.current === 0) {
          // Empieza centrado en la copia del medio
          offsetRef.current = -measuredWidth
          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
        }
        singleSetWidthRef.current = measuredWidth
      }
    }

    const images = Array.from(track.querySelectorAll('img'))
    let loaded = 0
    const onImgLoad = () => {
      loaded++
      if (loaded === images.length) updateWidth()
    }

    images.forEach((img) => {
      if (img.complete) {
        onImgLoad()
      } else {
        img.addEventListener('load', onImgLoad)
        img.addEventListener('error', onImgLoad)
      }
    })

    const fallbackTimer = setTimeout(updateWidth, 300)
    window.addEventListener('resize', updateWidth)

    return () => {
      clearTimeout(fallbackTimer)
      window.removeEventListener('resize', updateWidth)
      images.forEach((img) => {
        img.removeEventListener('load', onImgLoad)
        img.removeEventListener('error', onImgLoad)
      })
    }
  }, [photos.length])

  // Bucle de animación con delta time — fluido e independiente del refresco de pantalla
  useEffect(() => {
    lastTimeRef.current = performance.now()

    const step = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000
      lastTimeRef.current = currentTime

      if (!hoveredRef.current && !draggingRef.current && deltaTime < 0.1 && singleSetWidthRef.current > 0) {
        const moveBy = SPEED_PX_PER_SEC * deltaTime
        offsetRef.current = applyOffset(offsetRef.current - moveBy)
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const onMouseEnter = () => { hoveredRef.current = true }
  const onMouseLeave = () => { hoveredRef.current = false; draggingRef.current = false }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    hoveredRef.current = false
    dragStartX.current = e.clientX
    offsetAtDrag.current = offsetRef.current
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const dx = e.clientX - dragStartX.current
    offsetRef.current = applyOffset(offsetAtDrag.current + dx)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    hoveredRef.current = e.currentTarget.matches(':hover')
    lastTimeRef.current = performance.now()
  }

  return (
    <section ref={sectionRef} className="py-16 bg-[#f2f7f0]/80">
      <div className="text-center mb-10 px-5 reveal">
        <p className="text-[#557a59] uppercase tracking-[0.25em] text-xs font-semibold mb-3">Lo que hemos vivido</p>
        <h2 className="font-display text-4xl md:text-5xl text-[#2a3d2c] font-light italic leading-tight">Nuestro rollo</h2>
        <div className="section-divider mt-5" />
      </div>

      <div className="carousel-fade overflow-hidden reveal reveal-delay-1">
        <div
          ref={wrapperRef}
          className="overflow-hidden py-4"
          style={{ cursor: 'grab', touchAction: 'pan-y' }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            ref={trackRef}
            className="flex gap-5 md:gap-7 will-change-transform select-none"
            style={{ width: 'max-content' }}
          >
            {loopPhotos.map((photo, i) => (
              <div
                key={i}
                className={`shrink-0 w-48 h-60 md:w-64 md:h-80 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white ${
                  i % 2 === 0 ? '-rotate-2' : 'rotate-2'
                }`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}gallery/${photo}`}
                  alt=""
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Wedding Info — 3 cards ──────────────────────────────────────
function WeddingInfo() {
  const details = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.3">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
      title: 'Fecha',
      lines: ['Sábado, 12 de Junio de 2027'],
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.3">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" />
        </svg>
      ),
      title: 'Horario',
      lines: ['Ceremonia: 13:00h', 'Cóctel: 14:30h', 'Fiesta: hasta que el cuerpo aguante'],
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.3">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
      title: 'Lugar',
      lines: ['Albergue Virgen de Pedrajas, Ctra. Cornudilla s/n ', 'Poza de la Sal, Burgos'],
    },
    {
  icon: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3a2 2 0 100 4 2 2 0 000-4z" />
      <path d="M12 7v3M12 10L3 17a2 2 0 001.2 3.6h15.6A2 2 0 0021 17l-9-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  title: 'Dress code',
  lines: [
    'Guapos, pero no de etiqueta.',
    'La boda será informal y al aire libre, así que elige un look con el que te veas bien y estés cómodo.',
    '__warning__'
  ],
},
  ]

  return (
    <Section id="info" className="bg-[#fdfaf5]/80">
      <div className="max-w-3xl mx-auto">
        <SectionTitle sub="Detalles del día" title="Lo más importante"/>
        <p className="reveal text-center text-[#3e5c41] text-sm leading-relaxed max-w-lg mx-auto mb-8">
          Aquí tienes toda la información para que no se te escape ningún detalle de nuestro día.
        </p>
        <div className="flex flex-col gap-3">
          {details.map(({ icon, title, lines }, i) => (
            <div
              key={title}
              className={`reveal reveal-delay-${i + 1} flex items-center gap-4 p-4 bg-white rounded-xl border border-[#e1eedd] hover:shadow-md transition-all duration-300`}
            >
              <div className="flex flex-col items-center gap-1 shrink-0 w-12 text-center">
                <div className="text-[#557a59]">{icon}</div>
                <h3 className="font-display italic text-sm text-[#2a3d2c]">{title}</h3>
              </div>
              <div className="w-px self-stretch bg-[#e1eedd]" />
              <div className="flex-1">
              {lines.map((l, idx) => (
  <p
    key={l}
    className={`text-[#3e5c41] text-xs leading-relaxed flex items-start gap-1.5 ${idx > 0 ? 'mt-2' : ''}`}
  >
    {l === '__warning__' ? (
      <>
       <span className="italic">El césped y los tacones no son amigos {';)'}</span>
      </>
    ) : (
      l
    )}
  </p>
))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ── Our Story ───────────────────────────────────────────────────
function OurStory() {
  const ref = useReveal()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    setProgress((v.currentTime / v.duration) * 100)
  }

  const handleLoadedMetadata = () => {
    const v = videoRef.current
    if (!v) return
    setDuration(v.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const pct = Number(e.target.value)
    v.currentTime = (pct / 100) * v.duration
    setProgress(pct)
  }

  const formatTime = (secs: number) => {
    if (!isFinite(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const toggleFullscreen = async () => {
    const el = containerRef.current
    if (!el) return

    if (document.fullscreenElement) {
      if (screen.orientation && (screen.orientation as any).unlock) {
        ;(screen.orientation as any).unlock()
      }
      document.exitFullscreen()
      return
    }

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen()
      } else if ((el as any).webkitRequestFullscreen) {
        ;(el as any).webkitRequestFullscreen()
      }

      if (screen.orientation && (screen.orientation as any).lock) {
        try {
          await (screen.orientation as any).lock('landscape')
        } catch {}
      }
    } catch {}
  }

  return (
    <Section id="historia" className="bg-[#f2f7f0]/80">
      <div ref={ref} className="max-w-3xl mx-auto flex flex-col items-center">
        <SectionTitle sub="Cómo hemos llegado hasta aquí" title="Kilómetros y aventuras" />

        <div className="reveal w-11/12 sm:w-2/3 md:w-1/2 mx-auto -mt-12 mb-4 bg-white p-3 pb-8 rounded-sm shadow-2xl -rotate-2">
          <div className="aspect-[4/5] overflow-hidden bg-[#e1eedd]">
            <img
              src={`${import.meta.env.BASE_URL}gallery/gatas.jpg`}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="reveal w-full bg-white border border-[#e1eedd] rounded-2xl px-8 py-10 text-center shadow-sm">
          <span className="font-display italic text-[#557a59] text-5xl leading-none select-none">"</span>
          <p className="font-display italic text-[#2a3d2c] text-xl md:text-2xl leading-relaxed mt-1">
          Hay aventuras que no se planean, simplemente suceden.
          </p>
          <FloralDivider />
          {/* Contenedor con espacio vertical entre cada párrafo */}
          <div className="text-[#3e5c41] text-sm leading-relaxed mt-2 flex flex-col gap-3">
            <p>
              La nuestra empezó en el club de montaña —cómo no—, donde una cuerda de escalada hizo que pasáramos de ser dos extraños a ser cordada.
            </p>

            <p className="font-medium italic">
              Ella, la barranquista extrovertida; él, el alpinista misterioso.
            </p>

            <p>
              Nada hacía prever que la vida acabaría juntándonos. Será cosa del destino, ¿no? Al final, entre rocas, charlas y calimochos, terminamos encontrándonos el uno al otro.
            </p>

            <p>
              Si algo tenemos claro es que seguiremos siendo "esa pareja que no para quieta” y, sobre todo, seguiremos siendo el que siempre va por delante en la montaña y la que siempre monta el rápel en los barrancos.
            </p>

            <p className="font-semibold">
              Pero, a partir de ahora, lo haremos como marido y mujer.
            </p>
          </div>
          <p className="text-[#557a59] text-xs mt-5 tracking-widest uppercase">Clara &amp; Andrés</p>
        </div>

        <div className="reveal reveal-delay-1 flex flex-col items-center gap-2 mt-8 mb-3 text-[#557a59] animate-bounce">
          <p className="text-xs text-center uppercase tracking-[0.2em] font-medium">♥ Un pedacito de nuestra aventura ♥</p>
          <svg viewBox="0 0 24 32" fill="none" className="w-5 h-7" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="0" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5 16l7 10 7-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div ref={containerRef} className="video-container reveal reveal-delay-2 w-full relative rounded-2xl overflow-hidden shadow-xl bg-black group">
          <video
            ref={videoRef}
            src={`${import.meta.env.BASE_URL}video/video.mp4`}
            className="w-full max-h-[70vh] object-contain cursor-pointer"
            onClick={togglePlay}
            onPlay={() => {
              setPlaying(true)
              window.dispatchEvent(new CustomEvent('figma:pause-music'))
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            playsInline
            onContextMenu={(e) => e.preventDefault()}
          />

          {!playing && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
              aria-label="Reproducir"
            >
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" fill="#2a3d2c" className="w-7 h-7 ml-1">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </div>
            </button>
          )}

          <div
            className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-8 bg-gradient-to-t from-black/70 to-transparent flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              className="video-seek w-full"
              aria-label="Progreso del vídeo"
            />

            <div className="flex items-center justify-between">
              <button onClick={togglePlay} className="text-white p-1" aria-label={playing ? 'Pausar' : 'Reproducir'}>
                {playing ? (
                  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                    <rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-0.5">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                )}
              </button>

              <span className="text-white text-xs tabular-nums">
                {formatTime((progress / 100) * duration)} / {formatTime(duration)}
              </span>

              <div className="flex items-center gap-3">
              <button onClick={toggleMute} className="text-white p-1" aria-label={muted ? 'Activar sonido' : 'Silenciar'}>
                {muted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" />
                    <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" fill="white" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.5 8.5a5 5 0 010 7" strokeLinecap="round" />
                    <path d="M18.5 5.5a9 9 0 010 13" strokeLinecap="round" />
                  </svg>
                )}
              </button>

                <button onClick={toggleFullscreen} className="text-white p-1" aria-label="Pantalla completa">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
                    <path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ── Full-width parallax photo ───────────────────────────────────
function ParallaxPhoto() {
  return (
    <div className="relative w-full h-[35vh] md:h-[70vh] overflow-hidden bg-[#c4ddbf]">
      <img
        src={`${import.meta.env.BASE_URL}gallery/grande.png`}
        alt="Clara y Andrés"
        className="w-full h-full object-cover object-center md:object-[50%_70%]"
        loading="lazy"
      />
    </div>
  )
}

// ── Lugar ───────────────────────────────────────────────────────
function Venue() {
  const ref = useReveal()
  return (
    <Section id="lugar" className="bg-[#fdfaf5]/80">
      <div ref={ref} className="max-w-5xl mx-auto">
        <SectionTitle sub="Dónde nos casamos" title="El lugar" />
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal reveal-delay-1 rounded-3xl overflow-hidden shadow-lg bg-[#c4ddbf] aspect-[4/3]">
            <img
              src={`${import.meta.env.BASE_URL}gallery/albergue.png`}
              alt="Albergue Virgen de Pedrajas"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="reveal reveal-delay-2 flex flex-col gap-6">
            <div>
              <h3 className="font-display text-3xl text-[#2a3d2c] mb-2">Albergue Virgen de Pedrajas</h3>
              <p className="text-[#3e5c41] leading-relaxed"> 
                Un rincón especial y sencillo a las afueras de Poza de la Sal, bajo la silueta de La Reina Dormida. 
              </p>
              <p className="text-[#3e5c41] leading-relaxed">
              Un espacio rodeado de naturaleza y tranquilidad que convertiremos, por un día, en el escenario de nuestra aventura.
              </p>
              <br></br>
              <p className="text-[#3e5c41] leading-relaxed">
                La celebración al completo será en las zonas ajardinadas del albergue, con todo lo necesario para que solo tengas que preocuparte de disfrutar. 
              </p>
            </div>

            <div className="bg-[#f2f7f0] rounded-xl border border-[#e1eedd] p-4 flex flex-col items-center text-center gap-3">
              <div className="flex items-start gap-3 text-left w-full">
              <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#557a59]" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#2a3d2c] font-semibold text-sm">Dirección</p>
                  <p className="text-[#6d8c70] text-sm">Ctra. Cornudilla s/n, Poza de la Sal</p>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Albergue Virgen de Pedrajas+Poza de la Sal"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-[#557a59]/95 text-white px-5 py-2 rounded-full hover:bg-[#3e5c41] transition-all duration-300 text-xs font-medium shadow-sm hover:shadow-md w-fit"
              >
                Ver en Google Maps
              </a>
            </div>

            <div className="p-4 bg-[#f2f7f0] rounded-xl border border-[#e1eedd]">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#557a59]" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 20v-6a1 1 0 011-1h2a1 1 0 011 1v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#3e5c41] text-sm leading-relaxed">
                    Si no quieres volver a Burgos esa noche te puedes quedar a dormir en el albergue.
                  </p>
                  <p className="text-[#3e5c41] text-sm leading-relaxed mt-2">
                    Ten en cuenta que los baños y las habitaciones son compartidos.
                  </p>
                </div>
              </div>

              <p className="font-display italic text-[#557a59] text-base mt-3 text-center">
                ¡Trae tu espíritu de campamento!
              </p>
            </div>
            </div>
          </div>
        </div>
    </Section>
  )
}

// ── How to arrive ───────────────────────────────────────────────
function HowToArrive() {
  const ref = useReveal()

  const busStops = [
    {
      name: 'Parada Centro',
      address: 'Pza. Santa Teresa',
      mapsQuery: 'Plaza Santa Teresa, Burgos',
      departure: '11:30h',
    },
    {
      name: 'Parada Gamonal',
      address: 'Iglesia Antigua de Gamonal',
      mapsQuery: 'Iglesia Antigua de Gamonal, Burgos',
      departure: '11:45h',
    },
  ]

  return (
    <Section id="como-llegar" className="bg-[#f2f7f0]/80">
      <div ref={ref} className="max-w-3xl mx-auto">
        <SectionTitle sub="Para que no te pierdas" title="¿Cómo llegar?" />

        {/* Parking */}
        <div className="reveal flex items-start gap-4 p-6 bg-white rounded-2xl border border-[#e1eedd] mb-6">
          <div className="w-11 h-11 rounded-full bg-[#e1eedd] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#557a59]" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 16V8h3.5a2.5 2.5 0 010 5H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-display italic text-lg text-[#2a3d2c] mb-1">Parking privado</h3>
            <p className="text-[#3e5c41] text-sm leading-relaxed">
              El sitio cuenta con parking privado gratuito para todos los invitados que prefieran acudir en su propio coche.
            </p>
          </div>
        </div>

        {/* Bus */}
<div className="reveal reveal-delay-1 p-6 bg-white rounded-2xl border border-[#e1eedd]">
  <div className="flex items-start gap-4 mb-6">
    <div className="w-11 h-11 rounded-full bg-[#e1eedd] flex items-center justify-center shrink-0">
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#557a59]" stroke="currentColor" strokeWidth="1.5">
  <path d="M4 16V6a2 2 0 012-2h12a2 2 0 012 2v10" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M4 16a2 2 0 002 2h12a2 2 0 002-2M4 16h16" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M4 10h16" strokeLinecap="round" />
  <path d="M8 6v4M16 6v4" strokeLinecap="round" />
  <circle cx="7.5" cy="19" r="1.5" />
  <circle cx="16.5" cy="19" r="1.5" />
</svg>
    </div>
    <div>
      <h3 className="font-display italic text-lg text-[#2a3d2c] mb-1">Servicio de autobús</h3>
      <p className="text-[#3e5c41] text-sm leading-relaxed">
        Habrá un autobús desde Burgos, con dos puntos de salida. 
        </p>
        <p className="text-[#3e5c41] text-sm leading-relaxed">
        La vuelta se hará en dos turnos: a las 23:00h y a las 02:00h.
      </p>
    </div>
  </div>

  <div className="grid sm:grid-cols-2 gap-4">
    {busStops.map(({ name, address, mapsQuery, departure }) => (
      <a
      key={name}
      href={`https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-3 p-4 bg-[#f2f7f0] rounded-xl border border-[#e1eedd] hover:border-[#557a59] hover:shadow-sm transition-all duration-300"
    >
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-[#557a59] transition-transform group-hover:scale-110" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
        </svg>
        <div>
          <p className="text-[#2a3d2c] font-semibold text-sm">{name}</p>
          <p className="text-[#3e5c41] text-xs">{address}</p>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className="text-[#557a59] text-xs uppercase tracking-wider">Salida</span>
        <span className="text-[#2a3d2c] text-sm font-semibold tabular-nums">{departure}</span>
      </div>
    </a>
    ))}
  </div>
</div>

          {/* <p className="text-[#557a59] text-xs mt-5 text-center">
            Autobús de vuelta a Burgos: 11:00h y 02:00h
          </p> */}
        {/* </div> */}
      </div>
    </Section>
  )
}

// ── Two Photos Cascade ─────────────────────────────────────────
function PhotoCascade() {
  const ref = useReveal()

  return (
    <section ref={ref} className="py-5 px-5 bg-[#fdfaf5]/80 overflow-hidden">
      <div className="max-w-md sm:max-w-xl mx-auto relative">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 items-start">
          {/* Foto izquierda — más arriba */}
          <div className="reveal">
            <div className="bg-white p-2 sm:p-3 pb-6 sm:pb-8 rounded-sm shadow-2xl -rotate-3">
              <div className="aspect-[4/5] overflow-hidden bg-[#e1eedd]">
                <img
                  src={`${import.meta.env.BASE_URL}gallery/polaroid1.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Foto derecha — desplazada hacia abajo y superpuesta */}
          <div className="reveal reveal-delay-1 mt-12 sm:mt-20 -ml-4 sm:-ml-8 relative z-10">
            <div className="bg-white p-2 sm:p-3 pb-6 sm:pb-8 rounded-sm shadow-2xl rotate-3">
              <div className="aspect-[4/5] overflow-hidden bg-[#e1eedd]">
                <img
                  src={`${import.meta.env.BASE_URL}gallery/polaroid2.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Photo Upload QR ────────────────────────────────────────────
function PhotoUpload() {
  const ref = useReveal()
  const driveUrl = 'https://drive.google.com/drive/folders/17K_Hx308S66g7fxGouypoJfFtH_r95Zw'

  return (
    <Section id="album" className="bg-[#f2f7f0]/80">
      <div ref={ref} className="max-w-lg mx-auto text-center">
        <SectionTitle sub="Ayúdanos a recordarlo" title="Comparte tus fotos" />
        <p className="reveal text-[#3e5c41] text-sm leading-relaxed max-w-md mx-auto mb-8">
          Nos encantaría ver la boda a través de vuestros ojos. Pulsa el botón para guardarte el enlace y poder subir las fotos y vídeos que hagáis ese día a nuestro álbum.
        </p>

        <div className="reveal reveal-delay-2 mt-6">
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#557a59]/95 text-white px-6 py-3 rounded-full hover:bg-[#3e5c41] transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
            Abrir álbum
          </a>
        </div>
      </div>
    </Section>
  )
}

// ── Playlist Section ────────────────────────────────────────────
function PlaylistSection() {
  const ref = useReveal()
  const spotifyUrl = 'https://open.spotify.com/playlist/5YBr6pdfDy95BYI4ZrqsOP?si=ec0DeZ9tSxe5z2SyOsXGgw&utm_source=copy-link&pt=62ebb168027c18795ed8d9f15e367ba5&pi=__9p9ONwQg-kz&sci=spotify%3Acard-config%3A5ew24bTu2yCxjiwknYsL2V'

  return (
    <Section id="playlist" className="bg-[#fdfaf5]/80 relative overflow-hidden">
      {/* Notas musicales decorativas, muy sutiles */}
      <span className="absolute top-8 left-[15%] text-[#c4ddbf] text-8xl opacity-40 select-none pointer-events-none rotate-12">♪</span>
      <span className="absolute top-16 right-[15%] text-[#c4ddbf] text-7xl opacity-30 select-none pointer-events-none -rotate-12">♫</span>
      <span className="absolute bottom-10 left-[20%] text-[#c4ddbf] text-7xl opacity-30 select-none pointer-events-none rotate-6">♩</span>
      <span className="absolute bottom-16 right-[15%] text-[#c4ddbf] text-8xl opacity-40 select-none pointer-events-none -rotate-6">♬</span>
      <div ref={ref} className="relative max-w-lg mx-auto text-center">
        <SectionTitle sub="Que no falten temazos" title="Suma tu canción" />
        <p className="reveal text-[#3e5c41] text-sm leading-relaxed max-w-md mx-auto mb-2">
          Únete y añade esa canción que no puede faltar en la fiesta.
        </p>

        <svg viewBox="0 0 24 32" fill="none" className="reveal reveal-delay-1 w-5 h-7 mx-auto mb-4 text-[#557a59]" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="0" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5 16l7 10 7-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="reveal reveal-delay-2 inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#557a59] hover:bg-[#3e5c41] shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300"          aria-label="Añadir canción en Spotify"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.871 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.688-1.653-6.786-2.132-9.966-1.166a.78.78 0 11-.454-1.492c3.632-1.102 8.147-.568 11.235 1.329a.78.78 0 01.257 1.072zm.105-2.835C14.692 9.084 9.375 8.9 6.297 9.83a.936.936 0 11-.543-1.79c3.532-1.068 9.404-.861 13.115 1.331a.936.936 0 01-.955 1.596z"/>
          </svg>
        </a>
      </div>
    </Section>
  )
}

// ── Asistencia ────────────────────────────────────────────────────────
function Asistencia() {
  const ref = useReveal()
  const [form, setForm] = useState({
    name: '',
    attends: '',
    hasChildren: '',
    intolerance: '',
    intoleranceDetail: '',
    bus: '',
    busTrip: '',
    busStop: '',
    busReturn: '',
    sleepover: '',
    message: '',
    drinks: '',
    drinksOther: '',
  })
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [children, setChildren] = useState<{
    id: string
    name: string
    age: string
    hasIntolerance: string
    intolerance: string
    meal: string
    observations: string
  }[]>([])
  const [showChildModal, setShowChildModal] = useState(false)
  const [modalName, setModalName] = useState('')
  const [modalAge, setModalAge] = useState('')
  const [modalHasIntolerance, setModalHasIntolerance] = useState('')
  const [modalIntolerance, setModalIntolerance] = useState('')
  const [modalMeal, setModalMeal] = useState('')
  const [modalObservations, setModalObservations] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const scrollPosition = window.scrollY;
    const { name, value } = e.target;
    
    setForm((f) => {
      const updated = { ...f, [name]: value };

      // Limpiezas en cascada según cambios de estado
      if (name === 'hasChildren' && value === 'no') {
        setChildren([]);
      }
      if (name === 'intolerance' && value === 'no') {
        updated.intoleranceDetail = '';
      }
      if (name === 'bus') {
        if (value === 'no') {
          updated.busTrip = '';
          updated.busStop = '';
          updated.busReturn = '';
        }
      }
      if (name === 'busTrip') {
        if (value === 'ida') updated.busReturn = '';
        if (value === 'vuelta') updated.busStop = '';
      }

      return updated;
    })

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' as ScrollBehavior });
    });
  }

  const openChildModal = () => {
    setModalName('')
    setModalAge('')
    setModalHasIntolerance('')
    setModalIntolerance('')
    setModalMeal('')
    setModalObservations('')
    setShowChildModal(true)
  }

  const confirmAddChild = () => {
    if (!modalName.trim() || !modalAge.trim() || !modalHasIntolerance || !modalMeal) return
    if (modalHasIntolerance === 'yes' && !modalIntolerance.trim()) return

    setChildren((c) => [
      ...c,
      {
        id: crypto.randomUUID(),
        name: modalName.trim(),
        age: modalAge.trim(),
        hasIntolerance: modalHasIntolerance,
        intolerance: modalHasIntolerance === 'yes' ? modalIntolerance.trim() : 'Ninguna',
        meal: modalMeal,
        observations: modalObservations.trim(),
      },
    ])
    if (errors.hasChildrenList) {
      setErrors((prev) => ({ ...prev, hasChildrenList: false }));
    }
    setShowChildModal(false)
  }

  const removeChild = (id: string) => {
    setChildren((c) => c.filter((child) => child.id !== id))
  }

  const [sentStatus, setSentStatus] = useState<'success' | 'error' | null>(null)
  const handleSubmit = async (e: React.FormEvent) => {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJTXckjODg-iFhicYGx6TR8gXEsVRmce03uQkuLteHdl_fOL-rOdYSe6t9UADhKQD-WQ/exec'
    e.preventDefault()
    const newErrors: Record<string, boolean> = {}

    // 1. Validar campos obligatorios básicos
    if (!form.name.trim()) newErrors.name = true
    if (!form.attends) newErrors.attends = true

    // 2. Si asiste, validamos el flujo condicional en orden
    if (form.attends === 'yes') {
      // ¿Niños?
      if (!form.hasChildren) newErrors.hasChildren = true
      if (form.hasChildren === 'yes' && children.length === 0) {
        newErrors.hasChildrenList = true
      }

      // Intolerancias
      if (!form.intolerance) newErrors.intolerance = true
      if (form.intolerance === 'yes' && !form.intoleranceDetail.trim()) {
        newErrors.intoleranceDetail = true
      }

      // Autobús
      if (!form.bus) newErrors.bus = true
      if (form.bus === 'yes') {
        if (!form.busTrip) newErrors.busTrip = true
        if ((form.busTrip === 'ida' || form.busTrip === 'ida-vuelta') && !form.busStop) {
          newErrors.busStop = true
        }
        if ((form.busTrip === 'ida-vuelta' || form.busTrip === 'vuelta') && !form.busReturn) {
          newErrors.busReturn = true
        }
      }

      // Albergue
      if (!form.sleepover) newErrors.sleepover = true
      // Bebidas
      if (!form.drinks) newErrors.drinks = true
      if (form.drinks === 'otros' && !form.drinksOther.trim()) {
        newErrors.drinksOther = true // Valida que rellene qué bebe si marca "Otros"
      }
    }


    // 3. Bloqueo en caso de error
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setShowErrorModal(true)
      return
    }

    // 4. Envío de datos
    setErrors({})
    setSubmitting(true)

    // Mapa para traducir el ID del radio a texto limpio
    const drinksMap: Record<string, string> = {
      ron: 'Ron',
      ginebra: 'Ginebra',
      'ginebra-rosa': 'Ginebra Rosa',
      vodka: 'Vodka',
      whisky: 'Whisky',
      'vino-tinto': 'Vino Tinto',
      'vino-blanco': 'Vino Blanco',
      cerveza: 'Cerveza',
      'cerveza-0': 'Cerveza 0,0',
      calimocho: 'Calimocho',
      refrescos: 'Refrescos',
      agua: 'Agua',
      otros: 'Otros',
    }

    const formDataToSend = {
      ...form,
      drinks: drinksMap[form.drinks] || form.drinks, // Guarda "Otros", "Ginebra Rosa", etc.
      drinksOther: form.drinks === 'otros' ? form.drinksOther.trim() : '', // Texto personalizado sólo si es "otros"
      children: children,
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Necesario para evitar bloqueos CORS con Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      })

      // Éxito en el envío
      setSentStatus('success')
      document.getElementById('asistencia')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    } catch (error) {
      console.error('Error al enviar:', error)
      setSentStatus('error')
    }
    finally{
      setSubmitting(false)
    }
  }

  // Función para reiniciar el formulario por completo
  const handleResetForm = () => {
    // 1. Reseteamos el estado de envío para que vuelva a verse el <form>
    setSentStatus(null)
  
    // 2. Limpiamos los campos del formulario a su estado inicial
    setForm({
      name: '',
      attends: '',
      hasChildren: '',
      intolerance: '',
      intoleranceDetail: '',
      bus: '',
      busTrip: '',
      busStop: '',
      busReturn: '',
      sleepover: '',
      message: '',
      drinks: '',
      drinksOther: '',
    })
  
    // 3. Limpiamos la lista de niños y errores pendientes
    setChildren([])
    setErrors({})
  
    // 4. (Opcional) Volvemos a enfocar el inicio del formulario por si acaso
    document.getElementById('asistencia')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }

  const radioClass = (active: boolean) =>
    `flex items-center justify-center text-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all leading-tight ${
      active ? 'border-[#557a59] bg-[#557a59]/10 text-[#2a3d2c]' : 'border-[#c4ddbf] text-[#3e5c41] hover:border-[#557a59]'
    }`

  const inputErrorClass = (fieldName: string, baseClass: string) => {
    const hasErr = errors[fieldName];
    return `${baseClass} ${
      hasErr ? '!border-red-300 !bg-red-50/20' : ''
    }`;
  };

  return (
    <Section id="asistencia" className="bg-[#557a59]/80">
      <div ref={ref} className="max-w-xl mx-auto">
        <div className="reveal text-center mb-10">
          <p className="text-[#c4ddbf] uppercase tracking-[0.25em] text-xs mb-3">Confirmación de asistencia</p>
          <h2 className="font-display text-4xl md:text-5xl text-white font-light italic leading-tight">¿Vendrás?</h2>
          <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#c4ddbf] to-transparent mx-auto mt-5" />
          <p className="text-white/80 text-sm mt-4">Por favor confirma antes del 01/03/2027</p>
        </div>

        {sentStatus === 'success' && (
  <div className="text-center bg-white/10 backdrop-blur rounded-3xl p-8 md:p-12 border border-white/20">
    <div className="flex justify-center mb-4">
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div> 

    {/* Título fijo para todos */}
    <h3 className="font-display italic text-2xl md:text-3xl text-white mb-3">
      ¡Gracias por contestar!
    </h3>

    {/* Mensaje dinámico según si asiste o no */}
    <p className="text-[#c4ddbf] text-base mb-8">
      {form.attends === 'yes'
        ? '¡Nos vemos el 12 de junio! :)'
        : '¡Qué pena que no puedas venir! :('}
    </p>

            <button
              type="button"
              onClick={handleResetForm}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all border border-white/30 cursor-pointer"
            >
              Rellenar otro formulario
            </button>
          </div>
        )}

        {sentStatus === 'error' && (
          <div className="text-center bg-white/10 backdrop-blur rounded-3xl p-8 md:p-12 border border-red-300/30">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-red-200" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-white text-base max-w-md mx-auto leading-relaxed">
              Ha ocurrido un error al enviar el formulario. Por favor escríbenos por Whatsapp para no perdernos tu respuesta :(
            </p>
          </div>
        )}

        {sentStatus === null && (
          <form onSubmit={handleSubmit} className="animate-fadeIn bg-white rounded-3xl p-6 md:p-10 shadow-xl flex flex-col gap-5" noValidate>
          
            {/* 1. Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">Nombre completo*</label>
              <input
                name="name" value={form.name} onChange={handleChange}
                placeholder="Tu nombre y apellidos"
                className={inputErrorClass('name', "border rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2]")}
              />
            </div>

            {/* 2. Asistencia */}
            <div className="flex flex-col gap-2">
              <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Asistirás?*</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ val: 'yes', label: 'Sí, allí estaré' }, { val: 'no', label: 'No podré asistir' }].map(({ val, label }) => (
                  <label key={val} className={`${radioClass(form.attends === val)} ${errors.attends ? '!border-red-300 bg-red-50/20' : ''}`}>
                    <input type="radio" name="attends" value={val} checked={form.attends === val} onChange={handleChange} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* BLOQUE CONDICIONAL: Solo si asiste */}
            {form.attends === 'yes' && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                
                {/* 3. Niños */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Vienes con niños?*</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ val: 'yes', label: 'Sí' }, { val: 'no', label: 'No' }].map(({ val, label }) => (
                      <label key={val} className={`${radioClass(form.hasChildren === val)} ${errors.hasChildren ? '!border-red-300 bg-red-50/20' : ''}`}>
                        <input type="radio" name="hasChildren" value={val} checked={form.hasChildren === val} onChange={handleChange} className="sr-only" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sub-bloque: Añadir Niños */}
                {form.hasChildren === 'yes' && (
                  <div className={`flex flex-col gap-4 p-4 bg-[#f2f7f0] rounded-xl border animate-fadeIn transition-colors ${errors.hasChildrenList ? 'border-red-300 bg-red-50/20' : 'border-[#e1eedd]'}`}>
                    <p className="text-[#3e5c41] text-sm leading-relaxed">
                      Queremos que los peques también se lo pasen bien en este día especial; por eso habrá una zona con monitores llena de sorpresas para que jueguen y vosotros podáis relajaros.
                    </p>
                    <p className="text-[#3e5c41] text-sm leading-relaxed">
                      Para los más pequeños habrá una zona habilitada para guardar y calentar comida, cambiarles o lo que necesitéis.
                    </p>

                    {children.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-start justify-between gap-3 bg-white rounded-xl border border-[#e1eedd] px-4 py-3"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[#2a3d2c] text-sm font-medium">{child.name}</span>
                                <span className="text-[#557a59] text-xs bg-[#e1eedd] px-2 py-0.5 rounded-full">{child.age} años</span>
                              </div>
                              <p className="text-[#3e5c41] text-xs mt-1">
                                {child.meal === 'coctel' ? 'Come el cóctel' : 'Lleva su propia comida'}
                              </p>
                              <p className="text-[#3e5c41] text-xs mt-0.5">Intolerancias: {child.intolerance}</p>
                              {child.observations && (
                                <p className="text-[#3e5c41] text-xs mt-0.5">Obs: {child.observations}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeChild(child.id)}
                              className="text-[#3e5c41] hover:text-[#2a3d2c] p-1 shrink-0"
                              aria-label="Eliminar"
                            >
                              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={openChildModal}
                      className="flex items-center justify-center gap-2 border-2 border-dashed border-[#c4ddbf] hover:border-[#557a59] text-[#557a59] rounded-xl py-2.5 text-sm font-medium transition-colors cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                      Añade niñ@
                    </button>
                  </div>
                )}

                {/* 4. Intolerancias Adulto */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Tienes alguna intolerancia alimentaria/dieta especial?*</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ val: 'no', label: 'No tengo' }, { val: 'yes', label: 'Sí tengo' }].map(({ val, label }) => (
                      <label key={val} className={`${radioClass(form.intolerance === val)} ${errors.intolerance ? '!border-red-300 bg-red-50/20' : ''}`}>
                        <input type="radio" name="intolerance" value={val} checked={form.intolerance === val} onChange={handleChange} className="sr-only" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sub-bloque: Detalle Intolerancia */}
                {form.intolerance === 'yes' && (
                  <div className="flex flex-col gap-1 animate-fadeIn">
                    <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">
                      Describe tu intolerancia o dieta*
                    </label>
                    <input
                      name="intoleranceDetail"
                      value={form.intoleranceDetail}
                      onChange={handleChange}
                      placeholder="Ej: celiaquía, alergia al marisco, intolerancia a la lactosa…"
                      className={inputErrorClass(
                        'intoleranceDetail',
                        "border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2]"
                      )}
                    />
                  </div>
                )}

                {/* 5. Autobús */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Cogerás el autobús?*</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ val: 'no', label: 'No, iré por mi cuenta' }, { val: 'yes', label: 'Sí' }].map(({ val, label }) => (
                      <label key={val} className={`${radioClass(form.bus === val)} ${errors.bus ? '!border-red-300 bg-red-50/20' : ''}`}>
                        <input type="radio" name="bus" value={val} checked={form.bus === val} onChange={handleChange} className="sr-only" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sub-bloque: Trayectos y paradas */}
                {form.bus === 'yes' && (
                  <div className="flex flex-col gap-5 animate-fadeIn">
                    <div className="flex flex-col gap-2">
                      <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Qué trayecto necesitas?*</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'ida', label: 'Solo ida' },
                          { val: 'ida-vuelta', label: 'Ida y vuelta' },
                          { val: 'vuelta', label: 'Solo vuelta' },
                        ].map(({ val, label }) => (
                          <label key={val} className={`${radioClass(form.busTrip === val)} ${errors.busTrip ? '!border-red-300 bg-red-50/20' : ''}`}>
                            <input type="radio" name="busTrip" value={val} checked={form.busTrip === val} onChange={handleChange} className="sr-only" />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {(form.busTrip === 'ida' || form.busTrip === 'ida-vuelta') && (
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Desde qué parada cogerás el bus de ida?*</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { val: 'centro', label: 'Centro 11:30h' },
                            { val: 'gamonal', label: 'Gamonal 11:45h' },
                          ].map(({ val, label }) => (
                            <label key={val} className={`${radioClass(form.busStop === val)} ${errors.busStop ? '!border-red-300 bg-red-50/20' : ''}`}>
                              <input type="radio" name="busStop" value={val} checked={form.busStop === val} onChange={handleChange} className="sr-only" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {(form.busTrip === 'ida-vuelta' || form.busTrip === 'vuelta') && (
                      <div className="flex flex-col gap-2 animate-fadeIn">
                        <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿A qué hora volverás?*</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { val: '23:00', label: '23:00h' },
                            { val: '02:00', label: '02:00h' },
                          ].map(({ val, label }) => (
                            <label key={val} className={`${radioClass(form.busReturn === val)} ${errors.busReturn ? '!border-red-300 bg-red-50/20' : ''}`}>
                              <input type="radio" name="busReturn" value={val} checked={form.busReturn === val} onChange={handleChange} className="sr-only" />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Albergue */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Te quedarás a dormir en el albergue?*</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ val: 'yes', label: 'Sí' }, { val: 'no', label: 'No' }].map(({ val, label }) => (
                      <label key={val} className={`${radioClass(form.sleepover === val)} ${errors.sleepover ? '!border-red-300 bg-red-50/20' : ''}`}>
                        <input type="radio" name="sleepover" value={val} checked={form.sleepover === val} onChange={handleChange} className="sr-only" />
                        {label}
                      </label>
                    ))}
                  </div>
                  
                  {form.sleepover === 'yes' && (
                    <div className="mt-2 p-4 bg-[#f2f7f0] border border-[#e1eedd] rounded-xl text-[#3e5c41] text-xs leading-relaxed flex flex-col gap-2 animate-fadeIn">
                      <p>
                        Recuerda que se trata de un albergue con habitaciones y baños compartidos (intentaremos que estéis lo más cómodos posibles).
                      </p>
                      <p className="font-semibold">
                        El alojamiento tiene un coste de 5€/persona.
                      </p>
                      <p>
                        Para terminar de confirmar la cama escríbenos a cualquiera de los dos :)
                      </p>
                    </div>
                  )}
                </div>
                {/* Campo de Bebidas (Solo si asiste) */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">
                    ¿Qué vas a beber en la fiesta?*
                  </label>

                  <div className="p-4 bg-[#f2f7f0] border border-[#e1eedd] rounded-xl text-[#3e5c41] text-xs leading-relaxed">
                    <p>
                      Queremos asegurarnos que a nadie se le corte el rollo en mitad de la fiesta, por eso necesitamos calcular la bebida que debe haber.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { val: 'ron', label: 'Ron' },
                      { val: 'ginebra', label: 'Ginebra' },
                      { val: 'ginebra-rosa', label: 'Ginebra Rosa' },
                      { val: 'vodka', label: 'Vodka' },
                      { val: 'whisky', label: 'Whisky' },
                      { val: 'vino-blanco', label: 'Vino Blanco' },
                      { val: 'vino-tino', label: 'Vino Tinto' },
                      { val: 'cerveza', label: 'Cerveza' },
                      { val: 'cerveza-0', label: 'Cerveza 0,0' },
                      { val: 'calimocho', label: 'Calimocho' },
                      { val: 'refrescos', label: 'Refrescos' },
                      { val: 'agua', label: 'Agua' },
                      { val: 'otros', label: 'Otros' },
                    ].map(({ val, label }) => {
                      const isOtros = val === 'otros';
                  
                      return (
                        <label
                          key={val}
                          className={`${radioClass(form.drinks === val)} ${
                            // Si es 'otros', ocupa toda la fila restante y se centra
                            isOtros ? 'col-span-full justify-self-center max-w-xs w-full text-center' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="drinks"
                            value={val}
                            checked={form.drinks === val}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>

                  {form.drinks === 'otros' && (
                    <input
                      name="drinksOther"
                      value={form.drinksOther}
                      onChange={handleChange}
                      placeholder="¿Qué te gustaría beber?"
                      required
                      className={inputErrorClass(
                        'drinksOther',
                        "border rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2]"
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {/* 7. Mensaje opcional (siempre visible) */}
            <div className="flex flex-col gap-1">
              <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">Mensaje para los novios</label>
              <textarea
                name="message" value={form.message} onChange={handleChange} rows={3}
                placeholder="Si te apetece decirnos algo..."
                className="border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2] resize-none"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full bg-[#557a59]/95 text-white py-4 rounded-xl font-semibold hover:bg-[#3e5c41] transition-colors disabled:opacity-60 text-sm uppercase tracking-wider cursor-pointer"
              style={{ cursor: submitting ? 'wait' : 'pointer' }}
            >
              {submitting ? 'Enviando...' : 'Confirmar asistencia'}
            </button>
            </form>
        )}
      </div>

      {/* Modal para añadir niños */}
      {showChildModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center px-5"
          onClick={() => setShowChildModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display italic text-xl text-[#2a3d2c] mb-4 text-center">Añadir niño/a</h3>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">Nombre*</label>
                <input
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="Nombre del niño/a"
                  autoFocus
                  className="border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">Edad*</label>
                <input
                  value={modalAge}
                  onChange={(e) => setModalAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="Edad"
                  inputMode="numeric"
                  className="border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Tiene alguna intolerancia o dieta especial? *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ val: 'no', label: 'No' }, { val: 'yes', label: 'Sí' }].map(({ val, label }) => (
                    <label
                      key={val}
                      className={`flex items-center justify-center text-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all leading-tight ${
                        modalHasIntolerance === val ? 'border-[#557a59] bg-[#557a59]/10 text-[#2a3d2c]' : 'border-[#c4ddbf] text-[#3e5c41] hover:border-[#557a59]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modalHasIntolerance"
                        value={val}
                        checked={modalHasIntolerance === val}
                        onChange={(e) => {
                          const scrollPos = window.scrollY;
                          setModalHasIntolerance(e.target.value)
                          if (e.target.value === 'no') setModalIntolerance('')
                          requestAnimationFrame(() => {
                            window.scrollTo({ top: scrollPos, behavior: 'instant' as ScrollBehavior });
                          });
                        }}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {modalHasIntolerance === 'yes' && (
                <div className="flex flex-col gap-1 animate-fadeIn">
                  <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">Describe su intolerancia o dieta*</label>
                  <input
                    value={modalIntolerance}
                    onChange={(e) => setModalIntolerance(e.target.value)}
                    placeholder="Ej: celiaquía, lactosa…"
                    className="border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Qué va a comer?*</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'coctel', label: 'Cóctel' },
                    { val: 'propia', label: 'Lleva su comida' },
                  ].map(({ val, label }) => (
                    <label
                      key={val}
                      className={`flex items-center justify-center text-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all leading-tight ${
                        modalMeal === val ? 'border-[#557a59] bg-[#557a59]/10 text-[#2a3d2c]' : 'border-[#c4ddbf] text-[#3e5c41] hover:border-[#557a59]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="modalMeal"
                        value={val}
                        checked={modalMeal === val}
                        onChange={(e) => setModalMeal(e.target.value)}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">Observaciones</label>
                <textarea
                  value={modalObservations}
                  onChange={(e) => setModalObservations(e.target.value)}
                  rows={2}
                  placeholder="Necesidades especiales, trona, etc."
                  className="border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowChildModal(false)}
                className="flex-1 border border-[#c4ddbf] text-[#3e5c41] rounded-xl py-2.5 text-sm font-medium hover:bg-[#f2f7f0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmAddChild}
                disabled={!modalName.trim() || !modalAge.trim() || !modalHasIntolerance || !modalMeal || (modalHasIntolerance === 'yes' && !modalIntolerance.trim())}
                className="flex-1 bg-[#557a59] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#3e5c41] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ cursor: modalName.trim() && modalAge.trim() && modalHasIntolerance && modalMeal && (modalHasIntolerance !== 'yes' || modalIntolerance.trim()) ? 'pointer' : 'not-allowed' }}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error */}
      {showErrorModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowErrorModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border border-red-100 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-display italic text-2xl text-[#2a3d2c] mb-2 font-normal">¡Faltan datos!</h3>
            <p className="text-[#3e5c41] text-sm mb-7 leading-relaxed">
              Por favor, revisa el formulario. Hay campos obligatorios importantes sin rellenar que se han marcado en rojo.
            </p>
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-[#557a59] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#3e5c41] transition-all shadow-md shadow-[#557a59]/20 cursor-pointer"
            >
              Entendido, voy a revisarlo
            </button>
          </div>
        </div>
      )}
    </Section>
  )
}

/// ── Contact ─────────────────────────────────────────────────────
function Contact() {
  const ref = useReveal()
  const contacts = [
    { name: 'Clara', phone: '678 35 88 26' },
    { name: 'Andrés', phone: '645 95 32 75' },
  ]

  const toWhatsApp = (phone: string) => `https://wa.me/34${phone.replace(/\s/g, '')}`

  return (
    <Section id="contacto" className="bg-[#fdfaf5]/80">
      <div ref={ref} className="max-w-xl mx-auto text-center">
        <SectionTitle sub="Por si tienes dudas" title="Escríbenos" />
        <p className="reveal text-[#3e5c41] text-sm leading-relaxed max-w-md mx-auto mb-10">
          Si tienes cualquier duda sobre el evento, transporte, alojamiento o cualquier otra cosa no dudes en escribirnos.
        </p>
        <div className="reveal reveal-delay-1 flex flex-col gap-4 max-w-sm mx-auto">
          {contacts.map((contact) => {
            const name = contact.name
            const phone = contact.phone
            return (
              <a
                key={name}
                href={toWhatsApp(phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#e1eedd] hover:border-[#557a59] hover:shadow-md transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-full bg-[#e1eedd] flex items-center justify-center shrink-0 group-hover:bg-[#557a59]/95 transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#557a59] group-hover:text-white transition-colors">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2m0 1.67c2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 012.41 5.82c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 01-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23m-4.52 4.7c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.7 2.72 4.2 3.7 2.08.82 2.5.66 2.95.62.45-.04 1.46-.6 1.66-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.24-.64.8-.78.97-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.29.36-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43-.14-.01-.3-.01-.46-.01z" />
                  </svg>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="font-display italic text-lg text-[#2a3d2c]">{name}</p> -
                  <span className="text-[#557a59] group-hover:text-[#3e5c41] text-sm font-medium transition-colors">
                    {phone}
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

// ── Footer ──────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#2a3d2c] text-center py-12 px-5">
      <LeafLeft className="inline-block w-8 opacity-30" />
      <span className="mx-3 font-display italic text-[#557a59] text-2xl">Clara &amp; Andrés</span>
      <LeafRight className="inline-block w-8 opacity-30" />
        <p className="text-[#9dc49a] text-xs mt-4 tracking-widest uppercase">12 · 06 · 2027</p>
      <p className="text-[#c4ddbf] text-xs mt-6">Con todo nuestro amor ♥</p>
    </footer>
  )
}
// ── Nav ─────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#', label: 'Inicio' },
    { href: '#info', label: 'Info' },
    { href: '#historia', label: 'Nuestra Historia' },
    { href: '#lugar', label: 'Lugar' },
    { href: '#como-llegar', label: '¿Como llegar?' },
    { href: '#album', label: 'Álbum' }, 
    { href: '#playlist', label: 'Playlist' },
    { href: '#asistencia', label: 'Asistencia' },
    { href: '#contacto', label: 'Contacto' },
  ]

  return (
    <>
     <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 ${scrolled ? 'bg-white/10 backdrop-blur-md py-3' : 'py-5'}`}>
  <div className="max-w-5xl mx-auto px-5 flex items-center justify-end relative z-10">
 <div className="hidden md:flex items-center gap-7">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-[#557a59] hover:text-[#2a3d2c] text-sm font-medium transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-[#557a59] p-1"
            aria-label="Menú"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
              {open
                ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>

        {/* Degradado de desenfoque — sin color, solo transición de blur a nítido */}
        {scrolled && (
  <div className="absolute top-full left-0 right-0 h-32 pointer-events-none">
    <div className="absolute inset-x-0 top-0 h-4" style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }} />
    <div className="absolute inset-x-0 top-4 h-4" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} />
    <div className="absolute inset-x-0 top-8 h-4" style={{ backdropFilter: 'blur(7px)', WebkitBackdropFilter: 'blur(7px)' }} />
    <div className="absolute inset-x-0 top-12 h-4" style={{ backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }} />
    <div className="absolute inset-x-0 top-16 h-4" style={{ backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }} />
    <div className="absolute inset-x-0 top-20 h-4" style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} />
    <div className="absolute inset-x-0 top-24 h-4" style={{ backdropFilter: 'blur(1px)', WebkitBackdropFilter: 'blur(1px)' }} />
    <div className="absolute inset-x-0 top-28 h-4" style={{ backdropFilter: 'blur(0.5px)', WebkitBackdropFilter: 'blur(0.5px)' }} />
  </div>
)}
      </nav>

      {/* Overlay y panel del menú móvil — fuera del <nav> para evitar el bug de backdrop-filter con position:fixed */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`md:hidden fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white z-[60] shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e1eedd]">
          <span className="font-display italic text-[#2a3d2c] text-lg">Menú</span>
          <button
            onClick={() => setOpen(false)}
            className="text-[#557a59] p-1"
            aria-label="Cerrar menú"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col px-6 py-4">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-[#2a3d2c] text-base font-medium py-4 border-b border-[#f2f7f0] flex items-center justify-between group"
            >
              {label}
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#8aad87] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Contour line decorative layer ──────────────────────────────
function ContourLayer({ top, rotate = 0, flipX = false, flipY = false, opacity = 0.5, size = '500%' }: {
  top: string
  rotate?: number
  flipX?: boolean
  flipY?: boolean
  opacity?: number
  size?: string
}) {
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none md:!bg-[length:75%]"
      style={{
        top,
        height: '900px',
        backgroundImage: `url(${import.meta.env.BASE_URL}gallery/curvas.png)`,
        backgroundSize: size,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity,
        mixBlendMode: 'multiply',
        transform: `rotate(${rotate}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
      }}
    />
  )
}

// ── App ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen bg-[#f2f7f0] relative overflow-hidden">
      <ContourLayer top="0%" rotate={0} />
      <ContourLayer top="12%" rotate={0} flipX />
      <ContourLayer top="24%" rotate={0} flipY />
      <ContourLayer top="36%" rotate={0} />
      <ContourLayer top="48%" rotate={0} flipX flipY />
      <ContourLayer top="59%" rotate={0} />
      <ContourLayer top="72%" rotate={0} flipX />
      <ContourLayer top="82%" rotate={0} flipY />

      <div className="relative">
        <Nav />
        <Hero />
        <Countdown />
        <PhotoCarousel />
        <WeddingInfo />
        <OurStory />
        <ParallaxPhoto />
        <Venue />
        <HowToArrive />
        <PhotoCascade />
        <PhotoUpload />
        <PlaylistSection />
        <Asistencia />
        <Contact />
        <Footer />
        <MusicPlayer />
      </div>
    </div>
  )
}