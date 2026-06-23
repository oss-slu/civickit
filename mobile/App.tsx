// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { MessageView } from './src/components/MessageView';
import { StackParams } from './src/types/StackParams';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParams } from './src/types/TabParams'
import { colors, globalStyles, palette, size, spacing, typography } from './src/styles';
import { View, StyleSheet } from 'react-native';
import { CalendarIcon, MapIcon, PlusIcon, SearchIcon, UserIcon } from './src/components/Icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FlashMessage from 'react-native-flash-message';
import EventsScreen from './src/screens/Events/EventsScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import LoginScreen from './src/screens/Login/LoginScreen';
import RegisterScreen from './src/screens/Login/RegisterScreen';
import IssueCreationNav from './src/screens/IssueCreation/IssueCreationNav';
import React from 'react';
import { LocationProvider } from './src/contexts/LocationContext';
import { NearbyIssuesProvider } from './src/contexts/NearbyIssuesContext';
import LandingScreenNav from './src/screens/Landing/LandingScreenNav';
import FeedNav from './src/screens/Feed/FeedNav';
import Button from './src/components/Button';
import ProfileNav from './src/screens/Profile/ProfileNav';

const Tab = createBottomTabNavigator<TabParams>();

const queryClient = new QueryClient();

const Stack = createNativeStackNavigator<StackParams>();

function MainTabNavigator() {
  return (
    <LocationProvider>
      <NearbyIssuesProvider>
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
          <Tab.Screen name="Map" component={LandingScreenNav}
            options={{
              tabBarIcon: () => (
                <MapIcon
                  color={colors.textPrimary}
                  size={size.lg}
                  style={{ ...styles.icon, ...styles.navIcons }}
                />
              ),
              headerShown: false
            }} />
          <Tab.Screen name="Feed Nav" component={FeedNav}
            options={{
              tabBarIcon: () => (
                <SearchIcon
                  color={colors.textPrimary}
                  size={size.lg}
                  style={{ ...styles.icon, ...styles.navIcons }}
                />
              ),
              headerShown: false
            }} />

          <Tab.Screen name="ReportIssue" component={IssueCreationNav}
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
              headerShown: false
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
          <Tab.Screen name="Profile Nav" component={ProfileNav}
            options={{
              tabBarIcon: () => (
                <UserIcon
                  color={colors.textPrimary}
                  size={size.lg}
                  style={{ ...styles.icon, ...styles.navIcons }}
                />
              ),
              headerShown: false
            }} />
        </Tab.Navigator>
      </NearbyIssuesProvider>
    </LocationProvider>
  )
}

function AppNavigator() {
  const { user, isLoading, authToken, login } = useAuth();
  if (isLoading) return null; //or splash screen
  console.log(authToken)
  if (authToken != undefined) {
    login(authToken)
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ animation: 'slide_from_right' }}>
        {user != null ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
      {user != null && <FlashMessage position="top" style={{ paddingTop: 32 }} />}
    </NavigationContainer>
  )
}

export default function App() {
  if (queryClient != null) {
    return (
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
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
    paddingTop: spacing.sm
  }
});