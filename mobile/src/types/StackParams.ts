//mobile/src/types/StackParams.ts
import { Issue } from "@civickit/shared"

export type StackParams = {
    "Nearby Issues": {},
    "Issue List": {}
    "Create Issue": {},
    "Issue Details": {
        issue: Issue
    },
    "Error": {
        errorMessage: string
    },
    "Register": {},
    "Login": {},
}