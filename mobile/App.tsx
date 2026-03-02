// mobile/App.tsx
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IssueListWrapper from './src/screens/IssueListWrapper';
import IssueCreationScreen from './src/screens/IssueCreationScreen';
import { MessageView } from './src/components/MessageView';
import IssueDetailScreen from './src/screens/IssueDetailScreen';
import ErrorScreen from './src/screens/ErrorScreen';
import FlashMessage from 'react-native-flash-message';
import { StackParams } from './src/types/StackParams';

const Stack = createNativeStackNavigator<StackParams>();

export default function App() {
  const queryClient = new QueryClient();

  if (queryClient != null) {
    return (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Issues" component={IssueListWrapper} />
            <Stack.Screen name="CreateIssue" component={IssueCreationScreen} />
            <Stack.Screen name="IssueDetails" component={IssueDetailScreen} />
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