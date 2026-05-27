# King Housing Nav

Decoded Housing MVP: a calm housing counselor triage and follow-through system for King County housing navigation.

Core promise: Get housed. Stay housed.

This MVP is intentionally not a directory, portal, apartment listing site, or resource-first website. It starts with safety, builds a housing plan, gives exact phone scripts, and saves call logs on the device with localStorage.

## Routes

| Route | Purpose |
|---|---|
| `/` | Counselor intake start. No menu before intake. |
| `/intake` | Step-by-step safety, status, deadline, and barrier assessment. |
| `/plan` | Generated My Housing Plan with pathways, scripts, checklists, deadlines, and proof prompts. |
| `/script/:scriptId` | Mobile-friendly teleprompter for phone scripts. |
| `/call-log` | Call log form and saved call history. |

## localStorage schema

Storage key: `decodedHousing.mvp.v1`

```ts
interface SavedState {
  intake: {
    safety: Record<string, string>;
    housingStatus?: string;
    deadlines: Record<string, string>;
    barriers: string[];
  };
  plan?: HousingPlan;
  savedScripts: string[];
  callLogs: CallLogEntry[];
}
```

## Sample data

The app includes sample King County-oriented pathway and script content for:

- Shelter Survival Plan
- Voucher Lease-Up Tool
- Notice Triage Tool
- ARCH / Affordable Housing Tool
- Basic Needs Stabilization Tool
- Barrier-Clearing Checklist
- Stay Housed Plan starter

All resource-like information is sample-labeled and should be confirmed before action.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`.

## Limitations

- localStorage only
- no login
- no document upload
- no AI chat
- no live resource verification
- no legal advice
- no property search or application submission

## Next build

1. Full application tracker.
2. Waitlist and ARCH property tracker.
3. Evidence/proof timeline.
4. Rights trigger cards.
5. Full CE Decoder and Notice Triage workflows.
6. Stay-housed reminders.
7. Spanish-first multilingual copy pass.
