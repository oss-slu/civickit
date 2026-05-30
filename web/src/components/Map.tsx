import { palette } from "@/lib/colors";
import { useEffect, useState } from "react";
import { IoMdPin } from "react-icons/io";

export default function Map() {

    const pins = [
        { x: 26, y: 21, title: "Unwalkable Sidewalk", color: palette.red },
        { x: 38, y: 36, title: "Flooded Intersection", color: palette.yellow },
        { x: 79, y: 63, title: "Downed Light Pole", color: palette.red },
        { x: 3, y: 47, title: "Vandalism", color: palette.green },
    ]

    return (
        <div>
            {pins.map((pin, i) => (
                <Pin key={i} pin={pin} i={i} />
            ))}
            <img src={"/images/EmptyMap.png"} height={500} width={500} />
        </div>
    )
}

function Pin({ pin, i, style }: any) {
    const [visible, setVisible] = useState(false)
    const [cardVisible, setCardVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 400)
        return () => clearTimeout(t)
    }, [])

    return (
        <div style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            position: "absolute",
            textAlign: "center",
            justifyContent: "center",
            justifyItems: "center",
        }}>
            <div
                className="absolute rounded-md"
                style={{
                    transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.25s`,
                    opacity: cardVisible ? 1 : 0,
                    bottom: 32,
                    marginBottom: 28,
                    justifySelf: "center",
                    width: 80
                }}>
                <p className="text-sm">{pin.title}</p>
            </div>
            <span
                className="absolute h-15 w-15 animate-ping rounded-full opacity-20"
                style={{
                    backgroundColor: pin.color,
                    animationDuration: `${3.5 + i * 0.5}s`,
                    animationDelay: `${0.5 + i}s`,
                    left: -5,
                    top: -5,
                }}
            />
            <IoMdPin
                className={"text-5xl hover:scale-125 hover:-translate-y-2"}
                style={{
                    color: pin.color,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'scale(1) translateY(0)' : 'scale(0) translateY(-8px)',
                    transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1)`,
                    ...style,
                }}
                onMouseEnter={() => { setCardVisible(true) }}
                onMouseLeave={() => { setCardVisible(false) }}
            />

        </div>
    )
}