// mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import IssueListWrapper from './src/screens/IssueListWrapper';
import { MessageScreen } from './src/components/MessageScreen';
import { UseQueryClientContext } from './src/types/UseQueryClientContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const queryClient = useContext(UseQueryClientContext) as unknown as QueryClient

  if (queryClient != null) {
    return (
      <UseQueryClientContext value={queryClient}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Issues" component={IssueListWrapper} />
          </Stack.Navigator>
        </NavigationContainer>
      </UseQueryClientContext>
    );
  } else {
    return (
      <MessageScreen enableRefresh={false}>
        Error: query client not found
      </MessageScreen>
    )
  }

}

