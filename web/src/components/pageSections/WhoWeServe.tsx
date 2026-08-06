import { palette } from "@/lib/colors"
import Reveal from "../Reveal"
import { Building2, Landmark, Users } from "lucide-react"

export default function WhoWeServe() {
    const segments = [
        {
            icon: Users,
            title: 'Residents',
            accent: palette.red,
            desc: 'Anyone in the city can report an issue in seconds.',
        },
        {
            icon: Building2,
            title: 'Community Orgs',
            accent: palette.green,
            desc: 'Neighborhood associations, park districts, and improvement orgs can use CivicKit to track trends, address problems, and advocate with data.',
        },
        {
            icon: Landmark,
            title: 'City of St. Louis',
            accent: palette.yellow,
            desc: 'Alderpersons and city departments gain a data-backed, centralized dashboard visualizing what happens within their community.',
        },
    ]

    return (
        <section
            className="py-28 md:py-36"
            style={{ backgroundColor: palette.surface }}
        >
            <div className="mx-auto max-w-7xl px-8">
                <Reveal>
                    <h2
                        className="text-[clamp(2rem,4vw,4rem)] leading-[1.1] font-display font-bold tracking-tight"
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
                                    borderColor: s.accent,
                                    borderWidth: 4,
                                    backgroundColor: palette.bg,
                                }}
                            >
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                                    style={{
                                        backgroundColor: s.accent,
                                        borderWidth: 3,
                                        borderColor: palette.dark
                                    }}
                                >
                                    <s.icon className="h-6 w-6" style={{ color: palette.dark }} />
                                </div>
                                <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                                <p
                                    className="mt-3 text-[15px] leading-relaxed"
                                    style={{ color: palette.darkGray }}
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