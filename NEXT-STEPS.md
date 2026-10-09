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
