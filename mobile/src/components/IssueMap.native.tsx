// mobile/src/components/IssueMap.native.tsx

import React from 'react';
import MapView, { Marker } from 'react-native-maps';

interface IssueMapProps {
    latitude: number;
    longitude: number;
}

export default function IssueMap({ latitude, longitude }: IssueMapProps) {
    return (
        <MapView
            style={{ height: 300 }}
            initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
        >
            <Marker coordinate={{ latitude, longitude }} />
        </MapView>
    );
}