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

    let reportingIs = "Reporting is"
    let scattered = " scattered"

    return (
        <section className="py-28 md:py-36" style={{ backgroundColor: palette.bg }}>
            <div className="mx-auto max-w-7xl px-8">
                <Reveal>
                    <div
                        className="max-w-2xl text-[clamp(2rem,4vw,3rem)] leading-[1.1] 
                            font-display font-bold tracking-tight  flex flex-row gap-x-2"
                    >
                        <div>Reporting is </div>
                        <div style={{ color: palette.red }}>scattered.
                        </div>
                    </div>
                </Reveal>

                <div className="mt-14 grid grid-rows-[auto] gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {methods.map((m, i) => (
                        <Reveal key={m.title} delay={0.05 + i * 0.07} className="flex">
                            <div
                                className="group flex-1 rounded-xl border p-6 "
                                style={{
                                    borderColor: palette.lightGray,
                                    backgroundColor: palette.surface,
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: palette.yellow,
                                        borderWidth: 2,
                                        borderColor: palette.dark,
                                        padding: 8,
                                        width: 40,
                                        borderRadius: 100
                                    }}>
                                    <m.icon
                                        className="h-5 w-5 bg"
                                        style={{
                                            color: palette.dark,
                                        }}
                                    />
                                </div>
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
