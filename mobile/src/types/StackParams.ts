//mobile/src/types/StackParams.ts
import { Issue } from "../components/IssueCard"

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