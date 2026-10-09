# RWM SOCIAL

RWM social planning application. Deploy as a static site on Vercel: framework Other, no build command, output directory root.

## Working today
Manual before/after photo selection, editable template captions, browser-local drafts, draft editing and approval, business/status/day queue filters, clickable planned content counts, business-tagged monthly calendar, and intended Facebook/Instagram account pairings.

## Not yet connected
Meta OAuth, publishing, publication receipts and analytics, cloud persistence, and RWM OPS completed jobs/photo integration. A planned calendar date does not trigger publication. The current business tags are not security isolation; separate authorized workspaces are required before external customers use it.

## Next implementation
Secure shared identity and company permissions; server-side media/drafts; Meta app authorization with server-side token handling; approved dual-platform publishing with independent receipts; scheduled publishing and retry handling; OPS photo selection with marketing consent; live analytics.

Never store provider secrets or access tokens in frontend code or browser storage.

## Database foundation
`database/social-foundation.sql` is applied to the shared OPS Supabase project. Business and post tables use company ownership policies, a composite company/business foreign key, immutable post business ownership, and approval consent/caption guards. No anonymous access is granted. The static UI still uses browser storage; authenticated cloud persistence and media storage are the next integration. No Meta tokens or live posts exist in these tables.

Verification: owner read/update, unauthorized read/write denial, and approval guard tested with rolled-back fixtures. Existing OPS functions and auth password advisories are unrelated to these new tables.
