// mobile/src/components/IssueMap.web.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IssueMapProps {
    latitude: number;
    longitude: number;
}

export default function IssueMap({ latitude, longitude }: IssueMapProps) {

    const position: LatLngExpression = [latitude, longitude];

    return (
        <div style={{ height: 300 }}>
            <MapContainer
                center={position}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[latitude, longitude]}>
                    <Popup>Issue Location</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}