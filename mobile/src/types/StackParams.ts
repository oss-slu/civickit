//mobile/src/types/StackParams.ts
import { GetNearbyIssueResponse, Issue, User } from "@civickit/shared"
import type { PhotoMetadata } from "../utils/photoMetadata"

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
        metadata?: PhotoMetadata
    },
    "Statistics": {},
    "Stats Nav": {},
    "Leaderboard": {
        issues: any[]
        endorsementsOption?: boolean
        dateReportedOption?: boolean
        dateUpdatedOption?: boolean
        distanceOption?: boolean
    },
    "Profile": {},
    "Avatar": {
        user: User | null
    },
    "Settings": {},
    "My Issues": {
        issues: any[]
        endorsementsOption?: boolean
        dateReportedOption?: boolean
        dateUpdatedOption?: boolean
        distanceOption?: boolean
    },
    "My Endorsements": {
        issues: any[]
        endorsementsOption?: boolean
        dateReportedOption?: boolean
        dateUpdatedOption?: boolean
        distanceOption?: boolean
    },
    "DuplicateCheck": {}
}
