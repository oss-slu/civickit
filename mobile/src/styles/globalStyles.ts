// mobile/src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, size, palette } from './theme';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.sm,
    },

    card: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
        borderWidth: 0,
        padding: spacing.sm,
        flexDirection: 'row',
        flex: 1,
    },

    heading1: {
        fontSize: typography.sizeXl,
        fontWeight: typography.weightBold,
        color: colors.textPrimary,
    },

    heading2: {
        fontSize: typography.sizeLg,
        fontWeight: typography.weightBold,
        color: colors.textPrimary,
    },

    bodyText: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary,
        lineHeight: 22,
    },

    button: {
        fontSize: typography.sizeMd,
        color: colors.textContrast,
        fontWeight: typography.weightMedium,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,

        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        textAlign: "center",
    },

    wrapperButton: {
        fontSize: typography.sizeMd,
        color: colors.textContrast,
        fontWeight: typography.weightMedium,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,

        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        textAlign: "center",
    },

    outlinedButton: {
        backgroundColor: colors.background,
        color: colors.textSecondary,
        fontSize: typography.sizeLg,
        borderWidth: 4,
        borderColor: colors.backgroundSecondary
    },

    disabledbutton: {
        fontSize: typography.sizeMd,
        color: colors.textMuted,
        fontWeight: typography.weightMedium,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,

        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        textAlign: "center"
    },

    disabledWrapperButton: {
        fontSize: typography.sizeMd,
        color: colors.textMuted,
        fontWeight: typography.weightMedium,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.full,

        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        textAlign: "center"
    },

    longButton: {
        backgroundColor: palette.ckRed,
        padding: spacing.md,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        flexGrow: 1,
        flexShrink: 0,
    },
    longButtonText: {
        fontSize: typography.sizeXl,
        fontWeight: 'bold',
        color: colors.textContrast
    },
    textBoxBig: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.sizeMd,
        lineHeight: 22,
        minHeight: size.x4l,
        justifyContent: "flex-start",
        height: "auto",
        width: "100%",
        color: colors.textPrimary,
    },

    thumbnail: {
        width: size.xxxl,
        height: size.xxxl,
        borderRadius: borderRadius.md,
    },

    textBox: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        color: colors.textPrimary,
    },

    shadow: {
        elevation: 2,
        shadowColor: palette.ckDark,
        shadowOpacity: 0.25,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 4 },

    },

});
