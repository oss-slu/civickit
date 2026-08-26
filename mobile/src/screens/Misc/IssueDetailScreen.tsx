// mobile/src/screens/Misc/IssueDetailScreen.tsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Platform, Text, ScrollView, FlatList, Image, StyleSheet, View, TouchableOpacity, useWindowDimensions, useAnimatedValue, TextInput } from 'react-native';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { GetNearbyIssueResponse, Issue } from '@civickit/shared';
import { format, formatDistanceToNow } from 'date-fns';
import { DefaultCategoryIcon, CheckMarkCircleIcon, CheckMarkIcon, ClockIcon, LocationPinIcon, TagIcon, UpvoteIcon, WrenchIcon, TextIcon, CheckMarkDoneIcon } from '../../components/Icons';
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from '../../styles';
import { PROVIDER_GOOGLE } from 'react-native-maps/lib/ProviderConstants';
import { authApi, issuesApi, orgsApi } from '../../api';
import Pin from '../../components/Pin';
import { showLocation } from 'react-native-map-link';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import CategoryIcon from '../../components/CategoryIcon';
import ImageGallery from '../../components/ImageGallery';
import Timeline from '../../components/Timeline';
import { useAuth } from '../../contexts/AuthContext';
import ModalPopUp from '../../components/ModalPopup';
import { StackParams } from '../../types/StackParams';
import { StackNavigationProp } from '@react-navigation/stack';
import UpdatePopup from '../../components/UpdatePopup';
import { formatted } from '../../utils/dbValues';
import UnclaimIssuePopup from '../../components/UnclaimIssuePopup';

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

  //seeded with a sensible default so the first frame is reasonable; Header
  //reports its real height on layout and corrects this
  const [headerOffset, setHeaderOffset] = useState(spacing.xxxl)
  const [issue, setIssue] = useState<Issue | GetNearbyIssueResponse>(route.params.issue);
  const { width } = useWindowDimensions();
  const imageWidth = width - spacing.md * 2;
  const imageHeight = imageWidth * 1.25;
  const { role, organization, user } = useAuth()

  const [hasEndorsed, setHasEndorsed] = useState(false);

  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount ?? 0);
  const [timelineEntries, setTimelineEntries] = useState<any[]>()
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<StackNavigationProp<StackParams>>()

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

  //get upvotes
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

  //get timeline entries when issue changes
  useEffect(() => {
    const getEntries = async () => {
      const timeline = await issuesApi.getTimelineEntries(issue.id)
      setTimelineEntries(timeline.updates)
    }
    getEntries()

  }, [issue]);


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

  const handleClaim = async () => {
    try {
      await issuesApi.claimIssue(issue.id)
      await issuesApi.addTimelineEntry(issue.id, {
        message: organization.name + " claimed this issue",
        status: "ACKNOWLEDGED"
      })
      setIssue(await issuesApi.getIssueById(issue.id))
    } catch (error) {
      console.log(error)
      navigation.push('Error', { errorMessage: 'Issue Claim Failed' });
      throw error;
    }
  }

  const photoUrls = issue.photos.map((photo) => photo.url)

  return (
    <View style={{ ...styles.page, }}>
      <ScrollView contentContainerStyle={{ ...styles.container, paddingTop: headerOffset + spacing.md, rowGap: spacing.sm }}
        onScroll={(e) => modifyHeader(e.nativeEvent)}>

        {/* Image Caption/at a glance info */}
        <View style={styles.imageCaption}>

          <View style={{ flexDirection: "row", columnGap: spacing.sm, rowGap: spacing.sm, width: '80%', flexWrap: 'wrap' }}>

            <StatusBadge status={issue.status} style={{ paddingHorizontal: spacing.md }} textStyle={{ fontSize: typography.sizeLg }} />

            <View style={styles.infoElement}>
              <CategoryIcon
                category={issue.category}
                size={typography.sizeXl}
              />
              <Text style={styles.catValue}>
                {formatted(issue.category)}
              </Text>
            </View>
          </View>


          <View style={styles.infoElement}>
            <UpvoteIcon color={colors.textPrimary} size={typography.sizeXl} />
            <Text style={styles.countValue}>{upvoteCount}</Text>
          </View>

        </View>

        {/* Image Gallery */}
        <ImageGallery
          images={photoUrls}
          height={imageHeight}
          width={imageWidth} />

        {/* Claimed By */}
        {issue.claimedById &&
          <View style={{ ...styles.claimedByContainter }}>
            {issue.claimedByOrg?.profilePhoto &&
              <Image source={{ uri: issue.claimedByOrg.profilePhoto.url }} style={styles.orgProfilePic} />
            }

            <View style={{ paddingLeft: !issue.claimedByOrg?.profilePhoto ? spacing.sm : 0 }}>
              <Text style={styles.claimedByLabel}>Issue Claimed By</Text>
              <View style={{ flexDirection: "row", columnGap: spacing.xs, paddingLeft: !issue.claimedByOrg?.profilePhoto ? spacing.xs : 0 }}>
                <Text style={{ ...styles.claimedByText, fontWeight: typography.weightBold }}>{issue.claimedByUser?.name}</Text>
                <Text style={styles.claimedByText}>with</Text>
                <Text style={{ ...styles.claimedByText, fontWeight: typography.weightBold, }}>{issue.claimedByOrg?.name}</Text>
              </View>
            </View>
          </View>
        }

        {/* Description */}
        <View style={{ ...styles.infoBlock, flexDirection: "row", columnGap: spacing.sm }}>
          <TextIcon color={colors.textPrimary}
            size={typography.sizeLg}
            style={{ marginTop: spacing.xs }} />
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
                style={{ marginTop: spacing.xs }} />
              <Text style={{ ...styles.infoRowText, textDecorationLine: 'underline' }}>
                {resolvedAddress}
              </Text>
            </View>

            <Text style={styles.infoRowMeta}>Source: {formatSource(issue.locationSource)}</Text>
          </TouchableOpacity>

        </View>

        <Timeline entries={timelineEntries} issueCategory={issue.category} />

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

        {((role == "ORG_ADMIN" || role == "ORG_MEMBER") &&
          (issue.claimedById != null && issue.claimedByOrg?.id == organization.id)) &&

          <UnclaimIssuePopup
            issue={issue}
            setIssue={setIssue} />
        }


      </ScrollView>

      <Header title={issue.title}
        onBackPress={navigation.goBack}
        lineNum={lineNum}
        setOffset={(i: any) => setHeaderOffset(i)} />

      {/*TODO: add check for service area/*}
      {/* Endorse / Claim / Update Button */}
      {((role != "ORG_ADMIN" && role != "ORG_MEMBER") || //user is a reporter
        (issue.claimedById != null && issue.claimedByOrg?.id != organization.id) || //issue claimed by a different org
        !organization.categoryScope.includes(issue.category)) ? //issue is not a category this org serves

        <TouchableOpacity style={{ ...globalStyles.longButton, ...globalStyles.shadow, backgroundColor: hasEndorsed ? palette.ckGreen : palette.ckRed, bottom: spacing.ml, marginHorizontal: spacing.ml }} onPress={handleEndorse}>
          {hasEndorsed ?
            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
              <Text style={globalStyles.longButtonText}>Endorsed</Text>
              <CheckMarkIcon color={colors.textContrast} size={typography.sizeXl} />
            </View> :
            <Text style={globalStyles.longButtonText}>Endorse</Text>
          }
        </TouchableOpacity>
        :
        //responder
        ((issue.claimedById != null && issue.claimedByUser?.id == user!.id || //user claimed this issue
          (issue.claimedById != null && organization.id == issue.claimedByOrg?.id))) ?  //user's org claimed this issue

          <View style={styles.buttonBar}>
            <TouchableOpacity style={{ ...styles.littleEndorseButton, backgroundColor: hasEndorsed ? palette.ckGreen : palette.ckRed }} onPress={handleEndorse}>
              {hasEndorsed ?
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                  <CheckMarkIcon color={colors.textContrast} size={typography.sizeXl} />
                </View> :
                <CheckMarkIcon color={colors.textContrast} size={typography.sizeXl} />
              }
            </TouchableOpacity>


            <UpdatePopup issue={issue} setIssue={setIssue} />

          </View> :

          <View style={styles.buttonBar}>
            <TouchableOpacity style={{ ...styles.littleEndorseButton, backgroundColor: hasEndorsed ? palette.ckGreen : palette.ckRed }} onPress={handleEndorse}>
              {hasEndorsed ?
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                  <CheckMarkIcon color={colors.textContrast} size={typography.sizeXl} />
                </View> :
                <CheckMarkIcon color={colors.textContrast} size={typography.sizeXl} />
              }
            </TouchableOpacity>
            <TouchableOpacity style={{ ...globalStyles.longButton, ...globalStyles.shadow, backgroundColor: palette.ckRed }} onPress={handleClaim}>
              <Text style={globalStyles.longButtonText}>Claim</Text>
            </TouchableOpacity>
          </View>

      }
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
    alignSelf: 'flex-end',
    flexDirection: "row",
    columnGap: spacing.sm,
    // height: "100%"
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


  infoRowText: {
    fontSize: typography.sizeLg,
    color: colors.textPrimary,
  },

  claimedByText: {
    fontSize: typography.sizeLg,
    color: colors.textPrimary,
  },

  claimedByContainter: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingRight: spacing.md,
    // alignSelf: "flex-start",
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    columnGap: spacing.xs,
    alignItems: "center"

  },

  claimedByLabel: {
    fontSize: typography.sizeSm,
    fontWeight: typography.weightMedium,
    color: colors.textPrimary,
    marginLeft: spacing.xs
  },

  infoRowMeta: {
    fontSize: typography.sizeSm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  imageCaption: {
    flexDirection: "row",
    columnGap: spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
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

  buttonBar: {
    position: 'absolute',
    bottom: spacing.ml,
    paddingHorizontal: spacing.ml,
    flexDirection: "row",
    columnGap: spacing.sm,
    width: "100%",
  },

  littleEndorseButton: {
    padding: spacing.md + 3,
    borderRadius: borderRadius.full,
    flexGrow: 0,
    flexShrink: 0,
    ...globalStyles.shadow
  },

  orgProfilePic: {
    width: size.xl,
    height: size.xl,
    borderRadius: borderRadius.full
  },
},);
