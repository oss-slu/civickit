import { palette } from "@/lib/colors"
import Reveal from "../Reveal"
import { Mail } from "lucide-react"

export default function Contact() {

    return (
        <section
            id="contact"
            className="py-28 md:py-36" style={{ backgroundColor: palette.bg }}>
            <div className="mx-auto max-w-7xl px-8">
                <Reveal>
                    <div
                        className="max-w-2xl text-[clamp(2rem,4vw,3rem)] leading-[1.1] 
                            font-display font-bold tracking-tight  flex flex-row gap-x-2"
                    >
                        Get in touch!
                    </div>
                </Reveal>


                <Reveal delay={0.05 + 1 * 0.07} className="">
                    <a href="mailto:civickit@gmail.com">
                        <div
                            className="group flex flex-row gap-x-4 rounded-xl border p-6 m-4 hover:shadow w-full lg:w-3/4"
                            style={{
                                borderColor: palette.lightGray,
                                backgroundColor: palette.surface,
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: palette.lightGreen,
                                    borderWidth: 2,
                                    borderColor: palette.dark,
                                    padding: 8,
                                    borderRadius: 100,
                                }}>
                                <Mail
                                    className=""
                                    style={{
                                        color: palette.dark,
                                    }}
                                />
                            </div>

                            <p className="mt-2 text-[18px] font-semibold">civickitapp@gmail.com</p>


                        </div>
                    </a>
                </Reveal>
            </div>
        </section>
    )
}
