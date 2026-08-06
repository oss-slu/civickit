// shared/src/enums/organization.ts

export type OrgType =
    | 'WARD_OFFICE'
    | 'CID'
    | 'BID'
    | 'SBD'
    | 'CDC'
    | 'NONPROFIT'
    | 'CITY_DEPARTMENT'
    | 'OTHER';

export type OrgStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
export type OrgRole = 'ORG_ADMIN' | 'ORG_MEMBER';
export type OrgTier = 'STARTER' | 'GROWTH' | 'FULLSCALE';
export type BoundarySource = 'OFFICIAL' | 'UPLOADED' | 'FREEHAND';
