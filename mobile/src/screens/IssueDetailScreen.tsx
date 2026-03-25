// mobile/src/screens/IssueDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { Platform, Text, ScrollView, FlatList, Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { GetNearbyIssueResponse, Issue } from '@civickit/shared';
import { format, formatDistanceToNow } from 'date-fns';
import { CategoryIcon, ClockIcon, LocationPinIcon, TagIcon, WrenchIcon } from '../components/Icons';
import { borderRadius, colors, palette, size, spacing, typography } from '../styles';
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
            <Text style={styles.countValue}>{issue.upvoteCount ?? 0}</Text>
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
              Neighborhood / Location
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Tags */}
          <View style={styles.infoRow}>
            <TagIcon color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon} />
            <Text style={styles.infoRowText}>
              Tags
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

      {/* Bottom Action Button */}
      <TouchableOpacity style={styles.endorseButton} >
        <Text style={styles.endorseText}>Endorse</Text>
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
    textTransform: 'capitalize'
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
  },

  endorseText: {
    fontSize: typography.sizeXl,
    fontWeight: 'bold',
    color: palette.ckDark,
  }
},);
