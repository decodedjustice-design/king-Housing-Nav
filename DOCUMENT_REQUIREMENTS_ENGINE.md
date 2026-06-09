# Document Requirements Engine

## Purpose

The Document Requirements Engine defines how Decoded Housing should identify documents needed for each supported pathway without asking clients for unnecessary or unsafe records.

Core system rule: the platform must not show every housing option to every client. It should only recommend or display a pathway when the client's answers support that pathway. Document requests should follow supported pathways, not a universal checklist.

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

- Displayed pathway recommendations
- Eligibility outputs: Eligible, Potentially eligible, Unknown / needs verification, Not eligible
- Verification status: Client reported, Document verified, Navigator verified, System derived
- Confidence levels: High, Medium, Low, Unknown
- Household composition and identity document status
- Income, benefits, rental history, subsidy, and voucher details
- Legal notices, deadlines, court paperwork, or landlord communications
- Accessibility or accommodation needs, without diagnosis collection
- Existing document inventory and missing document barriers

## Outputs

Document requirements should separate:

- Required documents
- Recommended documents
- Optional documents
- Missing documents
- Not applicable documents

Each document item should include:

- Document name
- Related pathway
- Related barrier, if any
- Requirement level
- Verification status
- Confidence level
- Client-facing wording
- Safer alternative if the document is unavailable
- Internal/admin notes, if needed

## Rules

- Do not create a universal document checklist for every client.
- Required documents should be tied to a displayed pathway or a known next step.
- Missing documents should generate Document recovery tasks only when they block a supported pathway.
- Not applicable documents should be hidden from the client-facing checklist unless explanation helps reduce confusion.
- Legal documents should be requested only when a legal-risk pathway is supported.
- Disability and accommodation support should not require diagnosis details unless a specific future process legally requires documentation and the client chooses to pursue it.
- If a client cannot safely access a document, the plan should offer alternatives, replacement steps, or navigator support.
- Verification status must distinguish Client reported possession from Document verified review.
- Document storage, uploads, and Supabase connections are out of scope for this planning layer.

## Example logic

Example eviction prevention documents:

```text
If Eviction prevention is displayed
then Required documents may include notice or court paperwork when available.
If notice is missing
then Missing documents includes "copy or photo of notice"
and Document recovery task = "Find or request a copy of the notice."
```

Example voucher lease-up documents:

```text
If Voucher lease-up is displayed
then Recommended documents may include voucher briefing packet, RFTA forms, inspection notices, and deadline letters.
If no voucher is reported
then those documents are Not applicable documents.
```

Example reasonable accommodation documents:

```text
If Reasonable accommodation support is displayed
then Optional documents may include prior accommodation requests or denial letters.
Do not ask for diagnosis details in the intake.
```

## Future implementation notes

- Use a document requirement matrix keyed by pathway category and task type.
- Keep document status separate from file upload status so the system can work without uploads.
- Allow navigators to mark Document verified after reviewing a document outside the system.
- Support printable document checklists that show only relevant documents.
- Version document requirement rules so older plans remain understandable.
- Future Supabase document storage or metadata should be reviewed separately; this document does not change schema.

## Safety/privacy considerations

- Ask for the minimum document information needed for the next action.
- Do not require clients to upload sensitive documents in this planning layer.
- Avoid printing full SSNs, medical details, immigration details, or protected safety information.
- Give clients a safe alternative when documents are lost, stolen, inaccessible, or controlled by someone unsafe.
- Clearly label document status so Client reported information is not mistaken for Document verified proof.
