**To create a new type:**
1. In a file in `shared/types`, define your new interface
2. Add an export to your interface in `shared/index.ts`
3. In the `backend` or `mobile`, import your new interface
    * Ex. `import { Issue } from '@civickit/shared'`

**To create a new enum:**
1. In a file in `shared/enums`, define your new type
    * Instead of an actual enum, use a string union
    * Ex. `export type IssueStatus =
      | 'OPEN'
      | 'IN_PROGRESS'
      | 'RESOLVED'
      | 'CLOSED';`
2. Add an export to your type in `shared/index.ts`
3. In the `backend` or `mobile`, import your new type
    * Ex. `import { IssueStatus } from '@civickit/shared'`
