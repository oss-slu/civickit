// mobile/src/screens/Landing/LandingScreen.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParams } from '../../types/StackParams';
import { colors, typography } from '../../styles';
import IssueDetailScreen from '../Misc/IssueDetailScreen';
import ErrorScreen from '../Misc/ErrorScreen';
import LandingScreen from './LandingScreen';
import Header from '../../components/Header';
import { Text } from 'react-native';
import ProfileNav from '../Profile/ProfileNav';

const Stack = createNativeStackNavigator<StackParams>();

export default function LandingScreenNav() {

    return (
        <Stack.Navigator screenOptions={{
            headerStyle: {
                backgroundColor: colors.background,
            },
            headerTintColor: colors.textPrimary,
            // headerTitleStyle: {
            //     fontWeight: typography.weightRegular,
            // },
            headerTitleAlign: "left"
            // headerShown: false
        }}
        >
            <Stack.Screen name="Nearby Issues" component={LandingScreen}
                options={{
                    headerShown: false
                }} />
            <Stack.Screen name="ProfileNav" component={ProfileNav}
                options={{
                    headerShown: false
                }} />
            <Stack.Screen name="Issue Details" component={IssueDetailScreen}
                options={({ route }) => ({
                    headerShadowVisible: false,
                    headerShown: false
                })} />
            <Stack.Screen name="Error" component={ErrorScreen} />
        </Stack.Navigator>
    );

}