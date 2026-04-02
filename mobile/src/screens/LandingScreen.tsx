// mobile/src/screens/LandingScreen.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParams } from '../types/StackParams';
import { colors, typography } from '../styles';
import IssueDetailScreen from './IssueDetailScreen';
import ErrorScreen from './ErrorScreen';
import HomeScreen from './HomeScreenWrapper';

const Stack = createNativeStackNavigator<StackParams>();

export default function LandingScreen() {

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
            <Stack.Screen name="Nearby Issues" component={HomeScreen} />
            <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
            <Stack.Screen name="Error" component={ErrorScreen} />
        </Stack.Navigator>
    );

}