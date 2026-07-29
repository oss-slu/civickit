// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { MessageView } from './src/components/MessageView';
import { StackParams } from './src/types/StackParams';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParams } from './src/types/TabParams'
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from './src/styles';
import { View, StyleSheet, StatusBar } from 'react-native';
import { BarGraphIcon, CalendarIcon, LineGraphIcon, MapIcon, PlusIcon, SearchIcon, UserIcon } from './src/components/Icons';
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
import StatsNav from './src/screens/Stats/StatsNav';
import Button from './src/components/Button';
import ProfileNav from './src/screens/Profile/ProfileNav';
import LoadingScreen from './src/screens/Misc/LoadingScreen';

const Tab = createBottomTabNavigator<TabParams>();

const queryClient = new QueryClient();

const Stack = createNativeStackNavigator<StackParams>();

function MainTabNavigator() {
  return (
    <LocationProvider>
      <NearbyIssuesProvider>
        <Tab.Navigator screenOptions={{
          tabBarStyle: {
            backgroundColor: palette.ckVeryLightGray,
            height: size.xxl + spacing.sm,
            elevation: 0,
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.textPrimary,
          tabBarInactiveTintColor: colors.textPrimary,
          animation: "shift",
          headerTitleAlign: "left",

        }}
        >
          <Tab.Screen name="Map" component={LandingScreenNav}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  ...styles.iconBackground,
                  backgroundColor: focused ? palette.ckGrayBlue : palette.ckVeryLightGray
                }}>
                  <MapIcon
                    color={color}
                    size={size.lg}
                    style={{ ...styles.icon, ...styles.navIcons }}
                  />
                </View>
              ),
              headerShown: false
            }} />


          <Tab.Screen name="ReportIssue" component={IssueCreationNav}
            options={{
              tabBarIcon: ({ focused }) => (
                <View
                  style={{
                    ...styles.plusButton,
                    backgroundColor: focused ? palette.ckYellow : palette.ckRed
                  }}>
                  <PlusIcon
                    color={colors.textContrast}
                    size={size.xl}
                    style={styles.plusIcon}
                  />
                </View>
              ),
              headerShown: false
            }} />

          <Tab.Screen name="Stats Nav" component={StatsNav}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <View style={{
                  ...styles.iconBackground,
                  backgroundColor: focused ? palette.ckGrayBlue : palette.ckVeryLightGray
                }}>
                  <LineGraphIcon
                    color={color}
                    size={size.lg}
                    style={{ ...styles.icon, ...styles.navIcons }}
                  />
                </View>
              ),
              headerShown: false
            }} />

        </Tab.Navigator>
      </NearbyIssuesProvider>
    </LocationProvider>
  )
}

function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />
  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={"dark-content"} />
      <Stack.Navigator screenOptions={{ animation: 'slide_from_right' }}>
        {isLoggedIn ? (
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
      {isLoggedIn && <FlashMessage position="top" style={{ paddingTop: 32 }} />}
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
    position: "absolute",
    bottom: 0,
    height: size.xxl,
    width: size.xxl,
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.full,
    ...globalStyles.shadow
  },
  icon: {
    // display: "flex",
    height: size.xl,
    width: size.xl,
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
    // borderWidth: 2
  },
  plusIcon: {
    width: size.xl,
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center"
  },
  navIcons: {

  },
  iconBackground: {
    marginTop: spacing.md,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    paddingVertical: spacing.sd,
    // borderWidth: 2
  }
});