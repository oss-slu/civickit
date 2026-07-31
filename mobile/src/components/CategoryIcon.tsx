import { typography, colors, spacing } from "../styles"
import { TrafficConeIcon, LightBulbIcon, SprayPaintIcon, TrashIcon, BrokenIcon, TrafficLightIcon, ExclamationPointIcon } from "./Icons"

// mobile/src/components/CategoryIcon.tsx
export default function CategoryIcon({ category, size, color, style }: any) {
    if (category == "POTHOLE") {
        return <TrafficConeIcon size={size ? size : typography.sizeLg} color={color ? color : colors.textPrimary} style={{ ...style }} />

    } else if (category == "STREETLIGHT") {
        return <LightBulbIcon size={size ? size : typography.sizeLg} color={color ? color : colors.textPrimary}
            style={{ marginRight: spacing.xs, ...style }} />

    } else if (category == "GRAFFITI") {
        return <SprayPaintIcon size={size ? size : typography.sizeXl} color={color ? color : colors.textPrimary} />

    } else if (category == "ILLEGAL_DUMPING") {
        return <TrashIcon size={size ? size : typography.sizeLg} color={color ? color : colors.textPrimary}
            style={{ marginRight: spacing.xs, ...style }} />

    } else if (category == "BROKEN_SIDEWALK") {
        return <BrokenIcon size={size ? size : typography.sizeLg} color={color ? color : colors.textPrimary}
            style={{ marginRight: spacing.xs, ...style }} />

    } else if (category == "TRAFFIC_SIGNAL") {
        return <TrafficLightIcon size={size ? size : typography.sizeLg} color={color ? color : colors.textPrimary}
            style={{ marginRight: spacing.xs, ...style }} />

    } else {
        return <ExclamationPointIcon size={size ? size : typography.sizeLg} color={color ? color : colors.textPrimary} style={{ marginRight: spacing.xs, ...style }} />
    }
}