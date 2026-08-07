import { View } from "react-native";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { StackParams } from "../../types/StackParams";

export default function SettingsScreen() {
    //change name
    //change password
    //dark mode
    const navigation = useNavigation<StackNavigationProp<StackParams>>();
    return (
        <View>
            <Header
                title="Settings"
                onBackPress={navigation.goBack} />
        </View>
    )

}