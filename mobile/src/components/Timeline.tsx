// mobile/src/components/Timeline.tsx
import { View, StyleSheet } from "react-native";
import TimelineEntry from "./TimelineEntry";
import { useMemo } from "react";

export default function Timeline({ entries }: any) {

    // Copy before sorting: sort() mutates in place, and `entries` is state owned
    // by the caller.
    const sorted = useMemo(
        () => [...(entries ?? [])].sort(
            (a: any, b: any) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
        ),
        [entries]
    );

    //finds earliest "Report Submitted" and makes everything submitted before that anonymous
    const reportSubmitted = sorted.findLastIndex(entry => entry.message == 'Report Submitted')
    return (
        <View style={styles.timeline}>
            {sorted.map((entry: any, i: number) => (
                <TimelineEntry
                    timelineEntry={entry}
                    key={entry.id}
                    first={i === 0}
                    last={i === sorted.length - 1}
                    // the two oldest entries are the auto-generated "Report
                    // Submitted" / "Photo Taken" pair, which stay unattributed
                    anonymous={i >= reportSubmitted}
                />
            ))}
        </View>
    )

}

const styles = StyleSheet.create({
    timeline: {
        flexDirection: "column",
    }
})
