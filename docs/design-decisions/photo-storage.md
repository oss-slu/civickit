# Photo storage

How images attach to issues, timeline entries, and profiles — and why the
linking works the way it does.

**Status:** design approved, not yet built. Supersedes the approach taken on
branch `225-consider-image-database-modification-for-multiple-image-issues`,
which is being reworked against this document.

Related: `plans/004-timeline-claim-decline-schema.md` owns
`TimelineEntry.entryType`; this spec adds one value to that enum and depends on
nothing else in 004.

## The problem this solves

Before this work, an image was a URL string. `Issue.images` and
`TimelineEntry.images` were `text[]` of Cloudinary URLs, and each photo's
capture time lived in two columns **on the Issue** — `photoTakenAt` and
`photoTakenAtSource`.

That meant an issue could record exactly one capture time no matter how many
photos it carried. Issue #225 ("multiple image issues") is that constraint.
Status updates carrying their own photos make it worse: those photos have their
own capture times too, and there is nowhere to put them.

A second, smaller problem: nothing stored image dimensions, so the UI could not
lay out a photo before it loaded.

## Goals

1. Each photo carries its own capture time and provenance.
2. Status updates can carry photos, distinguishable from the photos filed with
   the original report.
3. Every photo on an issue is reachable from that issue, whenever it was added.
4. Photos are individually addressable, so moderation and "delete my data" are
   possible later.
5. Removing a photo is reversible.

## Non-goals

- Building the moderation UI. The schema must not foreclose it; that is all.
- Building avatar upload. Profile photos are seeded and displayed today; the
  shape for creating one is recorded below, not implemented.
- Sweeping orphaned Cloudinary assets. See "Known gaps".

## What Cloudinary already gives us

The upload response the app receives at
`mobile/src/services/cloudinaryService.ts` contains `secure_url`, `public_id`,
`width`, `height`, `format`, and `bytes`. Today the function discards all of it
but `secure_url`.

Dimensions therefore never need to be derived from EXIF. Cloudinary's numbers
are post-upload and orientation-normalized, which EXIF's are not. Cloudinary
URLs also accept inline transformations (`c_fill,ar_1:1,w_400,f_auto,q_auto`),
so display sizing is URL construction rather than a stored-dimension
calculation.

What Cloudinary cannot give us is **capture time and GPS** — it strips EXIF on
delivery, and the app needs both before upload anyway, to place the issue on a
map. Those stay client-read and server-stored.

## The core decision

A photo is an **owned part**, not a shared entity. It belongs to exactly one
issue or one timeline entry, permanently, and nothing looks one up on its own
during normal use.

So the link lives on the photo, as a real foreign key, pointing one direction:

```
Photo.issueId  →  Issue.id
```

The rejected alternative — which the 225 branch implemented — was a `text[]` of
ids on the parent *plus* a `source`/`sourceId` back-pointer on the photo. Two
links, pointing at each other, neither checked by Postgres, both maintained by
hand in a controller after the response had been sent. Every structural bug
found in review of that branch traces to it: orphaned rows, no ownership check,
N+1 reads, a back-pointer that could disagree with the array, and a seeder that
wrote URLs into the id column without Postgres objecting.

## Schema

```
Photo
  id                  cuid, PK
  userId              → user(id)            NOT NULL, ON DELETE restrict
  issueId             → Issue(id)           NULL, ON DELETE cascade
  timelineEntryId     → TimelineEntry(id)   NULL, ON DELETE cascade
  url                 text NOT NULL
  publicId            text NULL
  width               int NULL
  height              int NULL
  photoTakenAt        timestamp(3) NULL
  photoTakenAtSource  PhotoTimestampSource NULL      -- enum('exif','device')
  position            int NOT NULL DEFAULT 0
  createdAt           timestamp(3) NOT NULL DEFAULT now()
  deletedAt           timestamp(3) NULL

  INDEX on (issueId), (timelineEntryId), (userId)
```

The two nullable foreign keys encode three states, with no discriminator
column:

| State | `issueId` | `timelineEntryId` |
| --- | --- | --- |
| Original submission photo | set | null |
| Added by a status update | set | set |
| Profile photo | null | null |

`issueId` is set on **every** issue photo regardless of when it arrived, so
"every photo on this issue" is `WHERE issueId = X`. `timelineEntryId IS NULL`
is the definition of "filed with the original report" — there is no separate
flag, type, or source enum, and no `CHECK` constraint, because both columns
being set is the normal and correct state for an update photo.

### Column notes

- **`publicId`** is what makes eventual Cloudinary cleanup possible; a
  `secure_url` cannot be destroyed through the API, a `public_id` can. Nullable
  because seeded placeholder images are not Cloudinary assets.
- **`width`/`height` are nullable, not `-1`.** A sentinel in a `NOT NULL`
  column requires every consumer to know the secret, and dividing by it
  produces negative layout.
- **`photoTakenAt` is nullable.** Profile photos have no capture time, and
  neither does an upload with no EXIF. A `NOT NULL DEFAULT now()` would turn
  "unknown" into "just now", which is what made backdated entries sort
  unpredictably on the 225 branch.
- **`position`** preserves photo order. The array gave this for free; a table
  does not, and ordering by `createdAt` is unreliable across rows inserted in
  the same millisecond.
- **`photoTakenAtSource`** is a Postgres enum. Note that the existing
  `Issue.locationSource` is plain `text` for the same two values; aligning it
  is worthwhile but out of scope here.

### Changes to other tables

Dropped:

- `Issue.imageIds`, `Issue.photoTakenAt`, `Issue.photoTakenAtSource`
- `TimelineEntry.imageIds`
- The `PhotoSource` enum and `Image.source` / `Image.sourceId` from the 225
  branch

Changed:

- `user.profileImageId` and `Organization.profileImageId` become real foreign
  keys to `Photo(id)`, renamed to `profilePhotoId`.

Added:

- `TimelineEntry.entryType`, a `TimelineEntryType` enum defaulting to
  `COMMENT`, with `SYSTEM_REPORT_SUBMITTED` as its other value for now. Plan
  004 extends this enum with `SYSTEM_CLAIMED`, `SYSTEM_DECLINED`,
  `SYSTEM_STATUS_CHANGED`, `SYSTEM_SCHEDULED`, and
  `SYSTEM_REFERRED_TO_CITY`. **When plan 004 is ported to Drizzle its
  `images String[]` field must be dropped** — this spec removes that column.

## Naming

`Photo` throughout: the table, the shared type, the API field (`issue.photos`),
and the repository — `ImageRepository` becomes `PhotoRepository` in
`backend/src/repositories/photo.repository.ts`. `Image` collides with React
Native's `Image` component, which is imported in every file that renders these
— `IssueCard`, `IssueSquare`, `TimelineEntry`, `IssueDetailScreen`. The field
is `url`, not `link`, matching Cloudinary's `secure_url`.

## Write path

**A photo is created by the request that needs it, never on its own.**

There is no photo-creation endpoint. `backend/src/controllers/image.controller.ts`,
`backend/src/routes/image.routes.ts`, `ImageService.updateImageSource`, and
`mobile/src/api/images.ts` are deleted.

### Creating an issue

```jsonc
POST /api/issues
{
  "title": "...", "description": "...", "category": "POTHOLE",
  "latitude": 38.63, "longitude": -90.23, "address": "...",
  "locationSource": "exif",
  "photos": [
    { "url": "https://res.cloudinary.com/<cloud>/image/upload/v1/civickit/issues/abc.jpg",
      "publicId": "civickit/issues/abc",
      "width": 3024, "height": 4032,
      "photoTakenAt": "2026-08-24T14:03:11.000Z",
      "photoTakenAtSource": "exif" }
  ]
}
```

In one transaction: insert the `Issue`, then each `Photo` with `issueId` set
and `position` taken from array index, then the `SYSTEM_REPORT_SUBMITTED`
timeline entry. Respond `201` with the issue and its photos.

Every step is awaited before the response is sent. A failure at any point rolls
the transaction back, so a partial write is not representable.

### Posting an update

```jsonc
POST /api/issues/:issueId/update
{ "message": "Crew dispatched", "status": "IN_PROGRESS", "photos": [ ... ] }
```

In one transaction: insert the `TimelineEntry`, then each `Photo` with
`timelineEntryId` from the new entry and **`issueId` taken from the route
parameter**.

The server sets `issueId`; the client never sends it. A caller therefore cannot
attach a photo to an issue it is not posting to, and no ownership check needs
to exist anywhere.

### Profile photos (shape only, not built)

```
PATCH /api/users/me/avatar   { url, publicId, width, height }
  → transaction: insert Photo (issueId null) → set user.profilePhotoId
```

Same principle: the photo is created by the action that owns it.

## Validation

One zod schema for the `photos` array, shared by both write routes:

| Field | Rule |
| --- | --- |
| `photos` | array, max 3 **per request** |
| `url` | https URL whose host is this project's Cloudinary delivery domain |
| `publicId` | string, optional |
| `width`, `height` | positive integer, optional |
| `photoTakenAt` | ISO date string, optional |
| `photoTakenAtSource` | `exif` or `device`, optional |

The host check restores a guarantee lost on the 225 branch: `createIssueSchema`
previously enforced `z.array(z.string().url())`, its replacement enforced
nothing, and `url` is rendered directly into a React Native `Image` source.

The limit is three photos **per request**, not per issue. An issue accumulates
more over its life as updates add them; that is intended, and the original
report is still capped at three.

Validation runs before any write, so bad input is a `400` and nothing reaches
the database.

## Read path

Two repository methods, each one query, each returning photos already bucketed
by parent:

```ts
// Original submission photos only — timelineEntryId IS NULL.
PhotoRepository.findOriginalsByIssueIds(issueIds: string[]): Promise<Map<string, Photo[]>>
// Photos attached to specific timeline entries.
PhotoRepository.findByTimelineEntryIds(entryIds: string[]): Promise<Map<string, Photo[]>>
```

These are the only two read shapes the app needs. "Every photo on this issue,"
including ones added by updates, is the same query without the
`timelineEntryId IS NULL` clause; no method exists for it yet because
moderation is a non-goal here. Note the asymmetry is deliberate — goal 3 is
satisfied by the *column* being set on every photo, not by a method existing
today.

```sql
SELECT * FROM "Photo"
WHERE "issueId" = ANY($1)
  AND "timelineEntryId" IS NULL      -- originals only
  AND "deletedAt" IS NULL
ORDER BY "position"
```

Services become a map lookup:

```ts
const issues = await this.issueRepository.findNearby(...)
const photos = await this.photoRepository.findOriginalsByIssueIds(issues.map(i => i.id))
return issues.map(issue => ({ ...issue, photos: photos.get(issue.id) ?? [] }))
```

Two queries total, independent of how many issues or photos. The path being
replaced runs one query per photo inside a loop over issues: a 100-issue feed
at 3 photos each is 1 + 300 sequential round trips.

Three constraints on the implementation:

- **The soft-delete filter lives in the repository methods**, not the services,
  so no caller can forget it.
- **Use `push`, not indexed assignment.** `images[i] = image` inside a
  conditional produces a sparse array, which serializes as `null` holes and
  crashes `IssueDetailScreen`.
- **No `any[]`.** `getClaimedByInfo` and `getExtendedIssueInfo` are typed
  `any[]` today, which is precisely why `issue.imageIds` could silently be
  `undefined` after a `delete`. Introduce `IssueWithPhotos = NearbyIssue & { photos: Photo[] }`.

There is also an existing N+1 in `TimelineService.getExtendedInfo`, which calls
`authRepository.findById` once per entry for the author's name. That is a
`JOIN` in the timeline repository and should be fixed in the same pass, since
the function is being rewritten anyway. The comparable N+1 in
`getClaimedByInfo` (up to three queries per claimed issue) is left for a
follow-up.

## Timeline

The initial photos are **not owned by any timeline entry** — their
`timelineEntryId` stays null. The `SYSTEM_REPORT_SUBMITTED` entry *displays*
them by reading `issueId = X AND timelineEntryId IS NULL`. Display is not
ownership; if a synthetic entry owned them, the rule that defines "original
photo" would break immediately.

**The per-photo "Photo Taken" entries are removed.** They existed because
`Issue.photoTakenAt` was a single column and fanning out into separate events
was the only way to express several capture times. Each photo now stores its
own, so the timeline shows one entry for the report and each photo displays its
capture time in the gallery. Three photos produce one timeline row, not four.

`Timeline.tsx` currently decides which entries are unattributed by
string-matching the message `Report Submitted` and comparing array indexes;
when `findLastIndex` returns `-1`, `i >= -1` marks the **entire timeline**
anonymous. Replace with `anonymous={entry.entryType !== 'COMMENT'}`.

## Mobile

1. **`uploadImageToCloudinary` returns `{ url, publicId, width, height }`**
   instead of `secure_url` alone.

2. **Metadata travels through the upload, not alongside it.**
   `uploadPhotos([{ uri, photoTakenAt, photoTakenAtSource }, ...])` returns
   objects that are already the `photos` array of the POST body. Pairing by
   array index across two separate lists is what allows metadata to attach to
   the wrong photo when an upload fails or reorders.

3. **Delete the EXIF dimension logic.** `extractPhotoMetadataFromExif` reads
   `ImageWidth`/`ImageLength` and swaps them when `Orientation === 6`;
   `CameraScreen` then overrides them with the picker's already-corrected
   values, which that swap un-corrects. `ImagePicker` assets and
   `takePictureAsync` results both expose correct `width`/`height` directly.
   EXIF's remaining job is GPS and capture time.

4. **Remove the three `console.log(exif)` calls** in `photoMetadata.ts`. They
   print users' GPS coordinates.

5. **Split `resolvePhotoMetadata` in two.** An issue has one location; each
   photo has its own timestamp.

   ```ts
   resolveIssueLocation(allMetadata, deviceFallback)
     → { latitude, longitude, locationSource }
   resolvePhotoTakenAt(oneMetadata, fallback)
     → { photoTakenAt, photoTakenAtSource }
   ```

   Two defects close here. `locationSource` is currently always `exif`
   because the ternary tests a loop variable that is always truthy; the real
   tests are `isUsableCoordinate(...)` and `metadata.takenAt`. And the issue's
   location currently comes from photo 0 only, where it should come from the
   first photo with usable coordinates — otherwise a second photo's real GPS is
   discarded in favour of the device's.

   Expect `locationSource` to read `device` for most reports once it is
   honest. That is correct, not a regression — see "EXIF GPS availability".

6. **`SelectedImage` takes dimensions as props** from the picker or camera
   asset. It previews a local `file://` URI that has not been uploaded, so a
   database round trip cannot be involved. Fix `height: width` in its
   stylesheet, and the X-button offset that is computed against a different box
   than the one rendered.

7. **Components read `photo.url`.** `IssueCard`, `IssueSquare`,
   `TimelineEntry`, and `IssueDetailScreen` change together.

8. **One `MAX_PHOTOS` constant.** The limit `3` is currently hardcoded in four
   places across `CameraScreen` and `IssueCreationScreen`, and was `5` in two
   of them until recently. It must match the server's per-request cap.

Deferred to a follow-up, independent of everything above: a
`cloudinaryUrl(url, { width, aspect })` helper emitting
`c_fill,ar_1:1,w_400,f_auto,q_auto`. The feed currently downloads full-size
originals to draw 48-pixel thumbnails.

## Error handling

- Validation failures return `400` before any write.
- Both write paths are single transactions; a failure at photo 2 of 3 leaves no
  issue and no photos.
- Nothing is left un-awaited, so `try/catch` sees failures and the response is
  sent last. The 225 branch patched photos in an un-awaited `forEach` after
  `res.json()`; because there is no `process.on('unhandledRejection')` handler
  in `server.ts`, one rejected promise terminates the process. **Add that
  handler regardless**, as a safety net.
- Foreign keys make a dangling reference unrepresentable, so the `null`-hole
  case cannot occur.

## Testing

Unit, in the existing vitest style:

- Photo schema rejects a non-Cloudinary URL, rejects more than three photos,
  and rejects a malformed date. This replaces `rejects images containing a
  non-URL string`, deleted on the 225 branch with no substitute.
- `createIssue` attaches photos with the correct `issueId` and `position`.
- Read grouping maps photos to the correct parents, excludes soft-deleted rows,
  and orders by `position`.
- Update photos receive both `issueId` and `timelineEntryId`.
- `resolveIssueLocation` picks the first photo with usable coordinates, falls
  back to the device, and reports `locationSource` honestly. This is the
  regression test for the always-`exif` defect.
- `resolvePhotoTakenAt` distinguishes `exif` from `device`.

Integration, against Postgres:

- The foreign key rejects a bogus `issueId`.
- Deleting an issue cascades to its photos.
- A forced mid-transaction failure leaves neither issue nor photos.
- After an update adds photos, `issueId = X AND timelineEntryId IS NULL` still
  returns only the originals.

## Migration and rollout

There is no live database, and the 225 branch's renamed columns hold URLs
rather than ids, so no backfill is possible or needed — every environment must
be recreated regardless. Squash into one clean migration.

Two supporting changes:

- Add sqlstate `42701` (duplicate_column) to `ALREADY_EXISTS` in
  `backend/src/db/migrate.ts`. A teammate who pulls without resetting currently
  gets a raw Postgres error; this gives them the existing "recreate your
  database" guidance instead.
- Fix `backend/src/seed-utils.ts`. Its two fallback paths push placeholder
  **URLs** into the id array; a foreign key now rejects that outright. Insert a
  `Photo` row for the placeholder and use its id. Drop the `-1` dimensions in
  favour of `null`.

The PR description must carry `npm run db:reset && npm run seed:run`.

This work reshapes the existing `225-...` branch rather than starting fresh
from `main`. Changes on that branch unrelated to photo storage are kept as they
are — notably the `CameraScreen` unmount-on-blur fix and the photo-limit
correction from five to three, both of which stand on their own.

## EXIF GPS availability

Capture time and GPS come from different places and fail differently. This
matters because `locationSource` is about to start reporting honestly, and the
honest answer is usually `device`.

**Photos taken in the app never carry GPS, on any platform.** `expo-camera`
does not embed location into the images it produces. Since "open the app, take
a photo" is the primary flow, device location is the normal path rather than a
fallback.

**Photos picked from the library carry GPS on iOS, but not on Android.**
Android 10+ redacts GPS tags from images returned through the media picker
unless the app holds `ACCESS_MEDIA_LOCATION`. `mobile/app.json` declares no
`android.permissions` block, and nothing requests that permission at runtime,
which matches the behaviour the team has observed.

Fixing it requires declaring the permission and requesting it at runtime, which
changes the native manifest — so it needs a development build, and there is no
`eas.json` or `android/` directory in the repo today. **That work is out of
scope here and should be its own ticket**, because moving off Expo Go affects
everyone's workflow. Verify on a device before committing to it.

Note what is *not* affected: Android redacts location, not timestamps.
`DateTimeOriginal` arrives intact from the library, and camera captures carry it
too. Per-photo `photoTakenAt` — the reason this redesign exists — works on
Android regardless of how the permission question is settled.

The consequence for this work is only that the always-`exif` defect is
currently *hiding* the Android problem: reports whose coordinates came from the
phone are stored as though they came from the photo. Fixing the ternary makes
the problem visible; it does not cause it.

## Known gaps

- **Orphaned Cloudinary assets.** If an upload succeeds and the subsequent POST
  fails, the asset is stored with nothing referencing it. This is inherent to
  uploading directly from the device and is already true today. Storing
  `publicId` is what makes a future sweep possible — destroy assets under
  `civickit/issues` with no matching row — but that job is not built here.
- **Soft-deleted photos are never cleaned up.** `deletedAt` hides a row; the
  Cloudinary asset survives. Same sweep, same deferral.
- **`Issue.locationSource` stays `text`** while `Photo.photoTakenAtSource` is
  an enum. Worth aligning; not in scope.

## Order of work

1. Schema and migration; `seed-utils` fix; `migrate.ts` sqlstate.
2. Shared types: `Photo`, `CreatePhotoDTO`, updated `Issue`/`Org`/`User`.
3. Backend write path: zod schema, transactional create for issue and update.
4. Backend read path: batched repository methods, real return types, timeline
   `JOIN`.
5. Delete `image.controller.ts`, `image.routes.ts`,
   `ImageService.updateImageSource`, and the two `forEach` patch loops.
6. `TimelineEntry.entryType`; `Timeline.tsx` anonymity.
7. Mobile upload service and `IssueCreationScreen`.
8. Mobile components and `photoMetadata` split.
9. `process.on('unhandledRejection')` in `server.ts`.
10. Tests throughout, not at the end.
