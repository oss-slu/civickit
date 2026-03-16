// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IssueListWrapper from './src/screens/IssueListWrapper';
import IssueCreationScreen from './src/screens/IssueCreationScreen';
import { MessageView } from './src/components/MessageView';
import IssueDetailScreen from './src/screens/IssueDetailScreen';
import ErrorScreen from './src/screens/ErrorScreen';
import FlashMessage from 'react-native-flash-message';
import { StackParams } from './src/types/StackParams';
import NewIssueButton from './src/components/NewIssueButton';
import { colors, typography } from './src/styles';

const Stack = createNativeStackNavigator<StackParams>();

export default function App() {
  const queryClient = new QueryClient();

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
            <Stack.Screen name="Nearby Issues" component={IssueListWrapper}
              options={{
                headerRight: () => (<NewIssueButton isDisabled={false} />),
              }} />
            <Stack.Screen name="Create Issue" component={IssueCreationScreen} />
            <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
            <Stack.Screen name="Error" component={ErrorScreen} />
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