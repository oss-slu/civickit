// mobile/src/components/Logos.tsx
import { Image } from 'expo-image';
import { View } from 'react-native';

export function Logo({ style }: any) {
    return (
        <View>
            <Image source={require('../../assets/logos/logo.svg')}
                style={{ width: 100, height: 100, ...style }} />
        </View >
    )
}

export function LogoPlusText({ style }: any) {
    return (
        <View>
            <Image source={require('../../assets/logos/logoPlusText.svg')}
                style={{ width: 100, height: 100, ...style }} />
        </View>
    )
}


export function LoopingLogoGif({ style }: any) {
    return (
        <View>
            <Image source={require('../../assets/logos/logoLooping.gif')}
                style={{ width: 100, height: 100, ...style }} />
        </View>
    )
}