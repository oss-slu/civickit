// mobile/src/screens/IssueDetailScreen.tsx
import { StaticScreenProps } from '@react-navigation/native';

import React from 'react';
import { Platform, Text, ScrollView, FlatList, Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Issue } from '@civickit/shared';
import { format, formatDistanceToNow } from 'date-fns';
import { ClockIcon, LocationPinIcon, TagIcon, WrenchIcon } from '../components/Icons';
import { colors, size, spacing, typography } from '../styles';

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

type IssueDetailRouteProp = RouteProp<
  { IssueDetails: { issue: Issue } },
  'IssueDetails'
>;

const IssueDetailScreen = () => {
  const route = useRoute<IssueDetailRouteProp>();
  const { issue } = route.params;

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
            <TagIcon
              color={colors.textPrimary}
              size={typography.sizeLg}
              style={styles.icon}
            />
            <Text style={styles.infoRowText}>
              Category
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
            />
          </MapView>
        ) : (
          <Text style={styles.mapFallback}>Map not supported on web</Text>
        )}

        <Text style={styles.time}>
          Reported {formatDistanceToNow(new Date(issue.createdAt))} ago
        </Text>
      </ScrollView>

      {/* Bottom Action Button */}
      <TouchableOpacity style={styles.endorseButton}>
        <Text style={styles.endorseText}>Endorse</Text>
      </TouchableOpacity>
    </View>
  );
}

export default IssueDetailScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },

  container: {
    padding: 16,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  headerIcon: {
    fontSize: 32,
    marginRight: 8,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#d24b57',
    flex: 1,
  },

  countBadge: {
    backgroundColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },

  countLabel: {
    fontSize: 10,
    color: '#555',
  },

  countValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  infoCard: {
    backgroundColor: '#e6e6e6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  infoRowText: {
    fontSize: 16,
    color: '#444',
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
    backgroundColor: '#ccc',
    marginVertical: 4,
  },

  tagRow: {
    flexDirection: 'row',
    marginTop: 8,
  },

  tag: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },

  tagText: {
    color: '#fff',
  },

  image: {
    width: 300,
    height: 200,
    marginRight: 10,
    marginBottom: 16,
    borderRadius: 8,
  },

  description: {
    fontSize: 16,
    marginBottom: 16,
  },

  map: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
  },

  mapFallback: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#888',
  },

  time: {
    marginTop: 10,
    color: '#666',
  },

  endorseButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#d24b57',
    padding: 18,
    borderRadius: 40,
    alignItems: 'center',
  },

  endorseText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  }
},);
