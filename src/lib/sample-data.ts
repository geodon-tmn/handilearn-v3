/*
 * Sample data for the stage 0 prototype. Every screen that reads from this
 * file shows the "Preview" badge. Stage 1 onwards replaces it, screen by
 * screen, with real data from Supabase.
 *
 * Syllabus wording here is illustrative, not quoted from any official syllabus.
 */

export type Territory = { code: string; name: string; currency: string; schools: number; status: "live" | "planned" };
export const territories: Territory[] = [
  { code: "BB", name: "Barbados", currency: "BBD", schools: 4, status: "live" },
  { code: "JM", name: "Jamaica", currency: "JMD", schools: 0, status: "planned" },
  { code: "VC", name: "St. Vincent and the Grenadines", currency: "XCD", schools: 0, status: "planned" },
  { code: "TT", name: "Trinidad and Tobago", currency: "TTD", schools: 0, status: "planned" },
];

export type EducationSystem = { code: string; name: string; level: "Primary" | "Secondary" | "Tertiary"; territory: string | null; curricula: number };
export const educationSystems: EducationSystem[] = [
  { code: "CSEC", name: "Caribbean Secondary Education Certificate", level: "Secondary", territory: null, curricula: 2 },
  { code: "CAPE", name: "Caribbean Advanced Proficiency Examination", level: "Tertiary", territory: null, curricula: 0 },
  { code: "BB-PRI", name: "Barbados National Primary Curriculum", level: "Primary", territory: "BB", curricula: 1 },
  { code: "BSSEE", name: "Barbados Secondary Schools' Entrance Examination", level: "Primary", territory: "BB", curricula: 1 },
];

export type School = { name: string; territory: string; level: string; status: "Listed" | "Claimed" | "Subscribed"; students: number; consented: number };
export const schools: School[] = [
  { name: "Harrison College", territory: "BB", level: "Secondary", status: "Listed", students: 38, consented: 0 },
  { name: "The St. Michael School", territory: "BB", level: "Secondary", status: "Claimed", students: 21, consented: 9 },
  { name: "St. Winifred's School", territory: "BB", level: "Primary and secondary", status: "Subscribed", students: 17, consented: 14 },
  { name: "Wesley Hall Infants' School", territory: "BB", level: "Primary", status: "Listed", students: 6, consented: 0 },
];

export type Curriculum = { id: string; subject: string; owner: string; ownerKind: "system" | "school"; level: string; status: "Draft" | "Processing" | "In review" | "Live"; objectives: number; students: number; updated: string };
export const curricula: Curriculum[] = [
  { id: "csec-maths", subject: "Mathematics", owner: "CSEC", ownerKind: "system", level: "Forms 4–5", status: "In review", objectives: 24, students: 46, updated: "Today" },
  { id: "csec-english", subject: "English A", owner: "CSEC", ownerKind: "system", level: "Forms 4–5", status: "Processing", objectives: 0, students: 0, updated: "Today" },
  { id: "bssee-maths", subject: "Mathematics", owner: "BSSEE", ownerKind: "system", level: "Class 4", status: "Live", objectives: 31, students: 23, updated: "18 Nov" },
  { id: "bb-pri-science", subject: "Science", owner: "BB-PRI", ownerKind: "system", level: "Classes 3–4", status: "Draft", objectives: 0, students: 0, updated: "12 Nov" },
  { id: "stw-coding", subject: "Introduction to Coding", owner: "St. Winifred's School", ownerKind: "school", level: "Form 2", status: "Live", objectives: 12, students: 9, updated: "2 Nov" },
];

/* Hierarchy: subject → module → topic → objective → lesson (an objective holds its lessons). */
export type Lesson = { id: string; title: string };
export type Objective = { id: string; code: string; title: string; competency: string; quote: string; flag?: "check"; lessons: Lesson[] };
export type Topic = { id: string; title: string; objectives: Objective[] };
export type Module = { id: string; title: string; topics: Topic[] };
export const csecMaths: { subject: string; modules: Module[] } = {
  subject: "Mathematics",
  modules: [
    { id: "m1", title: "Number Theory and Computation", topics: [
      { id: "t1", title: "Computation", objectives: [
        { id: "o1", code: "1.1", title: "Carry out the four operations with fractions", competency: "Adds, subtracts, multiplies and divides fractions accurately", quote: "perform the four basic operations with fractions",
          lessons: [{ id: "o1-l1", title: "Adding and subtracting fractions" }, { id: "o1-l2", title: "Multiplying and dividing fractions" }] },
        { id: "o2", code: "1.2", title: "Convert between fractions, decimals and percentages", competency: "Moves between the three forms and chooses the most useful one", quote: "convert among fractions, percentages and decimals",
          lessons: [{ id: "o2-l1", title: "Fractions to decimals and back" }, { id: "o2-l2", title: "Working with percentages" }] },
        { id: "o3", code: "1.3", title: "Round to decimal places and significant figures", competency: "Rounds correctly and explains the effect on accuracy", quote: "approximate a value to a given number of decimal places or significant figures",
          lessons: [{ id: "o3-l1", title: "Decimal places" }, { id: "o3-l2", title: "Significant figures" }] },
        { id: "o4", code: "1.4", title: "Write numbers in standard form", competency: "Writes very large and very small numbers in standard form", quote: "express a value in scientific notation",
          lessons: [{ id: "o4-l1", title: "Standard form" }] },
      ] },
      { id: "t2", title: "Number theory", objectives: [
        { id: "o5", code: "2.1", title: "Classify numbers as natural, whole, integer or rational", competency: "Places any number in the right set and explains why", quote: "distinguish among sets of numbers",
          lessons: [{ id: "o5-l1", title: "Sets of numbers" }] },
        { id: "o6", code: "2.2", title: "Continue and describe number patterns", competency: "Finds the rule behind a sequence and predicts later terms", quote: "generate a sequence of numbers obeying a given rule", flag: "check",
          lessons: [{ id: "o6-l1", title: "Finding the rule" }, { id: "o6-l2", title: "Predicting later terms" }] },
      ] },
    ] },
    { id: "m2", title: "Consumer Arithmetic", topics: [
      { id: "t3", title: "Money in everyday life", objectives: [
        { id: "o7", code: "3.1", title: "Calculate profit, loss and discount", competency: "Works out profit, loss and discount as amounts and percentages", quote: "calculate discount, sales tax, profit and loss",
          lessons: [{ id: "o7-l1", title: "Profit and loss" }, { id: "o7-l2", title: "Discount and sales tax" }] },
        { id: "o8", code: "3.2", title: "Calculate simple and compound interest", competency: "Uses the right formula and compares the two kinds of interest", quote: "solve problems involving simple interest and compound interest",
          lessons: [{ id: "o8-l1", title: "Simple interest" }, { id: "o8-l2", title: "Compound interest" }] },
        { id: "o9", code: "3.3", title: "Work out utility bills and hire purchase", competency: "Reads a bill and checks the total", quote: "solve problems involving utility bills and hire purchase",
          lessons: [{ id: "o9-l1", title: "Reading a utility bill" }, { id: "o9-l2", title: "Hire purchase" }] },
      ] },
    ] },
    { id: "m3", title: "Algebra", topics: [
      { id: "t4", title: "Expressions and equations", objectives: [
        { id: "o10", code: "7.1", title: "Use symbols to represent numbers", competency: "Writes an expression from a description in words", quote: "use symbols to represent numbers, operations and relations",
          lessons: [{ id: "o10-l1", title: "From words to symbols" }] },
        { id: "o11", code: "7.2", title: "Simplify algebraic expressions", competency: "Collects like terms and expands brackets", quote: "simplify algebraic expressions",
          lessons: [{ id: "o11-l1", title: "Collecting like terms" }, { id: "o11-l2", title: "Expanding brackets" }] },
        { id: "o12", code: "7.3", title: "Solve linear equations in one unknown", competency: "Solves an equation step by step and checks the answer", quote: "solve linear equations in one unknown",
          lessons: [{ id: "o12-l1", title: "One-step and two-step equations" }, { id: "o12-l2", title: "Equations with brackets and fractions" }] },
        { id: "o13", code: "7.4", title: "Solve simultaneous linear equations", competency: "Solves a pair of equations by elimination or substitution", quote: "solve simultaneous linear equations in two unknowns", flag: "check",
          lessons: [{ id: "o13-l1", title: "Elimination" }, { id: "o13-l2", title: "Substitution" }] },
      ] },
    ] },
  ],
};
export const allObjectives = csecMaths.modules.flatMap(m => m.topics.flatMap(t => t.objectives.map(o => ({ ...o, topic: t.title, module: m.title }))));

/* Learning-path graph: from → to means "learn from before to". */
export type LinkType = "mandatory" | "recommended" | "supporting";
export type GraphLink = { from: string; to: string; type: LinkType; source: "Syllabus" | "AI" | "Admin"; reason: string };
export const links: GraphLink[] = [
  { from: "o1", to: "o2", type: "mandatory", source: "Syllabus", reason: "Converting needs fraction operations" },
  { from: "o2", to: "o3", type: "recommended", source: "AI", reason: "Rounding decimals builds on conversions" },
  { from: "o3", to: "o4", type: "mandatory", source: "AI", reason: "Standard form uses significant figures" },
  { from: "o5", to: "o6", type: "recommended", source: "AI", reason: "Patterns use number sets" },
  { from: "o2", to: "o7", type: "mandatory", source: "AI", reason: "Discounts are percentages" },
  { from: "o7", to: "o8", type: "mandatory", source: "Syllabus", reason: "Interest extends percentage change" },
  { from: "o7", to: "o9", type: "supporting", source: "AI", reason: "Bills reuse money calculations" },
  { from: "o5", to: "o10", type: "supporting", source: "AI", reason: "Symbols stand for numbers in a set" },
  { from: "o10", to: "o11", type: "mandatory", source: "Syllabus", reason: "Simplifying needs symbol use" },
  { from: "o11", to: "o12", type: "mandatory", source: "Syllabus", reason: "Solving needs simplifying" },
  { from: "o12", to: "o13", type: "mandatory", source: "AI", reason: "Pairs of equations extend single ones" },
  { from: "o1", to: "o12", type: "recommended", source: "AI", reason: "Equations often have fractions" },
];

/* Placement test: question bank for the first objectives and beyond. */
export type Question = { id: string; objective: string; difficulty: 1 | 2 | 3 | 4 | 5; prompt: string; options: string[]; answer: number };
export const placementBank: Question[] = [
  { id: "q1", objective: "o1", difficulty: 1, prompt: "What is 1/2 + 1/4?", options: ["2/6", "3/4", "1/8", "2/4"], answer: 1 },
  { id: "q2", objective: "o1", difficulty: 3, prompt: "What is 2/3 ÷ 4/9?", options: ["8/27", "3/2", "6/12", "2/3"], answer: 1 },
  { id: "q3", objective: "o2", difficulty: 2, prompt: "Write 0.35 as a percentage.", options: ["3.5%", "35%", "0.35%", "350%"], answer: 1 },
  { id: "q4", objective: "o2", difficulty: 3, prompt: "Which is largest?", options: ["3/5", "0.58", "61%", "0.6"], answer: 2 },
  { id: "q5", objective: "o3", difficulty: 2, prompt: "Round 4.0478 to 2 decimal places.", options: ["4.04", "4.05", "4.048", "4.00"], answer: 1 },
  { id: "q6", objective: "o3", difficulty: 4, prompt: "Round 0.006083 to 2 significant figures.", options: ["0.0061", "0.006", "0.01", "0.0060"], answer: 0 },
  { id: "q7", objective: "o7", difficulty: 3, prompt: "A $250 bag is discounted by 20%. What is the sale price?", options: ["$50", "$200", "$230", "$270"], answer: 1 },
  { id: "q8", objective: "o8", difficulty: 4, prompt: "Simple interest on $1,000 at 5% a year for 3 years?", options: ["$15", "$50", "$150", "$1,150"], answer: 2 },
  { id: "q9", objective: "o11", difficulty: 3, prompt: "Simplify 3x + 2y − x + 5y.", options: ["2x + 7y", "4x + 7y", "2x + 3y", "9xy"], answer: 0 },
  { id: "q10", objective: "o12", difficulty: 4, prompt: "Solve 3x − 7 = 11.", options: ["x = 4/3", "x = 6", "x = 18", "x = 3"], answer: 1 },
  { id: "q11", objective: "o13", difficulty: 5, prompt: "Solve x + y = 7 and x − y = 1.", options: ["x = 3, y = 4", "x = 4, y = 3", "x = 5, y = 2", "x = 6, y = 1"], answer: 1 },
];

/* Family, student and class data. */
export const parent = { name: "Keisha Bourne", email: "keisha@example.com" };
export type Child = { id: string; name: string; age: number; grade: string; school: string; schoolStatus: School["status"]; sharing: "Granted" | "Not asked" | "Asked" | "Withdrawn"; subjects: { name: string; owner: string; mastery: number; next: string }[] };
export const children: Child[] = [
  { id: "c1", name: "Jaden Bourne", age: 15, grade: "Form 4", school: "The St. Michael School", schoolStatus: "Claimed", sharing: "Asked",
    subjects: [{ name: "Mathematics", owner: "CSEC", mastery: 42, next: "Profit and loss (objective 3.1)" }, { name: "English A", owner: "CSEC", mastery: 0, next: "Starts after placement" }] },
  { id: "c2", name: "Amara Bourne", age: 10, grade: "Class 4", school: "Wesley Hall Infants' School", schoolStatus: "Listed", sharing: "Not asked",
    subjects: [{ name: "Mathematics", owner: "BSSEE", mastery: 67, next: "Area of rectangles" }] },
];
export const student = { name: "Jaden", streak: 4, minutesThisWeek: 85 };

export type PathStep = { objective: string; status: "done" | "current" | "next" | "later" };
export const jadenPath: PathStep[] = [
  { objective: "o1", status: "done" }, { objective: "o2", status: "done" }, { objective: "o3", status: "done" },
  { objective: "o7", status: "current" }, { objective: "o8", status: "next" }, { objective: "o4", status: "later" },
  { objective: "o10", status: "later" }, { objective: "o11", status: "later" }, { objective: "o12", status: "later" },
];

export const lessonContent = {
  objective: "o7",
  objectiveTitle: "Calculate profit, loss and discount",
  lesson: "Profit and loss",
  lessonOf: "Lesson 1 of 2",
  profile: "Developing · Secondary · Worked examples · English",
  reused: 37,
  flow: ["Recall", "Teach", "Guided practice", "Independent practice", "Mastery check", "Reflection"],
  recall: "Last time you converted 3/5 to 60%. Percentages are what we use for discounts too.",
  teach: [
    "A discount is money taken off the price. If a shop gives 20% off, you pay 80% of the price.",
    "Profit is what a seller gains when they sell for more than they paid. Loss is when they sell for less.",
  ],
  example: { problem: "A phone costs $800 at a store in Bridgetown. It is on sale for 15% off. What is the sale price?", steps: ["15% of $800 = 0.15 × 800 = $120", "Sale price = $800 − $120 = $680", "Check: you pay 85% of $800 = $680 ✓"] },
  practice: { problem: "A vendor buys mangoes for $3 each and sells them for $4.50 each. What is the profit as a percentage of the cost?", options: ["33%", "50%", "150%", "1.5%"], answer: 1, hint: "Profit is $1.50. Divide by what the vendor paid." },
};

export type TutorMessage = { role: "student" | "tutor"; text: string };
export const tutorOpening: TutorMessage[] = [
  { role: "tutor", text: "Hi Jaden! We're on profit, loss and discount. What would you like help with?" },
  { role: "student", text: "Why do we divide by the cost price and not the selling price?" },
  { role: "tutor", text: "Good question. Profit percentage measures how much you gained compared with what you put in. What you put in is the cost price, so that's what we compare against. Want to try one?" },
];
export const tutorReplies = [
  "Let's break it down. What did the seller pay, and what did they sell it for?",
  "Nearly there! Check which number you divided by. It should be the cost price.",
  "Yes, that's right! You've got it. Shall we try a discount question next?",
];

export type ClassRow = { student: string; mastery: number; lastActive: string; stuckOn?: string; sharing: boolean };
export const classRows: ClassRow[] = [
  { student: "Jaden B.", mastery: 42, lastActive: "Today", stuckOn: "Profit percentage", sharing: true },
  { student: "Kemar T.", mastery: 71, lastActive: "Yesterday", sharing: true },
  { student: "Shania W.", mastery: 18, lastActive: "5 days ago", stuckOn: "Converting fractions", sharing: true },
  { student: "Tariq M.", mastery: 55, lastActive: "Today", sharing: true },
  { student: "Ava C.", mastery: 0, lastActive: "—", sharing: false },
  { student: "Rhianna D.", mastery: 0, lastActive: "—", sharing: false },
];

export type Person = { name: string; email: string; role: "Global Administrator" | "School Administrator" | "Teacher" | "Parent" | "Student"; scope: string; twoFactor: boolean; status: "Active" | "Invited" };
export const people: Person[] = [
  { name: "You", email: "admin@handilearn.example", role: "Global Administrator", scope: "Everything", twoFactor: true, status: "Active" },
  { name: "Mrs. P. Alleyne", email: "principal@stmichael.example", role: "School Administrator", scope: "The St. Michael School", twoFactor: true, status: "Active" },
  { name: "Mr. D. Clarke", email: "dclarke@stmichael.example", role: "Teacher", scope: "Form 4 Maths", twoFactor: false, status: "Invited" },
  { name: "Keisha Bourne", email: "keisha@example.com", role: "Parent", scope: "2 children", twoFactor: false, status: "Active" },
  { name: "Jaden Bourne", email: "—", role: "Student", scope: "Own learning", twoFactor: false, status: "Active" },
];

export type AuditRow = { when: string; who: string; action: string; target: string; ai?: { provider: "Claude" | "OpenAI"; cost: number } };
export const audit: AuditRow[] = [
  { when: "Today 19:42", who: "You", action: "Uploaded syllabus", target: "CSEC Mathematics", ai: { provider: "Claude", cost: 0.84 } },
  { when: "Today 19:44", who: "System", action: "Built learning path", target: "CSEC Mathematics", ai: { provider: "Claude", cost: 0.21 } },
  { when: "Today 18:10", who: "Jaden Bourne", action: "Completed placement test", target: "CSEC Mathematics · 8 questions", ai: { provider: "Claude", cost: 0.03 } },
  { when: "Today 18:12", who: "System", action: "Reused stored lesson", target: "Profit and loss · objective 3.1" },
  { when: "Today 17:55", who: "Keisha Bourne", action: "Granted school access", target: "Jaden → The St. Michael School" },
  { when: "Yesterday 16:20", who: "System", action: "Generated illustration", target: "Area of rectangles", ai: { provider: "OpenAI", cost: 0.04 } },
  { when: "Yesterday 09:03", who: "Mrs. P. Alleyne", action: "Claimed school", target: "The St. Michael School" },
];

export const sampleSyllabus = `SECTION 1: COMPUTATION
GENERAL OBJECTIVES
Students should develop accuracy and confidence with numbers.
SPECIFIC OBJECTIVES
Students should be able to:
1.1 perform the four basic operations with fractions;
1.2 convert among fractions, percentages and decimals;
1.3 approximate a value to a given number of decimal places or significant figures;
1.4 express a value in scientific notation.

SECTION 2: NUMBER THEORY
2.1 distinguish among sets of numbers;
2.2 generate a sequence of numbers obeying a given rule.

SECTION 3: CONSUMER ARITHMETIC
3.1 calculate discount, sales tax, profit and loss;
3.2 solve problems involving simple interest and compound interest;
3.3 solve problems involving utility bills and hire purchase.`;
