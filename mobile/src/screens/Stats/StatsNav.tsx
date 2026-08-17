// mobile/src/screens/Stats/StatsNav.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParams } from '../../types/StackParams';
import { colors, typography } from '../../styles';
import StatsScreen from './StatsScreen';
import LeaderBoardScreen from '../Misc/LeaderboardScreen';
import IssueDetailScreen from '../Misc/IssueDetailScreen';
import ErrorScreen from '../Misc/ErrorScreen';
import PhotoValidationScreen from '../IssueCreation/PhotoValidationScreen';
import CameraScreen from '../IssueCreation/CameraScreen';

const Stack = createNativeStackNavigator<StackParams>();

export default function StatsNav() {
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
            <Stack.Screen name="Statistics" component={StatsScreen}
                options={{
                    headerTitle: "Statistics in Your Area",
                    headerShadowVisible: false,
                    headerShown: false
                }} />
            <Stack.Screen name="Leaderboard" component={LeaderBoardScreen}
                options={{
                    headerTitle: "",
                    headerShadowVisible: false,
                    headerShown: false
                }} />

            <Stack.Screen name="Issue Details" component={IssueDetailScreen}
                options={{
                    headerTitle: "",
                    headerShadowVisible: false,
                    headerShown: false
                }} />
            <Stack.Screen name="Error" component={ErrorScreen} />
            <Stack.Screen name="Photo Validation" component={PhotoValidationScreen}
                options={{
                    headerShown: false
                }} />
            <Stack.Screen name="Camera" component={CameraScreen}
                options={{
                    headerShown: false,
                }} />
        </Stack.Navigator>
    );

}
