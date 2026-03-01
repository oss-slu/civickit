import { MessageView } from "../components/MessageView";

export default function ErrorScreen({ route }: any) {
    const errorMessage = route.params.errorMessage;

    return (
        <MessageView>
            {errorMessage}
        </MessageView>
    )
}