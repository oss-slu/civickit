// shared/src/enums/issue.ts

export type IssueCategory =
    | 'POTHOLE'
    | 'STREETLIGHT'
    | 'GRAFFITI'
    | 'ILLEGAL_DUMPING'
    | 'BROKEN_SIDEWALK'
    | 'TRAFFIC_SIGNAL'
    | 'OTHER';

export type IssueStatus =
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'CLOSED';
