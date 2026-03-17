import { Image } from 'expo-image';
import { View } from 'react-native';

export function Logo({ style }: any) {
    return (
        <View style={{ flex: 1 }}>
            <Image source={require('../../assets/logo.svg')} style={{ width: 100, height: 100, ...style }} />
        </View>
    )
}

export function LogoPlusText({ style }: any) {
    return (
        <View style={{ flex: 1 }}>
            <Image source={require('../../assets/logoPlusText.svg')} style={{ width: 100, height: 100, ...style }} />
        </View>
    )
}