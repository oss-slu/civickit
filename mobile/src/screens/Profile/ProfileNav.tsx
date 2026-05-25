// mobile/src/screens/Profile/FeedNav.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParams } from '../../types/StackParams';
import { colors, spacing, typography } from '../../styles';
import ProfileScreen from './ProfileScreen';
import ErrorScreen from '../Misc/ErrorScreen';
import AvatarScreen from './AvatarScreen';
import SettingsScreen from './SettingsScreen';
import IconButton from '../../components/IconButton';
import { Text } from 'react-native';
import { SettingsIcon } from '../../components/Icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';


const Stack = createNativeStackNavigator<StackParams>();

export default function ProfileNav() {



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
            <Stack.Screen name="Profile" component={ProfileScreen}
                options={{
                    headerShown: true,
                }}
            />
            <Stack.Screen name="Avatar" component={AvatarScreen} />

            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Error" component={ErrorScreen} />
        </Stack.Navigator>
    );

}
