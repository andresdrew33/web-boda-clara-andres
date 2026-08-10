import { useState, useEffect, useRef, useCallback } from 'react'

const WEDDING_DATE = new Date('2027-06-12T06:12:30')

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
    <section id={id} ref={ref} className={`py-20 px-5 ${className}`}>
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

        {/* Notas musicales flotando alrededor cuando suena */}
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
  <div className="mt-36 sm:mt-0">
  <FloralDivider />
  <p className="mt-8 text-[#3e5c41] tracking-widest text-base font-medium uppercase">12 · Junio · 2027</p>
  <p className="text-[#557a59] text-base mt-1">Poza de la Sal, Burgos</p>
</div>
</div>

    <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 px-4">
  <p className="text-[#557a59] text-xs uppercase tracking-wide whitespace-nowrap">Desliza para enterarte</p>
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
    <section ref={ref} className="py-16 px-5 bg-[#557a59]">
      <div className="max-w-3xl mx-auto text-center">
        <p className="reveal text-white/90 uppercase tracking-[0.3em] text-xs mb-8">Faltan tan solo</p>
        <div className="reveal reveal-delay-1 grid grid-cols-4 gap-3 md:gap-6">
          {units.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur rounded-2xl px-2 py-4 md:px-6 md:py-6 w-full border border-white/10">
                <span className="font-display text-4xl md:text-6xl text-white font-light tabular-nums">
                  {String(value).padStart(2, '0')}
                </span>
              </div>
              <p className="text-white/90 text-xs uppercase tracking-widest mt-2">{label}</p>
            </div>
          ))}
        </div>
        <p className="reveal reveal-delay-2 text-white/70 text-xs mt-8">12 de Junio de 2027 · 12:30h</p>
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
    <section ref={sectionRef} className="py-16 bg-[#f2f7f0]">
      <div className="text-center mb-10 px-5 reveal">
        <p className="text-[#557a59] uppercase tracking-[0.25em] text-xs font-semibold mb-3">Momentos juntos</p>
        <h2 className="font-display text-4xl md:text-5xl text-[#2a3d2c] font-light italic leading-tight">Nuestra galería</h2>
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
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.3">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
      title: 'Fecha',
      lines: ['Sábado, 12 de Junio de 2027'],
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.3">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" />
        </svg>
      ),
      title: 'Horario',
      lines: ['Ceremonia: 13:00h', 'Cóctel: 14:30h', 'Fiesta hasta las 02:00h'],
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.3">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
      title: 'Lugar',
      lines: ['Finca Las Rosas', 'Ctra. de Utrera km 12', 'Poza de la Sal, Burgos'],
    },
  ]

  return (
    <Section id="info" className="bg-[#fdfaf5]">
      <div className="max-w-3xl mx-auto">
        <SectionTitle sub="Detalles del día" title="Todo lo que necesitas saber"/>
        <p className="reveal text-center text-[#3e5c41] text-sm leading-relaxed max-w-lg mx-auto mb-10">
          Aquí tienes toda la información para que no se te escape ningún detalle de nuestro gran día.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {details.map(({ icon, title, lines }, i) => (
            <div
              key={title}
              className={`reveal reveal-delay-${i + 1} text-center p-6 bg-white rounded-2xl border border-[#e1eedd] hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="flex justify-center mb-4 text-[#557a59]">{icon}</div>
              <h3 className="font-display italic text-lg text-[#2a3d2c] mb-3">{title}</h3>
              {lines.map((l) => (
                <p key={l} className="text-[#3e5c41] text-sm leading-relaxed">{l}</p>
              ))}
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
    <Section id="historia" className="bg-[#f2f7f0]">
      <div ref={ref} className="max-w-3xl mx-auto flex flex-col items-center">
        <SectionTitle sub="Cómo hemos llegado hasta aquí" title="Nuestra historia" />

        <div className="reveal w-full bg-white border border-[#e1eedd] rounded-2xl px-8 py-10 text-center shadow-sm">
          <span className="font-display italic text-[#557a59] text-5xl leading-none select-none">"</span>
          <p className="font-display italic text-[#2a3d2c] text-xl md:text-2xl leading-relaxed mt-1">
            Nos encontramos por casualidad, nos elegimos por amor, y hoy os invitamos a celebrar con nosotros el día en que lo hacemos para siempre.
          </p>
          <FloralDivider />
          <p className="text-[#3e5c41] text-sm leading-relaxed mt-2">
            Desde aquella tarde en que nuestros caminos se cruzaron, cada día ha sido una razón más para querernos. Gracias por ser parte de nuestra historia.
          </p>
          <p className="text-[#557a59] text-xs mt-5 tracking-widest uppercase">Clara &amp; Andrés</p>
        </div>

        <div className="reveal reveal-delay-1 flex flex-col items-center gap-2 mt-8 mb-3 text-[#557a59] animate-bounce">
          <p className="text-xs uppercase tracking-[0.2em] font-medium">♥ Un pedacito de nuestra aventura ♥</p>
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
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const progress = -rect.top / (rect.height + window.innerHeight)
      const img = el.querySelector('img') as HTMLImageElement | null
      if (img) img.style.transform = `translateY(${progress * 80}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={ref} className="relative w-full h-[35vh] md:h-[70vh] overflow-hidden bg-[#c4ddbf]">
      <img
        src="https://images.unsplash.com/photo-1722805740177-04256b6517f2?w=1600&h=1000&fit=crop&auto=format"
        alt="Clara y Andrés"
        className="w-full h-[calc(100%+80px)] object-cover object-top will-change-transform"
        style={{ marginTop: '-40px' }}
        loading="lazy"
      />
    </div>
  )
}

// ── Venue ───────────────────────────────────────────────────────
function Venue() {
  const ref = useReveal()
  return (
    <Section id="lugar" className="bg-[#fdfaf5]">
      <div ref={ref} className="max-w-5xl mx-auto">
        <SectionTitle sub="Dónde nos casamos" title="El lugar" />
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="reveal reveal-delay-1 rounded-3xl overflow-hidden shadow-lg bg-[#c4ddbf] aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1624067056935-593eb6595294?w=900&h=700&fit=crop&auto=format"
              alt="Finca Las Rosas"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="reveal reveal-delay-2 flex flex-col gap-6">
            <div>
              <h3 className="font-display text-3xl text-[#2a3d2c] mb-2">Finca Las Rosas</h3>
              <p className="text-[#3e5c41] leading-relaxed">
                Un paraíso verde en las afueras de Poza de la Sal. Jardines centenarios, una capilla de piedra y una terraza con vistas a los campos andaluces serán el escenario de nuestro día más especial.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#e1eedd]">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mt-0.5 shrink-0 text-[#557a59]" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
              </svg>
              <div>
                <p className="text-[#2a3d2c] font-semibold text-sm">Dirección</p>
                <p className="text-[#3e5c41] text-sm">Ctra. de Utrera km 12, Poza de la Sal</p>
              </div>
            </div>

            
             <a href="https://maps.google.com/?q=Poza de la Sal+Espana"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 bg-[#557a59] text-white px-6 py-3 rounded-full hover:bg-[#3e5c41] transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md w-fit mx-auto"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform group-hover:scale-110" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
                </svg>
                Ver en Google Maps
              </a>

            <div className="flex items-start gap-3 p-4 bg-[#f2f7f0] rounded-xl border border-[#e1eedd]">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 mt-0.5 shrink-0 text-[#557a59]" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 21v-7a2 2 0 012-2h12a2 2 0 012 2v7M4 21h16M9 12V7a3 3 0 016 0v5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-[#2a3d2c] font-semibold text-sm">¿Dónde dormir?</p>
                <p className="text-[#3e5c41] text-sm leading-relaxed mt-1">
                  Para quien no quiera volver a Burgos esa noche, tenemos reservado un albergue cerca de la finca. Ten en cuenta que las camas y los baños son compartidos — un plan sencillo y económico para seguir la fiesta hasta tarde.
                </p>
              </div>
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
      address: 'Plaza Mayor, Burgos',
      mapsQuery: 'Plaza Mayor, Burgos, España',
      departure: '11:00h',
    },
    {
      name: 'Parada Estación',
      address: 'Estación de Autobuses, Burgos',
      mapsQuery: 'Estación de Autobuses, Burgos, España',
      departure: '11:15h',
    },
  ]

  return (
    <Section id="como-llegar" className="bg-[#f2f7f0]">
      <div ref={ref} className="max-w-3xl mx-auto">
        <SectionTitle sub="Para que no falte de nada" title="¿Cómo llegar?" />

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
              La finca cuenta con parking privado gratuito para todos los invitados que prefieran acudir en su propio coche.
            </p>
          </div>
        </div>

        {/* Bus */}
        <div className="reveal reveal-delay-1 p-6 bg-white rounded-2xl border border-[#e1eedd]">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-11 h-11 rounded-full bg-[#e1eedd] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#557a59]" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="12" rx="2" />
                <path d="M3 11h18M7 17v2M17 17v2" strokeLinecap="round" />
                <circle cx="7.5" cy="14" r="0.5" fill="currentColor" />
                <circle cx="16.5" cy="14" r="0.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h3 className="font-display italic text-lg text-[#2a3d2c] mb-1">Servicio de autobús</h3>
              <p className="text-[#3e5c41] text-sm leading-relaxed">
                Ponemos a disposición un autobús gratuito desde Burgos, con dos puntos de salida. La vuelta se hará en dos turnos: a las 11:00h y a las 02:00h.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {busStops.map(({ name, address, mapsQuery, departure }) => (
              <div
                key={name}
                className="flex flex-col items-center text-center gap-2 p-5 bg-[#f2f7f0] rounded-2xl border border-[#e1eedd] hover:border-[#557a59] hover:shadow-sm transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-[#557a59]" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <p className="text-[#2a3d2c] font-semibold text-sm">{name}</p>
                <p className="text-[#3e5c41] text-xs">{address}</p>
                <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-[#e1eedd] mt-1">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-[#557a59]" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" />
                  </svg>
                  <span className="text-[#557a59] text-xs font-semibold uppercase tracking-wider">{departure}</span>
                </div>
                
                 <a href={`https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#557a59] hover:text-[#3e5c41] text-xs font-medium mt-2 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
                  </svg>
                  Ver en Google Maps
                </a>
              </div>
            ))}
          </div>

          <p className="text-[#557a59] text-xs mt-5 text-center">
            Autobús de vuelta a Burgos: 11:00h y 02:00h
          </p>
        </div>
      </div>
    </Section>
  )
}

// ── Two Photos Cascade ─────────────────────────────────────────
function PhotoCascade() {
  const ref = useReveal()

  return (
    <section ref={ref} className="py-5 px-5 bg-[#fdfaf5] overflow-hidden">
      <div className="max-w-md sm:max-w-xl mx-auto relative">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 items-start">
          {/* Foto izquierda — más arriba */}
          <div className="reveal">
            <div className="bg-white p-2 sm:p-3 pb-6 sm:pb-8 rounded-sm shadow-2xl -rotate-3">
              <div className="aspect-[4/5] overflow-hidden bg-[#e1eedd]">
                <img
                  src={`${import.meta.env.BASE_URL}gallery/foto1.jpg`}
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
                  src={`${import.meta.env.BASE_URL}gallery/foto2.jpg`}
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

// ── Asistencia ────────────────────────────────────────────────────────
function Asistencia() {
  const ref = useReveal()
  const [form, setForm] = useState({
    name: '',
    email: '',
    attends: '',
    sleepover: '',
    bus: '',
    busTrip: '',
    busReturn: '',
    intolerance: '',
    intoleranceDetail: '',
    message: '',
  })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSent(true)
    }, 1200)
  }

  const radioClass = (active: boolean) =>
    `flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${
      active ? 'border-[#557a59] bg-[#557a59]/10 text-[#2a3d2c]' : 'border-[#c4ddbf] text-[#3e5c41] hover:border-[#557a59]'
    }`

  return (
    <Section id="asistencia" className="bg-[#557a59]">
      <div ref={ref} className="max-w-xl mx-auto">
        <div className="reveal text-center mb-10">
          <p className="text-[#c4ddbf] uppercase tracking-[0.25em] text-xs mb-3">Confirmación de asistencia</p>
          <h2 className="font-display text-4xl md:text-5xl text-white font-light italic leading-tight">¿Vendrás?</h2>
          <div className="w-14 h-px bg-gradient-to-r from-transparent via-[#c4ddbf] to-transparent mx-auto mt-5" />
          <p className="text-white/80 text-sm mt-4">Por favor confirma antes del X de XXX de 2027</p>
        </div>

        {sent ? (
          <div className="reveal text-center bg-white/10 backdrop-blur rounded-3xl p-12 border border-white/20">
            <div className="text-5xl mb-4">🌿</div>
            <h3 className="font-display italic text-2xl text-white mb-3">
              ¡Gracias, {form.name.split(' ')[0] || 'querido invitado'}!
            </h3>
            <p className="text-[#c4ddbf]">Hemos recibido tu confirmación. ¡Nos vemos el 12 de Junio!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reveal reveal-delay-1 bg-white rounded-3xl p-8 md:p-10 shadow-xl flex flex-col gap-5">

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">Nombre completo *</label>
              <input
                name="name" value={form.name} onChange={handleChange} required
                placeholder="Tu nombre y apellidos"
                className="border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">Email *</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="tu@email.com"
                className="border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2]"
              />
            </div>

            {/* Asistencia */}
            <div className="flex flex-col gap-2">
              <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Asistirás? *</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ val: 'yes', label: '🥂 Sí, allí estaré' }, { val: 'no', label: '😔 No podré asistir' }].map(({ val, label }) => (
                  <label key={val} className={radioClass(form.attends === val)}>
                    <input type="radio" name="attends" value={val} checked={form.attends === val} onChange={handleChange} className="sr-only" required />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {form.attends === 'yes' && (
              <>
                {/* Dormir en el albergue */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Te quedarás a dormir en el albergue? *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ val: 'yes', label: '🛏️ Sí' }, { val: 'no', label: '🏠 No' }].map(({ val, label }) => (
                      <label key={val} className={radioClass(form.sleepover === val)}>
                        <input type="radio" name="sleepover" value={val} checked={form.sleepover === val} onChange={handleChange} className="sr-only" required />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Autobús */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Cogerás el autobús? *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ val: 'no', label: '🚗 No, iré por mi cuenta' }, { val: 'yes', label: '🚌 Sí' }].map(({ val, label }) => (
                      <label key={val} className={radioClass(form.bus === val)}>
                        <input type="radio" name="bus" value={val} checked={form.bus === val} onChange={handleChange} className="sr-only" required />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tipo de trayecto — solo si coge el bus */}
                {form.bus === 'yes' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Qué trayecto necesitas? *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'ida', label: 'Solo ida' },
                        { val: 'ida-vuelta', label: 'Ida y vuelta' },
                        { val: 'vuelta', label: 'Solo vuelta' },
                      ].map(({ val, label }) => (
                        <label key={val} className={radioClass(form.busTrip === val)}>
                          <input type="radio" name="busTrip" value={val} checked={form.busTrip === val} onChange={handleChange} className="sr-only" required />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Horario de vuelta — solo si necesita trayecto de vuelta */}
                {(form.busTrip === 'ida-vuelta' || form.busTrip === 'vuelta') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿A qué hora volverás? *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: '11:00', label: '11:00h' },
                        { val: '02:00', label: '02:00h' },
                      ].map(({ val, label }) => (
                        <label key={val} className={radioClass(form.busReturn === val)}>
                          <input type="radio" name="busReturn" value={val} checked={form.busReturn === val} onChange={handleChange} className="sr-only" required />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intolerancia alimentaria */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">¿Tienes alguna intolerancia alimentaria o dieta especial? *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ val: 'no', label: '✅ No tengo' }, { val: 'yes', label: '⚠️ Sí tengo' }].map(({ val, label }) => (
                      <label key={val} className={radioClass(form.intolerance === val)}>
                        <input type="radio" name="intolerance" value={val} checked={form.intolerance === val} onChange={handleChange} className="sr-only" required />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Detalle intolerancia — aparece solo si "Sí" */}
                {form.intolerance === 'yes' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">
                      Describe tu intolerancia o alergia *
                    </label>
                    <input
                      name="intoleranceDetail"
                      value={form.intoleranceDetail}
                      onChange={handleChange}
                      required
                      placeholder="Ej: celiaquía, alergia al marisco, intolerancia a la lactosa…"
                      className="border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2]"
                    />
                  </div>
                )}
              </>
            )}

            {/* Mensaje */}
            <div className="flex flex-col gap-1">
              <label className="text-[#3e5c41] text-xs font-semibold uppercase tracking-wider">Mensaje para los novios (opcional)</label>
              <textarea
                name="message" value={form.message} onChange={handleChange} rows={3}
                placeholder="Escríbenos algo bonito..."
                className="border border-[#c4ddbf] rounded-xl px-4 py-3 text-[#2a3d2c] text-sm focus:outline-none focus:border-[#557a59] focus:ring-1 focus:ring-[#557a59] transition placeholder:text-[#b0c9b2] resize-none"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full bg-[#557a59] text-white py-4 rounded-xl font-semibold hover:bg-[#3e5c41] transition-colors disabled:opacity-60 text-sm uppercase tracking-wider"
              style={{ cursor: submitting ? 'wait' : 'pointer' }}
            >
              {submitting ? 'Enviando...' : 'Confirmar asistencia'}
            </button>
          </form>
        )}
      </div>
    </Section>
  )
}

// ── Contact ─────────────────────────────────────────────────────
function Contact() {
  const ref = useReveal()
  const contacts = [
    { name: 'Andrés', phone: '600 000 000' },
    { name: 'Clara', phone: '600 000 001' },
  ]

  const toWhatsApp = (phone: string) => `https://wa.me/34${phone.replace(/\s/g, '')}`

  return (
    <Section id="contacto" className="bg-[#fdfaf5]">
      <div ref={ref} className="max-w-xl mx-auto text-center">
        <SectionTitle sub="Estamos para ayudar" title="Por si tienes dudas" />
        <p className="reveal text-[#3e5c41] text-sm leading-relaxed max-w-md mx-auto mb-10">
          Si tienes cualquier duda sobre el evento, el transporte o el alojamiento, no dudes en escribirnos.
        </p>
        <div className="reveal reveal-delay-1 grid sm:grid-cols-2 gap-6">
          {contacts.map((contact) => {
            const name = contact.name
            const phone = contact.phone
            return (
              
               <a key={name}
                href={toWhatsApp(phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 p-6 bg-white rounded-2xl border border-[#e1eedd] hover:border-[#557a59] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-full bg-[#e1eedd] flex items-center justify-center mb-1 group-hover:bg-[#557a59] transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#557a59] group-hover:text-white transition-colors">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2m0 1.67c2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 012.41 5.82c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 01-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23m-4.52 4.7c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.7 2.72 4.2 3.7 2.08.82 2.5.66 2.95.62.45-.04 1.46-.6 1.66-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.24-.64.8-.78.97-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.29.36-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43-.14-.01-.3-.01-.46-.01z" />
                  </svg>
                </div>
                <p className="font-display italic text-lg text-[#2a3d2c]">{name}</p>
                <span className="text-[#557a59] group-hover:text-[#3e5c41] text-sm font-medium transition-colors">
                  {phone}
                </span>
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
        <p className="text-[#9dc49a] text-xs mt-4 tracking-widest uppercase">XII · XI · MMXXVII</p>
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
    { href: '#historia', label: 'Historia' },
    { href: '#lugar', label: 'Lugar' },
    { href: '#como-llegar', label: '¿Como llegar?' },
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
// ── App ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-[100svh] min-h-[100dvh] bg-[#f2f7f0]">
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
      <Asistencia />
      <Contact />
      <Footer />
      <MusicPlayer />
    </div>
  )
}
