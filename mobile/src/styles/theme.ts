// mobile/src/styles/theme.ts

//brand colors
export const palette = {
    ckBlue: "#2563EB",
    ckRed: "#D1495B",
    ckYellow: "#EDAE49",
    ckLightGreen: "#9DCBBA",
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

    statusReported: palette.ckYellow,
    statusResolved: palette.ckLightGreen,
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64
};

export const typography = {
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
    cardCompact: 80,
    cardExpanded: 120,
    longButton: 200,
    imageLg: 340
};