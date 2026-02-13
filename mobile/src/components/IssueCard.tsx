// mobile/src/components/IssueCard.tsx
/*
 * Compact: 80px height, show only title + icon + upvotes
 * Expanded: 120px height, add description preview + distance
 * Use consistent spacing (8px, 16px multiples)
 * Category icons: Use emoji for MVP (we'll add icon library later)
 */

// interface IssueCardProps {
//   issue: {
//     id: string;
//     title: string;
//     category: string;
//     status: string;
//     distance?: number;
//     upvoteCount: number;
//     images: string[];
//   };
//   variant?: 'compact' | 'expanded';
//   onPress?: () => void;
// }

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  GestureResponderEvent,
} from 'react-native';

export interface Issue {
  id: string;
  title: string;
  category: string;
  status: string;
  distance?: number;
  upvoteCount: number;
  images: string[];
}

interface IssueCardProps {
  issue: Issue;
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
  reported: '#FACC15', // yellow
  resolved: '#22C55E', // green
  default: '#CBD5E1',
};

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  variant = 'compact',
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

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
    statusColors[issue.status] || statusColors.default;

  const isExpanded = variant === 'expanded';

  return (
    <Animated.View
      style={[
        styles.card,
        isExpanded ? styles.expanded : styles.compact,
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
            <Text style={styles.icon}>{icon}</Text>
            <Text
              style={styles.title}
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
                  {issue.distance.toFixed(1)} km away
                </Text>
              )}
            </>
          )}

          {/* Footer row */}
          <View style={styles.footer}>
            {/* Status badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor },
              ]}
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
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  compact: {
    height: 80,
  },
  expanded: {
    height: 120,
  },
  pressable: {
    flexDirection: 'row',
    flex: 1,
    padding: 12,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  distance: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  upvotes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvoteText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
