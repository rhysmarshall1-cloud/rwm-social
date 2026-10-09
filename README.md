# RWM SOCIAL

Static social content planning app, with Supabase owner login and company data. Deploy the repository to Vercel using framework Other, no build command, no install command, and output directory `.`.

## Implemented
- Local planning without login; owner login using the existing RWM OPS identity.
- Explicit company selection; cloud business and post data protected by row security.
- Separate Landscaping and Solar content namespaces, with Facebook + Instagram as the default destinations.
- Draft editing, approval, return to draft, and company/date/status queue filters.
- Monthly counts for posts to write, drafts and approved items. Calendar counts open matching content.
- Private JPG/PNG/WEBP uploads up to 3 MB; business-specific storage paths and 30-minute preview URLs.
- Completed OPS jobs and latest available before/after photos can populate the composer. No customer contact details or address are automatically included in captions.
- Explicit marketing permission before saving job photos as a social draft.
- Optimistic updates reject stale edits from another device. Editing approved content resets it to draft on the server.
- Local drafts import only after the owner chooses a company and confirms the import. Imported content requires fresh review.

## Not connected
Meta OAuth, actual Facebook/Instagram publishing, scheduled execution, publication receipts, live analytics and AI caption generation. Captions currently use a template. An approved post does not publish. The Posted calendar category is reserved for future confirmed provider receipts, not a manual success toggle.

## Credentials
`config.js` contains only the project's public publishable key. User access/refresh tokens stay in memory and are validated server-side. Closing/reloading the page requires login again. No passwords, service-role keys, Meta tokens or Meta secrets are committed or persisted by this app.

## Database
`database/social-foundation.sql` and `database/social-cloud-media.sql` document the applied changes in the shared OPS Supabase project. Company owner policies enforce data access, and source jobs must be completed jobs in the same company. New business records are initialized only after an owner explicitly selects a company.

## Verification
Run `node tests/queue-runtime.cjs` and `node tests/cloud-client.cjs`. These verify local runtime behavior and the cloud client against mocked API responses. Live database checks passed for owner access, unauthorized denial, business-specific media paths, approval reset and Instagram media requirements, using rolled-back fixtures. Supabase security advisors report no findings specific to the new social objects.

Real owner-login/upload/job-import browser acceptance remains to be done after hosting is connected. Browser visual testing was unavailable because the browser download failed; this is not a claim of end-to-end production verification.

## Next session
See `NEXT-STEPS.md` for deployment, acceptance and Meta setup requirements.
