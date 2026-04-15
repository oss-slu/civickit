//mobile/src/components/IconButton.tsx
import { useEffect, useRef } from 'react';
import { globalStyles } from '../styles';
import { TouchableOpacity, Animated, Easing } from 'react-native';

export default function IconButton({ onPress, style, isDisabled = false, loading = false, children, }: any) {
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (loading) {
            // Start a continuous spin animation while loading
            const loop = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            loop.start();
            return () => loop.stop();
        } else {
            // Reset rotation when not loading
            spinAnim.setValue(0);
        }
    }, [loading, spinAnim]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const disabled = isDisabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.6}
            style={[
                disabled ? globalStyles.disabledbutton : globalStyles.button,
                style,
                loading ? { opacity: 0.7 } : undefined,
            ]}
        >
            {loading ? (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    {children}
                </Animated.View>
            ) : (
                children
            )}
        </TouchableOpacity>
    )

}
