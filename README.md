# Decoded Housing - Self-Help Housing Counselor MVP

Decoded Housing Self-Help MVP is a free static prototype for one person using a phone to build a housing plan.

Core promise: Get housed. Stay housed.

The experience follows:

Safety -> housing status -> deadline -> household -> barriers -> strengths -> location -> My Housing Plan

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
- safety-first first screen
- one-question-at-a-time intake
- live My Housing Plan
- structured localStorage persistence using the key `decodedHousingSelfHelpMvp`
- backend-ready data sections for profile, safety, contact safety, current situation, deadlines, household, disability/accommodation, voucher/subsidy, income/benefits, housing history, barriers, strengths, preferences, plan, call logs, saved scripts, saved resources, follow-ups, evidence events, and handoff summary
- pathway logic for Shelter Survival, Notice Triage, Voucher Lease-Up, ARCH / Affordable Housing, Barrier-Clearing, Basic Needs Stabilization, Disability / Accommodation, Safety / Private Contact, and Stay-Housed Starter
- structured `sampleResources` placeholder for the future Housing_Decoded workbook import
- matched sample resources only inside My Housing Plan
- phone scripts
- teleprompter mode
- call log stored as structured objects
- saved scripts referencing `scriptType`
- saved resources referencing `resourceId`
- reusable follow-up objects
- evidence/proof events
- Warm Handoff Summary generated from the structured saved data
- proof and follow-up capture
- print plan
- start over
- continue saved plan
- What changed since last time? update flow

## localStorage and future backend structure

The MVP currently saves only to `localStorage` on the user's device.

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

This is not a directory and does not include search or browse pages.

This is not legal advice. For notices, eviction cases, discrimination concerns, or court deadlines, contact legal aid or a qualified advocate.

This prototype does not guarantee housing, shelter, funding, eligibility, landlord participation, or availability.

All resource cards are sample data. Call programs directly to confirm hours, availability, eligibility, intake steps, and current contact information before relying on them.
