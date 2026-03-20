// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessageView } from './src/components/MessageView';
import { StackParams } from './src/types/StackParams';
import { colors, typography } from './src/styles';

import IssueListWrapper from './src/screens/IssueListWrapper';
import IssueCreationScreen from './src/screens/IssueCreationScreen';
import IssueDetailScreen from './src/screens/IssueDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ErrorScreen from './src/screens/ErrorScreen';
import FlashMessage from 'react-native-flash-message';
import NewIssueButton from './src/components/NewIssueButton';

import { useAuthToken } from './src/hooks/useAuthToken';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<StackParams>();

export default function App() {
  const { isLoggedIn, isLoading } = useAuthToken();
  if (queryClient != null) {
    return (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              fontWeight: typography.weightRegular,
            },
          }}
          >
            {isLoggedIn ? (
              // Authenticated screens
              <>
                <Stack.Screen name="Nearby Issues" component={IssueListWrapper}
                  options={{
                    headerRight: () => (<NewIssueButton isDisabled={false} />),
                  }} />
                <Stack.Screen name="Create Issue" component={IssueCreationScreen} />
                <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
                <Stack.Screen name="Error" component={ErrorScreen} />
              </>
            ) : (
              // Auth screens
              <>
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
              </>
            )}
          </Stack.Navigator>
          <FlashMessage position="top" style={{ paddingTop: 32 }} />
        </NavigationContainer>
      </QueryClientProvider>
    );
  } else {
    return (
      <MessageView enableRefresh={false}>
        Error: query client not found
      </MessageView>
    )
  }

}