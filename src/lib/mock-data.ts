export const STAGES = [
  "Application Received",
  "Loan Setup",
  "Title Ordered",
  "Appraisal Ordered",
  "Submitted to Underwriting",
  "Approved w/ Conditions",
  "Clear to Close",
  "Docs Out",
  "Docs Signed",
  "Funded",
] as const;
export type Stage = (typeof STAGES)[number];

export type StageGroup = "Prospect" | "Processing" | "Closing" | "Funded";

export const STAGE_GROUPS: Record<StageGroup, Stage[]> = {
  Prospect: ["Application Received"],
  Processing: [
    "Loan Setup",
    "Title Ordered",
    "Appraisal Ordered",
    "Submitted to Underwriting",
    "Approved w/ Conditions",
    "Clear to Close",
  ],
  Closing: ["Docs Out", "Docs Signed"],
  Funded: ["Funded"],
};

export function groupOfStage(s: Stage): StageGroup {
  for (const [g, list] of Object.entries(STAGE_GROUPS) as [StageGroup, Stage[]][]) {
    if (list.includes(s)) return g;
  }
  return "Prospect";
}

export type LoanBorrower = {
  borrowerId: string;
  name: string;
  email: string;
  phone: string;
  role: "Primary" | "Co-Borrower";
  status: string; // e.g. "Needs In-Review · Full App"
  pending?: boolean;
};

export type Loan = {
  id: string;
  loanNumber: string;
  borrowerId: string;
  borrowerName: string;
  borrowers: LoanBorrower[];
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  propertyType: string;
  purchasePrice: number;
  arv: number;
  loanAmount: number;
  interestRate: number;
  ltv: number;
  termMonths: number;
  points: number;
  originationFee: number;
  maturityDate: string;
  lender: string;
  stage: Stage;
  tasksDue: number;
  conditionsPending: number;
  trackers: { itp: boolean; appraisal: boolean; title: boolean };
  lastUpdated: string; // ISO
  closingDate?: string;
  notes: { id: string; ts: string; author: string; body: string }[];
  documents: { id: string; name: string; uploadedAt: string }[];
};

export type Borrower = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssn: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  name: string;
  type: "Real Estate Agent" | "Escrow Agent" | "Title Rep" | "Attorney";
  company: string;
  email: string;
  phone: string;
  updatedAt: string;
};

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();
const monthsAhead = (m: number) =>
  new Date(now + m * 30 * 86400000).toISOString().slice(0, 10);

export const initialBorrowers: Borrower[] = [
  ["Gabriel", "Estrada", "gestrada@yahoo.com", "(626) 705-0177", "1289 Maple Ave, Pasadena, CA"],
  ["Jonathan", "Ferrell", "jonathan@highlevelautomations.com", "(404) 555-2231", "55 Peachtree St, Atlanta, GA"],
  ["Valerie", "Jewell", "vjewell@houseparts.com", "(404) 434-5064", "812 Oak Ln, Decatur, GA"],
  ["Joseph", "Anderson", "jedanderson@athensbest.com", "(706) 372-9850", "44 Broad St, Athens, GA"],
  ["Mark", "Guthrie", "loggerhead1980@aol.com", "(256) 443-6165", "190 Pine Rd, Huntsville, AL"],
  ["Christina", "Clifton", "cclifton99@gmail.com", "(706) 248-9964", "77 Lake Dr, Watkinsville, GA"],
  ["Curtis", "McGuire", "djthicklove@msn.com", "(706) 255-7882", "23 River Bend, Athens, GA"],
  ["Lisa", "Futrell", "soojatoo@gmail.com", "(404) 555-9911", "501 Magnolia, Atlanta, GA"],
  ["David", "Aguilar", "daguilar@blockbyblock.com", "(404) 555-2240", "8 Highland Ave, Atlanta, GA"],
  ["Reza", "Baharloo", "britedentalcenter@yahoo.com", "(404) 555-1190", "300 W Paces Ferry, Atlanta, GA"],
  ["Susan", "Stone", "choclateisgood@yahoo.com", "(404) 555-3344", "12 Elm St, Marietta, GA"],
  ["Kristy", "Ayala", "madridkris123@yahoo.com", "(404) 555-9988", "67 Cherokee Rd, Atlanta, GA"],
  ["Bernard", "Diaz", "bernieredstone@gmail.com", "(404) 555-7766", "910 Spring St, Atlanta, GA"],
].map(([f, l, e, p, a], i) => ({
  id: `B${1000 + i}`,
  firstName: f,
  lastName: l,
  email: e,
  phone: p,
  ssn: "***-**-" + (1000 + i),
  address: a,
  createdAt: daysAgo(30 + i * 7),
  updatedAt: daysAgo(i * 3),
}));

const lenders = ["Anchor Loans", "Kiavi", "RCN Capital", "Lima One Capital", "Fund That Flip"];
const propTypes = ["Single Family", "Multi-Family", "Condo", "Townhouse"];
const cities: [string, string, string][] = [
  ["Atlanta", "GA", "30303"],
  ["Pasadena", "CA", "91101"],
  ["Athens", "GA", "30601"],
  ["Huntsville", "AL", "35801"],
  ["Decatur", "GA", "30030"],
  ["Marietta", "GA", "30060"],
];

export const initialLoans: Loan[] = Array.from({ length: 15 }, (_, i) => {
  const b = initialBorrowers[i % initialBorrowers.length];
  const stage = STAGES[i % STAGES.length];
  const purchasePrice = 250000 + Math.round(Math.random() * 600000);
  const loanAmount = Math.round(purchasePrice * (0.65 + Math.random() * 0.25));
  const arv = purchasePrice + Math.round(Math.random() * 200000);
  const [city, state, zip] = cities[i % cities.length];
  const streetNum = 100 + i * 37;
  const co = i % 3 === 0 ? initialBorrowers[(i + 1) % initialBorrowers.length] : null;
  const primaryStatuses = ["Needs In-Review · Full App", "Submitted · Full App", "Active · Full App"];
  return {
    id: `L${2000 + i}`,
    loanNumber: String(16600000 + i * 137),
    borrowerId: b.id,
    borrowerName: `${b.firstName} ${b.lastName}`,
    borrowers: [
      {
        borrowerId: b.id,
        name: `${b.firstName} ${b.lastName}`,
        email: b.email,
        phone: b.phone,
        role: "Primary" as const,
        status: primaryStatuses[i % primaryStatuses.length],
        pending: i % 4 === 0,
      },
      ...(co
        ? [{
            borrowerId: co.id,
            name: `${co.firstName} ${co.lastName}`,
            email: co.email,
            phone: co.phone,
            role: "Co-Borrower" as const,
            status: "Needs Pending · Full App",
            pending: true,
          }]
        : []),
    ],
    propertyAddress: `${streetNum} ${["Oak", "Maple", "Pine", "Cedar", "Elm"][i % 5]} ${["St", "Ave", "Rd", "Ln"][i % 4]}`,
    propertyCity: city,
    propertyState: state,
    propertyZip: zip,
    propertyType: propTypes[i % propTypes.length],
    purchasePrice,
    arv,
    loanAmount,
    interestRate: 9 + Math.round(Math.random() * 40) / 10,
    ltv: Math.round((loanAmount / purchasePrice) * 1000) / 10,
    termMonths: [12, 18, 24][i % 3],
    points: 1 + (i % 3),
    originationFee: Math.round(loanAmount * 0.015),
    maturityDate: monthsAhead(12 + (i % 12)),
    lender: lenders[i % lenders.length],
    stage,
    tasksDue: i % 7,
    conditionsPending: i % 4,
    trackers: { itp: i % 2 === 0, appraisal: i % 3 === 0, title: i % 4 === 0 },
    lastUpdated: daysAgo(i),
    closingDate: monthsAhead(1),
    notes:
      i % 3 === 0
        ? [
            {
              id: "n1",
              ts: daysAgo(i + 1),
              author: "System",
              body: "Loan file created.",
            },
          ]
        : [],
    documents: [],
  };
});

export const initialContacts: Contact[] = [
  ["Meredith Von Kleydorff", "Real Estate Agent", "C21 Connect Realty", "meredithvonk@c21connectrealty.com", "(404) 555-1100"],
  ["Jeb Durgin", "Title Rep", "Complete Lending", "jeb@completelending.com", "(404) 555-1101"],
  ["Veronica Penn", "Real Estate Agent", "Allison James Estates", "joyousvv@gmail.com", "(415) 942-4000"],
  ["Judy Sin", "Escrow Agent", "Capital Title", "teamjudy@ctot.com", "(832) 559-7243"],
  ["Kristin Atkins", "Real Estate Agent", "CB&A Realtors", "kristinkny@mw.com", "(832) 678-4770"],
  ["Maribel Ramirez", "Real Estate Agent", "Zillow", "maribel@deanaguilargroup.com", "(619) 457-9842"],
  ["Tanya Gaitan", "Real Estate Agent", "Home Smart Realty West", "5361611@gmail.com", "(951) 536-1611"],
  ["Ryan Miller", "Real Estate Agent", "White Rock Realty", "rmillersmail@gmail.com", "(209) 495-7008"],
  ["Matt Gibson", "Attorney", "Gibson Legal", "matt@undercardgroup.com", "(404) 555-0099"],
  ["Talitha Brazeal", "Escrow Agent", "Alliance Mutual Escrow", "talitha.brazeal@gmail.com", "(404) 555-0088"],
  ["Laura Woodbury", "Title Rep", "Alliance Title", "teamlaura@ameescrow.com", "(404) 555-0077"],
  ["Christian Rodriguez", "Real Estate Agent", "eXp Realty", "cjrealestatelegacy@gmail.com", "(909) 670-3313"],
].map(([name, type, company, email, phone], i) => ({
  id: `C${3000 + i}`,
  name,
  type: type as Contact["type"],
  company,
  email,
  phone,
  updatedAt: daysAgo(20 + i * 30),
}));
