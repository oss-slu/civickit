import { ArrowRight, DollarSign, FlaskConical, Handshake } from "lucide-react"
import Reveal from "../Reveal"
import { Button } from "../ui/button"
import { palette } from "@/lib/colors"

export default function TheAsk() {
    const asks = [
        {
            icon: DollarSign,
            title: 'Funding',
            accent: palette.green,
            desc: 'To hire full-time developers who can commit to building and maintaining this properly.',
        },
        {
            icon: Handshake,
            title: 'Connections',
            accent: palette.yellow,
            desc: 'Introductions to city workers, alderpersons, neighborhood associations, and park districts.',
        },
        {
            icon: FlaskConical,
            title: 'Beta Testers',
            accent: palette.brightBlue,
            desc: 'Real users who will test early versions of the app and give us honest feedback.',
        },
    ]

    return (
        <section className="py-28 md:py-36" style={{ backgroundColor: palette.bg }}>
            <div className="mx-auto max-w-4xl px-8">
                <Reveal>
                    <h2
                        className="text-center font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.1] font-bold tracking-tight"
                    // style={{ fontFamily: "'DM Serif Display', serif" }}
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
                                    borderColor: palette.lightGray,
                                    borderLeftWidth: '3px',
                                    borderLeftColor: a.accent,
                                    backgroundColor: palette.surface,
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
                                        style={{ color: palette.darkGray }}
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
                        style={{ color: palette.medGray }}
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
                            style={{ backgroundColor: palette.green }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.darkGreen)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = palette.green)}
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