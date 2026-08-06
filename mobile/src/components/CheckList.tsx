import React, { useEffect, useState } from "react";
import { View, Modal, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Button from "./Button";
import { borderRadius, colors, palette, size, spacing, typography } from "../styles";
import { Checkbox } from 'expo-checkbox';
import WrapperButton from "./WrapperButton";
import { FilterIcon } from "./Icons";

export default function CheckList({ data, selectedValues, setSelectedValues, checkBoxColor = palette.ckYellow }: any) {
    const [selected, setSelected] = useState<boolean[]>([])

    useEffect(() => {
        let list: boolean[] = []

        for (let i = 0; i < data.length; i++) {
            if (selectedValues.includes(data[i])) {
                list.push(true);
            } else {
                list.push(false)
            }
        }
        setSelected(list)

    }, [selectedValues])



    const handleSelect = (item: any, i: any) => {
        // setSelectedValue(item);
        const newSelected = selected.map((item, index) => {
            if (i == index) {
                return !item
            } else {
                return item
            }
        })
        setSelected(newSelected)

        let newSelectedValues: string[] = []
        for (let i = 0; i < data.length; i++) {
            if (newSelected[i]) {
                newSelectedValues.push(data[i])
            }
        }
        setSelectedValues(newSelectedValues)
    }

    const checklist = data.map((item: any, index: number) =>
        <TouchableOpacity
            style={styles.option}
            onPress={() => handleSelect(item, index)}
            key={index.toString()}>
            <Checkbox
                value={selected[index]}
                color={selected[index] ? checkBoxColor : undefined}
            />
            <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
    )

    return (
        <View>
            {checklist}
        </View>

    )
}

const styles = StyleSheet.create({


    option: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.ckLightGray,
        color: colors.textPrimary,
        flexDirection: "row",
        columnGap: spacing.xs
    },
    optionText: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg
    },

})