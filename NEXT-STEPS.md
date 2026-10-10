# Next session

## Hosting and acceptance
1. Import `rhysmarshall1-cloud/rwm-social` into the RWM Vercel team. Select Other, no build/install commands, output directory `.`. The connected Vercel tool could not create a project due to team permissions.
2. Sign in with Rhys's existing RWM OPS owner account. Select the real RWM Landscaping company, avoiding demo companies.
3. Confirm that a draft saved from one device is visible on a second device after login and company selection.
4. Test an OPS completed job with available photos; review and confirm marketing permission, save, edit and approve. Confirm edits reset approval.
5. Verify Solar and Landscaping filters, account pairings and calendar counts. Add the approved RWM SOCIAL logo after the final brand asset is confirmed.

## Meta setup needed from Rhys
- Create or identify the RWM SOCIAL Meta developer app and configure Facebook/Instagram business publishing access. App secret belongs only in server environment variables.
- Confirm both Facebook Pages and Instagram professional account relationships, and authorize access through Meta's consent screen. Never share the Facebook password in chat.
- Landscaping: Facebook RWMlandscaping / Instagram rwmlandscaping.
- Solar: Facebook page ID 61583112135543, currently THE SOLAR BRIT, rename pending / Instagram thesolarbritnj.
- Configure the deployed HTTPS callback, privacy policy and data-deletion requirements, then validate actual permissions and supported account types.

## Remaining implementation after authorization
- Server-only token storage and authorization callback.
- Separate per-platform publication receipts, including partial failure status.
- Durable scheduler, retries, duplicate prevention and timezone handling.
- Provider-supported analytics and permission checks.
- Automatic completed-job suggestions and optional AI caption generation; current job preparation is owner initiated and template based.
- Photo retention/cleanup and larger/resumable uploads if required. Deleted posts currently leave private media for later cleanup; no public access is granted.

Nothing has been published to Facebook or Instagram, and no sample analytics are presented as real data.


## Completed content review improvements
- Search titles and captions; sort by planned date or title; show unscheduled items.
- Duplicate content as a fresh draft without inheriting approval, consent, date or OPS job association.
- Change dates from the queue, returning approved content to draft for review.
- Remove either photo from the composer and cancel edits without saving.
- Caption character count and separate Solar/Landscaping caption templates.
- Jump to a calendar month, return to this month and plan content from individual days.
- Automated queue regression checks cover these interactions. Real browser acceptance remains outstanding after hosting.

## Completed OPS-to-post and queue safeguards
- Search loaded completed jobs and paginate beyond the first 50 results.
- Recognize jobs already queued for the selected business; open the existing post or hide queued jobs.
- Show per-business to-write/draft/approved totals and past planned dates; filter past planned dates.
- Show readiness checks and prevent approval of oversized Instagram captions or unsupported destinations.
- Copy captions and export the filtered queue to CSV without private media links, with formula-like text escaped.
- Confirm before discarding unsaved composer changes and warn before leaving the page.
- Reject empty photos; block saving while photos load; ignore old file reads after replacement, removal or composer reset.
- Expanded mocked runtime checks cover the above. Meta publishing and real browser acceptance are still pending.

## Completed weekly planning and bulk review
- Weekly agenda with previous/next/current week navigation; calendar business filter and month status totals.
- Queue pages of 20 items and selections restricted to the active filter; select the current page or clear selections.
- Move selected dates, clear selected dates and return selected approved items to draft. Date changes revoke approval; no bulk approval or publishing.
- Download a versioned text-plan JSON backup and restore missing items with validation, company checks and stable IDs to avoid repeat imports. Photos, source job links and permission are deliberately excluded; restored approved/posted items become drafts for review.
- Backups retain device-local date strings and record the source timezone. These are content-plan backups, not media/database backups.
