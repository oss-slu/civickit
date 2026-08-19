// mobile/src/components/MiniMap.tsx
import MapView, { LatLng, Marker, Polygon, PROVIDER_GOOGLE } from "react-native-maps";
import Pin from "./Pin";
import { StyleSheet, View } from "react-native"
import { borderRadius } from "../styles";
import { useEffect, useMemo, useReducer, useState } from "react";
import { usePoints } from "../contexts/PointsContext";
import { isPointInPolygon } from "geolib";

export default function MiniMap({ issue, style, draggable = null, onMarkerDragEnd, mapRef, markerRef }: any) {
    const { stlPoints, worldPoints } = usePoints()
    const boundaryHoles = useMemo(() => [stlPoints], [stlPoints])
    const [pinLocation, setPinLocation] = useState({
        latitude: issue.latitude,
        longitude: issue.longitude
    })

    useEffect(() => {
        setPinLocation({
            latitude: issue.latitude,
            longitude: issue.longitude
        })
    }, [issue.latitude, issue.longitude])


    const onMarkerDragEndLocal = (coordinate: LatLng) => {
        if (!isPointInPolygon(coordinate, stlPoints)) {
            setPinLocation({
                latitude: issue.latitude,
                longitude: issue.longitude
            })
        } else {
            setPinLocation(coordinate)
            onMarkerDragEnd(coordinate)
        }

    }

    const generateRandomNumber = () => {
        var RandomNumber = Math.floor(Math.random() * 100) + 1;
        return RandomNumber;

    }

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
            ref={mapRef}
        >
            <Marker
                coordinate={{
                    latitude: pinLocation.latitude,
                    longitude: pinLocation.longitude,
                }}
                draggable={draggable}
                onDragEnd={(e) => onMarkerDragEndLocal(e.nativeEvent.coordinate)}
                ref={markerRef}
                key={generateRandomNumber()}
            >

                <Pin issue={issue} />
            </Marker>
            <Polygon
                key="stl-outline"
                coordinates={stlPoints}
                strokeColor={'black'}
                strokeWidth={1}
                fillColor='rgba(0,0,0,0)'
            />
            <Polygon
                key="stl-shading"
                coordinates={worldPoints}
                holes={boundaryHoles}
                strokeWidth={0}
                fillColor='rgba(0,0,0,0.25)'
            />
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