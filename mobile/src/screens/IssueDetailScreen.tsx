// mobile/src/screens/IssueDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { Platform, Text, ScrollView, FlatList, Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { GetNearbyIssueResponse, Issue } from '@civickit/shared';
import { format, formatDistanceToNow } from 'date-fns';
import { CategoryIcon, ClockIcon, LocationPinIcon, TagIcon, WrenchIcon } from '../components/Icons';
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from '../styles';
import { useAuth } from '../contexts/AuthContext';
import { PROVIDER_GOOGLE } from 'react-native-maps/lib/ProviderConstants';
import { useResolvedAddress, LocationSource } from '../hooks/useResolvedAddress';
import ENV from '../config/env';
import Pin from '../components/Pin';

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

type IssueDetailRouteProp = RouteProp<
  { IssueDetails: { issue: Issue | GetNearbyIssueResponse } },
  'IssueDetails'
>;

const IssueDetailScreen = () => {
  const route = useRoute<IssueDetailRouteProp>();
  const { issue } = route.params;

  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount ?? 0);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const { authToken } = useAuth();

  const locationSources: LocationSource[] = [
    // Future: unshift an EXIF source here when image EXIF extraction is implemented
    // e.g. { latitude: exifCoords.lat, longitude: exifCoords.lng, priority: 'exif' }
    { latitude: issue.latitude, longitude: issue.longitude, priority: 'gps' },
  ];
  const resolvedAddress = useResolvedAddress(locationSources);

  useEffect(() => {
    const fetchUpvoteState = async () => {
      try {
        const res = await fetch(
          `${ENV.apiUrl}/issues/${issue.id}/upvote`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const data = await res.json();

        setHasEndorsed(data.upvoted);
        setUpvoteCount(data.upvoteCount);
      } catch (err) {
        console.error("Failed to fetch upvote state:", err);
      }
    };

    fetchUpvoteState();
  }, []);


  const handleEndorse = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const method = hasEndorsed ? 'DELETE' : 'POST';

      const res = await fetch(
        `${ENV.apiUrl}/issues/${issue.id}/upvote`,
        {
          method,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await res.json();

      setHasEndorsed(data.upvoted);
      setUpvoteCount(data.upvoteCount);

    } catch (err) {
      console.error('Endorse failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const [category, setCategory] = useState<String>(issue.category.replace(/_/g, " ").toLowerCase())

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <WrenchIcon color={colors.textPrimary} size={size.xl}
            style={{ marginRight: spacing.xs }} />
          <Text style={styles.headerTitle}>{issue.title}</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countLabel}>count</Text>
            <Text style={styles.countValue}>{upvoteCount}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>

          {/* Date/Time */}
          <View style={styles.infoRow}>
            <ClockIcon color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon} />
            <Text style={styles.infoRowText}>
              {format(new Date(issue.createdAt), 'PPP p')}
            </Text>
          </View>
          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.infoRow}>
            <LocationPinIcon color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon} />
            <Text style={styles.infoRowText}>
              {resolvedAddress}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Tags */}
          <View style={styles.infoRow}>
            <TagIcon color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon} />
            <Text style={styles.infoRowText}>
              {issue.status}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Category */}
          <View style={styles.infoRow}>
            <CategoryIcon
              color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon}
            />
            <Text style={styles.infoRowText}>
              {category}
            </Text>
          </View>

        </View>

        {/* Image Gallery */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={issue.images}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.image} />
          )}
        />

        {/* Description */}
        <Text style={styles.description}>{issue.description}</Text>

        {/* Map */}
        {Platform.OS !== 'web' && MapView && Marker ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: issue.latitude,
              longitude: issue.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: issue.latitude,
                longitude: issue.longitude,
              }}
            >

              <Pin issue={issue} />
            </Marker>
          </MapView>
        ) : (
          <Text style={styles.mapFallback}>Map not supported on web</Text>
        )}

        <Text style={styles.time}>
          Reported {formatDistanceToNow(new Date(issue.createdAt))} ago
        </Text>
      </ScrollView>

      {/* Upvote / Endorse Button */}
      <TouchableOpacity style={styles.endorseButton} onPress={handleEndorse}>
        <Text style={styles.endorseText}>{hasEndorsed ? 'Endorsed ✓' : 'Endorse'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default IssueDetailScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.ckLight,
  },

  container: {
    padding: spacing.md,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  headerIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },

  headerTitle: {
    fontSize: typography.sizeXxl,
    fontWeight: 'bold',
    color: palette.ckRed,
    flex: 1,
  },

  countBadge: {
    backgroundColor: palette.ckLightGray,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },

  countLabel: {
    fontSize: typography.sizeXs,
    color: colors.textPrimary,
  },

  countValue: {
    fontSize: typography.sizeXl,
    fontWeight: 'bold',
  },

  infoCard: {
    backgroundColor: palette.ckLightGray,
    borderRadius: borderRadius.ml,
    padding: spacing.sd,
    marginBottom: spacing.md,
  },

  infoRowText: {
    fontSize: typography.sizeLg,
    color: colors.textSecondary,
    //textTransform: 'capitalize' causes region to lowercase, and Pm to act weird, need to fix categories without doing this line because now tags is all lowercase
  },

  infoRow: {
    flex: 1,
    flexDirection: "row",
    columnGap: spacing.sm,
    paddingVertical: spacing.sm,
  },

  icon: {
    alignSelf: "center"
  },

  divider: {
    height: 1,
    backgroundColor: palette.ckDarkGray,
    marginVertical: spacing.xs,
  },

  tagRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },

  tag: {
    backgroundColor: palette.ckDark,
    paddingHorizontal: spacing.sd,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },

  tagText: {
    color: palette.ckLight,
  },

  image: {
    width: 300,
    height: 200,
    marginRight: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },

  description: {
    fontSize: typography.sizeLg,
    marginBottom: spacing.md,
  },

  map: {
    height: 220,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  mapFallback: {
    textAlign: 'center',
    marginVertical: spacing.ml,
    color: palette.ckMediumGray,
  },

  time: {
    marginTop: spacing.sm,
    color: palette.ckDarkGray,
  },

  endorseButton: {
    position: 'absolute',
    bottom: spacing.ml,
    left: spacing.ml,
    right: spacing.ml,
    backgroundColor: palette.ckRed,
    padding: spacing.md,
    borderRadius: 40,
    alignItems: 'center',
    ...globalStyles.shadow
  },

  endorseText: {
    fontSize: typography.sizeXl,
    fontWeight: 'bold',
    color: palette.ckDark,
  }
},);
