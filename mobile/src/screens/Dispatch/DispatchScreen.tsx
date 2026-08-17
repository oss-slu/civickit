//mobile/src/screens/Dispatch/DispatchScreen.tsx

import { ScrollView, View } from "react-native";
import { useNearbyIssues } from "../../contexts/NearbyIssuesContext";
import LoadingScreen from "../Misc/LoadingScreen";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../../types/StackParams";
import { useEffect } from "react";

export default function DispatchScreen() {
    // const { data, isLoading, isFetching, error, refetch } = useNearbyIssues()
    // const navigation = useNavigation<StackNavigationProp<StackParams>>()

    // useEffect(() => {

    // }, [data])

    // if (isLoading) {
    //     return <LoadingScreen />
    // } else if (error) {
    //     navigation.navigate('Error', { errorMessage: "There was an Error" })
    // }
    return (
        <ScrollView>
        </ScrollView>
    )
}