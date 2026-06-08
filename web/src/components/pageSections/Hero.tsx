import { palette } from "@/lib/colors";
import Reveal from "../Reveal";
import { Button } from "../ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { GitHubIcon } from "../icons";
import Map from "../Map"

export default function Hero() {
    return (
        <section className="relative min-h-svh overflow-hidden" style={{ backgroundColor: palette.bg }}>
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage: `radial-gradient(circle at 70% 30%, ${palette.green}08 0%, transparent 50%), radial-gradient(circle at 30% 70%, ${palette.blue}06 0%, transparent 40%)`,
                }}
            />

            <div className="relative mx-auto flex min-h-svh max-w-7xl items-center px-8 pt-20">
                <div className="grid w-full items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <Reveal delay={0.08}>
                            <h1
                                className="text-[clamp(2.8rem,9vw,7rem)] leading-[1.08] font-bold font-display tracking-tight"
                                style={{
                                    color: palette.dark,
                                }}
                            >
                                Making
                                <br />
                                public works
                                <br />
                                <span style={{ color: palette.green }}>public facing.</span>
                            </h1>
                        </Reveal>

                        <Reveal delay={0.16}>
                            <p
                                className="mt-6 max-w-lg text-[17px] leading-relaxed"
                                style={{ color: palette.darkGray }}
                            >
                                See a problem? Snap a photo, add a description, and submit in under 10 seconds. Your report is
                                instantly pinned on a shared, live map that the whole city can
                                see.
                            </p>
                        </Reveal>

                        <Reveal delay={0.24}>
                            <div className="mt-8 flex items-center gap-3">
                                <Button
                                    size="lg"
                                    className="group/cta h-11 rounded-full px-7 text-[15px] font-semibold text-white transition-colors duration-200"
                                    style={{ backgroundColor: palette.green }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = palette.darkGreen)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = palette.green)}
                                >
                                    See the Demo
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-11 rounded-full px-6 text-[15px]"
                                    style={{
                                        borderColor: palette.lightGray,
                                        color: palette.darkGray,
                                    }}
                                >
                                    <a href="https://github.com/oss-slu/civickit"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex" style={{
                                            alignItems: "center"
                                        }}>
                                        <GitHubIcon className="mr-2 h-4 w-4" />
                                        GitHub
                                    </a>
                                </Button>

                            </div>
                        </Reveal>

                    </div>

                    <Reveal delay={0.2} className="hidden lg:block">
                        <div className="relative ml-auto aspect-square max-w-[480px]">
                            <div
                                className="absolute -inset-6 rounded-3xl blur-3xl"
                                style={{ backgroundColor: `${palette.green}08` }}
                            />
                            <div
                                className="relative h-full w-full overflow-hidden rounded-2xl border shadow-xl"
                                style={{
                                    borderColor: palette.lightGray,
                                    backgroundColor: palette.surface,
                                    boxShadow: `0 25px 60px -12px ${palette.dark}10`,
                                }}
                            >
                                <Map />
                            </div>
                            <div className="mt-4 flex items-center justify-end gap-5">
                                {/* {[
                                    { color: palette.red, label: 'Reported' },
                                    { color: palette.yellow, label: 'In Progress' },
                                    { color: palette.green, label: 'Resolved' },
                                ].map((s) => (
                                    <span
                                        key={s.label}
                                        className="flex items-center gap-2 text-xs font-medium"
                                        style={{ color: palette.medGray }}
                                    >
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: s.color }}
                                        />
                                        {s.label}
                                    </span>
                                ))} */}
                            </div>
                        </div>
                    </Reveal>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <ChevronDown
                        className="h-5 w-5 animate-bounce"
                        style={{ color: palette.medGray }}
                    />
                </div>
            </div>
        </section>
    )
}
