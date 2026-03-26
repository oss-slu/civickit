// mobile/src/screens/IssueListScreen.tsx
import { View, RefreshControl } from 'react-native';
import { useState } from 'react';
import React from 'react';
import IssueCard from '../components/IssueCard';
import { MessageView } from '../components/MessageView';
import { useNavigation } from '@react-navigation/native';
import { StackParams } from '../types/StackParams';
import { StackNavigationProp } from '@react-navigation/stack';
import { globalStyles, spacing } from '../styles';
import { BottomSheetFlatList, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';

export default function IssueListScreen({ issues, refetch, style }: any) {
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation<StackNavigationProp<StackParams>>();

  //check if any data was returned
  if (issues.length == 0) {
    return (
      <View>
        <MessageView enableRefresh={true}
          onRefresh={refetch}
          refreshing={refreshing}>
          No issues nearby
        </MessageView>
      </View>

    )
  }

  //display list
  return (

    <BottomSheetFlatList
      style={{
        ...globalStyles.container,
        flex: undefined,
        marginHorizontal: spacing.md,

      }}
      contentContainerStyle={{ gap: spacing.sm, ...style }}
      data={issues}
      renderItem={({ item }: any) => <IssueCard issue={item}
        onPress={() => navigation.navigate("Issue Details", { issue: item })}
        variant='expanded' />}
      keyExtractor={(item: any) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing}

        onRefresh={refetch} />}
    />


  );

}
