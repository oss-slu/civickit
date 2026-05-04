import { palette } from "@/lib/colors"
import Reveal from "../Reveal"

export default function Problem() {
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
            style={{ backgroundColor: palette.surface }}
        >
            <div className="mx-auto max-w-7xl px-8">
                <Reveal>
                    <p
                        className="text-[13px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: palette.red }}
                    >
                        The Problem
                    </p>
                </Reveal>
                <Reveal delay={0.08}>
                    <h2
                        className="mt-4 max-w-3xl text-[clamp(3rem,4.5vw,4rem)] leading-[1.1] 
                            font-display font-bold tracking-tight"
                    >
                        Look familiar?
                    </h2>
                </Reveal>
                <Reveal delay={0.14}>
                    <p
                        className="mt-5 max-w-xl text-[17px] leading-relaxed"
                        style={{ color: palette.darkGray }}
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
                                    borderColor: palette.lightGray,
                                    backgroundColor: palette.bg,
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
                                            style={{ backgroundColor: palette.red }}
                                        >
                                            !
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-[15px] font-semibold">{item.location}</p>
                                    <p
                                        className="mt-2 text-sm leading-relaxed"
                                        style={{ color: palette.darkGray }}
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
                        className="mt-14 max-w-5xl text-[17px] leading-relaxed italic"
                        style={{ color: palette.medGray }}
                    >
                        &ldquo;How can we explore, enjoy and take pride in our city when we
                        don&apos;t feel welcome, safe, or considered?&rdquo;
                    </p>
                </Reveal>
            </div>
        </section>
    )
}
