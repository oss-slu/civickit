import { palette } from "@/lib/colors"
import Reveal from "../Reveal"
import { Globe, Mail, MessageCircle, Phone } from "lucide-react"

export default function ScatteredReporting() {
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
        <section className="py-28 md:py-36" style={{ backgroundColor: palette.bg }}>
            <div className="mx-auto max-w-7xl px-8">
                <Reveal>
                    <h2
                        className="max-w-2xl text-[clamp(2rem,4vw,3rem)] leading-[1.1] 
                            font-display font-bold tracking-tight"
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
                                    borderColor: palette.lightGray,
                                    backgroundColor: palette.surface,
                                }}
                            >
                                <m.icon
                                    className="h-5 w-5"
                                    style={{ color: palette.medGray }}
                                />
                                <p className="mt-4 text-[15px] font-semibold">{m.title}</p>
                                <p
                                    className="mt-2 text-sm leading-relaxed"
                                    style={{ color: palette.darkGray }}
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
                        style={{ color: palette.medGray }}
                    >
                        Reports are scattered, manually sorted, and slow to reach the
                        right department.
                    </p>
                </Reveal>
            </div>
        </section>
    )
}
