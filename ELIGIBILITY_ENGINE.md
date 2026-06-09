# Eligibility Engine

## Purpose

The Eligibility Engine defines how future Decoded Housing form answers should be interpreted before any housing pathway is recommended or displayed.

Core system rule: the platform must not show every housing option to every client. It should only recommend or display a pathway when the client's answers support that pathway.

This document is planning documentation only. It does not create UI, routes, Supabase tables, Supabase connections, imported data, CSV validator changes, or temporary files.

Supported pathway categories:

- Shelter
- Eviction prevention
- Voucher lease-up
- Affordable housing search
- Rapid rehousing
- Permanent supportive housing / PSH
- Transitional housing
- Income stabilization
- Document recovery
- Legal aid referral
- Reasonable accommodation support

## Inputs

Future inputs may come from the structured intake and saved plan data already described by the Decoded Housing form planning layer:

- Current housing status and safety tonight
- Eviction notice, court date, lease issue, or landlord deadline
- Voucher, subsidy, or lease-up status
- Household size, children, pets, accessibility needs, and location preferences
- Income, benefits, employment, and rent burden
- Disability or accommodation support needs, without collecting diagnosis details
- Documents available, missing, or needing replacement
- Barriers such as ID, credit, debt, criminal history, domestic violence safety, or transportation
- Client goals, preferences, and stated next steps
- Verification status for each important answer
- Navigator notes, when available

Verification status values:

- Client reported
- Document verified
- Navigator verified
- System derived

## Outputs

Each pathway evaluation should return a future-ready eligibility result:

- Pathway category
- Eligibility output
- Confidence level
- Verification status
- Supporting answers
- Blocking or missing answers
- Recommended next verification step
- Client-facing explanation
- Internal/admin notes, if needed

Eligibility outputs:

- Eligible
- Potentially eligible
- Unknown / needs verification
- Not eligible

Confidence levels:

- High
- Medium
- Low
- Unknown

## Rules

- Do not recommend or display a pathway unless the client's answers support it.
- Do not mark a client Eligible when required facts are only Client reported and still need confirmation.
- Use Potentially eligible when answers appear to support a pathway but verification, capacity, availability, or program-specific criteria are unresolved.
- Use Unknown / needs verification when the system lacks enough information to include or exclude a pathway.
- Use Not eligible only when known answers rule out the pathway for the current plan period.
- A Not eligible result should not erase the pathway forever; it should explain what changed facts could reopen review.
- Pathway rules should prefer safety-first routing when a client reports no safe place tonight, imminent eviction, violence risk, or court deadlines.
- Eligibility should separate client facts from program availability. A client can meet screening criteria even when a program is full.
- Eligibility should not ask for sensitive details that are not necessary for pathway screening.
- Any system-derived result must be traceable to the answers that produced it.

## Example logic

Example shelter logic:

```text
If current_housing_status is "unsheltered" or "unsafe tonight"
and client needs a same-day place to sleep
then Shelter = Potentially eligible
verification_status = Client reported
confidence = Medium
next_step = confirm safety, household needs, location, and immediate contact options
```

Example eviction prevention logic:

```text
If client reports a pay-or-vacate notice, eviction summons, or court date
then Eviction prevention = Potentially eligible
and Legal aid referral = Potentially eligible
If document image or navigator review confirms the notice
then verification_status may become Document verified or Navigator verified
```

Example voucher lease-up logic:

```text
If client has an active voucher or subsidy
and reports a search deadline or inspection issue
then Voucher lease-up = Potentially eligible
Else if no voucher or subsidy is reported
then Voucher lease-up = Not eligible for the current plan
```

## Future implementation notes

- Store each eligibility result as a structured object linked to intake answers, barriers, documents, and pathway categories.
- Keep rules transparent and explainable so navigators can review why a pathway was shown or hidden.
- Allow navigators to override a system-derived result with a reason and verification status.
- Version rule sets so old plans can be understood after future rule changes.
- Keep eligibility separate from task generation, document requirements, scoring, and printable outputs, even when those systems consume eligibility results.
- Future Supabase work should map to this structure only after documentation and product review; this document does not change schema.

## Safety/privacy considerations

- Do not present eligibility as a guarantee of housing, funding, shelter, legal outcome, or program acceptance.
- Do not expose sensitive answers in client-facing summaries unless the client needs them for action.
- Avoid diagnosis collection for accommodation support; record functional access needs and requested accommodations instead.
- Treat domestic violence, immigration, disability, health, and legal details as high-sensitivity information.
- Use plain language and give the client another next step when eligibility is Unknown / needs verification or Not eligible.
