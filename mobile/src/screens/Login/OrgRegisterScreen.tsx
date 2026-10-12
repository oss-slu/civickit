import { View, Text, Image, KeyboardAvoidingView, ScrollView, Platform, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import LoginScreen from "./LoginScreen";
import * as ImagePicker from 'expo-image-picker';
import LoginForm from "../../components/LoginForm";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from "../../styles";
import RegisterForm from "../../components/RegisterForm";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../../types/StackParams";
import ModalDropdown from "../../components/ModalDropdown";
import { CaretDownIcon, CloseXIcon, FilterIcon, PictureIcon, UploadIcon } from "../../components/Icons";
import ModalPopUp from "../../components/ModalPopup";
import CheckList from "../../components/CheckList";
import { IssueCategoryArray } from "../../types/IssueCategoryArray";
import Button from "../../components/Button";
import WrapperButton from "../../components/WrapperButton";
import { extractPhotoMetadataFromExif, IssueCategory, OrgStatus, OrgTier, OrgType, resolvePhotoTakenAt } from "@civickit/shared";
import * as DocumentPicker from 'expo-document-picker';
import { Paths, File } from "expo-file-system";
import { uploadPhotos } from "../../services/cloudinaryService";
import { orgsApi } from "../../api";

export default function OrgRegisterScreen({ logoutOnBack = true }) {
    const [hasAnAccount, setHasAnAccount] = useState(true)
    const { isLoggedIn, setRegisteringOrg, logout, user, role } = useAuth()
    const [cancelOnBack, SetCancelOnBack] = useState(true)
    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    const [canSubmit, setCanSubmit] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const [name, setName] = useState('');
    const [type, setType] = useState<OrgType | null>();
    const [tier, setTier] = useState<OrgTier>("FULLSCALE");
    const [profileImage, setProfileImage] = useState<null | string>(null)
    const [profileMetadata, setProfileMetadata] = useState<any>()
    const [shape, setShape] = useState<any>(null)
    const [filename, setFilename] = useState('')
    // const [geojson, setGeoJson] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    const orgTypeDisplay = ["Ward Office",
        "Community Improvement District",
        "Business Improvement District",
        "Special Business District",
        "Community Development Corporation",
        "Nonprofit",
        "City Department",
        "Other"
    ]

    const orgTypeOptions = new Map<string, OrgType>()
    orgTypeOptions.set("Ward Office", "WARD_OFFICE")
    orgTypeOptions.set("Community Improvement District", "CID")
    orgTypeOptions.set("Business Improvement District", "BID")
    orgTypeOptions.set("Special Business District", "SBD")
    orgTypeOptions.set("Community Development Corporation", "CDC")
    orgTypeOptions.set("Nonprofit", "NONPROFIT")
    orgTypeOptions.set("City Department", "CITY_DEPARTMENT")
    orgTypeOptions.set("Other", "OTHER")


    const orgTierOptions = ["Starter",
        "Growth",
        "Fullscale"
    ]
    const [nameError, setNameError] = useState('');
    const { authToken, refresh } = useAuth()

    useEffect(() => {
        if (isLoggedIn) {
            SetCancelOnBack(false)
        } else {
            SetCancelOnBack(true)
        }
    }, [isLoggedIn])

    const pickImage = async () => {
        const results = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            exif: true,
            allowsMultipleSelection: true,
            selectionLimit: 1
        })
        if (!results.canceled) {
            const resultList = results.assets.map(r => r.uri)
            // Dimensions come from the asset, which already has orientation
            // applied. EXIF only supplies GPS and capture time.
            const metadataList = results.assets.map(asset => ({
                ...extractPhotoMetadataFromExif(asset.exif),
                width: asset.width,
                height: asset.height,
            }))
            setProfileMetadata(metadataList[0]);
            setProfileImage(resultList[0]);
        }
    }


    const clearImage = () => {
        setProfileImage('')
        setProfileMetadata(null)
    }

    const clearShape = () => {
        setFilename('')
        setShape('')
    }

    const handleSlug = (name: string) => {
        let slug = name.toLowerCase()
            .replace(" ", "-")
            .replace("_", "-")

        for (let i = 0; i < slug.length; i++) {
            let code = slug.charCodeAt(i)
            if (!(code > 47 && code < 58) &&
                !(code > 64 && code < 91) &&
                !(code > 96 && code < 123) &&
                (code != 45)) {
                slug = slug.substring(0, i) + slug.substring(i + 1)
            }
        }
        return slug
    }

    const pickGeoJSON = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                multiple: false,
                type: 'application/*',
            })
            if (!result.canceled) {
                const { uri, name } = result.assets[0];
                const file = new File(uri);
                const geojson = JSON.parse(file.textSync())
                setFilename(name)
                let newShape = "MULTIPOLYGON ("
                for (let i = 0; i < geojson.features.length; i++) {
                    if (i > 0) {
                        newShape += ", "
                    }
                    newShape += "("
                    for (let j = 0; j < geojson.features[i].geometry.coordinates.length; j++) {
                        if (j > 0) {
                            newShape += ", "
                        }
                        newShape += "("
                        for (let k = 0; k < geojson.features[i].geometry.coordinates[j].length; k++) {
                            if (k > 0) {
                                newShape += ", "
                            }
                            newShape += geojson.features[i].geometry.coordinates[j][k][0] + " " + geojson.features[i].geometry.coordinates[j][k][1]
                        }
                        newShape += ")"
                    }
                    newShape += ")"
                }
                newShape += ")"

                setShape(newShape)
            }
        } catch (e) {
            console.log(e)
        }
    }

    const submit = async () => {
        try {
            if (!authToken) {
                setIsLoading(false)
                navigation.push('Error', { errorMessage: 'Not authenticated' });
                throw new Error('No auth token available');
            }
            setIsLoading(true)

            let photo;
            const fallbackTakenAt = new Date().toISOString();
            //upload profile picture
            if (profileImage) {
                try {
                    photo = await uploadPhotos([{
                        uri: profileImage,
                        ...resolvePhotoTakenAt(profileMetadata ?? {}, fallbackTakenAt),
                    }])
                } catch (e) {
                    setIsLoading(false);
                    navigation.push('Error', { errorMessage: 'Image upload to Cloudinary failed' });
                    throw e;
                }
            }

            const status: OrgStatus = "ACTIVE"
            const cats: IssueCategory[] = selectedCategories.map((cat) => {
                const newCat: IssueCategory = cat.replace(" ", "_").toUpperCase() as IssueCategory
                return newCat
            })
            if (type) {
                const requestBody = {
                    name,
                    slug: handleSlug(name),
                    type: orgTypeOptions.get(type)!,
                    tier,
                    status,
                    categoryScope: cats,
                    geofence: shape,
                }

                let org;
                try {
                    if (photo) {
                        org = await orgsApi.createOrg({ ...requestBody, profilePhoto: photo[0] });
                    } else {
                        org = await orgsApi.createOrg(requestBody);
                    }


                } catch (submitError) {
                    setIsLoading(false);
                    navigation.push('Error', { errorMessage: 'Upload Failed' });
                    throw submitError;
                }
                setIsLoading(false);
                refresh()
                setRegisteringOrg(false)
            }


        } catch (e) {
            console.log(e)
        }
    }

    return (
        <ScrollView
            contentContainerStyle={[styles.container, { paddingTop: spacing.xxxl }]}
            style={{ paddingBottom: spacing.xxxl, backgroundColor: colors.background }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}>
            <Header
                style={{ paddingTop: spacing.lg }}
                onBackPress={() => {
                    if (logoutOnBack) {
                        logout()
                        if (cancelOnBack) {
                            navigation.replace("Login", {})
                            setRegisteringOrg(false)
                        } else {
                            setRegisteringOrg(true)
                        }
                    } else {
                        navigation.goBack()
                    }
                }
                }
            />

            {/* Step 1 */}
            {(!isLoggedIn || (role != "REPORTER")) && <View style={{ rowGap: spacing.lg }}>
                <View>
                    {/* <Text style={styles.subheading}>Step 1</Text> */}
                    <Text style={styles.heading}>Do you already have an Reporter (free) account?</Text>
                </View>

                <View>
                    <View style={styles.toggle}>
                        <TouchableOpacity
                            style={{ ...styles.toggleOption, backgroundColor: hasAnAccount ? palette.ckLightGreen : palette.ckLightGray }}
                            onPress={() => setHasAnAccount(true)}>
                            <Text
                                style={styles.toggleOptionText}>Yes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ ...styles.toggleOption, backgroundColor: hasAnAccount ? palette.ckLightGray : palette.ckLightGreen }}
                            onPress={() => setHasAnAccount(false)}>
                            <Text
                                style={styles.toggleOptionText}>No</Text>
                        </TouchableOpacity>
                    </View>
                    {
                        hasAnAccount ?
                            <View style={styles.accountScreen}>
                                <Text style={{ ...styles.heading }}>Login</Text>
                                <Text style={{ ...styles.subheading2 }}>This account will become an admin account of your organization.</Text>
                                <LoginForm />
                                {(role && role != "REPORTER") && <Text style={{ color: palette.ckRed, fontSize: typography.sizeMd, fontWeight: typography.weightMedium, alignSelf: "center" }}>Account can only be tied to 1 organization at a time.</Text>}
                            </View>
                            :
                            <View style={styles.accountScreen}>
                                <Text style={{ ...styles.heading }}>Register as a user</Text>
                                <Text style={{ ...styles.subheading2 }}>This account will become an admin account of your organization.</Text>
                                <RegisterForm />
                            </View>
                    }

                </View>
            </View>
            }

            {/* Step 2 */}
            {(isLoggedIn && role == "REPORTER") && <ScrollView style={{ rowGap: spacing.lg, paddingBottom: spacing.xxxl }}>
                <View>
                    {/* <Text style={styles.subheading}>Step 2</Text> */}
                    <Text style={styles.heading}>Hello <Text style={{ color: palette.ckGreen }}>{user?.name}</Text>!</Text>
                    <Text style={styles.heading}>Describe your organization:</Text>

                    <View style={styles.form}>
                        {/* Name */}
                        <View>
                            <Text style={{ ...styles.subheading2, marginLeft: spacing.sm }}>Organization Name</Text>
                            <TextInput
                                style={[styles.textBox, nameError ? styles.textBoxError : null]}
                                placeholder="Organization Name"
                                value={name}
                                onChangeText={text => { setName(text); setNameError(''); }}
                                autoCapitalize="words"
                            />
                            {!!nameError && <Text style={styles.fieldError}>{nameError}</Text>}
                        </View>

                        {/* Profile Picture */}
                        <View style={{ rowGap: spacing.sm }}>
                            <Text style={{ ...styles.subheading2, marginLeft: spacing.sm }}>Profile Picture (Optional)</Text>
                            <View style={styles.photoSelector}>
                                <WrapperButton onPress={pickImage} style={{ ...styles.uploadButton, ...styles.uploader }}>
                                    <UploadIcon color={colors.textSecondary}
                                        size={size.lg} />
                                </WrapperButton>
                                {profileImage &&
                                    <WrapperButton onPress={clearImage} style={{ backgroundColor: palette.ckRed, paddingVertical: 0, padding: spacing.md, borderRadius: borderRadius.full }}>
                                        <CloseXIcon color={colors.textContrast}
                                            size={size.lg} />
                                    </WrapperButton>
                                }
                            </View>
                            {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}
                        </View>

                        {/* Org Type */}
                        <ModalDropdown
                            data={orgTypeDisplay}
                            onDataSelect={setType}
                            defaultText={"Organization Type"}
                            buttonStyle={styles.modalButton}
                            labelSuffix={<CaretDownIcon />} />

                        {/* Org Tier - awaiting clarification */}
                        {/* <ModalDropdown
                                data={orgTierOptions}
                                onDataSelect={setTier}
                                defaultText={"Organization Tier"}
                                buttonStyle={{ ...styles.modalButton }}
                                labelSuffix={<CaretDownIcon />} /> */}

                        {/* Org Categories */}
                        <View>
                            <Text style={{ ...styles.subheading, color: colors.textPrimary, marginLeft: spacing.sm, paddingBottom: spacing.xs }}>Categories you'd like to service</Text>
                            <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 3, borderColor: palette.ckLightGray, borderRadius: borderRadius.lg }}>

                                <View style={{ paddingHorizontal: spacing.sm }}>
                                    <CheckList
                                        data={IssueCategoryArray}
                                        selectedValues={selectedCategories}
                                        setSelectedValues={setSelectedCategories}
                                        checkBoxColor={palette.ckGreen}
                                        linesVisible={true}
                                    />
                                </View>
                            </View>
                        </View>


                        {/* Org Geofence */}
                        <View style={{ rowGap: spacing.sm }}>
                            <View>
                                <Text style={{ ...styles.subheading, color: colors.textPrimary, marginLeft: spacing.sm }}>Define your service area</Text>
                                <Text style={{ ...styles.subheading2, marginLeft: spacing.sm }}>Upload a .geojson file defining the area you service.</Text>
                            </View>

                            {filename.length > 0 &&
                                <View style={{ flexDirection: "row", columnGap: spacing.sm }}>
                                    <View style={{ padding: spacing.sm, backgroundColor: palette.ckLightGray, borderRadius: borderRadius.lg, flexGrow: 1 }}>
                                        <Text style={{ ...styles.subheading, marginLeft: spacing.sm }}>{filename}</Text>
                                    </View>
                                    <WrapperButton onPress={clearShape} style={{ backgroundColor: palette.ckRed, paddingVertical: 0, padding: spacing.md, borderRadius: borderRadius.full }}>
                                        <CloseXIcon color={colors.textContrast}
                                            size={size.lg} />
                                    </WrapperButton>
                                </View>
                            }
                            <WrapperButton onPress={pickGeoJSON} style={{ ...styles.uploadButton, ...styles.uploader }}>
                                <UploadIcon color={colors.textSecondary}
                                    size={size.lg} />
                            </WrapperButton>

                        </View>

                        <Button text="Submit" onPress={submit} style={{ fontSize: typography.sizeXl }}
                            isDisabled={
                                !(name.length > 0 && selectedCategories.length > 0 && type)
                            } />
                    </View>
                </View>
            </ScrollView>
            }

        </ScrollView>

    )
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingVertical: spacing.md
    },
    container: {
        //paddingTop is supplied inline from the safe-area inset
        ...globalStyles.container,
        padding: spacing.md,
        // flexGrow: 1,
    },
    profileImage: {
        height: 150,
        width: 150,
        maxWidth: "100%",
        flexShrink: 1,
        borderRadius: borderRadius.full,
        alignSelf: "center"
    },
    photoSelector: {
        flexDirection: "row",
        columnGap: spacing.sm,
        flex: 1
    },
    uploader: {
        flexShrink: 0,
        flexGrow: 1
    },
    heading: {
        fontSize: typography.sizeXxl,
        fontWeight: typography.weightBold,
    },
    subheading: {
        fontSize: typography.sizeXl,
        color: colors.textSecondary,
        fontWeight: typography.weightMedium,
    },
    subheading2: {
        fontSize: typography.sizeLg,
        color: colors.textSecondary,
        fontWeight: typography.weightMedium,
    },
    toggle: {
        flexDirection: "row",
        columnGap: spacing.sm,
        marginLeft: spacing.lg
    },
    toggleOption: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md
    },
    toggleOptionText: {
        fontSize: typography.sizeXxl,
        color: colors.textPrimary,
        fontWeight: typography.weightBold,
    },
    accountScreen: {
        borderWidth: 3,
        borderRadius: borderRadius.lg,
        borderColor: palette.ckLightGreen,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md
    },
    form: {
        rowGap: spacing.md,
        marginTop: spacing.sm
    },
    textBox: {
        ...globalStyles.textBox,
        marginTop: spacing.sm,
        fontSize: typography.sizeLg,
        borderWidth: 1,
        borderColor: 'transparent',
        height: 52,
    },
    textBoxError: {
        borderColor: colors.error,
    },
    fieldError: {
        color: colors.error,
        fontSize: typography.sizeSm,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
    modalButton: {
        backgroundColor: palette.ckGreen,
        color: colors.textContrast,
        fontSize: typography.sizeLg,
        fontWeight: typography.weightRegular,
        flexDirection: "row",
        alignItems: "center"
    },
    uploadButton: {
        backgroundColor: palette.ckLightGray,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg
    }

})