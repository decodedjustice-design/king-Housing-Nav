# Task Generation Engine

## Purpose

The Task Generation Engine defines how Decoded Housing should convert supported pathways, barriers, deadlines, and document needs into future-ready action objects.

Core system rule: the platform must not show every housing option to every client. It should only recommend or display a pathway when the client's answers support that pathway. Tasks should be generated only for pathways, barriers, and documents supported by the client's answers.

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

- Displayed pathways and primary pathway
- Eligibility outputs: Eligible, Potentially eligible, Unknown / needs verification, Not eligible
- Verification status: Client reported, Document verified, Navigator verified, System derived
- Confidence levels: High, Medium, Low, Unknown
- Housing stability risk level: Stable, At risk, High risk, Critical
- Deadlines, barriers, documents, client preferences, strengths, and follow-up history
- Legal, voucher, shelter, application, or benefits-related time limits
- Client availability and safe contact preferences

## Outputs

Task generation should create future-ready task objects with:

- Task title
- Owner
- Due date
- Priority
- Status
- Related barrier
- Related pathway
- Related document, if any
- Client-facing wording
- Internal/admin notes, if needed

Additional optional task metadata:

- Source answer or rule
- Verification status
- Confidence level
- Created date
- Completed date
- Reopen trigger
- Printable output category

## Rules

- Generate tasks only from displayed pathways, missing documents, verified deadlines, or client-selected goals.
- Do not create tasks for pathways marked Not eligible unless the task is to verify or revisit the decision.
- Critical risk should create urgent tasks with short due dates when the task is actionable and safe.
- Client-facing wording should be concrete, short, and nonjudgmental.
- Internal/admin notes should not appear in client printouts unless intentionally included.
- Every task should have an owner: client, navigator, legal partner, housing provider, benefits worker, or other named role.
- Due dates should reflect legal deadlines, voucher deadlines, shelter urgency, benefits timelines, and client availability.
- Missing documents should generate Document recovery tasks only when the document supports a displayed pathway.
- Completed tasks should remain in progress history for printable summaries.

## Example logic

Example eviction task:

```text
If Legal aid referral is displayed
and court_date is within 14 days
then create task:
Task title = "Call legal aid about the court deadline"
Owner = Client or Navigator
Due date = today
Priority = High
Status = Not started
Related pathway = Legal aid referral
Related document = Eviction notice or summons, if any
Client-facing wording = "Call legal aid today and say you have a housing court deadline."
```

Example document recovery task:

```text
If Affordable housing search is displayed
and photo ID is Missing documents
then create task:
Task title = "Start ID replacement"
Related barrier = Missing ID
Related pathway = Document recovery
Related document = Photo ID
Priority = Medium
```

Example voucher lease-up task:

```text
If Voucher lease-up is displayed
and voucher expiration date exists
then create task due before the expiration date to confirm extension options, landlord paperwork, or inspection status.
```

## Future implementation notes

- Store tasks as structured records linked to pathway, barrier, document, and source answer.
- Support recurring follow-up tasks without creating duplicate clutter.
- Allow navigators to edit owner, due date, priority, and wording.
- Keep task generation separate from notifications until notification consent and safe contact rules are designed.
- Future Supabase task tables should be reviewed separately; this document does not change schema.
- Keep task rules explainable so clients and navigators know why a task exists.

## Safety/privacy considerations

- Do not generate unsafe contact tasks when the client has identified privacy or safety concerns.
- Do not put sensitive legal, disability, domestic violence, immigration, or health details in task titles.
- Use internal/admin notes for context that should not appear on client-facing screens or printouts.
- Give fallback actions when the first task cannot be completed.
- Avoid task overload; show the next few actions, not every possible action.
