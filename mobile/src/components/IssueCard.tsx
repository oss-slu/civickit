// mobile/src/components/IssueCard.tsx
/*
 * Compact: 80px height, show only title + icon + upvotes
 * Expanded: 120px height, add description preview + distance
 */

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

export default function IssueCard({ issue, variant = 'compact', onPress, style, animated = true }: IssueCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [icon, setIcon] = useState(<ExclamationPointIcon size={typography.sizeLg} color={colors.textPrimary} style={{ marginRight: spacing.xs }} />)

  useEffect(() => {
    if (issue.category == "POTHOLE") {
      setIcon(<TrafficConeIcon size={typography.sizeLg} color={colors.textPrimary} />)
    } else if (issue.category == "STREETLIGHT") {
      setIcon(<LightBulbIcon size={typography.sizeLg} color={colors.textPrimary}
        style={{ marginRight: spacing.xs }} />)
    } else if (issue.category == "GRAFFITI") {
      setIcon(<SprayPaintIcon size={typography.sizeXl} color={colors.textPrimary} />)
    } else if (issue.category == "ILLEGAL_DUMPING") {
      setIcon(<TrashIcon size={typography.sizeLg} color={colors.textPrimary}
        style={{ marginRight: spacing.xs }} />)
    } else if (issue.category == "BROKEN_SIDEWALK") {
      setIcon(<BrokenIcon size={typography.sizeLg} color={colors.textPrimary}
        style={{ marginRight: spacing.xs }} />)
    } else if (issue.category == "TRAFFIC_SIGNAL") {
      setIcon(<TrafficLightIcon size={typography.sizeLg} color={colors.textPrimary}
        style={{ marginRight: spacing.xs }} />)
    } else {
      setIcon(<ExclamationPointIcon size={typography.sizeLg} color={colors.textPrimary} style={{ marginRight: spacing.xs }} />)
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

  const isExpanded = variant === 'expanded';

  return (
    <Animated.View
      style={[
        globalStyles.card,
        isExpanded ? { height: size.cardExpanded } : { height: size.cardCompact },
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
        {/* Thumbnail */}
        {issue.images?.length > 0 && (
          <Image
            source={{ uri: issue.images[0] }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Title + Category */}
          <View style={styles.row}>
            {icon}
            <Text
              style={globalStyles.heading2}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {issue.title}
            </Text>
          </View>

          {/* Expanded details */}
          {isExpanded && (
            <>
              {issue.distance !== undefined && (
                <Text style={styles.distance}>
                  {parseFloat(issue.distance).toFixed(1)} km away
                </Text>
              )}
            </>
          )}

          {/* Footer row */}
          <View style={styles.footer}>
            {/* Status badge */}
            <View
              style={{
                ...styles.statusBadge,
                backgroundColor: statusColor.background
              }}
            >
              <Text style={{ ...styles.statusText, color: statusColor.text }}>
                {issue.status.replace(/_/g, " ")}
              </Text>
            </View>

            {/* Upvotes */}
            <View style={styles.upvotes}>
              <UpvoteIcon color={colors.textPrimary} size={typography.sizeLg} />
              <Text style={styles.upvoteText}>
                {issue.upvoteCount}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};


const styles = StyleSheet.create({
  pressable: {
    flexDirection: 'row',
    flex: 1,
    padding: spacing.sm,
    alignItems: "center"
  },
  thumbnail: {
    ...globalStyles.thumbnail,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    ...globalStyles.bodyText,
    paddingLeft: spacing.sm,
    marginTop: spacing.xs
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.sizeSm,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
    textAlign: "center"
  },
  upvotes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvoteText: {
    color: colors.textPrimary,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightMedium,
  },
});
