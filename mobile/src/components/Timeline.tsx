// mobile/src/components/Timeline.tsx
import { View, StyleSheet } from "react-native";
import TimelineEntry from "./TimelineEntry";
import { useMemo } from "react";

export default function Timeline({ entries, issueCategory = 'OTHER' }: any) {

    // Copy before sorting: sort() mutates in place, and `entries` is state owned
    // by the caller.
    const sorted = useMemo(
        () => [...(entries ?? [])].sort(
            (a: any, b: any) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
        ),
        [entries]
    );

    return (
        <View style={styles.timeline}>
            {sorted.map((entry: any, i: number) => (
                <TimelineEntry
                    timelineEntry={entry}
                    issueCategory={issueCategory}
                    key={entry.id}
                    first={i === 0}
                    last={i === sorted.length - 1}
                    // Server-authored entries stay unattributed. entryType is
                    // set at write time, so a user typing "Report Submitted"
                    // into an update cannot make the timeline anonymous.
                    anonymous={entry.entryType !== 'COMMENT'}
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
