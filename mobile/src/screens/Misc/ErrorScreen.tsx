// mobile/src/screens/Misc/ErrorScreen.tsx
import { StaticScreenProps } from "@react-navigation/native";
import { MessageView } from "../../components/MessageView";

type Props = StaticScreenProps<{
    errorMessage: string;
}>;

export default function ErrorScreen({ route }: Props) {
    const errorMessage = route.params.errorMessage;

    return (
        <MessageView>
            {errorMessage}
        </MessageView>
    )
}