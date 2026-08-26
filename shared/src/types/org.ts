// shared/src/types/user.ts

import { IssueCategory } from "../enums/issue";
import { OrgStatus, OrgType } from "../enums/organization";
import { UserRole } from "../enums/user";
import { Photo } from "./photo";

export interface Org {
    id: string,
    name: string,
    profilePhoto?: Photo | null,
    createdAt: string,
    type: OrgType,
    status: OrgStatus;
    categoryScope: IssueCategory[];
    //add geofence later
}
