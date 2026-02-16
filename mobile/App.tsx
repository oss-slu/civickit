// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessageScreen } from './src/screens/IssueListScreen';
import { QueryClient } from '@tanstack/react-query';
import { useContext, createContext } from 'react';
import IssueListWrapper from './src/screens/IssueListWrapper';

const Stack = createNativeStackNavigator();
export const QueryClientContext = createContext<QueryClient>(new QueryClient());

export default function App() {
  const queryClient = useContext(QueryClientContext) as unknown as QueryClient

  if (queryClient != null) {
    return (
      <QueryClientContext value={queryClient}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Issues" component={IssueListWrapper} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientContext>
    );
  } else {
    return (
      <MessageScreen enableRefresh={false}>
        Error: query client is null
      </MessageScreen>
    )
  }

}
