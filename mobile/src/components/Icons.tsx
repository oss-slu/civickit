import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleProp, TextStyle } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from "react";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

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

