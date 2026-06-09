# Housing Stability Scoring

## Purpose

Housing Stability Scoring defines how Decoded Housing may summarize current housing risk for prioritization, pathway routing, and action planning.

Core system rule: the platform must not show every housing option to every client. It should only recommend or display a pathway when the client's answers support that pathway. A risk score should prioritize next steps, not expose unsupported pathways.

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

- Current housing status and safety tonight
- Eviction notices, court dates, move-out dates, voucher expiration dates, or subsidy deadlines
- Rent arrears, income loss, benefits disruption, or utility shutoff risk
- Household members, children, disability-related needs, pets, and accessibility needs
- Missing documents and barriers that block action
- Safety and privacy concerns
- Displayed pathway recommendations
- Verification status: Client reported, Document verified, Navigator verified, System derived
- Confidence levels: High, Medium, Low, Unknown

## Outputs

Housing stability risk levels should include:

- Stable
- At risk
- High risk
- Critical

Each score result should include:

- Risk level
- Main risk drivers
- Confidence level
- Verification status
- Recommended next step
- Pathways supported by the risk result
- Pathways not supported by the risk result
- Reassessment trigger

## Rules

- Critical means the client may lack safe housing tonight, has an imminent court or lockout risk, or faces another urgent housing loss deadline.
- High risk means housing loss is likely without timely action, such as a pending notice, voucher deadline, severe arrears, unsafe housing, or major barrier.
- At risk means housing is currently strained but there is time for prevention, search, stabilization, or document recovery.
- Stable means the client has current housing and no immediate housing loss signal, though they may still need affordability, accessibility, or income support.
- Risk scoring should not replace eligibility. It should help rank supported pathways and tasks.
- Do not use risk score alone to show Rapid rehousing, Permanent supportive housing / PSH, or Transitional housing.
- Use Unknown confidence when key facts are missing.
- Re-score when the client updates housing status, deadlines, documents, income, safety, or completed tasks.

## Example logic

Example Critical score:

```text
If client reports no safe place tonight
then risk_level = Critical
confidence = Medium when Client reported
supported pathways may include Shelter and Document recovery if answers support them.
```

Example High risk score:

```text
If client reports an eviction court date within 14 days
then risk_level = High risk or Critical depending on timing and lockout risk
supported pathways may include Legal aid referral and Eviction prevention.
```

Example At risk score:

```text
If client is housed but rent is unaffordable
and no eviction deadline exists
then risk_level = At risk
supported pathways may include Affordable housing search and Income stabilization.
```

## Future implementation notes

- Keep scoring explainable and visible to navigators.
- Store risk score history so progress summaries can show change over time.
- Use conservative scoring when facts are Client reported and unverified.
- Do not use scoring as a denial mechanism.
- Future Supabase scoring tables or analytics should be reviewed separately; this document does not change schema.
- Consider separate safety flags for information that should not print or display broadly.

## Safety/privacy considerations

- Avoid presenting risk levels as labels of the client; frame them as current housing situation levels.
- Do not print sensitive risk drivers without client consent.
- Do not use risk score to limit access to emergency information when safety is at stake.
- Make room for client correction when System derived risk is wrong.
- Always pair High risk or Critical scoring with a concrete next step.
