import { palette } from "@/lib/colors"
import { useEffect, useState } from "react"

export default function MapVisualization() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 400)
        return () => clearTimeout(t)
    }, [])

    const pins = [
        { x: 30, y: 28, status: 0, delay: 0.3 },
        { x: 55, y: 22, status: 2, delay: 0.6 },
        { x: 75, y: 35, status: 0, delay: 0.9 },
        { x: 42, y: 50, status: 1, delay: 1.2 },
        { x: 65, y: 66, status: 0, delay: 1.5 },
        { x: 25, y: 65, status: 2, delay: 1.8 },
        { x: 50, y: 75, status: 1, delay: 2.1 },
        { x: 78, y: 70, status: 2, delay: 2.4 },
    ]

    const colors = [palette.red, palette.yellow, palette.green]

    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl" style={{ backgroundColor: '#EEF2EE' }}>
            <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
                {/* Neighborhood blocks — fewer, more spaced */}
                <rect x="30" y="50" width="140" height="100" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
                <rect x="200" y="40" width="170" height="110" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
                <rect x="30" y="185" width="155" height="110" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
                <rect x="215" y="180" width="155" height="115" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
                <rect x="50" y="325" width="130" height="55" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />
                <rect x="210" y="325" width="145" height="55" rx="4" fill="#E4EAE4" stroke="#D4DCD4" strokeWidth="0.6" />

                {/* Major roads */}
                <line x1="0" y1="160" x2="400" y2="160" stroke="#C0CCC0" strokeWidth="4" />
                <line x1="0" y1="310" x2="400" y2="310" stroke="#C0CCC0" strokeWidth="4" />
                <line x1="190" y1="0" x2="190" y2="400" stroke="#C0CCC0" strokeWidth="4" />

                {/* Secondary roads */}
                <line x1="0" y1="100" x2="400" y2="100" stroke="#D8E0D8" strokeWidth="1.5" />
                <line x1="0" y1="240" x2="400" y2="240" stroke="#D8E0D8" strokeWidth="1.5" />
                <line x1="100" y1="0" x2="100" y2="400" stroke="#D8E0D8" strokeWidth="1.5" />
                <line x1="300" y1="0" x2="300" y2="400" stroke="#D8E0D8" strokeWidth="1.5" />

                {/* Park */}
                <ellipse cx="245" cy="230" rx="40" ry="25" fill={`${palette.lightGreen}25`} stroke={`${palette.lightGreen}40`} strokeWidth="1" />

                {/* Labels — bigger, bolder */}
                <text x="245" y="234" textAnchor="middle" fontSize="11" fontWeight="500" fill={palette.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.5">Forest Park</text>
                <text x="100" y="95" textAnchor="middle" fontSize="11" fontWeight="500" fill={palette.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">The Grove</text>
                <text x="290" y="90" textAnchor="middle" fontSize="11" fontWeight="500" fill={palette.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">Midtown</text>
                <text x="100" y="245" textAnchor="middle" fontSize="11" fontWeight="500" fill={palette.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">Dogtown</text>
                <text x="120" y="358" textAnchor="middle" fontSize="11" fontWeight="500" fill={palette.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">Tower Grove</text>
                <text x="290" y="358" textAnchor="middle" fontSize="11" fontWeight="500" fill={palette.darkGray} fontFamily="'Outfit', sans-serif" opacity="0.35">Soulard</text>
            </svg>

            {pins.map((pin, i) => (
                <div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'scale(1) translateY(0)' : 'scale(0) translateY(-8px)',
                        transition: `all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${pin.delay}s`,
                    }}
                >
                    <span
                        className="absolute -inset-4 animate-ping rounded-full opacity-20"
                        style={{
                            backgroundColor: colors[pin.status],
                            animationDuration: `${3.5 + i * 0.5}s`,
                            animationDelay: `${pin.delay + 0.5}s`,
                        }}
                    />
                    <span
                        className="relative block h-3.5 w-3.5 rounded-full border-[2.5px] border-white shadow-lg"
                        style={{
                            backgroundColor: colors[pin.status],
                            boxShadow: `0 2px 8px ${colors[pin.status]}40`,
                        }}
                    />
                </div>
            ))}
        </div>
    )
}