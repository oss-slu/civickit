import { palette } from "@/lib/colors"
import Reveal from "../Reveal"
import { Camera, FileText, Send } from "lucide-react"

export default function Solution() {
    const steps = [
        { num: 1, icon: Camera, label: 'Snap a photo', sub: 'Point and shoot', color: palette.red },
        { num: 2, icon: FileText, label: 'Add a description', sub: 'Quick context', color: palette.yellow },
        { num: 3, icon: Send, label: 'Submit', sub: 'Pinned on the map', color: palette.green },
    ]

    return (
        <section
            id="solution"
            className="scroll-mt-20 py-28 md:py-36"
            style={{ backgroundColor: palette.surface }}
        >
            <div className="mx-auto max-w-7xl px-8">
                <Reveal>
                    <p
                        className="text-[13px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: palette.green }}
                    >
                        Introducing CivicKit
                    </p>
                </Reveal>
                <Reveal delay={0.08}>
                    <h2
                        className="mt-4 max-w-4xl text-[clamp(2.2rem,5vw,5rem)] leading-[1.08] font-display
                            font-bold tracking-tight"
                    >
                        Report any civic issue
                        <br />
                        in under{' '}
                        <span style={{ color: palette.green }}>10 seconds.</span>
                    </h2>
                </Reveal>

                <div className="mt-20 grid gap-8 md:grid-cols-3 justify-center">
                    {steps.map((step, i) => (
                        <Reveal key={step.num} delay={0.12 + i * 0.1}>
                            <div className="group relative justify-items-center md:justify-items-start">
                                <div
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
                                    style={{
                                        backgroundColor: step.color,
                                        boxShadow: `0 8px 24px ${step.color}25`,
                                    }}
                                >
                                    {step.num}
                                </div>
                                {i < steps.length - 1 && (
                                    <div
                                        className="absolute top-8 left-20 hidden h-px w-[calc(100%-5rem)] lg:block"
                                        style={{
                                            backgroundImage: `linear-gradient(to right, ${step.color}30, transparent)`,
                                        }}
                                    />
                                )}
                                <h3 className="mt-6 text-xl font-bold">{step.label}</h3>
                                <p
                                    className="mt-1 text-sm"
                                    style={{ color: palette.medGray }}
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
                        style={{ color: palette.medGray }}
                    >
                        Your report is instantly pinned on a shared, live map, visible to
                        the whole city.
                    </p>
                </Reveal>
            </div>
        </section>
    )
}