# Pathway Exclusion Rules

## Purpose

Pathway Exclusion Rules define when Decoded Housing should hide, suppress, defer, or mark a pathway as not currently supported by the client's answers.

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

- Client answers from intake and plan updates
- Eligibility outputs: Eligible, Potentially eligible, Unknown / needs verification, Not eligible
- Verification status: Client reported, Document verified, Navigator verified, System derived
- Confidence levels: High, Medium, Low, Unknown
- Housing stability risk level: Stable, At risk, High risk, Critical
- Pathway recommendation results
- Missing answers or documents
- Navigator notes and override reasons

## Outputs

Each exclusion should produce:

- Pathway category
- Exclusion status
- Exclusion reason
- Whether the exclusion is client-facing or internal-only
- Confidence level
- Verification status
- Revisit trigger
- Data needed to reconsider
- Safer alternative pathway, if available

Exclusion statuses may include:

- Hidden because not supported
- Deferred until verification
- Internal-only review
- Not eligible for current plan
- Revisit when facts change

## Rules

- Exclude a pathway when answers do not support it, required facts are missing, or another urgent pathway should take priority.
- Do not exclude a pathway permanently when the only issue is missing verification.
- Use Unknown / needs verification instead of Not eligible when facts are incomplete.
- Do not show Rapid rehousing, Permanent supportive housing / PSH, or Transitional housing as default menu options.
- Do not show Voucher lease-up unless a voucher, subsidy, port, inspection issue, or lease-up deadline is reported.
- Do not show Eviction prevention unless the client reports a housing loss risk, notice, rent arrears, landlord conflict, subsidy issue, or court-related risk.
- Do not show Shelter unless the client reports current homelessness, unsafe housing tonight, imminent displacement, or a safety-driven need for immediate placement.
- Do not show Legal aid referral unless there is a legal deadline, rights issue, notice, court case, discrimination concern, lockout, subsidy termination, or accommodation denial.
- Do not show Reasonable accommodation support unless the client reports an access need, disability-related housing barrier, or accommodation request.
- Always provide another next step when a pathway is excluded from the client-facing plan.

## Example logic

Example affordable housing search exclusion:

```text
If client reports no desire to move
and no affordability crisis
and no current housing instability
then Affordable housing search = Hidden because not supported
revisit_trigger = "Client later wants to move or reports rent burden."
```

Example PSH exclusion:

```text
If no homelessness history, disability-related service need, referral context, or navigator verification exists
then Permanent supportive housing / PSH = Deferred until verification
client_facing = false
```

Example legal aid exclusion:

```text
If the client has no notice, court date, rights concern, subsidy termination, discrimination issue, or accommodation denial
then Legal aid referral = Hidden because not supported
alternative = "Continue housing plan and document checklist."
```

## Future implementation notes

- Store exclusions as structured records so hidden decisions can be audited.
- Give navigators a way to view excluded pathways and the facts needed to reopen them.
- Keep client-facing exclusion language limited and supportive.
- Version exclusion rules alongside eligibility and pathway recommendation rules.
- Exclusion rules should feed printable outputs only when useful and safe for the client.
- Future Supabase work should preserve exclusion auditability; this document does not change schema.

## Safety/privacy considerations

- Exclusion wording should not blame the client or imply they are undeserving.
- Do not expose sensitive internal reasoning on printed materials unless the client needs it.
- Avoid harmful labels such as noncompliant, difficult, or failed.
- If a pathway is excluded due to safety or legal sensitivity, show a safer alternative next step.
- Allow correction when Client reported information was misunderstood or later verified differently.
