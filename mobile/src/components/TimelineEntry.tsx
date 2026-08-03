// mobile/src/components/TimelineEntries.tsx
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { borderRadius, colors, palette, size, spacing, typography } from "../styles";
import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import CategoryIcon from "./CategoryIcon";
import ModalPopUp from "./ModalPopup";
import ImageGallery from "./ImageGallery";
import { statusColors } from "../styles/theme";
import { getUserById } from "../api/auth";
import { authApi } from "../api";

export default function TimelineEntry({ timelineEntry, issueCategory = "OTHER", first = false, last = false, anonymous = false }: any) {

    const [date, setDate] = useState(new Date(timelineEntry.createdAt))
    const [height, setHeight] = useState(0)
    const [author, setAuthor] = useState<any>()
    const HOURS24 = 86400000
    const isNew = new Date().valueOf() - new Date(timelineEntry.createdAt).valueOf() < HOURS24

    const pictures = timelineEntry.images.map((image: any, index: number) =>
        <Image source={{ uri: image }} key={index} style={styles.picture} />)


    useEffect(() => {
        const getEntries = async () => {
            const user = await authApi.getUserById(timelineEntry.userId)
            setAuthor(user)
        }

        getEntries()

    }, [timelineEntry]);

    return (
        <View style={styles.container}>

            <View style={styles.leftContainter}>
                {timelineEntry.images.length == 0 ?
                    <View style={{
                        ...styles.dot, flexDirection: "row", alignItems: "center", justifyContent: "center",
                        backgroundColor: statusColors[timelineEntry.status.toLowerCase()].background,
                        borderColor: statusColors[timelineEntry.status.toLowerCase()].background
                    }}>
                        <CategoryIcon
                            category={issueCategory}
                            color={statusColors[timelineEntry.status.toLowerCase()].text}
                            size={typography.sizeXxl}
                            style={{ borderWidth: 0, height: "100%", alignSelf: "center", paddingLeft: 4, paddingTop: 7 }}
                        />
                    </View>
                    :
                    <Image source={{ uri: timelineEntry.images[0] }}
                        style={styles.dot} />
                }

                {!last && <View style={{ ...styles.line, height: height, backgroundColor: statusColors[timelineEntry.status.toLowerCase()].background }} />}
            </View>




            <View style={styles.rightContainer} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
                <View style={{
                    flexDirection: "row", columnGap: spacing.sm, flexWrap: "wrap",
                    marginHorizontal: spacing.sm
                }}>
                    {/* eventually check if user is reporter or responder and hide based on that */}
                    {(!anonymous && author != undefined) &&
                        <Text style={styles.author}>{author.name}</Text>}
                    {(anonymous) &&
                        <Text style={styles.author}>User</Text>}
                    <Text style={styles.timestamp}>{
                        `${date.toLocaleString("en-us", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}`
                    }</Text>
                </View>

                <View style={{ flexDirection: "row", columnGap: spacing.xs }}>
                    <StatusBadge status={timelineEntry.status}
                        style={styles.statusPill}
                        textStyle={styles.statusText} />
                    {first && <View style={styles.pill}>
                        <Text style={styles.pillText}>LATEST</Text>
                    </View>}
                    {isNew && <View style={{ ...styles.pill, borderColor: palette.ckYellow }}>
                        <Text style={{ ...styles.pillText, color: colors.textPrimary, }}>NEW</Text>
                    </View>}
                </View>


                <View style={styles.messageContainer}>
                    <Text style={styles.message}>{timelineEntry.message}</Text>
                </View>


                <ModalPopUp
                    buttonBody={pictures}
                    buttonStyle={{ backgroundColor: colors.background, flexDirection: "row", columnGap: spacing.xs, flexWrap: "wrap" }}
                    style={styles.modal}>
                    <ImageGallery images={timelineEntry.images} width={300} height={400} />
                </ModalPopUp>
            </View>


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        columnGap: spacing.sm,
        alignItems: "flex-start",
        justifyContent: "center",
        width: "100%",

    },
    pill: {
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 3,
        borderColor: palette.ckGreen,
        paddingHorizontal: spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: borderRadius.full
    },
    pillText: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg,
        fontWeight: typography.weightBold
    },
    modal: {
        // padding: spacing.sm,
        alignItems: "center",
        rowGap: spacing.sm
    },
    line: {
        width: 4,
        backgroundColor: palette.ckRed,
    },
    rightContainer: {
        flexDirection: "column",
        alignContent: "flex-start",
        alignItems: "flex-start",
        rowGap: spacing.xs,
        width: "80%",
    },
    leftContainter: {
        flexDirection: "column",
        alignItems: "center"
    },
    dot: {
        height: size.xxl,
        width: size.xxl,
        backgroundColor: palette.ckRed,
        marginTop: spacing.xs,
        borderRadius: borderRadius.full,
        borderWidth: 3,
        borderColor: palette.ckRed,
    },
    timestamp: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary,
    },
    author: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary,
        fontWeight: typography.weightMedium
    },
    statusText: {
        fontSize: typography.sizeLg,
    },
    statusPill: {
        paddingHorizontal: spacing.sm
    },
    message: {
        fontSize: typography.sizeLg,
        color: colors.textPrimary,
        marginHorizontal: spacing.sm,
    },
    messageContainer: {
        backgroundColor: colors.backgroundSecondary,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        width: "100%"
    },
    picture: {
        width: size.x4l,
        height: size.x4l,
        borderRadius: borderRadius.lg
    }
})