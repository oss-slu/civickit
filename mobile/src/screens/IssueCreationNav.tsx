// mobile/src/screens/LandingScreen.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IssueCreationScreen from './IssueCreationScreen';
import IssueDetailScreen from './IssueDetailScreen';
import ErrorScreen from './ErrorScreen';
import { StackParams } from '../types/StackParams';
import { colors, typography } from '../styles';
const Stack = createNativeStackNavigator<StackParams>();

export default function IssueCreationNav() {

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
            <Stack.Screen name="Report An Issue" component={IssueCreationScreen} />
            <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
            <Stack.Screen name="Error" component={ErrorScreen} />
        </Stack.Navigator>
    );

}