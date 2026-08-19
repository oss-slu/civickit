// shared/src/types/user.ts

import { IssueCategory } from "../enums/issue";
import { OrgStatus, OrgType } from "../enums/organization";
import { UserRole } from "../enums/user";
import { Image } from "./image";

export interface Org {
    id: string,
    name: string,
    profileImage: Image,
    createdAt: string,
    type: OrgType,
    status: OrgStatus;
    categoryScope: IssueCategory[];
    //add geofence later
}
