# RWM SOCIAL

RWM social planning application. Deploy as a static site on Vercel: framework Other, no build command, output directory root.

## Working today
Manual before/after photo selection, editable template captions, browser-local drafts, draft editing, planned content counts, business-tagged monthly calendar, and intended Facebook/Instagram account pairings.

## Not yet connected
Meta OAuth, publishing, publication receipts and analytics, cloud persistence, and RWM OPS completed jobs/photo integration. A planned calendar date does not trigger publication. The current business tags are not security isolation; separate authorized workspaces are required before external customers use it.

## Next implementation
Secure shared identity and company permissions; server-side media/drafts; Meta app authorization with server-side token handling; approved dual-platform publishing with independent receipts; scheduled publishing and retry handling; OPS photo selection with marketing consent; live analytics.

Never store provider secrets or access tokens in frontend code or browser storage.
