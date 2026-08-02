# The responder model

How organization members get their abilities and why it works that way.

**Status:** the schema groundwork is in place — `Organization` and `OrgMembership`
exist, with slug, boundary provenance, and membership timestamps. **The permission work
described here is not built yet**, so today an org member still cannot update an issue's
status. That is the gap this document exists to close.

## What a responder is

A responder is **anyone who belongs to an organization**. There is no `RESPONDER` value
in the platform `Role` enum and there should not be one — membership in an org is what
makes someone a responder, and it is what scopes them to that org.

```
User ──< OrgMembership >── Organization
              │
              └── OrgRole: ORG_ADMIN | ORG_MEMBER
```

## What a responder can do

**Every member of an org can work issues — this is not limited to admins.** An ordinary
`ORG_MEMBER` claims issues and updates their status. `ORG_ADMIN` is about running the
organization, not about doing the work.

| Ability | ORG_MEMBER | ORG_ADMIN | Scope |
| --- | :---: | :---: | --- |
| See issues in the org's service area | yes | yes | Anything inside the geofence, claimed or not |
| Claim an issue | yes | yes | Must be in the service area |
| Decline / refer an issue | yes | yes | Must be in the service area |
| **Update issue status** | **yes** | **yes** | Only issues the org has claimed |
| Post timeline updates | yes | yes | Only issues the org has claimed |
| Invite / remove members | no | yes | Their own org |
| Edit org settings and service area | no | yes | Their own org |

The platform `ADMIN` role is a separate thing entirely — site-wide moderation, not org
work. A responder never needs it.

### Read scope and write scope deliberately differ

| | Scope | Check |
| --- | --- | --- |
| **Read** | Service area | `ST_Covers(org.geofence, issue point)` |
| **Write** | Claimed only | `issue.claimedByOrgId` is one of the user's orgs |

They have to differ because of read-before-claim: a responder must be able to see an
unclaimed issue in their area in order to claim it. If reads were also limited to
claimed issues, the Dispatch feed would always be empty.

Going the other way — allowing writes anywhere in the service area — lets two orgs with
overlapping areas edit the same issue simultaneously with nothing arbitrating between
them. The claim is what settles ownership.

## Why membership-derived instead of a `RESPONDER` role

Adding `RESPONDER` to the platform `Role` enum would slot into the existing permission
map with almost no work. It was rejected because the platform role is global: a
responder would then be able to update **any** issue on the platform, including issues
belonging to other organizations. There is nothing in a global role that can express
"only this org's issues."

Scope has to come from the membership, because the membership is the only thing that
knows which org a person belongs to.

## How permissions work today, and why this currently breaks

Permissions are a flat map keyed only by the platform role:

```ts
// backend/src/config/permissions.ts
const reporter_perms = ['create:issue', 'create:upvote', 'read:upvote',
                        'delete:upvote', 'create:upload_signature'];

export const rolePermissions: Record<Role, string[]> = {
    REPORTER: reporter_perms,
    ADMIN: [...reporter_perms, 'update:issue_status'],
};
```

The check that consumes it is resource-blind — it looks at who you are, never at what
you are touching:

```ts
// backend/src/middleware/authorize.middleware.ts:22
const allowed = rolePermissions[user.role];
```

**The concrete failure:** `update:issue_status` belongs to `ADMIN` only. An org member
who is a platform `REPORTER` gets a **403** when updating an issue their own
organization claimed. That is the wrong outcome, and it is the whole reason this
document exists.

## What has to change

Two pieces:

1. **An org-aware permission path** alongside the existing one. Given a request, it
   needs to resolve which org the resource belongs to, confirm the user has an
   `OrgMembership` in that org, and only then allow the action. The existing
   `requirePermission` cannot express this because it never looks at the resource.

2. **A claim field on `Issue`.** The write-scope check reads `issue.claimedByOrgId`,
   **which does not exist yet.** Until an issue can record which org claimed it, there
   is nothing to check writes against. This is the blocking dependency — the read path
   (service-area filtering) can be built first, since it only needs the geofence query.

3. **Updated authz tests.** The existing tests assert that a non-`ADMIN` is refused
   `update:issue_status`. That assertion becomes wrong once org members can update the
   status of issues their org claimed, and will need to encode the new rule instead.

## Other decisions made alongside this

### Tiers are labels; limits live in code

`OrgTier { STARTER, GROWTH, FULLSCALE }` stays as-is. What a tier *grants* does not
belong in the database:

```ts
// backend/src/config/tiers.ts  (does not exist yet)
export const TIER_LIMITS = {
  STARTER:   { seats: 3,    maxAreaKm2: 5,    features: [] },
  GROWTH:    { seats: 15,   maxAreaKm2: 50,   features: ['reports'] },
  FULLSCALE: { seats: null, maxAreaKm2: null, features: ['reports', 'api'] },
};
```

The dimensions are still undecided — somewhere between seat count, geographic size, and
feature gating. Names that encode a dimension (`SINGLE_DISTRICT`, `MULTI_SITE`) become
false as soon as the dimension changes. `STARTER / GROWTH / FULLSCALE` never claimed to
describe a mechanism, so they survive a change of mind, and changing what a tier grants
is a code edit rather than a migration.

If tiers do end up geography-based, measure **`ST_Area(geofence)`**, never a count of
pieces. One org stores a single MultiPolygon that may contain several disjoint pieces, so
a two-piece business district and a single ward bisected by a river both report
`ST_NumGeometries = 2`.

### Say "service area", not "district"

`Issue.district` already exists and holds a neighborhood name (`'Midtown'` in the seed
data). Reusing the word for org territory would give it two unrelated meanings in one
schema. "District" also only fits wards and business districts — not nonprofits, park
conservancies, or campuses. "Service area" is neutral across every org type.

### Boundary provenance needs a reference

`BoundarySource { OFFICIAL, UPLOADED, FREEHAND }` records *how* a geofence was created
but not *which* source it came from. Two columns, now present on `Organization`:

```prisma
boundaryRef      String?    // OFFICIAL: "stl-open-data:wards-2023:ward-17"
                            // UPLOADED: file URL or storage key
                            // FREEHAND: null
boundarySyncedAt DateTime?
```

Official boundaries go stale. St. Louis went from 28 wards to 14 in 2022. Without a
reference there is no way to detect that, and issues quietly route to the wrong ward
office with nothing surfacing the problem.

### Organization slugs

A slug is a short, URL-safe form of the organization's name — lowercase, hyphens for
spaces, no punctuation or accents:

| `name` | `slug` |
| --- | --- |
| Midtown CID | `midtown-cid` |
| Ward 7 Office | `ward-7-office` |
| Tower Grove Neighborhood Assoc. | `tower-grove-neighborhood-assoc` |

**What it is for: addressability.** Every org already has a unique `id` (a cuid), and
that is what guarantees two orgs are distinguishable — the slug does not add that. What
the slug adds is a form that can appear in a URL a human will read, type, or paste:

```
/orgs/clx7k2p9q0000abcd1234efgh     — the id
/orgs/midtown-cid                    — the slug
```

Both address the same row. Only one survives being pasted into a support ticket.

`slug` is `UNIQUE` because it is used as a lookup key — `WHERE slug = 'midtown-cid'`
must return exactly one row, or the URL is ambiguous. `name` is deliberately left
unconstrained.

**That combination relocates the duplicate-name problem rather than solving it.** Two
orgs may both be named "Ward 7 Office", but they cannot both be `ward-7-office`; one
becomes `ward-7-office-2` or `ward-7-office-stl`. This is the intended trade — a
collision is resolved once, at signup, instead of a `UNIQUE` constraint on the display
name hard-blocking a legitimate organization from registering at all.

Two decisions the registration wizard still owes:

1. **Collision strategy** — numeric suffix, city suffix, or prompt the user. A numeric
   suffix is the usual default.
2. **Rename behaviour** — when "Midtown CID" becomes "Midtown Community District", the
   slug should **stay frozen** at its original value. Regenerating it breaks every saved
   link and every URL anyone has shared. If slugs ever do need to follow the name, that
   requires keeping the old slug as a redirect, not overwriting it.

Neither is blocking, but the second is the one that causes damage quietly, and it is
much cheaper to decide before orgs exist than after.

### Smaller items

Done:

- `OrgMembership.updatedAt`, so role promotions and demotions leave a trace.

Still to enforce in code:

- An empty `categoryScope` means **routes nothing**, and org setup must require at least
  one category. Defining empty as "all" would flood a misconfigured org.

## Notes for the Drizzle migration

The geofence is the fragile part. Carry these over deliberately:

- **Column type** `geography(MultiPolygon,4326)`. MultiPolygon rather than Polygon
  because business districts are assembled parcel-by-parcel and are routinely
  non-contiguous, and city open-data exports are often authored as MultiPolygon
  regardless. The overhead is a flat 8 bytes.
- **A GIST index** on that column. Without one, every service-area lookup is a
  sequential scan.
- **Writes** must wrap single polygons in `ST_Multi(...)`; an unwrapped `Polygon` is
  rejected by the column type.
- **Reads** must stay in `geography` and use `ST_Covers` / `ST_Intersects`. Casting via
  `geofence::geometry` produces a different expression than the indexed one and silently
  falls back to a sequential scan.

Drizzle can express both the custom column type and the GIST index directly, so the
Prisma `Unsupported(...)` workaround does not need to carry over.

## Known gaps

- **Supabase:** the migration chain currently fails against a Supabase-style layout with
  `type "geometry" does not exist`, because PostGIS lives in an `extensions` schema
  rather than `public`. Fix is to include `extensions` on the `search_path`. Pre-existing
  and unrelated to the org work.
- **Row Level Security** is disabled on `Organization` and `OrgMembership`. Supabase
  exposes tables to the anon key through PostgREST, and `OrgMembership` maps users to
  orgs. The backend connects as table owner and bypasses RLS, so enabling it costs
  nothing.
