// mobile/src/screens/Misc/IssueDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { Platform, Text, ScrollView, FlatList, Image, StyleSheet, View, TouchableOpacity, useWindowDimensions, useAnimatedValue } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { GetNearbyIssueResponse, Issue } from '@civickit/shared';
import { format, formatDistanceToNow } from 'date-fns';
import { DefaultCategoryIcon, CheckMarkCircleIcon, CheckMarkIcon, ClockIcon, LocationPinIcon, TagIcon, UpvoteIcon, WrenchIcon, TextIcon } from '../../components/Icons';
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from '../../styles';
import { PROVIDER_GOOGLE } from 'react-native-maps/lib/ProviderConstants';
import { issuesApi } from '../../api';
import Pin from '../../components/Pin';
import { showLocation } from 'react-native-map-link';
import Header from '../../components/Header';
import { Animated } from 'react-native';
import StatusBadge from '../../components/StatusBadge';
import CategoryIcon from '../../components/CategoryIcon';

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

  const [headerOffset, setHeaderOffset] = useState(0)
  const { issue } = route.params;
  const { width } = useWindowDimensions();
  const imageWidth = width - spacing.md * 2;
  const imageHeight = imageWidth * 1.25;

  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount ?? 0);
  const [timelineEntries, setTimelineEntries] = useState([])
  const [loading, setLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const navigation = useNavigation();

  const resolvedAddress = issue.address || 'No address available';
  const formatSource = (source?: string) => source === 'exif' ? 'Photo metadata' : 'Device GPS';

  //header collapse
  const [lineNum, setLineNum] = useState(4)

  const modifyHeader = ({ contentOffset }: any) => {
    if (contentOffset.y > 0) {
      setLineNum(1)
    } else if (contentOffset.y == 0) {
      setLineNum(4)
    }
  }


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

    // setTimelineEntries(issuesApi.)

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
    <View style={{ ...styles.page, }}>
      <ScrollView contentContainerStyle={{ ...styles.container, paddingTop: headerOffset + spacing.xxl * (25 / headerOffset), rowGap: spacing.sm }}
        onScroll={(e) => modifyHeader(e.nativeEvent)}>

        {/* Image Caption/at a glance info */}
        <View style={styles.imageCaption}>

          <View style={{ flexDirection: "row", columnGap: spacing.sm }}>

            <StatusBadge status={issue.status} style={{ paddingHorizontal: spacing.md }} textStyle={{ fontSize: typography.sizeLg }} />

            <View style={styles.infoElement}>
              <CategoryIcon
                category={issue.category}
                size={typography.sizeXl}
              />
              <Text style={styles.catValue}>
                {category}
              </Text>
            </View>
          </View>


          <View style={styles.infoElement}>
            <UpvoteIcon color={colors.textPrimary} size={typography.sizeXl} />
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

        {/* Description */}
        <View style={{ ...styles.infoBlock, flexDirection: "row", columnGap: spacing.sm }}>
          <TextIcon color={colors.textPrimary}
            size={typography.sizeLg}
            style={{ ...styles.icon, marginTop: spacing.xs }} />
          {/* <Text style={styles.infoRowLabel}>Description</Text> */}
          <Text style={styles.infoRowText}>{issue.description}</Text>
        </View>

        {/* Location */}
        <View style={styles.infoBlock}>

          <TouchableOpacity onPress={() => showLocation({
            latitude: issue.latitude,
            longitude: issue.longitude,
            googleForceLatLon: true
          })}
          >
            <View style={{ flexDirection: "row", columnGap: spacing.xs }}>
              <LocationPinIcon color={colors.textPrimary}
                size={typography.sizeLg}
                style={{ ...styles.icon, marginTop: spacing.xs }} />
              <Text style={{ ...styles.infoRowText, textDecorationLine: 'underline' }}>
                {resolvedAddress}
              </Text>
            </View>

            <Text style={styles.infoRowMeta}>Source: {formatSource(issue.locationSource)}</Text>
          </TouchableOpacity>

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


        </View>



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

      <Header title={issue.title}
        onBackPress={navigation.goBack}
        lineNum={lineNum}
        setOffset={(i: any) => setHeaderOffset(i)} />

      {/* Upvote / Endorse Button */}
      <TouchableOpacity style={{ ...styles.endorseButton, backgroundColor: hasEndorsed ? palette.ckGreen : palette.ckRed }} onPress={handleEndorse}>
        {hasEndorsed ?
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <Text style={styles.endorseText}>Endorsed</Text>
            <CheckMarkIcon color={colors.textPrimary} size={typography.sizeXl} />
          </View> :
          <Text style={styles.endorseText}>Endorse</Text>
        }

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
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },

  infoElement: {
    backgroundColor: palette.ckLightGray,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    flexDirection: "row",
    columnGap: spacing.sm,
    height: "100%"
  },

  countValue: {
    fontSize: typography.sizeXl,
    fontWeight: 'bold',
  },

  catValue: {
    fontSize: typography.sizeLg,
    color: colors.textPrimary,
    fontWeight: typography.weightMedium
  },

  infoCard: {
    backgroundColor: palette.ckLightGray,
    borderRadius: borderRadius.ml,
    padding: spacing.sd,
  },

  infoRowText: {
    fontSize: typography.sizeLg,
    color: colors.textPrimary,
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

  imageCaption: {
    flexDirection: "row",
    columnGap: spacing.sm,
    alignItems: "center",
    justifyContent: "space-between"
  },

  icon: {
  },

  divider: {
    height: 1,
    backgroundColor: palette.ckDarkGray,
    marginVertical: spacing.xs,
  },

  image: {
    borderRadius: borderRadius.md,
    backgroundColor: palette.ckLightGray,
    resizeMode: 'cover',
  },

  imageGallery: {
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

  infoBlock: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg
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
