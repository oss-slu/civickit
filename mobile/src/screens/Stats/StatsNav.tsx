// mobile/src/screens/Stats/StatsNav.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParams } from '../../types/StackParams';
import { colors, typography } from '../../styles';
import StatsScreen from './StatsScreen';
import LeaderBoardScreen from '../Misc/LeaderboardScreen';
import IssueDetailScreen from '../Misc/IssueDetailScreen';
import ErrorScreen from '../Misc/ErrorScreen';

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
                    headerShown: true
                }} />
            <Stack.Screen name="Leaderboard" component={LeaderBoardScreen} />

            <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
            <Stack.Screen name="Error" component={ErrorScreen} />
        </Stack.Navigator>
    );

}
