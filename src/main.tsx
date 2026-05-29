import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookmarkCheck, ClipboardList, PhoneCall, Printer, Save } from "lucide-react";
import "./styles.css";

// ─── Types ──────────────────────────────────────────────────────────────────

type CrisisLevel = "Critical" | "High" | "Moderate" | "Stable-Seeking";
type PathwayId = "shelter" | "voucher" | "notice" | "arch" | "basic" | "barriers" | "stay";

type SavedState = {
  intake: { safety: Record<string, string>; housingStatus?: string; deadlines: Record<string, string>; barriers: string[] };
  plan?: HousingPlan;
  savedScripts: string[];
  callLogs: CallLogEntry[];
};

type HousingPlan = {
  generatedAt: string;
  crisisLevel: CrisisLevel;
  urgencyLevel: string;
  housingGoal: string;
  firstStep: string;
  weekSteps: string[];
  barriers: string[];
  documents: string[];
  pathways: PathwayId[];
  scripts: string[];
  deadlines: Array<{ label: string; date: string; warning?: string }>;
  backupPlan: string;
  moveInNeeds: string[];
  stayHousedNeeds: string[];
  proof: string[];
};

type CallLogEntry = {
  id: string;
  date: string;
  who: string;
  phone: string;
  answered: string;
  spokeWith: string;
  notes: string;
  deadline: string;
  saidNo: string;
  followUp: string;
  proof: boolean;
  scriptId?: string;
};

// ─── Persistence ─────────────────────────────────────────────────────────────

const storageKey = "decodedHousing.mvp.v1";
const emptyState: SavedState = { intake: { safety: {}, deadlines: {}, barriers: [] }, savedScripts: [], callLogs: [] };
const loadState = (): SavedState => {
  try { return { ...emptyState, ...JSON.parse(localStorage.getItem(storageKey) || "{}") }; } catch { return emptyState; }
};
const saveState = (state: SavedState) => localStorage.setItem(storageKey, JSON.stringify(state));

// ─── Static Data ──────────────────────────────────────────────────────────────

const statuses = [
  ["outside", "Sleeping outside"], ["vehicle", "Sleeping in a vehicle"], ["shelter", "In emergency shelter"],
  ["doubled", "Doubled up or couch surfing"], ["motel", "Motel or hotel"], ["unsafe", "Housed but unsafe"],
  ["unaffordable", "Housed but unaffordable"], ["notice", "Received a notice"], ["eviction", "Eviction case filed in court"],
  ["voucher", "Voucher holder searching for a unit"], ["affordable", "Long-term affordable housing seeker"]
];

const barrierOptions = ["Missing ID", "No income proof", "No phone", "No mailing address", "No transportation", "No internet/device", "Prior eviction", "Rental debt", "Credit issues", "Criminal history", "No rental history", "Disability accommodation needed", "Language access", "Childcare", "Move-in funds", "Furniture", "Household supplies", "Utilities setup", "Renter's insurance"];

const scriptData: Record<string, { title: string; pathway: string; who: string; phone: string; ready: string[]; lines: string[]; ask: string[]; ifNo: string; after: string[] }> = {
  "211-shelter": { title: "211 shelter request", pathway: "Shelter Survival Plan", who: "211", phone: "211", ready: ["Your general location", "Household size", "Children's ages", "Pets or service animal details", "Medical or disability needs"], lines: ["Hi, I need help finding emergency shelter tonight.", "I am currently [single adult / family / pregnant / fleeing domestic violence].", "I am located in [general area].", "I have [pets / disability / medical need]. Please note that.", "Can you tell me what shelters have openings tonight?"], ask: ["Is there a family shelter?", "Is there safe parking?", "Is there a day center that opens early?", "Can I have a reference number?"], ifNo: "Ask for the nearest day center, safe parking option, warming or cooling center, and first time to call back tomorrow.", after: ["Log the call", "Save any reference number", "Write down every place mentioned", "Set tomorrow morning follow-up"] },
  "ce-rap": { title: "Coordinated Entry / RAP call", pathway: "Coordinated Entry support", who: "Regional Access Point", phone: "Sample: confirm current RAP number", ready: ["Household members and ages", "Current sleeping situation", "Income or benefits", "Disability or medical needs", "Prior CE history"], lines: ["Hi, my name is [name] and I am calling to schedule a Coordinated Entry assessment.", "I am currently [sleeping outside / in a vehicle / in shelter / doubled up].", "I have [number] people in my household.", "I am calling from [East King County / Seattle / South King County]."], ask: ["How do I schedule an assessment?", "What do I need to bring?", "How long is the wait?", "What happens after assessment?"], ifNo: "Ask for the status inquiry process and whether another RAP location or call time is available.", after: ["Log the call", "Save assessment date", "Add status follow-up", "Keep CE as one track, not the only track"] },
  "landlord-voucher": { title: "Landlord with voucher", pathway: "Voucher Lease-Up Tool", who: "Landlord or leasing office", phone: "Listing phone number", ready: ["Voucher bedroom size", "Payment standard if known", "Move-in timeline", "PHA contact", "Income documents"], lines: ["Hi, my name is [name]. I am calling about a rental you have available.", "I am a Housing Choice Voucher holder.", "I am interested in learning whether the unit would work for the voucher program.", "Is this a good time to ask a few questions?"], ask: ["What is the monthly rent?", "Would you work with the housing authority voucher process?", "When is the unit available?", "Can I schedule a showing?"], ifNo: "Ask for the reason in writing if they refuse because of the voucher, then save it as proof.", after: ["Log the call", "Save showing time", "Start RFTA/RTA checklist", "Document any denial"] },
  "legal-aid": { title: "Legal aid notice call", pathway: "Notice Triage Tool", who: "Legal aid or tenant hotline", phone: "Sample King County legal aid contact", ready: ["Notice type", "Date on notice", "Court date", "Household details", "Voucher info if any"], lines: ["Hi, my name is [name]. I received a housing notice dated [date].", "The notice says [pay or vacate / comply or vacate / court papers / I am not sure].", "I need help understanding what to do next.", "Can I speak with someone today?"], ask: ["What documents should I send?", "Is there a deadline I need to meet?", "Should I apply for rental assistance now?"], ifNo: "Ask for another tenant hotline and the safest next step before the deadline. This is not legal advice.", after: ["Log the call", "Photograph the notice front and back", "Save any appointment", "Set reminder before the deadline"] },
  "arch": { title: "ARCH property manager", pathway: "ARCH / Affordable Housing Tool", who: "Property manager", phone: "Property phone number", ready: ["Bedroom size", "Income estimate", "Voucher info if applicable", "Phone and email contact"], lines: ["Hi, my name is [name] and I am looking for affordable housing.", "I found your property listed through ARCH and wanted to ask a few questions.", "Do you have any units available or are you taking applications?"], ask: ["What is the income limit?", "Do you accept Housing Choice Vouchers?", "How do I apply?", "Is there a waitlist?", "When should I check back?"], ifNo: "Ask when the list may reopen and save a next check date. ARCH is not a central waitlist.", after: ["Log the call", "Save next check date", "Add the property if you apply"] },
  "utility": { title: "Utility assistance call", pathway: "Basic Needs Stabilization Tool", who: "Utility assistance provider", phone: "Sample: confirm current provider number", ready: ["Utility account number", "Shutoff notice", "Income proof", "Lease or address"], lines: ["Hi, I need help with utility assistance.", "My utility is [electric / gas / water] and the deadline is [date].", "Can you tell me what help is available and what documents you need?"], ask: ["Can this stop a shutoff?", "How long does processing take?", "Can I get confirmation in writing?"], ifNo: "Ask whether the utility company can set a payment plan or hold while another application is pending.", after: ["Log the call", "Save confirmation", "Set follow-up date", "Add shutoff date to plan"] },
  "follow-up": { title: "Follow-up after no response", pathway: "Any pathway", who: "Program or person who has not responded", phone: "Number from your last log", ready: ["Last call date", "Reference number", "What you asked for", "Deadline coming up"], lines: ["Hi, my name is [name]. I am following up on my call from [date].", "I was told [what they said] and I have not heard back yet.", "My deadline is [date], so I need to confirm the next step today."], ask: ["Who is handling this?", "What is the current status?", "What should I do next?", "Can you send confirmation in writing?"], ifNo: "Ask for a supervisor, alternate contact, or written status process. Log the attempt.", after: ["Log the call", "Update the plan", "Save any written response", "Set next follow-up"] }
};

const pathwayDetails: Record<PathwayId, { title: string; why: string; next: string; fallback: string; scripts: string[] }> = {
  shelter: { title: "Shelter Survival Plan", why: "Tonight needs a concrete safety step, fallback if no bed is open, and a morning plan.", next: "Call 211 and ask for emergency shelter, day center, and safe parking options.", fallback: "If no bed is available, ask for the nearest day center, safe parking, and first time to call again tomorrow.", scripts: ["211-shelter", "ce-rap"] },
  voucher: { title: "Voucher Lease-Up Tool", why: "Protect the voucher deadline while searching, submitting RFTA/RTA paperwork, and preparing for inspection.", next: "Check the voucher expiration date and make one landlord call using the voucher script.", fallback: "If the voucher is within 30 days of expiration, contact the PHA about an extension and reasonable accommodation if disability affected the search.", scripts: ["landlord-voucher", "follow-up"] },
  notice: { title: "Notice Triage Tool", why: "Written notices and court deadlines need same-day clarity and documentation.", next: "Call legal aid with the notice date, type, and any court deadline.", fallback: "If legal aid cannot answer today, photograph the notice, save the envelope, apply for rent assistance if rent is owed, and call another tenant hotline.", scripts: ["legal-aid", "follow-up"] },
  arch: { title: "ARCH / Affordable Housing Tool", why: "ARCH is not a central waitlist. Each property must be contacted separately.", next: "Choose one property and call to ask whether applications or waitlists are open.", fallback: "If the list is closed, ask when to check again and save the next check date.", scripts: ["arch", "follow-up"] },
  basic: { title: "Basic Needs Stabilization Tool", why: "Housing plans fail when food, utilities, phone, transportation, and move-in costs are treated as separate from housing stability.", next: "Clear the most urgent basic need blocking the next housing step.", fallback: "Ask for a written extension or alternate process when the need blocks an appointment, inspection, or move-in.", scripts: ["utility", "follow-up"] },
  barriers: { title: "Barrier-Clearing Checklist", why: "The plan needs to show exactly how each barrier will be cleared or worked around.", next: "Start with the barrier that blocks the next application, shelter intake, or lease-up step.", fallback: "If a barrier cannot be cleared in time, ask what can be submitted temporarily and save that answer.", scripts: ["follow-up"] },
  stay: { title: "Stay Housed Plan starter", why: "Move-in is not the finish line. Rent, utilities, recertification, repairs, and notices need reminders.", next: "Save rent due, utility, and recertification dates as they become known.", fallback: "If a notice, rent problem, benefit cut, or voucher problem appears, call the right support the same day.", scripts: ["follow-up", "utility"] }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function noSafeSleep(intake: SavedState["intake"]) {
  return intake.safety.safeTonight === "need-help" || intake.safety.sleepTonight === "no" || intake.housingStatus === "outside" || intake.housingStatus === "vehicle";
}

function generatePlan(intake: SavedState["intake"]): HousingPlan {
  const pathways = new Set<PathwayId>();
  if (noSafeSleep(intake) || intake.housingStatus === "shelter") pathways.add("shelter");
  if (intake.housingStatus === "voucher" || intake.deadlines.voucher) pathways.add("voucher");
  if (["notice", "eviction"].includes(intake.housingStatus || "") || intake.deadlines.court || intake.deadlines.notice) pathways.add("notice");
  if (intake.housingStatus === "affordable") pathways.add("arch");
  if (intake.barriers.length) pathways.add("barriers");
  if (intake.barriers.some((b) => ["Move-in funds", "Utilities setup", "No phone", "No transportation", "Furniture", "Household supplies", "Childcare", "Renter's insurance"].includes(b))) pathways.add("basic");
  pathways.add("stay");
  const list = [...pathways];
  const crisisLevel: CrisisLevel = noSafeSleep(intake) || intake.housingStatus === "eviction" || intake.safety.immediateDanger === "yes" ? "Critical" : intake.housingStatus === "notice" || intake.housingStatus === "unsafe" ? "High" : intake.housingStatus ? "Moderate" : "Stable-Seeking";
  const deadlineLabels: Record<string, string> = { leave: "Date you must leave", notice: "Notice date", court: "Court date", voucher: "Voucher expiration", shelter: "Shelter exit", utility: "Utility shutoff", application: "Application or waitlist deadline", followUp: "Follow-up date" };
  const deadlines = Object.entries(intake.deadlines).filter(([, date]) => date).map(([key, date]) => ({ label: deadlineLabels[key] || key, date, warning: key === "court" ? "Court-related deadline. Call legal aid today. This is not legal advice." : key === "voucher" ? "PHA/voucher deadline. Ask about extension steps before it expires." : undefined })).sort((a, b) => a.date.localeCompare(b.date));
  const scripts = [...new Set(list.flatMap((id) => pathwayDetails[id].scripts))];
  const firstStep = list.includes("shelter") ? "Call 211 now and ask for emergency shelter, day center, and safe parking options." : list.includes("notice") ? "Call legal aid with your notice or court date and save the notice front and back." : list.includes("voucher") ? "Check your voucher expiration date and make one landlord call using the voucher script." : "Choose the highest-risk barrier and take the first clearing step today.";
  return { generatedAt: new Date().toISOString(), crisisLevel, urgencyLevel: crisisLevel === "Critical" ? "Immediate" : crisisLevel === "High" ? "Short-term" : "Planning", housingGoal: "Build a realistic housing plan with a next step, backup plan, and follow-up date.", firstStep, weekSteps: [firstStep, deadlines[0] ? `Handle urgent deadline: ${deadlines[0].label} on ${deadlines[0].date}.` : "Set one follow-up date so nothing waits in your head.", intake.barriers.length ? "Start the first barrier-clearing checklist item." : "Gather documents that are already available.", "Log every call, voicemail, no, and next step as proof."], barriers: intake.barriers, documents: ["Photo ID if available", "Proof of income or benefits if available", "Any notice, denial, or voucher paperwork", "Application confirmations", "Call log notes"], pathways: list, scripts, deadlines, backupPlan: list.includes("shelter") ? "If no bed is available tonight, ask 211 for the nearest day center, safe parking, and the first time to call again tomorrow." : "If the primary step does not work by the next follow-up date, use the follow-up script and ask for a written next step.", moveInNeeds: ["Deposit and first month plan", "Utilities start date", "Basic furniture", "Household supplies", "Food support", "Transportation", "Phone or internet", "Renter's insurance if required"], stayHousedNeeds: ["Rent due reminder", "Utility payment reminder", "Benefits renewal reminder", "Repair request script", "Notice response plan", "Voucher recertification date if applicable"], proof: ["Application confirmations", "Denial notices", "Call logs and voicemails", "Landlord or PHA emails", "Inspection dates and outcomes", "Accommodation requests", "Receipts and payment confirmations"] };
}

// ─── Design Primitives ────────────────────────────────────────────────────────

/** Eyebrow label in muted gold caps */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
      {children}
    </p>
  );
}

/** Serif display headline */
function DisplayTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={`font-display text-4xl font-semibold leading-tight text-inksoft sm:text-5xl ${className}`}>
      {children}
    </h1>
  );
}

/** Elegant section card — warm white, rounded, generous padding */
function Card({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-mist bg-white p-6 shadow-card sm:p-8">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="font-display mt-3 text-3xl font-semibold leading-tight text-inksoft sm:text-4xl">{title}</h1>
      <div className="mt-7 grid gap-6">{children}</div>
    </section>
  );
}

/** Muted gold divider */
function Divider() {
  return <hr className="rule-gold my-0" />;
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell({ children }: { children: React.ReactNode }) {
  const hasPlan = Boolean(loadState().plan);
  const showNav = location.pathname !== "/" && hasPlan;
  return (
    <div className="min-h-screen bg-ivory text-ink">
      {showNav && (
        <header className="no-print sticky top-0 z-20 border-b border-mist bg-ivory/95 backdrop-blur-sm">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link to="/plan" className="font-display text-lg font-semibold text-maroon tracking-wide">
              Decoded Housing
            </Link>
            <div className="flex gap-1">
              <NavLink to="/plan" icon={<ClipboardList size={16} />}>Plan</NavLink>
              <NavLink to="/call-log" icon={<PhoneCall size={16} />}>Calls</NavLink>
            </div>
          </nav>
        </header>
      )}
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-16">
        {children}
      </main>
    </div>
  );
}

function NavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex min-h-10 items-center gap-2 rounded-pill border border-transparent px-4 text-sm font-medium text-inksoft hover:border-mist hover:bg-parchment transition-colors"
    >
      {icon}{children}
    </Link>
  );
}

// ─── Home (Hero + Safety Check) ───────────────────────────────────────────────

function Home() {
  return (
    <section className="animate-fade-up">
      {/* Cinematic hero band */}
      <div className="relative mb-12 overflow-hidden rounded-card">
        {/* Photography placeholder — swap src with a real neighborhood image */}
        <div
          className="h-72 w-full sm:h-96"
          style={{
            background: "linear-gradient(135deg, #3d3530 0%, #6b4435 40%, #9b7060 70%, #c9a882 100%)",
          }}
          aria-hidden="true"
        />
        {/* Warm overlay fade to ivory */}
        <div className="hero-overlay absolute inset-0" />
        {/* Floating headline */}
        <div className="absolute bottom-0 left-0 w-full px-7 pb-8">
          <Eyebrow>King County · Housing Navigation</Eyebrow>
          <DisplayTitle className="mt-2 text-inksoft">
            You deserve a clear
            <br />
            path forward.
          </DisplayTitle>
        </div>
      </div>

      {/* Safety check */}
      <div className="mx-auto max-w-xl">
        <div className="mb-8 border-b border-mist pb-8">
          <p className="font-display text-2xl font-semibold text-inksoft leading-snug">
            Let&rsquo;s start with what is happening right now.
          </p>
          <p className="mt-3 text-base leading-relaxed text-ink/60">
            You don&rsquo;t need to figure out the whole system today. We&rsquo;ll build a plan together, one step at a time.
          </p>
        </div>

        <h2 className="font-display text-2xl font-semibold text-inksoft">Are you safe tonight?</h2>
        <div className="mt-5 grid gap-3">
          <StartChoice label="Yes, I am safe" value="safe" />
          <StartChoice label="No — I need help tonight" value="need-help" urgent />
          <StartChoice label="I&rsquo;m not sure" value="unsure" />
        </div>

        <p className="mt-8 border-t border-mist pt-6 text-sm leading-7 text-ink/50">
          Private by default. Your answers are saved only on this device unless you choose to share them.
        </p>
      </div>
    </section>
  );
}

function StartChoice({ label, value, urgent = false }: { label: string; value: string; urgent?: boolean }) {
  return (
    <Link
      to={`/intake?safeTonight=${value}`}
      className={`card-hover flex min-h-[4.5rem] items-center justify-between rounded-card border px-6 text-left text-base font-medium shadow-card transition-colors
        ${
          urgent
            ? "border-maroon/30 bg-maroon/5 text-maroon hover:bg-maroon/10"
            : "border-mist bg-white text-inksoft hover:border-gold/50"
        }`}
    >
      <span dangerouslySetInnerHTML={{ __html: label }} />
      <ArrowRight size={18} className={urgent ? "text-maroon" : "text-gold"} />
    </Link>
  );
}

// ─── Intake ───────────────────────────────────────────────────────────────────

function Intake() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [intake, setIntake] = useState(() => {
    const saved = loadState().intake;
    const safe = params.get("safeTonight");
    return safe ? { ...saved, safety: { ...saved.safety, safeTonight: safe } } : saved;
  });
  function update(next: SavedState["intake"]) { setIntake(next); saveState({ ...loadState(), intake: next }); }
  function finish() { const plan = generatePlan(intake); saveState({ ...loadState(), intake, plan }); navigate("/plan"); }

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      {/* Progress */}
      <div className="mb-7">
        <div className="mb-2 flex justify-between text-xs text-ink/45 font-medium">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="progress-track h-1.5">
          <div className="progress-fill h-full" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <Card eyebrow="Safety intake" title="First, let's make tonight clearer.">
          <Question title="Are you safe tonight?" options={["safe", "need-help", "unsure"]} value={intake.safety.safeTonight} set={(v) => update({ ...intake, safety: { ...intake.safety, safeTonight: v } })} />
          <Question title="Do you have somewhere to sleep tonight?" options={["yes", "no", "unsure"]} value={intake.safety.sleepTonight} set={(v) => update({ ...intake, safety: { ...intake.safety, sleepTonight: v } })} />
          <Question title="Are you in immediate danger?" options={["yes", "no"]} value={intake.safety.immediateDanger} set={(v) => update({ ...intake, safety: { ...intake.safety, immediateDanger: v } })} />
          <Question title="Are children with you?" options={["yes", "no"]} value={intake.safety.children} set={(v) => update({ ...intake, safety: { ...intake.safety, children: v } })} />
          <Question title="Do you have pets or a service animal?" options={["yes", "no"]} value={intake.safety.pets} set={(v) => update({ ...intake, safety: { ...intake.safety, pets: v } })} />
          <Question title="Is it safe to call or text you?" options={["yes", "text-only", "no"]} value={intake.safety.contact} set={(v) => update({ ...intake, safety: { ...intake.safety, contact: v } })} />
        </Card>
      )}
      {step === 2 && (
        <Card eyebrow="Housing status" title="What best describes where things stand right now?">
          <div className="grid gap-3">
            {statuses.map(([id, label]) => (
              <button
                key={id}
                className={`min-h-[3.5rem] rounded-xl border px-5 text-left font-medium transition-colors
                  ${intake.housingStatus === id
                    ? "border-maroon/40 bg-maroon/5 text-maroon"
                    : "border-mist bg-white text-inksoft hover:border-gold/50"}`}
                onClick={() => update({ ...intake, housingStatus: id })}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>
      )}
      {step === 3 && (
        <Card eyebrow="Deadline check" title="Add any date that could change what happens next.">
          <div className="grid gap-4 sm:grid-cols-2">
            {[["leave","Date you must leave"],["notice","Notice date"],["court","Court date"],["voucher","Voucher expiration date"],["shelter","Shelter exit date"],["utility","Utility shutoff date"],["application","Application or waitlist deadline"],["followUp","Follow-up date"]].map(([id, label]) => (
              <label key={id} className="grid gap-2 text-sm font-medium text-inksoft">
                {label}
                <input
                  className="min-h-12 rounded-xl border border-mist bg-white px-4 text-sm shadow-inner focus:border-gold focus:outline-none"
                  type="date"
                  value={intake.deadlines[id] || ""}
                  onChange={(e) => update({ ...intake, deadlines: { ...intake.deadlines, [id]: e.target.value } })}
                />
              </label>
            ))}
          </div>
        </Card>
      )}
      {step === 4 && (
        <Card eyebrow="Barrier assessment" title="What could block housing access right now?">
          <p className="-mt-2 text-sm leading-7 text-ink/60">
            Choose anything that applies. This is not about blame — it tells the plan what to clear first.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {barrierOptions.map((b) => (
              <label
                key={b}
                className={`flex min-h-[3.5rem] cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors
                  ${intake.barriers.includes(b)
                    ? "border-maroon/40 bg-maroon/5 text-maroon"
                    : "border-mist bg-white text-inksoft hover:border-gold/40"}`}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 flex-shrink-0 accent-maroon"
                  checked={intake.barriers.includes(b)}
                  onChange={() => update({ ...intake, barriers: intake.barriers.includes(b) ? intake.barriers.filter((x) => x !== b) : [...intake.barriers, b] })}
                />
                <span className="text-sm font-medium">{b}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill border border-mist bg-white px-5 text-sm font-semibold text-inksoft hover:bg-parchment transition-colors"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft size={16} />Back
          </button>
        )}
        <button
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-maroon px-5 text-sm font-semibold text-white hover:bg-maroonlight transition-colors shadow-lift"
          onClick={step < 4 ? () => setStep(step + 1) : finish}
        >
          {step < 4 ? "Continue" : "Build my plan"}<ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function Question({ title, options, value, set }: { title: string; options: string[]; value?: string; set: (v: string) => void }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-inksoft">{title}</h2>
      <div className="grid gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => set(o)}
            className={`min-h-12 rounded-xl border px-5 text-left text-sm font-medium transition-colors
              ${value === o
                ? "border-maroon/40 bg-maroon/5 text-maroon"
                : "border-mist bg-white text-inksoft hover:border-gold/40"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

function Plan() {
  const plan = loadState().plan;
  if (!plan) return (
    <section className="mx-auto max-w-xl rounded-card border border-mist bg-white p-8 shadow-card">
      <Eyebrow>No plan yet</Eyebrow>
      <h1 className="font-display mt-3 text-3xl font-semibold text-inksoft">No housing plan yet.</h1>
      <p className="mt-3 leading-7 text-ink/60">Start with safety intake. The plan appears after safety, status, deadlines, and barriers are checked.</p>
      <Link to="/" className="mt-6 inline-flex min-h-12 items-center rounded-pill bg-maroon px-6 text-sm font-semibold text-white hover:bg-maroonlight transition-colors">
        Start intake
      </Link>
    </section>
  );

  const urgent = plan.deadlines[0];
  return (
    <article className="mx-auto max-w-4xl animate-fade-up">
      {/* Plan header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>My Housing Plan</Eyebrow>
          <h1 className="font-display mt-3 text-4xl font-semibold text-inksoft">Get housed. Stay housed.</h1>
          <p className="mt-2 text-sm text-ink/45">Generated {new Date(plan.generatedAt).toLocaleString()}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print inline-flex min-h-11 items-center gap-2 rounded-pill border border-mist bg-white px-4 text-sm font-semibold text-inksoft hover:bg-parchment transition-colors"
        >
          <Printer size={16} />Print or save
        </button>
      </div>

      {/* Crisis + First step */}
      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-card border border-mist bg-white p-6 shadow-card">
          <Eyebrow>Crisis level</Eyebrow>
          <CrisisBadge level={plan.crisisLevel} />
          <p className="mt-4 text-sm leading-7 text-ink/60">Urgency: {plan.urgencyLevel}</p>
          <p className="mt-3 text-sm leading-7 text-inksoft">{plan.housingGoal}</p>
        </div>
        <div className="rounded-card bg-maroon p-6 shadow-lift text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">Today&rsquo;s first step</p>
          <p className="mt-4 font-display text-2xl font-semibold leading-snug">{plan.firstStep}</p>
        </div>
      </div>

      <Section title="Urgent Deadline">
        {urgent ? (
          <div className="rounded-card border border-clay/30 bg-white p-5 shadow-card">
            <Eyebrow>Urgent deadline</Eyebrow>
            <h3 className="font-display mt-2 text-2xl font-semibold text-inksoft">{urgent.label}: {urgent.date}</h3>
            {urgent.warning && (
              <p className="mt-3 rounded-xl bg-clay/8 p-4 text-sm leading-7 text-inksoft">{urgent.warning}</p>
            )}
          </div>
        ) : <p className="text-sm text-ink/50">No hard deadline entered yet.</p>}
      </Section>

      <Section title="Your Pathways">
        <div className="grid gap-4">
          {plan.pathways.map((id, i) => <PathwayCard key={id} id={id} primary={i === 0} />)}
        </div>
      </Section>

      <Section title="This Week"><Checklist items={plan.weekSteps} /></Section>
      <Section title="Barriers To Clear">
        <Checklist items={plan.barriers.length ? plan.barriers.map((b) => `${b}: start the first clearing step and save proof.`) : ["No barriers selected yet."]} />
      </Section>
      <Section title="Documents I Need"><Checklist items={plan.documents} /></Section>
      <Section title="Calls And Scripts">
        <div className="grid gap-4 sm:grid-cols-2">
          {plan.scripts.map((id) => <ScriptCard key={id} id={id} />)}
        </div>
      </Section>
      <Section title="Backup Plan">
        <div className="rounded-card border border-mist bg-white p-5 shadow-card">
          <p className="leading-7 text-inksoft">{plan.backupPlan}</p>
        </div>
      </Section>
      <Section title="Move-In Needs"><Checklist items={plan.moveInNeeds} /></Section>
      <Section title="Stay-Housed Needs"><Checklist items={plan.stayHousedNeeds} /></Section>
      <Section title="What To Track And Save As Proof"><Checklist items={plan.proof} /></Section>
    </article>
  );
}

function CrisisBadge({ level }: { level: CrisisLevel }) {
  const colors: Record<CrisisLevel, string> = {
    Critical: "bg-maroon text-white",
    High: "bg-clay text-white",
    Moderate: "bg-gold/20 text-inksoft",
    "Stable-Seeking": "bg-sage text-inksoft"
  };
  return (
    <span className={`mt-4 inline-flex rounded-pill px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] ${colors[level]}`}>
      {level}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-mist py-8">
      <h2 className="font-display text-2xl font-semibold text-inksoft">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <label key={item} className="flex min-h-12 items-start gap-4 rounded-xl border border-mist bg-white p-4 cursor-pointer hover:border-gold/40 transition-colors">
          <input type="checkbox" className="mt-0.5 h-5 w-5 flex-shrink-0 accent-maroon" />
          <span className="text-sm leading-7 text-inksoft">{item}</span>
        </label>
      ))}
    </div>
  );
}

function PathwayCard({ id, primary }: { id: PathwayId; primary: boolean }) {
  const p = pathwayDetails[id];
  return (
    <article className="rounded-card border border-mist bg-white p-6 shadow-card card-hover">
      <Eyebrow>{primary ? "Primary pathway" : "Also running"}</Eyebrow>
      <h3 className="font-display mt-2 text-xl font-semibold text-inksoft">{p.title}</h3>
      <p className="mt-2 text-sm leading-7 text-ink/65">{p.why}</p>
      <p className="mt-4 rounded-xl bg-parchment p-4 text-sm leading-7 text-inksoft">
        <strong className="text-gold">Next step: </strong>{p.next}
      </p>
      <p className="mt-3 text-sm leading-7 text-ink/60">
        <strong>Fallback: </strong>{p.fallback}
      </p>
    </article>
  );
}

function ScriptCard({ id }: { id: string }) {
  const s = scriptData[id];
  if (!s) return null;
  return (
    <article className="rounded-card border border-mist bg-white p-5 shadow-card card-hover">
      <Eyebrow>Sample script — confirm before acting</Eyebrow>
      <h3 className="font-display mt-2 text-lg font-semibold text-inksoft">{s.title}</h3>
      <p className="mt-2 text-sm text-ink/55">Who to call: {s.who}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to={`/script/${id}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-maroon px-4 text-sm font-semibold text-white hover:bg-maroonlight transition-colors"
        >
          <PhoneCall size={15} />Teleprompter
        </Link>
        <button
          onClick={() => { const st = loadState(); if (!st.savedScripts.includes(id)) saveState({ ...st, savedScripts: [...st.savedScripts, id] }); }}
          className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-mist bg-white px-4 text-sm font-semibold text-inksoft hover:bg-parchment transition-colors"
        >
          <BookmarkCheck size={15} />Save to plan
        </button>
      </div>
    </article>
  );
}

// ─── Script Teleprompter ──────────────────────────────────────────────────────

function ScriptPage() {
  const { scriptId } = useParams();
  const script = scriptId ? scriptData[scriptId] : undefined;
  const [line, setLine] = useState(0);
  if (!script || !scriptId) return <Navigate to="/plan" replace />;
  return (
    <section className="mx-auto max-w-2xl animate-fade-up">
      <Eyebrow>{script.pathway}</Eyebrow>
      <h1 className="font-display mt-2 text-4xl font-semibold text-inksoft">{script.title}</h1>

      {/* Teleprompter card */}
      <div className="mt-7 rounded-card bg-maroon p-8 text-white shadow-lift">
        <p className="text-xs text-white/50 font-medium">Line {line + 1} of {script.lines.length}</p>
        <p className="mt-6 min-h-40 font-display text-3xl font-semibold leading-snug">{script.lines[line]}</p>
        <div className="mt-8 flex gap-3">
          <button
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-white/10 border border-white/20 px-4 text-sm font-semibold hover:bg-white/15 transition-colors"
            onClick={() => setLine(Math.max(0, line - 1))}
          >
            <ArrowLeft size={16} />Previous
          </button>
          <button
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-white px-4 text-sm font-semibold text-maroon hover:bg-parchment transition-colors"
            onClick={() => setLine(Math.min(script.lines.length - 1, line + 1))}
          >
            Next<ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 rounded-card border border-mist bg-white p-6 shadow-card">
        <List title="What to have ready" items={script.ready} />
        <Divider />
        <List title="What to ask" items={script.ask} />
        <Divider />
        <p className="rounded-xl bg-parchment p-4 text-sm leading-7 text-inksoft">
          <strong className="text-gold">If they say no: </strong>{script.ifNo}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/call-log?scriptId=${scriptId}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-maroon px-5 text-sm font-semibold text-white hover:bg-maroonlight transition-colors"
          >
            <PhoneCall size={15} />Log call
          </Link>
          <Link
            to="/plan"
            className="inline-flex min-h-10 items-center rounded-pill border border-mist bg-white px-5 text-sm font-semibold text-inksoft hover:bg-parchment transition-colors"
          >
            Back to plan
          </Link>
        </div>
      </div>
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-inksoft">{title}</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-7 text-ink/70">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

// ─── Call Log ─────────────────────────────────────────────────────────────────

function CallLog() {
  const [params] = useSearchParams();
  const [logs, setLogs] = useState(loadState().callLogs);
  const [entry, setEntry] = useState<CallLogEntry>({
    id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10),
    who: "", phone: "", answered: "yes", spokeWith: "", notes: "",
    deadline: "", saidNo: "no", followUp: "", proof: true,
    scriptId: params.get("scriptId") || undefined
  });
  function save() {
    const next = [entry, ...logs];
    setLogs(next);
    saveState({ ...loadState(), callLogs: next });
    setEntry({ ...entry, id: crypto.randomUUID(), who: "", phone: "", spokeWith: "", notes: "", deadline: "", followUp: "" });
  }
  return (
    <section className="mx-auto grid max-w-3xl gap-8 animate-fade-up">
      <div>
        <Eyebrow>Call log</Eyebrow>
        <h1 className="font-display mt-2 text-4xl font-semibold text-inksoft">Save what happened.</h1>
        <p className="mt-3 text-base leading-7 text-ink/60">
          Every call, voicemail, no, deadline, and next step can become proof later.
        </p>
      </div>

      <div className="rounded-card border border-mist bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-inksoft">Log this call</h2>
        <div className="mt-6 grid gap-5">
          <Field label="Date" type="date" value={entry.date} set={(v) => setEntry({ ...entry, date: v })} />
          <Field label="Who did you call?" value={entry.who} set={(v) => setEntry({ ...entry, who: v })} />
          <Field label="Phone number" value={entry.phone} set={(v) => setEntry({ ...entry, phone: v })} />
          <label className="grid gap-2 text-sm font-medium text-inksoft">
            Did they answer?
            <select
              className="min-h-12 rounded-xl border border-mist bg-white px-4 text-sm shadow-inner"
              value={entry.answered}
              onChange={(e) => setEntry({ ...entry, answered: e.target.value })}
            >
              <option>yes</option><option>voicemail</option><option>no</option>
            </select>
          </label>
          <Field label="Who did you speak with?" value={entry.spokeWith} set={(v) => setEntry({ ...entry, spokeWith: v })} />
          <label className="grid gap-2 text-sm font-medium text-inksoft">
            What did they say?
            <textarea
              className="min-h-28 rounded-xl border border-mist bg-white p-4 text-sm shadow-inner"
              value={entry.notes}
              onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
            />
          </label>
          <Field label="Deadline given" type="date" value={entry.deadline} set={(v) => setEntry({ ...entry, deadline: v })} />
          <Field label="Follow-up needed" value={entry.followUp} set={(v) => setEntry({ ...entry, followUp: v })} />
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-inksoft">
            <input type="checkbox" className="h-5 w-5 accent-maroon" checked={entry.proof} onChange={(e) => setEntry({ ...entry, proof: e.target.checked })} />
            Save this as proof
          </label>
          <button
            onClick={save}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-maroon px-6 text-sm font-semibold text-white hover:bg-maroonlight transition-colors shadow-lift"
          >
            <Save size={16} />Save call log
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {logs.length ? logs.map((l) => (
          <article key={l.id} className="rounded-card border border-mist bg-white p-5 shadow-card card-hover">
            <Eyebrow>{l.date}</Eyebrow>
            <h3 className="font-display mt-1 text-lg font-semibold text-inksoft">{l.who || "Call logged"}</h3>
            <p className="mt-2 text-sm text-ink/55">Answer: {l.answered}. Phone: {l.phone || "not entered"}</p>
            {l.notes && <p className="mt-3 rounded-xl bg-parchment p-4 text-sm leading-7 text-inksoft">{l.notes}</p>}
          </article>
        )) : (
          <p className="rounded-card border border-mist bg-white p-6 text-sm text-ink/50">No calls logged yet.</p>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, set, type = "text" }: { label: string; value: string; set: (v: string) => void; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-inksoft">
      {label}
      <input
        className="min-h-12 rounded-xl border border-mist bg-white px-4 text-sm shadow-inner focus:border-gold focus:outline-none"
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </label>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intake" element={<Intake />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/script/:scriptId" element={<ScriptPage />} />
        <Route path="/call-log" element={<CallLog />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
