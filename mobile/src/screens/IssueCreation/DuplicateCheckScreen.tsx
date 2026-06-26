import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useNearbyIssues } from "../../contexts/NearbyIssuesContext";
import LoadingScreen from "../Misc/LoadingScreen";
import { MessageView } from "../../components/MessageView";
import IssueCard from "../../components/IssueCard";
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from "../../styles";
import { View, StyleSheet, RefreshControl } from "react-native";
import IconButton from "../../components/IconButton";
import { RightArrowIcon } from "../../components/Icons";
import Button from "../../components/Button";
import { StackParams } from "../../types/StackParams";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { AddressContext, CategoryContext, DescriptionContext, FormStartedContext, ImagesContext, TitleContext, UserLocationContext } from "../../contexts/FormContexts";

//mobile/src/screens/DuplicateCheckScreen.tsx
export default function DuplicateCheckScreen() {

    const { data, isLoading, error, refetch } = useNearbyIssues()
    const [issues, setIssues] = useState(data.issues.filter((i: any) => i.distance <= 15.24)) //within 50ft
    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    const [refreshing, setRefreshing] = useState(false)
    const { images, setImages } = useContext(ImagesContext);
    const { formStarted, setFormStarted } = useContext(FormStartedContext)

    useEffect(() => {
        setIssues(data.issues.filter((i: any) => i.distance <= 15.24))
    }, [data])

    if (isLoading) {
        return <LoadingScreen />
    }
    if (error != null) {
        return (
            <MessageView>
                {error}
            </MessageView>
        )
    }

    const handleCancel = () => {
        setImages([])
        setFormStarted(false)
        navigation.popTo("Camera", {})
    }

    return (
        <View style={{ height: "100%" }}>
            <FlatList
                data={issues}
                style={{ margin: spacing.sm }}
                contentContainerStyle={{ gap: spacing.sm }}
                keyExtractor={(item, index) => index.toString()}
                refreshControl={<RefreshControl
                    refreshing={refreshing}
                    onRefresh={refetch} />}
                renderItem={({ item, index }) => (
                    <View style={styles.container}>
                        <IssueCard issue={item}
                            onPress={() => navigation.navigate('Issue Details', { issue: item })}
                            animated={false} />
                        <IconButton style={styles.button}
                            onPress={() => navigation.navigate('Issue Details', { issue: item })}>
                            <RightArrowIcon size={typography.sizeXxl} color={colors.textPrimary} />
                        </IconButton>
                    </View>
                )}
            />
            <View style={styles.buttonRow}>

                <Button onPress={handleCancel}
                    style={{ ...styles.submitButton, backgroundColor: palette.ckRed }}
                    text="Cancel">
                </Button>

                <Button onPress={() => navigation.replace('Report An Issue', {})}
                    style={styles.submitButton}
                    text="Continue">
                </Button>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: colors.backgroundSecondary,
        borderRadius: borderRadius.lg,
    },
    button: {
        backgroundColor: colors.backgroundSecondary,
    },
    buttonRow: {
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        position: "absolute",
        bottom: spacing.lg,
    },
    submitButton: {
        fontSize: typography.sizeXxl,
        fontWeight: typography.weightBold,
        width: size.longButton,

        ...globalStyles.shadow
    },
})