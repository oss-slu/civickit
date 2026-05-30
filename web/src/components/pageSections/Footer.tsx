import { palette } from "@/lib/colors";
import { GitHubIcon } from "../icons";
import Reveal from "../Reveal";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export default function Footer() {
    return (
        <footer
            className="border-t py-12"
            style={{
                borderColor: palette.lightGray,
                backgroundColor: palette.surface,
            }}
        >
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-8 md:flex-row md:justify-between">
                <div className="flex items-center gap">

                    <img src={"images/logo-green.png"} height={30} width={30} />

                    <span
                        className="font-bold tracking-tight text-xl font-display"
                    >
                        CivicKit
                    </span>
                </div>
                <Reveal delay={0.4}>
                    <div className="text-center">
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

                <a
                    href="https://github.com/oss-slu/civickit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs transition-colors hover:opacity-70"
                    style={{ color: palette.darkGray }}
                >
                    <GitHubIcon className="h-4 w-4" />
                    View on GitHub
                </a>
            </div>
        </footer>
    )
}