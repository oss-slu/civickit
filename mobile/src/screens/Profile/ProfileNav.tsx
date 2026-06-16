// mobile/src/screens/Profile/FeedNav.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackParams } from '../../types/StackParams';
import ProfileScreen from './ProfileScreen';
import ErrorScreen from '../Misc/ErrorScreen';
import AvatarScreen from './AvatarScreen';
import SettingsScreen from './SettingsScreen';
import IconButton from '../../components/IconButton';
import { Text, View, StyleSheet } from 'react-native';
import { SettingsIcon } from '../../components/Icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { palette, colors, globalStyles, size, spacing, typography, borderRadius } from "../../styles";
import Button from '../../components/Button';
import IssueDetailScreen from '../Misc/IssueDetailScreen';
import LeaderBoardScreen from '../Misc/LeaderboardScreen';


const Stack = createNativeStackNavigator<StackParams>();

export default function ProfileNav() {
    const { user } = useAuth();
    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    const { logout } = useAuth();

    if (user == null) {
        return (
            <View style={styles.container}>
                <Text style={[globalStyles.heading1]}>You are not logged in.</Text>
                <Button text="Go to login" onPress={logout} />
            </View>
        )
    }


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
            <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
            <Stack.Screen name="My Issues" component={LeaderBoardScreen} />
            <Stack.Screen name="My Endorsements" component={LeaderBoardScreen} />
        </Stack.Navigator>
    );

}

const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        alignItems: 'center',
        rowGap: spacing.md,
        justifyContent: 'center'
    },
})