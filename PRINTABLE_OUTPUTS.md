# Printable Outputs

## Purpose

Printable Outputs define the future documents Decoded Housing may generate from intake, pathway, task, document, and progress data.

Core system rule: the platform must not show every housing option to every client. It should only recommend or display a pathway when the client's answers support that pathway. Printable outputs should include only pathways and actions supported by the client's answers, plus safe verification or backup steps.

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

- Intake summary and saved plan data
- Displayed pathway recommendations and exclusions safe to print
- Eligibility outputs: Eligible, Potentially eligible, Unknown / needs verification, Not eligible
- Verification status: Client reported, Document verified, Navigator verified, System derived
- Confidence levels: High, Medium, Low, Unknown
- Housing stability risk levels: Stable, At risk, High risk, Critical
- Task objects, document requirements, deadlines, barriers, strengths, and progress history
- Client privacy preferences and safe contact settings

## Outputs

Printable outputs should include:

- Full intake summary
- Housing Stability Plan
- Weekly / 30-day action sheet
- Barrier plan
- Legal deadlines one-pager
- Document checklist
- Housing leads list
- Waitlist/application tracker
- Progress summary
- Exit/transition summary

Each printable output should include:

- Title and date generated
- Client-facing summary
- Pathways included
- Next actions
- Verification status where relevant
- Safety/privacy note
- Optional navigator notes when safe and intended

## Rules

- Do not print every pathway by default.
- Include only pathways that are displayed, selected, or needed for safe verification.
- Hide internal-only exclusions unless they are safe and useful for the client.
- Legal deadlines one-pager should print only when a legal-risk signal exists.
- Document checklist should show Required documents, Recommended documents, Optional documents, Missing documents, and Not applicable documents only when relevant to the client.
- Housing leads list should not imply live availability unless data is actually connected and verified.
- Full intake summary should allow sensitive sections to be omitted.
- Progress summary should distinguish completed tasks from still-open tasks.
- Exit/transition summary should include handoff-ready next steps and unresolved needs.

## Example logic

Example action sheet:

```text
If primary pathway = Eviction prevention
and task list has three urgent tasks
then Weekly / 30-day action sheet includes those tasks, related documents, due dates, and legal aid referral wording.
```

Example document checklist:

```text
If Voucher lease-up is displayed
then Document checklist may include voucher packet, RFTA, inspection notes, ID, income proof, and landlord contact documents.
If Voucher lease-up is hidden, these items should not appear unless another pathway requires them.
```

Example housing leads list:

```text
If Affordable housing search is displayed
then Housing leads list may show client-selected leads or navigator-entered leads.
It must label sample, stale, or unverified information clearly.
```

## Future implementation notes

- Treat print templates as consumers of pathway, task, document, and scoring outputs.
- Add privacy controls before generating printable summaries.
- Support short mobile-friendly printouts and fuller navigator handoff packets.
- Include generated dates and rule version references where helpful.
- Future PDF generation, storage, or Supabase links should be reviewed separately; this document does not change schema.
- Keep output wording aligned with the self-help counselor flow: what happened, what matters now, and what to do next.

## Safety/privacy considerations

- Ask before printing sensitive legal, safety, disability, immigration, health, or domestic violence details.
- Do not include unsafe contact information when privacy concerns are flagged.
- Avoid language that sounds like legal advice, guaranteed housing, guaranteed eligibility, or live resource verification.
- Make printable outputs useful even when eligibility is Unknown / needs verification.
- Include backup paths so the client is not left without another action.
