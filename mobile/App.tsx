// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
<<<<<<< 75-create-navigation-bar-component
import { MessageView } from './src/components/MessageView';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LandingScreen from './src/screens/LandingScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParams } from './src/types/TabParams'
import { colors, globalStyles, palette, size, spacing, typography } from './src/styles';
import FeedScreen from './src/screens/FeedScreen';
import IssueCreationScreen from './src/screens/IssueCreationScreen';
import EventsScreen from './src/screens/EventsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { View, StyleSheet } from 'react-native';
import { CalendarIcon, LocationPinIcon, PlusIcon, SearchIcon, UserIcon } from './src/components/Icons';

const Tab = createBottomTabNavigator<TabParams>();
=======
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { MessageView } from './src/components/MessageView';
import { StackParams } from './src/types/StackParams';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreenWrapper';
import IssueCreationScreen from './src/screens/IssueCreationScreen';
import IssueDetailScreen from './src/screens/IssueDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import NewIssueButton from './src/components/NewIssueButton';

const queryClient = new QueryClient();

const Stack = createNativeStackNavigator<StackParams>();
>>>>>>> main

function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return null; //or splash screen
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animation: 'slide_from_right' }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Nearby Issues" component={HomeScreen}
            options={{
                  headerRight: () => (<NewIssueButton isDisabled={false} />),
                }} /> 
            <Stack.Screen name="Create Issue" component={IssueCreationScreen} />
            <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  if (queryClient != null) {
    return (
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
<<<<<<< 75-create-navigation-bar-component
          <NavigationContainer>
            <Tab.Navigator screenOptions={{
              tabBarStyle: {
                backgroundColor: colors.background,
              },
              tabBarShowLabel: false,
              animation: "shift",
              tabBarActiveBackgroundColor: colors.backgroundSecondary,
              headerTitleAlign: "left"
            }}
            >
              <Tab.Screen name="Map" component={LandingScreen}
                options={{
                  tabBarIcon: () => (
                    <LocationPinIcon
                      color={colors.textPrimary}
                      size={size.lg}
                      style={{ ...styles.icon, ...styles.navIcons }}
                    />
                  ),
                  headerShown: false
                }} />
              <Tab.Screen name="Feed" component={FeedScreen}
                options={{
                  tabBarIcon: () => (
                    <SearchIcon
                      color={colors.textPrimary}
                      size={size.lg}
                      style={{ ...styles.icon, ...styles.navIcons }}
                    />
                  ),
                }} />

              <Tab.Screen name="Report An Issue" component={IssueCreationScreen}
                options={{
                  tabBarIcon: () => (
                    <View
                      style={styles.plusButton}>
                      <PlusIcon
                        color={colors.textContrast}
                        size={size.xl}
                        style={styles.icon}
                      />
                    </View>
                  ),
                }} />
              <Tab.Screen name="Events" component={EventsScreen}
                options={{
                  tabBarIcon: () => (
                    <CalendarIcon
                      color={colors.textPrimary}
                      size={size.lg}
                      style={{ ...styles.icon, ...styles.navIcons }}
                    />
                  ),
                }} />
              <Tab.Screen name="Profile" component={ProfileScreen}
                options={{
                  tabBarIcon: () => (
                    <UserIcon
                      color={colors.textPrimary}
                      size={size.lg}
                      style={{ ...styles.icon, ...styles.navIcons }}
                    />
                  ),
                }} />
            </Tab.Navigator>
            <FlashMessage position="top" style={{ paddingTop: 32 }} />
          </NavigationContainer>
=======
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
>>>>>>> main
        </QueryClientProvider>
      </GestureHandlerRootView>
    );
  } else {
    return (
      <MessageView enableRefresh={false}>
        Error: query client not found
      </MessageView>
    )
  }

}


const styles = StyleSheet.create({
  plusButton: {
    ...globalStyles.button,
    position: "absolute",
    bottom: 0,
    height: size.xxl,
    width: size.xxl,
    backgroundColor: palette.ckRed,
    ...globalStyles.shadow
  },
  icon: {
    display: "flex",
    height: size.xxl,
    width: size.xxl,
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginTop: spacing.sd,
  },
  navIcons: {
    paddingTop: spacing.xs
  }
});