// mobile/src/styles/theme.ts

//brand colors
export const palette = {
    ckBrightBlue: "#2563EB",
    ckBlue: "#3A78AC",
    ckDarkBlue: "#30638E",
    ckRed: "#D1495B",
    ckDarkRed: "#ac2c3d",
    ckYellow: "#EDAE49",
    ckDarkYellow: "#a86d0e",
    ckOrange: "#da6f1d",
    ckDarkOrange: "#a94d06",
    ckLightGreen: "#9DCBBA",
    ckMediumGreen: "#74b59d",
    ckGreen: "#2A9D8F",
    ckDarkGreen: "#1c7268",

    ckLight: "#F9FAFB",
    ckDark: "#111827",
    ckDarkGray: "#6B7280",
    ckMediumGray: "#9CA3AF",
    ckLightGray: "#E5E7EB",

}

//element colors
export const colors = {
    primary: palette.ckGreen,
    primaryDark: palette.ckDarkGreen,
    secondary: palette.ckYellow,

    background: palette.ckLight,
    backgroundSecondary: palette.ckLightGray,
    surface: '#FFFFFF',

    textPrimary: palette.ckDark,
    textSecondary: palette.ckDarkGray,
    textMuted: palette.ckMediumGray,
    textContrast: palette.ckLight,

    error: palette.ckRed,
    warning: palette.ckYellow,
    success: palette.ckGreen,

    border: palette.ckLightGray,

    statusReported: palette.ckRed,
    statusAcknowledged: palette.ckOrange,
    statusInProgress: palette.ckYellow,
    statusCommunityResolved: palette.ckLightGreen,
    statusResolved: palette.ckGreen,
    statusClosed: palette.ckMediumGray,
};

export const spacing = {
    xs: 4,
    sm: 8,
    sd: 12,
    md: 16,
    ml: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64
};

export const typography = {
    sizeXs: 10,
    sizeSm: 12,
    sizeMd: 14,
    sizeLg: 16,
    sizeXl: 20,
    sizeXxl: 28,
    weightRegular: '400' as const,
    weightMedium: '500' as const,
    weightBold: '700' as const,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    ml: 14,
    lg: 16,
    full: 9999,
};

export const size = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 80,
    x4l: 84,
    cardCompact: 80,
    cardExpanded: 120,
    longButton: 200,
    imageLg: 340,
    navBar: 88
};

export const statusColors: Record<string, { background: string, stroke: string, text: string }> = {
    reported: {
        background: colors.statusReported,
        stroke: palette.ckDarkRed,
        text: colors.textContrast
    },
    resolved: {
        background: colors.statusResolved,
        stroke: palette.ckDarkGreen,
        text: colors.textContrast
    },
    acknowledged: {
        background: colors.statusAcknowledged,
        stroke: palette.ckDarkOrange,
        text: colors.textContrast
    },
    in_progress: {
        background: colors.statusInProgress,
        stroke: palette.ckDarkYellow,
        text: colors.textPrimary
    },
    community_resolved: {
        background: colors.statusCommunityResolved,
        stroke: palette.ckMediumGreen,
        text: colors.textPrimary
    },
    closed: {
        background: colors.statusClosed,
        stroke: palette.ckDarkGray,
        text: colors.textContrast
    },
    default: {
        background: colors.background,
        stroke: colors.backgroundSecondary,
        text: colors.textPrimary
    }
};