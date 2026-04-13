// mobile/src/screens/LandingScreen.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IssueCreationScreen from './IssueCreationScreen';
import IssueDetailScreen from './IssueDetailScreen';
import ErrorScreen from './ErrorScreen';
import { StackParams } from '../types/StackParams';
import { colors, typography } from '../styles';
import IssuePhotoScreen from './CameraScreen';
import PhotoValidationScreen from './PhotoValidationScreen';
import CameraScreen from './CameraScreen';
import { userLocation } from '../types/userLocation';
import { createContext, useState } from 'react';
import { ImagesContext, UserLocationContext, AddressContext, TitleContext, CategoryContext, DescriptionContext } from '../types/FormContexts';

const Stack = createNativeStackNavigator<StackParams>();

export default function IssueCreationNav() {

    const [images, setImages] = useState<string[]>([]);
    const [location, setLocation] = useState<userLocation | null>(null);
    const [address, setAddress] = useState<string>('Detecting location...');
    const [title, setTitle] = useState<string>("");
    const [category, setCategory] = useState<"POTHOLE" | "STREETLIGHT" | "GRAFFITI" | "ILLEGAL_DUMPING" | "BROKEN_SIDEWALK" | "TRAFFIC_SIGNAL" | "OTHER">();
    const [description, setDescription] = useState<string>("");

    return (
        <ContextWrapper
            images={images} setImages={setImages}
            location={location} setLocation={setLocation}
            address={address} setAddress={setAddress}
            title={title} setTitle={setTitle}
            category={category} setCategory={setCategory}
            description={description} setDescription={setDescription}
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
                        headerShown: true
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

                <Stack.Screen name="Error" component={ErrorScreen} />
            </Stack.Navigator>
        </ContextWrapper>
    );

}

function ContextWrapper({
    images, setImages,
    location, setLocation,
    address, setAddress,
    title, setTitle,
    category, setCategory,
    description, setDescription,
    children }: any) {
    return (
        <ImagesContext.Provider value={{ images, setImages }}>
            <UserLocationContext.Provider value={{ location, setLocation }}>
                <AddressContext.Provider value={{ address, setAddress }}>
                    <TitleContext.Provider value={{ title, setTitle }}>
                        <CategoryContext.Provider value={{ category, setCategory }}>
                            <DescriptionContext.Provider value={{ description, setDescription }}>
                                {children}
                            </DescriptionContext.Provider>
                        </CategoryContext.Provider>
                    </TitleContext.Provider>
                </AddressContext.Provider>
            </UserLocationContext.Provider>
        </ImagesContext.Provider>
    )
}
