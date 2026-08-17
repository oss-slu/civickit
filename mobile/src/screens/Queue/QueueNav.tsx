// mobile/src/screens/Queue/QueueNav.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IssueDetailScreen from '../Misc/IssueDetailScreen';
import ErrorScreen from '../Misc/ErrorScreen';
import { StackParams } from '../../types/StackParams';
import { colors, typography } from '../../styles';
import PhotoValidationScreen from '../IssueCreation/PhotoValidationScreen';
import CameraScreen from '../IssueCreation/CameraScreen';
import { userLocation } from '../../types/userLocation';
import { useState } from 'react';
import { ImagesContext, PhotoMetadataContext, UserLocationContext, AddressContext, TitleContext, CategoryContext, DescriptionContext, FormStartedContext } from '../../contexts/FormContexts';
import type { PhotoMetadata } from '../../utils/photoMetadata';
import QueueScreen from './QueueScreen';

const Stack = createNativeStackNavigator<StackParams>();

export default function QueueNav() {

    return (

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
            <Stack.Screen name="Queue" component={QueueScreen}
                options={{
                    headerShown: false,
                }} />
            <Stack.Screen name="Camera" component={CameraScreen}
                options={{
                    headerShown: false,
                }} />
            <Stack.Screen name="Issue Details" component={IssueDetailScreen}
                options={{
                    headerTitle: "",
                    headerShadowVisible: false,
                    headerShown: false
                }} />
            <Stack.Screen name="Photo Validation" component={PhotoValidationScreen}
                options={{
                    headerShown: false
                }} />
            <Stack.Screen name="Error" component={ErrorScreen}
                options={{
                    headerTitle: "",
                    headerShadowVisible: false,
                    headerBackVisible: false,
                }} />
        </Stack.Navigator>
    );

}