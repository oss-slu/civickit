// mobile/src/components/IssueCard.tsx
/*
 * Compact: 80px height, show only title + icon + upvotes
 * Expanded: 120px height, add description preview + distance
 * Category icons: Use emoji for MVP (we'll add icon library later)
 */

import React, { useRef } from 'react';
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
import Entypo from '@expo/vector-icons/Entypo';

interface IssueCardProps {
  issue: GetNearbyIssueResponse;
  variant?: 'compact' | 'expanded';
  onPress?: () => void;
}

// categories-emoji (MVP)
const categoryIcons: Record<string, string> = {
  pothole: '🕳️',
  streetlight: '💡',
  graffiti: '🎨',
  trash: '🗑️',
  water: '💧',
  default: '📍',
};

const statusColors: Record<string, string> = {
  reported: colors.statusReported,
  resolved: colors.statusResolved,
  default: colors.background,
};

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  variant = 'compact',
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  console.log("ISSUE", issue)

  const handlePressIn = (event: GestureResponderEvent) => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const icon = categoryIcons[issue.category] || categoryIcons.default;
  const statusColor =
    statusColors[issue.status.toLowerCase()] || statusColors.default;

  const isExpanded = variant === 'expanded';

  return (
    <Animated.View
      style={[
        globalStyles.card,
        isExpanded ? { height: size.cardExpanded } : { height: size.cardCompact },
        { transform: [{ scale }] },
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
            <Entypo name="location-pin" size={typography.sizeLg} color={colors.textPrimary} />
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
                backgroundColor: statusColor,
              }}
            >
              <Text style={styles.statusText}>
                {issue.status}
              </Text>
            </View>

            {/* Upvotes */}
            <View style={styles.upvotes}>
              <Text style={styles.upvoteText}>
                ⬆ {issue.upvoteCount}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default IssueCard;

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
    borderRadius: borderRadius.lg,
  },
  statusText: {
    fontSize: typography.sizeMd,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
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
