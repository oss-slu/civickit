// mobile/src/components/IssueSquare.tsx

import React, { useEffect, useRef, useState } from 'react';
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

interface IssueCardProps {
    issue: GetNearbyIssueResponse;
    variant?: 'compact' | 'expanded';
    onPress?: () => void;
    style?: any;
    animated?: boolean
}

export default function IssueSquare({ issue, variant = 'compact', onPress, style, animated = true }: IssueCardProps) {
    const scale = useRef(new Animated.Value(1)).current;
    const [icon, setIcon] = useState(<ExclamationPointIcon size={typography.sizeLg} color={colors.textPrimary} style={{ marginRight: spacing.xs }} />)

    useEffect(() => {
        if (issue.category == "POTHOLE") {
            setIcon(<TrafficConeIcon size={typography.sizeXl} color={colors.textPrimary}
                style={styles.icon} />)
        } else if (issue.category == "STREETLIGHT") {
            setIcon(<LightBulbIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        } else if (issue.category == "GRAFFITI") {
            setIcon(<SprayPaintIcon size={typography.sizeLg} color={colors.textPrimary} />)
        } else if (issue.category == "ILLEGAL_DUMPING") {
            setIcon(<TrashIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        } else if (issue.category == "BROKEN_SIDEWALK") {
            setIcon(<BrokenIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        } else if (issue.category == "TRAFFIC_SIGNAL") {
            setIcon(<TrafficLightIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        } else {
            setIcon(<ExclamationPointIcon size={typography.sizeLg} color={colors.textPrimary}
                style={styles.icon} />)
        }
    }, [issue])

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
        statusColors[issue.status.toLowerCase()] || statusColors.default;

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
    return (
        <Animated.View
            style={[
                { transform: [{ scale }] },
                style
            ]}
        >
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.pressable}
            >
                <View>
                    {issue.images?.length > 0 && (
                        <Image
                            source={{ uri: issue.images[0] }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                    )}
                    {icon}
                    <View style={styles.upvotes}>
                        <UpvoteIcon color={colors.textPrimary} size={typography.sizeLg} />
                        <Text style={styles.upvoteText}>
                            {issue.upvoteCount}
                        </Text>
                    </View>
                </View>

                {issue.distance !== undefined && (
                    <Text style={styles.distance}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {issue.title}
                    </Text>
                )}


            </Pressable>
        </Animated.View>
    );
};



