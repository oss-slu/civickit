# Testing Instructions

How to get a known database, log in as each role, and check the reporter,
responder, and admin flows. For first-time setup, see [SETUP.md](SETUP.md).

## 1. Reset the database

```bash
cd backend
npm run db:setup     # first time only: starts Postgres and applies migrations
npm run seed:reset   # wipes every row, then seeds
```

Expect `users: 45, issues: 14, organizations: 2, orgMemberships: 3` at the end.
Run `seed:reset` again whenever you want a clean slate, for example after
claiming issues.

The seed only runs against a local database. See
[SETUP.md, Seeding the database](SETUP.md#seeding-the-database) for the guard
and the full list of what gets seeded.

## 2. Test accounts

All passwords are `password123`.

| Email | Role | Org |
|---|---|---|
| `reporter@example.com` | Reporter | none |
| `orgadmin@example.com` | Responder, ORG_ADMIN | Midtown CID (org A) |
| `orgmember@example.com` | Responder, ORG_MEMBER | Midtown CID (org A) |
| `otherorg@example.com` | Responder, ORG_MEMBER | Southside Neighbors (org B) |
| `admin@example.com` | Platform ADMIN | none |

These sign in through the legacy JWT login, `POST /api/auth/login`, which the
mobile app uses. They do not work with BetterAuth (`/api/better-auth`). When the
app moves to BetterAuth (#156), the seed has to create BetterAuth credentials
and this page has to be updated.

## 3. Log in

**Mobile:** start the backend (`npm run dev` in `backend`) and the app
(`npm start` in `mobile`), then sign in with an email above. To switch roles,
tap Logout on the Profile screen and sign in again.

Outside St. Louis, set a dev location first or the map is empty and reporting
is disabled. See [SETUP.md, Developing outside St. Louis](SETUP.md#developing-outside-st-louis).
`38.63965, -90.23581` (Olive and N Spring, Midtown) shows every seeded issue.

**API:**

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "orgmember@example.com", "password": "password123"}'
```

Copy `token` from the response and send it as `Authorization: Bearer <token>`.
The examples below use `$TOKEN`, `$ISSUE`, `$ORG_A`, and `$USER_ID` as
placeholders.

Useful IDs:

```bash
# the issue used in the responder flow
docker exec civickit-db psql -U postgres -d civickit -tAc \
  "SELECT id FROM \"Issue\" WHERE title = 'Unwalkable sidewalk'"

# org ids
docker exec civickit-db psql -U postgres -d civickit -c \
  "SELECT slug, id FROM \"Organization\""
```

Or call `GET /api/organizations/me` as an org member, which returns the org.

## 4. Reporter flow

Log in as `reporter@example.com`.

1. **Map** shows 14 issues. The reporter owns 3 (Unwalkable sidewalk,
   Abandoned items in alleyway, Graffiti on storefront shutter) and endorses 2
   (Traffic signal malfunction at intersection, Street light flickering on
   Washington Ave). Profile should show those counts.
2. Open an issue you do not own and tap **Endorse**, then tap again to remove it.
3. **Report an issue**: take or pick a photo, fill in the form, submit. It
   should appear on the map.
4. There is no Dispatch or Queue tab, and issue pages show Endorse, not Claim.

API checks:

| Request | Expect |
|---|---|
| `GET /api/organizations/me` | `200`, `null` |
| `GET /api/organizations/me/membership` | `200`, `null` |
| `POST /api/issues/$ISSUE/claim` | `403` |

## 5. Responder flow

Use `orgmember@example.com` and `orgadmin@example.com` (org A) together, and
`otherorg@example.com` (org B) as the outsider. The issue is **Unwalkable
sidewalk**, which is unclaimed and inside org A's geofence and scope.

1. As `orgmember@`, open **Dispatch**. Category filters start from Midtown CID's
   scope.
2. Open **Unwalkable sidewalk** and tap **Claim**. It moves to **Queue**.
3. Log in as `orgadmin@`. The issue is in Queue under Midtown CID's claims, with
   **Update** and **Unclaim**. The Update button is not wired up yet, so post
   updates and change status through the API (table below). Any member of the
   claiming org can do this, not just the one who claimed it.
4. Log in as `otherorg@`. The issue page shows Endorse, not Update. Dispatch
   shows Southside Neighbors' scope (graffiti, illegal dumping).
5. As `orgadmin@`, unclaim the issue, or run `seed:reset`.

API checks, after `orgmember@` has claimed `$ISSUE`:

| Request | As | Expect |
|---|---|---|
| `POST /api/issues/$ISSUE/update` with `{"message":"...","status":"IN_PROGRESS","photos":[]}` | `orgadmin@` | `201` |
| `PATCH /api/issues/$ISSUE/status` with `{"status":"RESOLVED"}` | `orgmember@` | `200` |
| same update, status, or `POST .../release` | `otherorg@` | `403` |
| same update, status, or release | `reporter@` | `403` |
| `GET /api/organizations/$ORG_A/getMembershipsbyOrgId` | `orgmember@` | `200`, 2 members |
| same | `otherorg@` | `403` |
| `GET /api/organizations/$USER_ID/getOrgByUserId` for another user | any non-admin | `403` |

**Known gap:** claiming does not check the org's geofence or scope yet (TODO in
`requirePermission`). `otherorg@` can claim Unwalkable sidewalk and gets `200`.
Once that check lands, expect `403`.

## 6. Admin flow

Log in as `admin@example.com`. The admin has no org and is tested through the
API.

| Request | Expect |
|---|---|
| `GET /api/organizations/me` and `/me/membership` | `200`, `null` |
| `GET /api/organizations/$ORG_A/getMembershipsbyOrgId` | `200` (any org) |
| `GET /api/organizations/$USER_ID/getOrgByUserId` | `200` (any user) |
| `GET /api/organizations/$USER_ID/getMembershipByUserId` | `200` (any user) |
| `PATCH /api/issues/$ISSUE/status` | `200` (any issue) |
| `POST /api/issues/$ISSUE/update` | `201` (any issue) |
| `POST /api/issues/$ISSUE/claim` or `/release` | `403` (no org) |

**Known issue in the app:** the Queue tab shows for admins but expects an org,
so opening it as `admin@` crashes. Use the API for admin checks until that is
fixed.

## 7. Automated checks

`backend/src/__tests__/integration/seed.integration.test.ts` seeds a test
database, checks the fixtures, and runs every API check on this page through
the real login and authorization middleware. Run it with:

```bash
cd backend
npm run test:integration -- seed.integration
```
