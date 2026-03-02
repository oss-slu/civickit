//mobile/src/types/StackParams.ts
import { Issue } from "../components/IssueCard"

export type StackParams = {
    Issues: {},
    CreateIssue: {},
    IssueDetails: {
        issue: Issue
    },
    Error: {
        errorMessage: string
    },
}