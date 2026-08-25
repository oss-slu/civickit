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
import { BrokenIcon, DefaultCategoryIcon, ExclamationPointIcon, LightBulbIcon, LocationPinIcon, RoadIcon, SprayPaintIcon, TrafficConeIcon, TrafficLightIcon, TrashIcon, UpvoteIcon } from './Icons';
import { palette, statusColors } from '../styles/theme';
import StatusBadge from './StatusBadge';
import CategoryIcon from './CategoryIcon';

interface IssueCardProps {
  issue: GetNearbyIssueResponse;
  variant?: 'compact' | 'expanded';
  onPress?: () => void;
  style?: any;
  animated?: boolean
}

export default function IssueCard({ issue, variant = 'compact', onPress, style, animated = true }: IssueCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

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
        isExpanded && { height: size.cardExpanded },// : { height: size.cardCompact },
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
        {issue.photos?.[0] &&
          <Image
            source={{ uri: issue.photos[0].url }}
            style={isExpanded ? { ...styles.thumbnail } : { ...styles.thumbnail, width: size.xxl, height: size.xxl }}
            resizeMode="cover"
          />
        }

        {/* Content */}
        <View style={styles.content}>
          {/* Title + Category */}
          <View style={styles.row}>
            <CategoryIcon category={issue.category} />
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
                  {parseFloat(issue.distance).toFixed(1)} meters away
                </Text>
              )}
            </>
          )}

          {/* Footer row */}
          <View style={styles.footer}>

            <View style={{ flexDirection: "row", alignItems: "center", columnGap: spacing.xs }}>
              {/* Status badge */}
              <StatusBadge status={issue.status} />
              {/* Org that claimed issue */}
              {issue.claimedById &&
                issue.claimedByOrg?.profilePhoto &&
                <Image source={{ uri: issue.claimedByOrg.profilePhoto.url }} style={styles.orgProfilePic} />

              }
            </View>

            <View style={{ flexDirection: "row", columnGap: spacing.xs }}>
              {!isExpanded && (
                <>
                  {issue.distance !== undefined && (
                    <Text style={{ ...styles.distance, textAlign: "left" }}>
                      {parseFloat(issue.distance).toFixed(1)} m away
                    </Text>
                  )}
                </>
              )}
              {/* Upvotes */}
              <View style={styles.upvotes}>
                <UpvoteIcon color={colors.textPrimary} size={typography.sizeLg} />
                <Text style={styles.upvoteText}>
                  {issue.upvoteCount}
                </Text>
              </View>

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

  orgProfilePic: {
    width: size.lg,
    height: size.lg,
    borderRadius: borderRadius.full
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.md
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
    flexWrap: "wrap"
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
