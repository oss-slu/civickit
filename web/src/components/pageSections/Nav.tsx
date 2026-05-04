import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import { palette } from "@/lib/colors"

export default function Nav() {
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
          ? `1px solid ${palette.lightGray}`
          : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <div className="flex items-center">
          <img src={"images/logo-green.png"} height={50} width={50} />
          <span
            className="text-2xl font-bold tracking-tight font-display"
            style={{
              color: palette.dark,
            }}
          >
            CivicKit
          </span>
        </div>
        <nav className="hidden items-center gap-10 md:flex">
          {['Problem', 'Solution', 'Contact'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-[13px] font-medium uppercase tracking-[0.12em] transition-colors hover:opacity-100"
              style={{ color: palette.darkGray }}
            >
              {label}
            </a>
          ))}
          <Button
            size="sm"
            className="rounded-full px-5 text-[13px] font-semibold text-white transition-colors duration-200"
            style={{ backgroundColor: palette.green }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.darkGreen)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = palette.green)}
          >
            See the Demo
          </Button>
        </nav>
      </div>
    </header>
  )
}
