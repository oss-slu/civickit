// mobile/src/components/SelectedImageGallery.tsx
import { useState, } from "react";
import { FlatList, View, Image, StyleSheet } from "react-native";
import { borderRadius, colors, palette, spacing } from "../styles";
import SelectedImage from "./SelectedImage";

export default function SelectedImageGallery({ images, metadata, width, height, onDeletePressed }: any) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    return (
        <View style={{ width: width, height: height }}>
            <FlatList
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={images}
                keyExtractor={(_, idx) => idx.toString()}
                onMomentumScrollEnd={(event) => {
                    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                    setActiveImageIndex(nextIndex);
                }}
                renderItem={({ item, index }) => (
                    <SelectedImage
                        source={item}
                        metadata={metadata?.[index] ?? {}}
                        style={[styles.image]}
                        width={width}
                        height={height}
                        onDeletePressed={onDeletePressed}
                    />
                )}
            />
            {images.length > 1 && (
                <View style={styles.imageDots}>
                    {images.map((_: any, index: any) => (
                        <View
                            key={index}
                            style={[
                                styles.imageDot,
                                index === activeImageIndex ? styles.imageDotActive : styles.imageDotInactive
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    image: {
        borderRadius: borderRadius.md,
        backgroundColor: palette.ckLightGray,
        resizeMode: 'contain',
    },

    imageDots: {
        position: 'absolute',
        bottom: spacing.sm,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
        backgroundColor: 'rgba(17, 24, 39, 0.35)',
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },

    imageDot: {
        width: spacing.sm,
        height: spacing.sm,
        borderRadius: borderRadius.full,
    },

    imageDotActive: {
        backgroundColor: colors.textContrast,
        opacity: 0.95,
    },

    imageDotInactive: {
        backgroundColor: colors.textContrast,
        opacity: 0.45,
    },
})