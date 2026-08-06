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
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-8">
                <div className="flex items-center gap">

                    <img src={"images/logo-color.png"} height={40} width={40} />

                    <span
                        className="font-bold tracking-tight text-xl font-display"
                    >
                        CivicKit
                    </span>
                </div>
            </div>
        </footer>
    )
}