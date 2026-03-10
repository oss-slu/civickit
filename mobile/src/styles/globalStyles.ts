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

        // elevation: 2,
        // shadowColor: palette.ckDark,
        // shadowOpacity: 0.05,
        // shadowRadius: 16,
        // shadowOffset: { width: 0, height: 2 },

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
        textAlign: "center"
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

    thumbnail: {
        width: size.xxxl,
        height: size.xxxl,
        borderRadius: borderRadius.md,
    },

    textBox: {
        borderRadius: borderRadius.lg,
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: spacing.md,
        color: colors.textPrimary
    },

    shadow: {
        elevation: 2,
        shadowColor: palette.ckDark,
        shadowOpacity: 0.05,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 2 },
    }

});

//globalize icons in other file