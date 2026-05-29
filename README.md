# Decoded Housing - Self-Help Housing Counselor MVP

Decoded Housing Self-Help MVP is a free static prototype for one person using a phone to build a housing plan.

Core promise: Get housed. Stay housed.

The product follows a housing navigator workflow:

stabilize -> assess -> prioritize -> plan -> act -> follow up -> adjust

## Static no-build version

This branch is intentionally static and GitHub Pages-ready.

Required files:

- `index.html`
- `README.md`

There are no build tools and no app framework dependencies.

Do not use npm, Vite, React, Tailwind, Supabase, login, AI chat, document upload, full database import, or a resource directory for this MVP.

## How to run

Open `index.html` directly in any browser.

To publish with GitHub Pages, serve the repository from the `main` branch root after review and merge.

## What is included

- Self-Help Mode only
- research-aligned housing navigator triage
- safety-first intake
- one-question-at-a-time flow
- household size and children intake
- disability/accommodation support without diagnosis or medical record collection
- safety/private contact intake with neutral wording
- voucher/subsidy intake and expiration reminder
- income/benefits stability intake
- optional housing history intake
- grouped barrier assessment
- compact My Housing Plan with Top Priority and Next 3 Actions
- active pathway logic for Shelter Survival, Coordinated Entry Preparation, Notice Triage, Voucher Lease-Up, ARCH / Affordable Housing, Barrier-Clearing, Basic Needs Stabilization, Disability / Accommodation, Safety / Private Contact, and Stay-Housed Starter
- matched sample resources only inside My Housing Plan
- phone scripts
- teleprompter mode
- call log
- follow-ups
- evidence/proof events
- Warm Handoff Summary
- print plan
- continue saved plan
- What changed since last time? flow
- start over

## localStorage and future backend structure

The MVP currently saves only to `localStorage` on the user's device using the key:

`decodedHousingSelfHelpMvp`

No personal data is sent to a server in this static MVP.

The saved localStorage schema mirrors the future backend data model. This is intentional: when backend storage is added later, users should not have to repeat the same intake questions just because the storage layer changed.

The stored object includes:

- `profile`
- `safety`
- `contactSafety`
- `currentSituation`
- `deadlines`
- `household`
- `disabilityAccommodation`
- `voucherSubsidy`
- `incomeBenefits`
- `housingHistory`
- `barriers`
- `strengths`
- `preferences`
- `plan`
- `callLogs`
- `savedScripts`
- `savedResources`
- `followUps`
- `evidenceEvents`
- `handoffSummary`

Users can choose **Start over** to clear locally saved data from this device.

## Important limits

Decoded Housing is not a directory, dashboard, or resource list.

This is not legal advice. For notices, eviction cases, discrimination concerns, or court deadlines, contact legal aid or a qualified advocate.

This prototype does not guarantee housing, shelter, funding, eligibility, landlord participation, or availability.

All resource cards are sample data. Call programs directly to confirm hours, availability, eligibility, intake steps, and current contact information before relying on them.
