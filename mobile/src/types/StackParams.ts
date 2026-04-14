//mobile/src/types/StackParams.ts
import { Issue } from "@civickit/shared"

export type StackParams = {
    "Nearby Issues": {},
    "Issue List": {},
    "Report An Issue": {},
    "Issue Details": {
        issue: Issue
    },
    "Error": {
        errorMessage: string
    },
    "Main": {},
    "Register": {},
    "Login": {},
    "Camera": {},
    "Photo Validation": {
        uri: string
    }
}