// Detention math, demo data and copy shared by every screen.
// All money is in US dollars; all times are epoch milliseconds.

export const H = 3_600_000;
export const M = 60_000;
export const FREE = 2 * H;
export const RATE = 75;
export const STEP = 15 * M;
export const STEP_USD = RATE / 4;
export const LINE_HAUL = 2100;

export interface Detention {
  end: number;
  elapsed: number;
  billable: number;
  steps: number;
  amount: number;
  toNext: number;
}

export function calc(arrivedAt: number, departedAt: number | null, now: number): Detention {
  const end = departedAt ?? now;
  const elapsed = Math.max(0, end - arrivedAt);
  const billable = Math.max(0, elapsed - FREE);
  const steps = Math.floor(billable / STEP);
  return { end, elapsed, billable, steps, amount: steps * STEP_USD, toNext: STEP - (billable % STEP) };
}

export const clock = (t: number) =>
  new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
export const day = (t: number) =>
  new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const longDate = (t: number) =>
  new Date(t).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
export const usd = (n: number, cents = false) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
export const hm = (ms: number) => {
  const m = Math.floor(ms / M);
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};
export const hmPad = (ms: number) => {
  const m = Math.floor(ms / M);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};
export const secs = (ms: number) => String(Math.floor((ms % M) / 1000)).padStart(2, '0') + 's';
export const countdown = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function buildEmail(arrivedAt: number, departedAt: number | null, now: number): string {
  const c = calc(arrivedAt, departedAt, now);
  const endLabel = departedAt
    ? `${day(c.end)} at ${clock(c.end)}`
    : `${day(c.end)} at ${clock(c.end)} (truck still there)`;
  const totalH = (c.elapsed / H).toFixed(2).replace(/\.00$/, '');
  const billH = ((c.steps * STEP) / H).toFixed(2).replace(/\.00$/, '');
  const amt = usd(c.amount, true);
  return `Hi Dana,

We're requesting detention on load DR-2041:
• Delivery #1, Lodi Cold Storage, Lodi CA. ${day(arrivedAt)} at ${clock(arrivedAt)} to ${endLabel}. Sat ${totalH} hrs, ${billH} hrs past your 2 hrs free. ${billH} × $75/hr = ${amt}.

That comes to ${amt} in detention.

Could you send over a revised rate confirmation for ${usd(LINE_HAUL + c.amount, true)} total: $2,100.00 line haul plus ${amt} in accessorials (detention)?

Please confirm any approval required by these terms. This request does not assume it has been granted.

Thanks,
Northbound Freight Co. dispatch
(209) 555-0148`;
}

// ---------- demo data (fictional company, loads and people) ----------

export type Badge = 'b-red' | 'b-amber' | 'b-blue' | 'b-green';

export interface Need {
  id: string;
  kind: string;
  title: string;
  sub: string;
  badge: Badge;
  icon: IconName;
  action?: { label: string; toast: string };
  opensDetention?: boolean;
}

export const needs: Need[] = [
  {
    id: 'load',
    kind: 'New load',
    title: 'DR-2056 · Stockton → Reno',
    sub: 'Pinecrest Logistics · $2,750 · picks up Sat',
    badge: 'b-blue',
    icon: 'truck',
    action: { label: 'Save', toast: 'DR-2056 saved to Loads' }
  },
  {
    id: 'det',
    kind: 'Detention',
    title: 'DR-2041 · Lodi Cold Storage',
    sub: '',
    badge: 'b-red',
    icon: 'hourglass',
    opensDetention: true
  },
  {
    id: 'arrive',
    kind: 'Check-in',
    title: 'Confirm arrival · DR-2038',
    sub: 'Location check needs a tap from you',
    badge: 'b-amber',
    icon: 'pin',
    action: { label: 'Confirm', toast: 'Arrival confirmed · DR-2038' }
  }
];

export type LoadState = 'det' | 'arriving' | 'booked' | 'pod' | 'paid';
export type LoadFilter = 'all' | 'active' | 'done';

export interface Load {
  id: string;
  lane: string;
  broker: string;
  amount: number;
  state: LoadState;
}

export const loads: Load[] = [
  { id: 'DR-2041', lane: 'Fresno → Lodi', broker: 'Pinecrest Logistics', amount: 2100, state: 'det' },
  { id: 'DR-2038', lane: 'Modesto → Sacramento', broker: 'Bayline Brokerage', amount: 1650, state: 'arriving' },
  { id: 'DR-2056', lane: 'Stockton → Reno', broker: 'Pinecrest Logistics', amount: 2750, state: 'booked' },
  { id: 'DR-2033', lane: 'Merced → Oakland', broker: 'Harbor & Vine', amount: 1380, state: 'pod' },
  { id: 'DR-2029', lane: 'Visalia → San Jose', broker: 'Bayline Brokerage', amount: 1920, state: 'paid' }
];

const delivered: LoadState[] = ['pod', 'paid'];

export const filterLoads = (f: LoadFilter) =>
  loads.filter((l) => f === 'all' || (f === 'done') === delivered.includes(l.state));

export function loadStatus(state: LoadState, departed: boolean): [Badge, string] {
  switch (state) {
    case 'det':
      return departed ? ['b-green', 'Truck left · bill it'] : ['b-red', 'Detention running'];
    case 'arriving':
      return ['b-amber', 'Confirm arrival'];
    case 'booked':
      return ['b-blue', 'Booked'];
    case 'pod':
      return ['b-green', 'POD sent'];
    case 'paid':
      return ['b-green', 'Paid'];
  }
}

export type AutoKey = 'arrival' | 'departure' | 'headsup' | 'pod' | 'overdue' | 'invoice';

export const automations: { key: AutoKey; icon: IconName; title: string; detail: string }[] = [
  { key: 'arrival', icon: 'pin', title: 'Arrival updates', detail: 'Texts the broker when the driver checks in at pickup or delivery.' },
  { key: 'departure', icon: 'dep', title: 'Departure updates', detail: 'Lets the broker know the truck is rolling again, with the time it left.' },
  { key: 'headsup', icon: 'hourglass', title: 'Detention heads-up', detail: 'Tells the broker before their notice deadline, or the moment detention starts when no advance notice is required.' },
  { key: 'pod', icon: 'doc', title: 'POD send', detail: 'Sends the signed proof of delivery as soon as the driver snaps it.' },
  { key: 'overdue', icon: 'clockUp', title: 'Follow up on overdue invoices', detail: 'A polite nudge at 30 days, another at 45, each with the invoice attached.' },
  { key: 'invoice', icon: 'receipt', title: 'Invoice automatically', detail: 'Builds the invoice with line haul, detention and lumpers once POD is in.' }
];

export const initialAutos: Record<AutoKey, boolean> = {
  arrival: false,
  departure: false,
  headsup: true,
  pod: false,
  overdue: false,
  invoice: false
};

// ---------- icons (24×24 stroke paths) ----------

export const icons = {
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9"/>',
  truck: '<path d="M2 6.5h11v9H2zM13 9.5h4.5L21 13v2.5h-8z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  receipt: '<path d="M6 3h12v18l-2.5-1.5L13 21l-2-1.5L9 21l-3-1.5z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.2M12 17.2v.1"/>',
  today: '<rect x="3.5" y="4.5" width="17" height="16" rx="3.5"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/><circle cx="12" cy="15" r="1.6"/>',
  loads: '<path d="M3 7.5 12 3l9 4.5-9 4.5z"/><path d="M3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>',
  switch: '<rect x="2.5" y="4" width="19" height="7" rx="3.5"/><circle cx="17.5" cy="7.5" r="1.8"/><rect x="2.5" y="13" width="19" height="7" rx="3.5"/><circle cx="6.5" cy="16.5" r="1.8"/>',
  chevR: '<path d="m9 5 7 7-7 7"/>',
  chevL: '<path d="m15 5-7 7 7 7"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.1"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.7 2.7L16.2 9.5"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13l2 2 4-4"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  dep: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  clockUp: '<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"/><path d="M12 8v4l3 2"/>'
} as const;

export type IconName = keyof typeof icons;
