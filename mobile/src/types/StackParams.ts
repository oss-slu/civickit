//mobile/src/types/StackParams.ts
import { Issue } from "@civickit/shared"

export type StackParams = {
    "Nearby Issues": {},
    "Create Issue": {},
    "Issue Details": {
        issue: Issue
    },
    "Error": {
        errorMessage: string
    },
}