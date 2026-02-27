// mobile/App.tsx
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IssueListWrapper from './src/screens/IssueListWrapper';
import IssueCreationScreen from './src/screens/IssueCreationScreen';
import { MessageScreen } from './src/components/MessageScreen';
import { View } from 'react-native';
import IssueDetailScreen from './src/screens/IssueDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const queryClient = new QueryClient();

  if (queryClient != null) {
    return (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Issues" component={IssueListWrapper} />
            <Stack.Screen name="Create Issue" component={IssueCreationScreen} />
            <Stack.Screen name="Issue Details" component={IssueDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    );
  } else {
    return (
      <MessageScreen enableRefresh={false}>
        Error: query client not found
      </MessageScreen>
    )
  }

}