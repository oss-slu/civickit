// mobile/src/components/MiniMap.tsx
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Pin from "./Pin";
import { StyleSheet, View } from "react-native"
import { borderRadius } from "../styles";

export default function MiniMap({ issue, style, draggable = null, onMarkerDragEnd, ref }: any) {
    return (
        <MapView
            style={{ ...styles.map, ...style }}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
                latitude: issue.latitude,
                longitude: issue.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            ref={ref}
        >
            <Marker
                coordinate={{
                    latitude: issue.latitude,
                    longitude: issue.longitude,
                }}
                draggable
                onDragEnd={(e) => onMarkerDragEnd(e.nativeEvent.coordinate)}
            >

                <Pin issue={issue} />
            </Marker>
        </MapView>
    )
}

const styles = StyleSheet.create({
    map: {
        height: 220,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
})