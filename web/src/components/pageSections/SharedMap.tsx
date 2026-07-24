import { palette } from "@/lib/colors"
import { Eye, Layers, ShieldCheck, TrendingUp } from "lucide-react"
import Reveal from "../Reveal"

export default function SharedMap() {
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
        <section className="py-28 md:py-36" style={{ backgroundColor: palette.bg }}>
            <div className="mx-auto max-w-7xl px-8">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    <div>
                        <Reveal>
                            <h2
                                className="text-[clamp(2rem,4vw,4rem)] leading-[1.1] font-display font-bold tracking-tight"
                            >
                                One shared map.
                                <br />
                                <span style={{ color: palette.medGray }}>
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
                                            borderColor: palette.lightGray,
                                            backgroundColor: palette.surface,
                                        }}
                                    >
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: `${palette.green}10` }}
                                        >
                                            <b.icon
                                                className="h-5 w-5"
                                                style={{ color: palette.green }}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-semibold">{b.label}</p>
                                            <p
                                                className="mt-0.5 text-sm"
                                                style={{ color: palette.darkGray }}
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
                        <div>
                            <img className="shadow-lg rounded-[55px]"
                                src={"images/phone1.png"} />
                            <img className="absolute shadow-xl rounded-[55px]"
                                style={{
                                    top: 40,
                                    left: 200
                                }}
                                src={"images/phone2.png"} />

                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}