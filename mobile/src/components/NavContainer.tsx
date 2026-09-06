//mobile/src/components/NavContainer.tsx
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking'

export default function NavContainer({ children }: any) {
    const linking = {
        prefixes: [Linking.createURL('/'), "org.civickit.civickit://"],

        // Custom function to get the URL which was used to open the app
        async getInitialURL() {
            // First, handle deep links
            const url = await Linking.getInitialURL();

            if (url != null) {
                return url;
            }

            // Handle URL from expo push notifications
            const response = await Notifications.getLastNotificationResponseAsync();
            return response?.notification.request.content.data.url;
        },

        // Custom function to subscribe to incoming links
        subscribe(listener: any) {
            // Listen to incoming links for deep links
            const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
                listener(url);
            });

            // Listen to expo push notifications when user interacts with them
            const pushNotificationSubscription =
                Notifications.addNotificationResponseReceivedListener((response) => {
                    const url = response.notification.request.content.data.url;
                    listener(url);
                });

            return () => {
                // Clean up the event listeners
                linkingSubscription.remove();
                pushNotificationSubscription.remove();
            };
        },

        config: {
            screens: {
                Main: {
                    screens: {
                        Map: {
                            screens: {
                                "Issue Details": 'maps/details/:id'
                            }
                        }
                    }
                }
            }
        },
    };


    return (
        <NavigationContainer linking={linking}>
            {children}
        </NavigationContainer>
    )
}