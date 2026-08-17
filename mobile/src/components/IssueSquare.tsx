// mobile/src/components/IssueSquare.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GetNearbyIssueResponse } from '@civickit/shared'
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    Animated,
    GestureResponderEvent,
} from 'react-native';
import { globalStyles } from '../styles';
import { borderRadius, colors, size, spacing, typography } from '../styles';
import { BrokenIcon, ExclamationPointIcon, LightBulbIcon, LocationPinIcon, RoadIcon, SprayPaintIcon, TrafficConeIcon, TrafficLightIcon, TrashIcon, UpvoteIcon } from './Icons';
import { statusColors } from '../styles/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { issuesApi } from '../api';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../types/StackParams';

interface IssueCardProps {
    issue: GetNearbyIssueResponse;
    variant?: 'compact' | 'expanded';
    onPress?: null | (() => void);
    style?: any;
    animated?: boolean
}

export default function IssueSquare({ issue, variant = 'compact', onPress = null, style, animated = true }: IssueCardProps) {
    const scale = useRef(new Animated.Value(1)).current;
    const [icon, setIcon] = useState(<ExclamationPointIcon size={typography.sizeLg} color={colors.textPrimary} style={{ marginRight: spacing.xs }} />)
    const navigation = useNavigation<StackNavigationProp<StackParams>>();

    const [localIssue, setLocalIssue] = useState(issue)
    useFocusEffect(
        useCallback(() => {
            const getIssue = async () => {
                //get updates to issue
                if (issue) {
                    setLocalIssue({ ...(await issuesApi.getIssueById(issue.id)), distance: issue?.distance })
                }

            }
            getIssue()
        }, [])
    )

    useEffect(() => {
        if (localIssue.category == "POTHOLE") {
            setIcon(<TrafficConeIcon size={typography.sizeXl} color={colors.textPrimary}
                style={styles.icon} />)
        } else if (localIssue.category == "STREETLIGHT") {
            setIcon(<LightBulbIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        } else if (localIssue.category == "GRAFFITI") {
            setIcon(<SprayPaintIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        } else if (localIssue.category == "ILLEGAL_DUMPING") {
            setIcon(<TrashIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        } else if (localIssue.category == "BROKEN_SIDEWALK") {
            setIcon(<BrokenIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        } else if (localIssue.category == "TRAFFIC_SIGNAL") {
            setIcon(<TrafficLightIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        } else {
            setIcon(<ExclamationPointIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        }
    }, [localIssue])

    const handlePressIn = (event: GestureResponderEvent) => {
        if (animated) {
            Animated.spring(scale, {
                toValue: 0.97,
                useNativeDriver: true,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (animated) {
            Animated.spring(scale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
            }).start();
        }

    };

    const statusColor =
        statusColors[localIssue.status.toLowerCase()] || statusColors.default;

    const styles = StyleSheet.create({
        pressable: {
            flexDirection: 'column',
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
            height: size.cardExpanded,
            width: 100,
            padding: spacing.sm,
            borderRadius: borderRadius.lg

        },
        thumbnail: {
            width: size.cardCompact,
            height: size.cardCompact,
            borderRadius: borderRadius.lg,
            borderWidth: 4,
            borderColor: statusColor.background,

        },
        icon: {
            paddingLeft: spacing.xs,
            paddingTop: spacing.xs,
            borderColor: statusColor.background,
            backgroundColor: statusColor.background,
            borderTopLeftRadius: borderRadius.lg,
            borderBottomRightRadius: borderRadius.md,
            borderWidth: 4,
            position: "absolute",
            top: 0,
        },
        distance: {
            ...globalStyles.bodyText,
            color: colors.textPrimary,
            fontWeight: typography.weightMedium,
            marginTop: spacing.xs
        },
        upvotes: {
            flexDirection: 'row',
            position: "absolute",
            bottom: 0,
            right: 0,
            alignItems: 'center',
            paddingRight: spacing.xs,
            borderWidth: 4,
            borderColor: statusColor.background,
            backgroundColor: statusColor.background,
            borderTopLeftRadius: borderRadius.md,
            borderBottomRightRadius: borderRadius.lg,
        },
        upvoteText: {
            color: colors.textPrimary,
            fontSize: typography.sizeSm,
            fontWeight: typography.weightMedium,
        },

    });


    // console.log(onPress)
    return (
        <Animated.View
            style={[
                { transform: [{ scale }] },
                style
            ]}
        >
            <Pressable
                onPress={onPress ? onPress : () => {
                    navigation.navigate("Issue Details", { issue: localIssue })
                }}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.pressable}
            >
                <View>
                    {(localIssue.images?.length > 0 && localIssue.images[0] != null) && (
                        <Image
                            source={{ uri: localIssue.images[0].link }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                    )}
                    {icon}
                    <View style={styles.upvotes}>
                        <UpvoteIcon color={colors.textPrimary} size={typography.sizeLg} />
                        <Text style={styles.upvoteText}>
                            {localIssue.upvoteCount}
                        </Text>
                    </View>
                </View>

                {localIssue.distance !== undefined && (
                    <Text style={styles.distance}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {localIssue.title}
                    </Text>
                )}


            </Pressable>
        </Animated.View>
    );
};



