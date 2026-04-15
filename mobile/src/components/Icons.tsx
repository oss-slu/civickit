// mobile/src/components/Icons.tsx
//icons sourced from https://icons.expo.fyi/Index
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleProp, TextStyle } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from "react";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

interface IconProps {
    color?: string,
    size?: number,
    style?: StyleProp<TextStyle>
}

export function LocationPinIcon(props: IconProps) {
    return (
        <Entypo name="location-pin"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function PictureIcon(props: IconProps) {
    return (
        <AntDesign name="picture"
            color={props.color}
            size={props.size}
            style={props.style}
        />
    )
}

export function CameraIcon(props: IconProps) {
    return (
        <AntDesign name="camera"
            color={props.color}
            size={props.size}
            style={props.style}
        />
    )
}

export function CloseXIcon(props: IconProps) {
    return (
        <AntDesign name="close"
            color={props.color}
            size={props.size}
            style={props.style}
        />
    )
}

export function WrenchIcon(props: IconProps) {
    return (
        <MaterialCommunityIcons name="wrench-outline"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function ClockIcon(props: IconProps) {
    return (
        <Feather name="clock"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function TagIcon(props: IconProps) {
    return (
        <AntDesign name="tag"
            color={props.color}
            size={props.size}
            style={props.style}
        />
    )
}

export function CategoryIcon(props: IconProps) {
    return (
        <MaterialIcons name="category"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function RoadIcon(props: IconProps) {
    return (
        <FontAwesome name="road"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function TrafficConeIcon(props: IconProps) {
    return (
        <MaterialCommunityIcons name="traffic-cone"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function TrafficLightIcon(props: IconProps) {
    return (
        <FontAwesome5 name="traffic-light"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function LightBulbIcon(props: IconProps) {
    return (
        <FontAwesome5 name="lightbulb"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function SprayPaintIcon(props: IconProps) {
    return (
        <MaterialCommunityIcons name="spray"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function TrashIcon(props: IconProps) {
    return (
        <Feather name="trash-2"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function BrokenIcon(props: IconProps) {
    return (
        <MaterialIcons name="broken-image"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function ErrorIcon(props: IconProps) {
    return (
        <MaterialIcons name="error"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function AddIcon(props: IconProps) {
    return (
        <AntDesign name="plus"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function ExclamationPointIcon(props: IconProps) {
    return (
        <FontAwesome name="exclamation"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function RefreshIcon(props: IconProps) {
    return (
        <Ionicons name="refresh-sharp"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function FilterIcon(props: IconProps) {
    return (
        <Ionicons name="filter-outline"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function StatusIcon(props: IconProps) {
    return (
        <MaterialCommunityIcons name="progress-check"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function WarningIcon(props: IconProps) {
    return (
        <FontAwesome name="warning"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function UpvoteIcon(props: IconProps) {
    return (
        <Entypo name="arrow-bold-up"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function RightArrowIcon(props: IconProps) {
    return (
        <Feather name="arrow-right"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function PlusIcon(props: IconProps) {
    return (
        <AntDesign name="plus"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function SearchIcon(props: IconProps) {
    return (
        <Feather name="search"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function CalendarIcon(props: IconProps) {
    return (
        <Feather name="calendar"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function UserIcon(props: IconProps) {
    return (
        <Feather name="user"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function RecenterIcon(props: IconProps) {
    return (
        <AntDesign name="aim"
            color={props.color}
            size={props.size}
            style={props.style}
        />
    )
}

export function FlipCameraIcon(props: IconProps) {
    return (
        <MaterialIcons name="flip-camera-android"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function LightingOutlineIcon(props: IconProps) {
    return (
        <MaterialCommunityIcons name="lightning-bolt-outline"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function LightingFillIcon(props: IconProps) {
    return (
        <MaterialCommunityIcons name="lightning-bolt"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function FlashlightOnIcon(props: IconProps) {
    return (
        <MaterialIcons name="flashlight-on"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function FlashlightOffIcon(props: IconProps) {
    return (
        <MaterialIcons name="flashlight-off"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}

export function MapIcon(props: IconProps) {
    return (
        <Feather name="map"
            color={props.color}
            size={props.size}
            style={props.style} />
    )
}