//mobile/src/types/StackParams.ts
import { Issue } from "@civickit/shared"

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