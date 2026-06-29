// mobile/src/screens/IssueCreation/LandingScreen.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IssueCreationScreen from './IssueCreationScreen';
import IssueDetailScreen from '../Misc/IssueDetailScreen';
import ErrorScreen from '../Misc/ErrorScreen';
import { StackParams } from '../../types/StackParams';
import { colors, typography } from '../../styles';
import PhotoValidationScreen from './PhotoValidationScreen';
import CameraScreen from './CameraScreen';
import { userLocation } from '../../types/userLocation';
import { useState } from 'react';
import DuplicateCheckScreen from './DuplicateCheckScreen';
import { ImagesContext, PhotoMetadataContext, UserLocationContext, AddressContext, TitleContext, CategoryContext, DescriptionContext, FormStartedContext } from '../../contexts/FormContexts';
import type { PhotoMetadata } from '../../utils/photoMetadata';

const Stack = createNativeStackNavigator<StackParams>();

export default function IssueCreationNav() {

    const [images, setImages] = useState<string[]>([]);
    const [photoMetadata, setPhotoMetadata] = useState<PhotoMetadata[]>([]);
    const [location, setLocation] = useState<userLocation | null>(null);
    const [address, setAddress] = useState<string>('Detecting location...');
    const [title, setTitle] = useState<string>("");
    const [category, setCategory] = useState<"POTHOLE" | "STREETLIGHT" | "GRAFFITI" | "ILLEGAL_DUMPING" | "BROKEN_SIDEWALK" | "TRAFFIC_SIGNAL" | "OTHER">();
    const [description, setDescription] = useState<string>("");
    const [formStarted, setFormStarted] = useState(false)

    return (
        <ContextWrapper
            images={images} setImages={setImages}
            photoMetadata={photoMetadata} setPhotoMetadata={setPhotoMetadata}
            location={location} setLocation={setLocation}
            address={address} setAddress={setAddress}
            title={title} setTitle={setTitle}
            category={category} setCategory={setCategory}
            description={description} setDescription={setDescription}
            formStarted={formStarted} setFormStarted={setFormStarted}
        >
            <Stack.Navigator screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: {
                    fontWeight: typography.weightRegular,
                },
                headerTitleAlign: "left"

            }}
            >
                <Stack.Screen name="Camera" component={CameraScreen}
                    options={{
                        headerShown: true,
                        headerTitle: "Report An Issue"
                    }} />
                <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
                <Stack.Screen name="Photo Validation" component={PhotoValidationScreen}
                    options={{
                        headerShown: false
                    }} />
                <Stack.Screen name="Report An Issue" component={IssueCreationScreen}
                    options={{
                        headerBackVisible: false
                    }} />
                <Stack.Screen name="DuplicateCheck" component={DuplicateCheckScreen}
                    options={{
                        headerTitle: "Has this already been reported?"
                    }} />

                <Stack.Screen name="Error" component={ErrorScreen} />
            </Stack.Navigator>
        </ContextWrapper>
    );

}

function ContextWrapper({
    images, setImages,
    photoMetadata, setPhotoMetadata,
    location, setLocation,
    address, setAddress,
    title, setTitle,
    category, setCategory,
    description, setDescription,
    formStarted, setFormStarted,
    children, }: any) {
    return (
      
        <ImagesContext.Provider value={{ images, setImages }}>
        <PhotoMetadataContext.Provider value={{ photoMetadata, setPhotoMetadata }}>
            <UserLocationContext.Provider value={{ location, setLocation }}>
                <AddressContext.Provider value={{ address, setAddress }}>
                    <TitleContext.Provider value={{ title, setTitle }}>
                        <CategoryContext.Provider value={{ category, setCategory }}>
                            <DescriptionContext.Provider value={{ description, setDescription }}>
                                <FormStartedContext.Provider value={{ formStarted, setFormStarted }}>
                                    {children}
                                </FormStartedContext.Provider>
                            </DescriptionContext.Provider>
                        </CategoryContext.Provider>
                    </TitleContext.Provider>
                </AddressContext.Provider>
            </UserLocationContext.Provider>
            </PhotoMetadataContext.Provider>
        </ImagesContext.Provider>
    )
}
