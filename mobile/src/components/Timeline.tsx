// mobile/src/components/Timeline.tsx
import { View, StyleSheet } from "react-native";
import TimelineEntry from "./TimelineEntry";
import { spacing } from "../styles";
import { useEffect, useState } from "react";

export default function Timeline({ entries }: any) {

    const [list, setList] = useState<any[]>()
    useEffect(() => {
        if (entries != undefined) {
            const sortedEntries = entries.sort((a: any, b: any) => { return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf() })

            if (sortedEntries.length > 2) {
                setList([<TimelineEntry timelineEntry={sortedEntries[0]} key={sortedEntries[0].id} first={true} />,
                ...sortedEntries.slice(1, -2).map((entry: any) => <TimelineEntry timelineEntry={entry} key={entry.id} />),
                <TimelineEntry timelineEntry={sortedEntries[sortedEntries.length - 2]} key={sortedEntries[sortedEntries.length - 2].id} anonymous={true} />,
                <TimelineEntry timelineEntry={sortedEntries[sortedEntries.length - 1]} key={sortedEntries[sortedEntries.length - 1].id} last={true} anonymous={true} />
                ])
            } else if (sortedEntries.length == 2) {
                setList([<TimelineEntry timelineEntry={sortedEntries[0]} key={sortedEntries[0].id} first={true} anonymous={true} />,
                <TimelineEntry timelineEntry={sortedEntries[1]} key={sortedEntries[1].id} last={true} anonymous={true} />
                ])
            } else {
                setList([<TimelineEntry timelineEntry={sortedEntries[0]} key={sortedEntries[0].id} first={true} last={true} anonymous={true} />])
            }

        }
    }, [entries])

    return (
        <View style={styles.timeline}>
            {list}
        </View>
    )

}

const styles = StyleSheet.create({
    timeline: {
        flexDirection: "column",
        // rowGap: spacing.xl
    }
})