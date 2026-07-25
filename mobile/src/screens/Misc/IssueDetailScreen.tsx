// mobile/src/screens/Misc/IssueDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { Platform, Text, ScrollView, FlatList, Image, StyleSheet, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { GetNearbyIssueResponse, Issue } from '@civickit/shared';
import { format, formatDistanceToNow } from 'date-fns';
import { CategoryIcon, ClockIcon, LocationPinIcon, TagIcon, WrenchIcon } from '../../components/Icons';
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from '../../styles';
import { PROVIDER_GOOGLE } from 'react-native-maps/lib/ProviderConstants';
import { issuesApi } from '../../api';
import Pin from '../../components/Pin';
import { showLocation } from 'react-native-map-link';

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
  const { width } = useWindowDimensions();
  const imageWidth = width - spacing.md * 2;
  const imageHeight = imageWidth * 1.25;

  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount ?? 0);
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const navigation = useNavigation();

  const resolvedAddress = issue.address || 'No address available';
  const formatSource = (source?: string) => source === 'exif' ? 'Photo metadata' : 'Device GPS';

  useEffect(() => {
    const controller = new AbortController();

    issuesApi
      .getUpvoteState(issue.id, controller.signal)
      .then((state) => {
        setHasEndorsed(state.upvoted);
        setUpvoteCount(state.upvoteCount);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Failed to fetch upvote state:', err);
      });

    return () => controller.abort();
  }, [issue.id]);


  const handleEndorse = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const state = hasEndorsed
        ? await issuesApi.removeUpvote(issue.id)
        : await issuesApi.addUpvote(issue.id);

      setHasEndorsed(state.upvoted);
      setUpvoteCount(state.upvoteCount);

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

        {/* Image Gallery */}
        <View style={[styles.imageGallery, { width: imageWidth, height: imageHeight }]}>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={issue.images}
            keyExtractor={(_, idx) => idx.toString()}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
              setActiveImageIndex(nextIndex);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={[styles.image, { width: imageWidth, height: imageHeight }]} />
            )}
          />
          {issue.images.length > 1 && (
            <View style={styles.imageDots}>
              {issue.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.imageDot,
                    index === activeImageIndex ? styles.imageDotActive : styles.imageDotInactive
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>

          {/* Date/Time */}
          <View style={styles.infoRow}>
            <ClockIcon color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon} />
            <View style={styles.infoTextColumn}>
              <Text style={styles.infoRowLabel}>Report submitted</Text>
              <Text style={styles.infoRowText}>
                {format(new Date(issue.createdAt), 'PPP p')}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Photo Date/Time */}
          <View style={styles.infoRow}>
            <ClockIcon color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon} />
            <View style={styles.infoTextColumn}>
              <Text style={styles.infoRowLabel}>Photo taken</Text>
              <Text style={styles.infoRowText}>
                {format(new Date(issue.photoTakenAt ?? issue.createdAt), 'PPP p')}
              </Text>
              <Text style={styles.infoRowMeta}>Source: {formatSource(issue.photoTakenAtSource)}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.infoRow}>
            <LocationPinIcon color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon} />
            <View style={styles.infoTextColumn}>
              <TouchableOpacity onPress={() => showLocation({
                latitude: issue.latitude,
                longitude: issue.longitude,
                googleForceLatLon: true
              })}>
                <Text style={styles.infoRowLabel}>Location</Text>
                <Text style={{ ...styles.infoRowText, textDecorationLine: 'underline' }}>
                  {resolvedAddress}
                </Text>

                <Text style={styles.infoRowMeta}>Source: {formatSource(issue.locationSource)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tags */}
          <View style={styles.infoRow}>
            <TagIcon color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon} />
            <View style={styles.infoTextColumn}>
              <Text style={styles.infoRowLabel}>Status</Text>
              <Text style={styles.infoRowText}>
                {issue.status}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Category */}
          <View style={styles.infoRow}>
            <CategoryIcon
              color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon}
            />
            <View style={styles.infoTextColumn}>
              <Text style={styles.infoRowLabel}>Category</Text>
              <Text style={styles.infoRowText}>
                {category}
              </Text>
            </View>
          </View>

        </View>

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

  infoRowLabel: {
    fontSize: typography.sizeSm,
    fontWeight: typography.weightBold,
    color: colors.textPrimary,
  },

  infoRowMeta: {
    fontSize: typography.sizeSm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  infoTextColumn: {
    flex: 1,
    gap: spacing.xs,
  },

  infoRow: {
    flex: 1,
    flexDirection: "row",
    columnGap: spacing.sm,
    paddingVertical: spacing.sm,
  },

  icon: {
    marginTop: spacing.xs
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
    borderRadius: borderRadius.md,
    backgroundColor: palette.ckLightGray,
    resizeMode: 'cover',
  },

  imageGallery: {
    marginBottom: spacing.md,
  },

  imageDots: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  imageDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: borderRadius.full,
  },

  imageDotActive: {
    backgroundColor: colors.textContrast,
    opacity: 0.95,
  },

  imageDotInactive: {
    backgroundColor: colors.textContrast,
    opacity: 0.45,
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
