import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  FileText,
  Send,
  MapPin,
  Phone,
  Globe,
  MessageCircle,
  Mail,
  Users,
  Building2,
  Landmark,
  Eye,
  TrendingUp,
  ShieldCheck,
  Layers,
  Check,
  X,
  ArrowRight,
  DollarSign,
  Handshake,
  FlaskConical,
  ChevronDown,
} from 'lucide-react'

const ck = {
  green: '#2A9D8F',
  darkGreen: '#1C7268',
  red: '#D1495B',
  yellow: '#EDAE49',
  orange: '#DA6F1D',
  lightGreen: '#9DCBBA',
  blue: '#3A78AC',
  darkBlue: '#30638E',
  brightBlue: '#2563EB',
  bg: '#F9FAFB',
  dark: '#111827',
  darkGray: '#6B7280',
  medGray: '#9CA3AF',
  lightGray: '#E5E7EB',
  surface: '#FFFFFF',
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: 'CivicKit - Making public works public facing' },
      {
        name: 'description',
        content:
          'Report civic issues in under 10 seconds. One shared map. Full transparency. Built for St. Louis, scalable to every city.',
      },
      {
        property: 'og:title',
        content: 'CivicKit - Making public works public facing',
      },
      {
        property: 'og:description',
        content:
          'Report civic issues in under 10 seconds. One shared map. Full transparency.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://civickit.org' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap',
      },
    ],
  }),
})

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

function MapVisualization() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(t)
  }, [])

  const pins = [
    { x: 30, y: 28, status: 0, delay: 0.3 },
    { x: 55, y: 22, status: 2, delay: 0.6 },
    { x: 75, y: 35, status: 0, delay: 0.9 },
    { x: 42, y: 50, status: 1, delay: 1.2 },
    { x: 65, y: 66, status: 0, delay: 1.5 },
    { x: 25, y: 65, status: 2, delay: 1.8 },
    { x: 50, y: 75, status: 1, delay: 2.1 },
    { x: 78, y: 70, status: 2, delay: 2.4 },
  ]

  const colors = [ck.red, ck.yellow, ck.green]

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl" style={{ backgroundColor: '#EEF2EE' }}>
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        {/* Neighborhood blocks — fewer, more spaced */}
        <rect x="30" y="50" width="140" height="100" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
        <rect x="200" y="40" width="170" height="110" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
        <rect x="30" y="185" width="155" height="110" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
        <rect x="215" y="180" width="155" height="115" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
        <rect x="50" y="325" width="130" height="55" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
        <rect x="210" y="325" width="145" height="55" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />

        {/* Major roads */}
        <line x1="0" y1="160" x2="400" y2="160" stroke="#C0CCC0" strokeWidth="4" />
        <line x1="0" y1="310" x2="400" y2="310" stroke="#C0CCC0" strokeWidth="4" />
        <line x1="190" y1="0" x2="190" y2="400" stroke="#C0CCC0" strokeWidth="4" />

        {/* Secondary roads */}
        <line x1="0" y1="100" x2="400" y2="100" stroke="#D8E0D8" strokeWidth="1.5" />
        <line x1="0" y1="240" x2="400" y2="240" stroke="#D8E0D8" strokeWidth="1.5" />
        <line x1="100" y1="0" x2="100" y2="400" stroke="#D8E0D8" strokeWidth="1.5" />
        <line x1="300" y1="0" x2="300" y2="400" stroke="#D8E0D8" strokeWidth="1.5" />

        {/* Park */}
        <ellipse cx="245" cy="230" rx="40" ry="25" fill={`${ck.lightGreen}25`} stroke={`${ck.lightGreen}40`} strokeWidth="1" />

        {/* Labels — bigger, bolder */}
        <text x="245" y="234" textAnchor="middle" fontSize="11" fontWeight="500" fill={ck.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.5">Forest Park</text>
        <text x="100" y="95" textAnchor="middle" fontSize="11" fontWeight="500" fill={ck.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">The Grove</text>
        <text x="290" y="90" textAnchor="middle" fontSize="11" fontWeight="500" fill={ck.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">Midtown</text>
        <text x="100" y="245" textAnchor="middle" fontSize="11" fontWeight="500" fill={ck.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">Dogtown</text>
        <text x="120" y="358" textAnchor="middle" fontSize="11" fontWeight="500" fill={ck.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">Tower Grove</text>
        <text x="290" y="358" textAnchor="middle" fontSize="11" fontWeight="500" fill={ck.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">Soulard</text>
      </svg>

      {pins.map((pin, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1) translateY(0)' : 'scale(0) translateY(-8px)',
            transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${pin.delay}s`,
          }}
        >
          <span
            className="absolute -inset-4 animate-ping rounded-full opacity-20"
            style={{
              backgroundColor: colors[pin.status],
              animationDuration: `${3.5 + i * 0.5}s`,
              animationDelay: `${pin.delay + 0.5}s`,
            }}
          />
          <span
            className="relative block h-3.5 w-3.5 rounded-full border-[2.5px] border-white shadow-lg"
            style={{
              backgroundColor: colors[pin.status],
              boxShadow: `0 2px 8px ${colors[pin.status]}40`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

function LandingPage() {
  return (
    <div
      className="min-h-svh antialiased"
      style={{
        fontFamily: "'Outfit', sans-serif",
        backgroundColor: ck.bg,
        color: ck.dark,
      }}
    >
      <Nav />
      <Hero />
      <Problem />
      <ScatteredReporting />
      <Solution />
      <SharedMap />
      <WhoWeServe />
      <BusinessModel />
      <Competitive />
      <TheAsk />
      <Footer />
    </div>
  )
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className="fixed top-0 z-50 w-full transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled
          ? `1px solid ${ck.lightGray}`
          : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: ck.green }}
          >
            <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "'DM Serif Display', serif",
              color: ck.dark,
            }}
          >
            CivicKit
          </span>
        </div>
        <nav className="hidden items-center gap-10 md:flex">
          {['Problem', 'Solution', 'Model'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-[13px] font-medium uppercase tracking-[0.12em] transition-colors hover:opacity-100"
              style={{ color: ck.darkGray }}
            >
              {label}
            </a>
          ))}
          <Button
            size="sm"
            className="rounded-full px-5 text-[13px] font-semibold text-white transition-colors duration-200"
            style={{ backgroundColor: ck.green }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ck.darkGreen)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ck.green)}
          >
            Get Early Access
          </Button>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative min-h-svh overflow-hidden" style={{ backgroundColor: ck.bg }}>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, ${ck.green}08 0%, transparent 50%), radial-gradient(circle at 30% 70%, ${ck.blue}06 0%, transparent 40%)`,
        }}
      />

      <div className="relative mx-auto flex min-h-svh max-w-7xl items-center px-8 pt-20">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal delay={0.08}>
              <h1
                className="text-[clamp(2.8rem,5.5vw,5rem)] leading-[1.08] font-bold tracking-tight"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  color: ck.dark,
                }}
              >
                Making
                <br />
                public works
                <br />
                <span style={{ color: ck.green }}>public facing.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p
                className="mt-6 max-w-lg text-[17px] leading-relaxed"
                style={{ color: ck.darkGray }}
              >
                Snap a photo. Add a description. Submit. Your report is
                instantly pinned on a shared, live map that the whole city can
                see. Under 10 seconds, from anywhere.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex items-center gap-3">
                <Button
                  size="lg"
                  className="group/cta h-11 rounded-full px-7 text-[15px] font-semibold text-white transition-colors duration-200"
                  style={{ backgroundColor: ck.green }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ck.darkGreen)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ck.green)}
                >
                  Get Early Access
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-full px-6 text-[15px]"
                  style={{
                    borderColor: ck.lightGray,
                    color: ck.darkGray,
                  }}
                >
                  <GitHubIcon className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </Reveal>

          </div>

          <Reveal delay={0.2} className="hidden lg:block">
            <div className="relative ml-auto aspect-square max-w-[480px]">
              <div
                className="absolute -inset-6 rounded-3xl blur-3xl"
                style={{ backgroundColor: `${ck.green}08` }}
              />
              <div
                className="relative h-full w-full overflow-hidden rounded-2xl border shadow-xl"
                style={{
                  borderColor: ck.lightGray,
                  backgroundColor: ck.surface,
                  boxShadow: `0 25px 60px -12px ${ck.dark}10`,
                }}
              >
                <MapVisualization />
              </div>
              <div className="mt-4 flex items-center justify-end gap-5">
                {[
                  { color: ck.red, label: 'Reported' },
                  { color: ck.yellow, label: 'In Progress' },
                  { color: ck.green, label: 'Resolved' },
                ].map((s) => (
                  <span
                    key={s.label}
                    className="flex items-center gap-2 text-xs font-medium"
                    style={{ color: ck.medGray }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown
            className="h-5 w-5 animate-bounce"
            style={{ color: ck.medGray }}
          />
        </div>
      </div>
    </section>
  )
}

function Problem() {
  const locations = [
    {
      location: 'Olive St. & N Spring Ave.',
      desc: 'Crumbling sidewalk with exposed hazards. A daily obstacle for pedestrians.',
      image: '/images/sidewalk.jpg',
    },
    {
      location: 'Great Rivers Greenway',
      desc: 'Brand new greenway damaged within one week of its grand opening.',
      image: '/images/light-pole.jpg',
    },
    {
      location: 'Grand & Forest Park Ave.',
      desc: 'Fallen construction barriers and a flooded intersection left unresolved.',
      image: '/images/flooding.jpg',
    },
  ]

  return (
    <section
      id="problem"
      className="scroll-mt-20 py-28 md:py-36"
      style={{ backgroundColor: ck.surface }}
    >
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <p
            className="text-[13px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: ck.red }}
          >
            The Problem
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            className="mt-4 max-w-3xl text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.1] font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Look familiar?
          </h2>
        </Reveal>
        <Reveal delay={0.14}>
          <p
            className="mt-5 max-w-xl text-[17px] leading-relaxed"
            style={{ color: ck.darkGray }}
          >
            Broken sidewalks, downed signs, crumbling infrastructure. These
            aren&apos;t edge cases. They exist in every
            neighborhood in St.&nbsp;Louis.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {locations.map((item, i) => (
            <Reveal key={item.location} delay={0.1 + i * 0.08}>
              <div
                className="group overflow-hidden rounded-2xl border transition-shadow hover:shadow-md"
                style={{
                  borderColor: ck.lightGray,
                  backgroundColor: ck.bg,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.location}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md"
                      style={{ backgroundColor: ck.red }}
                    >
                      !
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[15px] font-semibold">{item.location}</p>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: ck.darkGray }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <p
            className="mt-14 max-w-2xl text-[17px] leading-relaxed italic"
            style={{ color: ck.medGray }}
          >
            &ldquo;How can we explore, enjoy and take pride in our city when we
            don&apos;t feel welcome, safe, or considered?&rdquo;
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function ScatteredReporting() {
  const methods = [
    { icon: Phone, title: '311 / Call', problem: 'Only Mon–Fri, 8am–5pm' },
    {
      icon: Globe,
      title: 'Online Form',
      problem: 'Need to know exact department, easy to get lost',
    },
    {
      icon: MessageCircle,
      title: 'Twitter / @stlcsb',
      problem: 'Social media monitoring required',
    },
    {
      icon: Mail,
      title: 'Email CSB',
      problem: 'Requires moderators to read and route',
    },
  ]

  return (
    <section className="py-28 md:py-36" style={{ backgroundColor: ck.bg }}>
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <h2
            className="max-w-2xl text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Reporting is scattered.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-rows-[auto] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((m, i) => (
            <Reveal key={m.title} delay={0.05 + i * 0.07} className="flex">
              <div
                className="group flex-1 rounded-xl border p-6 transition-shadow hover:shadow-md"
                style={{
                  borderColor: ck.lightGray,
                  backgroundColor: ck.surface,
                }}
              >
                <m.icon
                  className="h-5 w-5"
                  style={{ color: ck.medGray }}
                />
                <p className="mt-4 text-[15px] font-semibold">{m.title}</p>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: ck.darkGray }}
                >
                  {m.problem}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35}>
          <p
            className="mt-12 max-w-2xl text-[17px] leading-relaxed italic"
            style={{ color: ck.medGray }}
          >
            Reports are scattered, manually sorted, and slow to reach the
            right department.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Solution() {
  const steps = [
    { num: 1, icon: Camera, label: 'Snap a photo', sub: 'Point and shoot' },
    {
      num: 2,
      icon: FileText,
      label: 'Add a description',
      sub: 'Quick context',
    },
    { num: 3, icon: Send, label: 'Submit', sub: 'Pinned on the map' },
  ]

  return (
    <section
      id="solution"
      className="scroll-mt-20 py-28 md:py-36"
      style={{ backgroundColor: ck.surface }}
    >
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <p
            className="text-[13px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: ck.green }}
          >
            Introducing CivicKit
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            className="mt-4 max-w-4xl text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.08] font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Report any civic issue
            <br />
            in under{' '}
            <span style={{ color: ck.green }}>10 seconds.</span>
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={0.12 + i * 0.1}>
              <div className="group relative">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
                  style={{
                    backgroundColor: ck.green,
                    boxShadow: `0 8px 24px ${ck.green}25`,
                  }}
                >
                  {step.num}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="absolute top-8 left-20 hidden h-px w-[calc(100%-5rem)] lg:block"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${ck.green}30, transparent)`,
                    }}
                  />
                )}
                <h3 className="mt-6 text-xl font-bold">{step.label}</h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: ck.medGray }}
                >
                  {step.sub}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.45}>
          <p
            className="mt-16 text-[17px] italic"
            style={{ color: ck.medGray }}
          >
            Your report is instantly pinned on a shared, live map, visible to
            the whole city.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function SharedMap() {
  const benefits = [
    {
      icon: Layers,
      label: 'Reduces duplicate reports',
      desc: 'Residents see existing pins before submitting',
    },
    {
      icon: Eye,
      label: 'Full transparency',
      desc: 'Every report visible to the public',
    },
    {
      icon: TrendingUp,
      label: 'Reveals patterns',
      desc: 'Data shows where problems cluster',
    },
    {
      icon: ShieldCheck,
      label: 'Surfaces neglected areas',
      desc: 'Overlooked neighborhoods get attention',
    },
  ]

  return (
    <section className="py-28 md:py-36" style={{ backgroundColor: ck.bg }}>
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <h2
                className="text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] font-bold tracking-tight"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                One shared map.
                <br />
                <span style={{ color: ck.medGray }}>
                  Full transparency.
                </span>
              </h2>
            </Reveal>

            <div className="mt-10 space-y-3">
              {benefits.map((b, i) => (
                <Reveal key={b.label} delay={0.08 + i * 0.07}>
                  <div
                    className="group flex items-start gap-4 rounded-xl border p-5 transition-all hover:shadow-md"
                    style={{
                      borderColor: ck.lightGray,
                      backgroundColor: ck.surface,
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${ck.green}10` }}
                    >
                      <b.icon
                        className="h-5 w-5"
                        style={{ color: ck.green }}
                      />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold">{b.label}</p>
                      <p
                        className="mt-0.5 text-sm"
                        style={{ color: ck.darkGray }}
                      >
                        {b.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15} className="hidden lg:block">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-xl"
              style={{
                borderColor: ck.lightGray,
                backgroundColor: ck.surface,
                boxShadow: `0 25px 60px -12px ${ck.dark}08`,
              }}
            >
              <MapVisualization />
              <div className="absolute bottom-5 left-5 flex items-center gap-5">
                {[
                  { color: ck.red, label: 'Reported' },
                  { color: ck.yellow, label: 'In Progress' },
                  { color: ck.green, label: 'Resolved' },
                ].map((s) => (
                  <span
                    key={s.label}
                    className="flex items-center gap-2 text-xs font-medium"
                    style={{ color: ck.darkGray }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function WhoWeServe() {
  const segments = [
    {
      icon: Users,
      title: 'Residents',
      accent: ck.brightBlue,
      desc: 'Anyone in the city can report an issue in seconds. No barriers. No accounts required to view the map.',
    },
    {
      icon: Building2,
      title: 'Community Orgs',
      accent: ck.green,
      desc: 'Neighborhood associations, park districts, and improvement orgs use CivicKit to track trends and advocate with data.',
    },
    {
      icon: Landmark,
      title: 'City of St. Louis',
      accent: ck.darkBlue,
      desc: 'Alderpersons and city departments gain a data-backed, centralized dashboard, funded by beautification budgets.',
    },
  ]

  return (
    <section
      className="py-28 md:py-36"
      style={{ backgroundColor: ck.surface }}
    >
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Who we&apos;re building this for.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {segments.map((s, i) => (
            <Reveal key={s.title} delay={0.08 + i * 0.08}>
              <div
                className="group relative overflow-hidden rounded-2xl border p-8 transition-shadow hover:shadow-md"
                style={{
                  borderColor: ck.lightGray,
                  backgroundColor: ck.bg,
                }}
              >
                <div
                  className="absolute top-0 left-0 h-1 w-full"
                  style={{ backgroundColor: s.accent }}
                />
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${s.accent}12` }}
                >
                  <s.icon className="h-6 w-6" style={{ color: s.accent }} />
                </div>
                <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                <p
                  className="mt-3 text-[15px] leading-relaxed"
                  style={{ color: ck.darkGray }}
                >
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function BusinessModel() {
  const tiers = [
    {
      label: 'FREE',
      title: 'Residents',
      features: [
        'Report issues from your phone',
        'View the live map',
        'Follow updates on reports',
      ],
      accent: ck.darkGray,
      border: ck.lightGray,
    },
    {
      label: 'SUBSCRIBE',
      title: 'Community Orgs',
      features: [
        'Analytics dashboard',
        'Trend reports & insights',
        'Custom alerts & notifications',
      ],
      accent: ck.green,
      border: ck.green,
      featured: true,
    },
    {
      label: 'ENTERPRISE',
      title: 'City of St. Louis',
      features: [
        'Full routing dashboard',
        'Department management',
        'API access & integrations',
      ],
      accent: ck.darkBlue,
      border: ck.darkBlue,
    },
  ]

  return (
    <section
      id="model"
      className="scroll-mt-20 py-28 md:py-36"
      style={{ backgroundColor: ck.bg }}
    >
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <p
            className="text-[13px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: ck.green }}
          >
            Business Model
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            className="mt-4 text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Software as a Service
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.title} delay={0.08 + i * 0.08}>
              <div
                className="relative overflow-hidden rounded-2xl border p-7 transition-shadow hover:shadow-md"
                style={{
                  borderColor: t.featured ? `${t.border}40` : ck.lightGray,
                  backgroundColor: ck.surface,
                }}
              >
                {t.featured && (
                  <div
                    className="absolute top-0 left-0 h-1 w-full"
                    style={{ backgroundColor: ck.green }}
                  />
                )}
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: t.accent }}
                >
                  {t.label}
                </p>
                <h3
                  className="mt-3 text-2xl font-bold"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {t.title}
                </h3>
                <ul className="mt-6 space-y-3">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-sm"
                      style={{ color: ck.darkGray }}
                    >
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: ck.medGray }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35}>
          <p className="mt-10 text-sm italic" style={{ color: ck.medGray }}>
            The city funds the subscription from budgets already allocated for
            beautification &amp; community improvement.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Competitive() {
  return (
    <section
      className="py-28 md:py-36"
      style={{ backgroundColor: ck.surface }}
    >
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <h2
            className="max-w-3xl text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            The closest competitor stopped.
            <br />
            <span style={{ color: ck.green }}>
              We&apos;re just getting started.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.08}>
            <div
              className="rounded-2xl border p-8"
              style={{ borderColor: ck.lightGray }}
            >
              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: ck.medGray }}
              >
                Competitor
              </p>
              <h3
                className="mt-2 text-2xl font-bold"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  color: ck.medGray,
                }}
              >
                SeeClickFix
              </h3>
              <ul className="mt-8 space-y-4">
                {[
                  { ok: true, text: 'Shared map concept, same idea' },
                  { ok: true, text: 'Was used in St. Louis' },
                  { ok: false, text: 'Last STL report: ~2013' },
                  { ok: false, text: 'Platform essentially abandoned' },
                  { ok: false, text: 'Not maintained or supported' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    {item.ok ? (
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${ck.medGray}15` }}
                      >
                        <Check
                          className="h-3 w-3"
                          style={{ color: ck.medGray }}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${ck.red}12` }}
                      >
                        <X
                          className="h-3 w-3"
                          style={{ color: ck.red }}
                        />
                      </div>
                    )}
                    <span
                      className="text-sm"
                      style={{
                        color: item.ok ? ck.medGray : ck.red,
                      }}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div
              className="rounded-2xl border-2 p-8 shadow-lg"
              style={{
                borderColor: `${ck.green}35`,
                boxShadow: `0 8px 32px ${ck.green}08`,
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: ck.green }}
              >
                Our Solution
              </p>
              <h3
                className="mt-2 text-2xl font-bold"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                CivicKit
              </h3>
              <ul className="mt-8 space-y-4">
                {[
                  'Same shared map concept',
                  'Built for STL, right now',
                  'Modern, maintained codebase',
                  'Full SaaS with city integration',
                  'Actively developed & supported',
                ].map((text) => (
                  <li key={text} className="flex items-center gap-3">
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${ck.green}15` }}
                    >
                      <Check
                        className="h-3 w-3"
                        style={{ color: ck.green }}
                      />
                    </div>
                    <span className="text-sm font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.25}>
          <p
            className="mt-10 text-[17px] italic"
            style={{ color: ck.medGray }}
          >
            There is a clear, unmet need in St. Louis, and we&apos;re
            the team filling it.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function TheAsk() {
  const asks = [
    {
      icon: DollarSign,
      title: 'Funding',
      accent: ck.green,
      desc: 'To hire full-time developers who can commit to building and maintaining this properly.',
    },
    {
      icon: Handshake,
      title: 'Connections',
      accent: ck.yellow,
      desc: 'Introductions to city workers, alderpersons, neighborhood associations, and park districts.',
    },
    {
      icon: FlaskConical,
      title: 'Beta Testers',
      accent: ck.brightBlue,
      desc: 'Real users who will test early versions of the app and give us honest feedback.',
    },
  ]

  return (
    <section className="py-28 md:py-36" style={{ backgroundColor: ck.bg }}>
      <div className="mx-auto max-w-4xl px-8">
        <Reveal>
          <h2
            className="text-center text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.1] font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Here&apos;s what we need.
          </h2>
        </Reveal>

        <div className="mt-14 space-y-4">
          {asks.map((a, i) => (
            <Reveal key={a.title} delay={0.08 + i * 0.08}>
              <div
                className="group flex items-start gap-6 rounded-2xl border p-7 transition-all hover:shadow-md"
                style={{
                  borderColor: ck.lightGray,
                  borderLeftWidth: '3px',
                  borderLeftColor: a.accent,
                  backgroundColor: ck.surface,
                }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${a.accent}12` }}
                >
                  <a.icon className="h-5 w-5" style={{ color: a.accent }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{a.title}</h3>
                  <p
                    className="mt-1.5 text-[15px] leading-relaxed"
                    style={{ color: ck.darkGray }}
                  >
                    {a.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.35}>
          <p
            className="mt-12 text-center text-sm italic"
            style={{ color: ck.medGray }}
          >
            We&apos;re in early stages, but St. Louis needs this, and
            so do countless other cities.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mt-8 text-center">
            <Button
              size="lg"
              className="group/cta h-12 rounded-full px-10 text-[15px] font-semibold text-white transition-colors duration-200"
              style={{ backgroundColor: ck.green }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ck.darkGreen)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ck.green)}
            >
              Get in Touch
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer
      className="border-t py-12"
      style={{
        borderColor: ck.lightGray,
        backgroundColor: ck.surface,
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ backgroundColor: ck.green }}
          >
            <MapPin className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            CivicKit
          </span>
        </div>
        <p className="text-xs" style={{ color: ck.medGray }}>
          Saint Louis University &middot; School of Science and Engineering
          &middot; Open Source with SLU
        </p>
        <a
          href="https://github.com/oss-slu/civickit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs transition-colors hover:opacity-70"
          style={{ color: ck.darkGray }}
        >
          <GitHubIcon className="h-4 w-4" />
          View on GitHub
        </a>
      </div>
    </footer>
  )
}
