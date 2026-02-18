// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IssueListWrapper from './src/screens/IssueListWrapper';
import { MessageScreen } from './src/components/MessageScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const queryClient = new QueryClient();

  if (queryClient != null) {
    return (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Issues" component={IssueListWrapper} />
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

