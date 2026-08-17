// mobile/src/screens/Dispatch/DispatchNav.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParams } from '../../types/StackParams';
import { colors, typography } from '../../styles';
import DispatchScreen from './DispatchScreen';
import ErrorScreen from '../Misc/ErrorScreen';
import PhotoValidationScreen from '../IssueCreation/PhotoValidationScreen';
import IssueDetailScreen from '../Misc/IssueDetailScreen';
import CameraScreen from '../IssueCreation/CameraScreen';
import LeaderBoardScreen from '../Misc/LeaderboardScreen';
import { useNearbyIssues } from '../../contexts/NearbyIssuesContext';

const Stack = createNativeStackNavigator<StackParams>();

export default function DispatchNav() {
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
            <Stack.Screen name="Dispatch" component={DispatchNav}
                options={{
                    headerShown: true,
                    headerShadowVisible: false,
                    headerTitle: "Unclaimed Issues"
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
