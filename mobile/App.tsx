// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from './src/api';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { MessageView } from './src/components/MessageView';
import { StackParams } from './src/types/StackParams';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParams } from './src/types/TabParams'
import { borderRadius, colors, globalStyles, palette, size, spacing, typography } from './src/styles';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarGraphIcon, CalendarIcon, LineGraphIcon, MapIcon, MenuIcon, PlusIcon, SearchIcon, UserIcon } from './src/components/Icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FlashMessage from 'react-native-flash-message';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/Login/LoginScreen';
import RegisterScreen from './src/screens/Login/RegisterScreen';
import IssueCreationNav from './src/screens/IssueCreation/IssueCreationNav';
import React from 'react';
import { LocationProvider } from './src/contexts/LocationContext';
import { NearbyIssuesProvider } from './src/contexts/NearbyIssuesContext';
import LandingScreenNav from './src/screens/Landing/LandingScreenNav';
import StatsNav from './src/screens/Stats/StatsNav';
import LoadingScreen from './src/screens/Misc/LoadingScreen';
import { StatusBar } from "expo-status-bar";
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import DispatchNav from './src/screens/Dispatch/DispatchNav';

const Tab = createBottomTabNavigator<TabParams>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx will not become a 2xx on retry — only retry transport failures.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

const Stack = createNativeStackNavigator<StackParams>();

function MainTabNavigator() {
  const { width, height } = Dimensions.get("window")
  const { role } = useAuth()
  console.log(role)
  return (
    <SafeAreaView style={{
      width,
      height,
      flex: 1,
    }}>
      <StatusBar style="dark"
        translucent={true}
        hidden={false}
      />
      <LocationProvider>
        <NearbyIssuesProvider>
          <Tab.Navigator screenOptions={{
            tabBarStyle: {
              backgroundColor: palette.ckVeryLightGray,
              //an explicit height makes getTabBarHeight return it verbatim and
              //skip adding insets.bottom, but BottomTabBar still applies
              //paddingBottom: insets.bottom — so the inset has to be added here
              //or it eats the space the icons need.
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
                      style={{ ...styles.icon }}
                    />
                  </View>
                ),
                headerShown: false
              }} />

            {(role === 'ORG_ADMIN' || role === 'ORG_MEMBER') && <Tab.Screen name="Dispatch Nav" component={DispatchNav}
              options={{
                tabBarIcon: ({ color, focused }) => (
                  <View style={{
                    ...styles.iconBackground,
                    backgroundColor: focused ? palette.ckGrayBlue : palette.ckVeryLightGray
                  }}>
                    <MenuIcon
                      color={color}
                      size={size.xl}
                      style={{ ...styles.icon, marginTop: 0 }}
                    />
                  </View>
                ),
                headerShown: false
              }} />}


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
                      style={{ ...styles.icon }}
                    />
                  </View>
                ),
                headerShown: false
              }} />


          </Tab.Navigator>
        </NearbyIssuesProvider>
      </LocationProvider>
    </SafeAreaView>
  )
}

function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) return <LoadingScreen />
  return (
    <NavigationContainer>
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
      {isLoggedIn && <FlashMessage position="top" />}
    </NavigationContainer>
  )
}

export default function App() {
  if (queryClient != null) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* SafeAreaProvider must fill the screen or useSafeAreaInsets reads 0 */}
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
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