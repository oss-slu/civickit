//mobile/src/types/StackParams.ts
import { Issue } from "../components/IssueCard"

//TODO: create seperate list of screen names
export type StackParams = {
    "Nearby Issues": {},
    "Create Issue": {},
    "Issue Details": {
        issue: Issue
    },
    Error: {
        errorMessage: string
    },
}