# Pathway Engine

## Purpose

The Pathway Engine defines how Decoded Housing should decide which pathways to recommend, prioritize, display, hide, or revisit after the Eligibility Engine evaluates the client's answers.

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

- Eligibility outputs for each pathway: Eligible, Potentially eligible, Unknown / needs verification, Not eligible
- Verification status: Client reported, Document verified, Navigator verified, System derived
- Confidence levels: High, Medium, Low, Unknown
- Housing stability risk level: Stable, At risk, High risk, Critical
- Current safety, housing status, deadlines, household needs, barriers, strengths, and preferences
- Known legal deadlines, voucher deadlines, application deadlines, or shelter needs
- Required, recommended, optional, missing, and not applicable documents
- Existing plan actions, follow-ups, evidence events, and handoff notes

## Outputs

The engine should produce a pathway recommendation set:

- Displayed pathways
- Primary pathway
- Secondary pathways
- Hidden or excluded pathways
- Reason for each displayed pathway
- Reason for each hidden or excluded pathway, in internal wording
- Confidence level
- Verification status
- Next best action for each displayed pathway
- Revisit trigger for each hidden or excluded pathway

## Rules

- Display only pathways supported by answers, eligibility results, or verified navigator judgment.
- Prioritize immediate safety and deadlines before long-term search tasks.
- A Critical risk level should surface Shelter, Legal aid referral, Eviction prevention, or safety-related next steps when supported.
- Stable clients should not be pushed into crisis pathways unless answers indicate a new risk.
- Affordable housing search should be displayed when the client is looking for lower-cost housing and no more urgent pathway fully displaces it.
- Rapid rehousing, Permanent supportive housing / PSH, and Transitional housing should not be shown as generic options; they need specific eligibility signals and local referral context.
- Document recovery and Income stabilization can support other pathways but should become primary only when missing documents or income disruption blocks progress.
- Reasonable accommodation support should be displayed when the client reports a disability-related access barrier or accommodation need, without requiring medical details.
- Legal aid referral should be displayed for notices, court deadlines, lockouts, discrimination, subsidy termination, reasonable accommodation denial, or other legal-risk signals.
- Hidden pathways should remain reviewable by a navigator but should not distract the client-facing plan.

## Example logic

Example pathway routing:

```text
If risk_level = Critical
and client reports no safe place tonight
then primary_pathway = Shelter
and secondary_pathways may include Document recovery or Income stabilization only if they support immediate stabilization.
```

Example eviction routing:

```text
If Eviction prevention = Potentially eligible
and Legal aid referral = Potentially eligible
then display both pathways.
Primary pathway depends on deadline:
court_date_within_14_days -> Legal aid referral first
rent_notice_no_case_yet -> Eviction prevention first
```

Example exclusion:

```text
If Voucher lease-up = Not eligible
because the client reports no voucher or subsidy
then hide Voucher lease-up
and set revisit_trigger = "Client later reports a voucher, subsidy, port, or lease-up deadline."
```

## Future implementation notes

- Keep pathway ranking deterministic and explainable.
- Store each recommendation with the answer evidence that caused it to appear.
- Use pathway versioning so printable plans can show which rules produced a recommendation.
- Let navigators manually add a pathway with a reason, verification status, and confidence level.
- Avoid converting pathway rules into a resource directory. The pathway should answer what the client should do next.
- Future Supabase work should preserve this logic as a service or rules layer; this document does not change schema.

## Safety/privacy considerations

- Do not imply that displayed pathways guarantee eligibility, funding, housing, or legal results.
- Do not display excluded pathways to clients in a way that feels like rejection without explanation or another next step.
- Avoid showing sensitive pathway labels to other household members or unsafe contacts without client consent.
- Keep client-facing wording focused on action, not judgment.
- When confidence is Low or Unknown, ask for verification and provide a backup path.
