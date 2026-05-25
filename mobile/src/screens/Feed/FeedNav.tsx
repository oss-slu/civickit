// mobile/src/screens/Feed/FeedNav.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParams } from '../../types/StackParams';
import { colors, typography } from '../../styles';
import FeedScreen from './FeedScreen';
import LeaderBoardScreen from './LeaderboardScreen';
import IssueDetailScreen from '../Misc/IssueDetailScreen';
import ErrorScreen from '../Misc/ErrorScreen';

const Stack = createNativeStackNavigator<StackParams>();

export default function FeedNav() {
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
            <Stack.Screen name="Feed" component={FeedScreen}
                options={{
                    headerShown: true
                }} />
            <Stack.Screen name="Leaderboard" component={LeaderBoardScreen} />

            <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
            <Stack.Screen name="Error" component={ErrorScreen} />
        </Stack.Navigator>
    );

}
