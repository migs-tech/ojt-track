// Sample data for the demo build. Every name, email and company here is fictional.

// Small seeded RNG so the demo looks the same on every visit.
let seed = 20260924;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const FIRST = [
  "Juan", "Maria", "Jose", "Angela", "Mark", "Kristine", "Paolo", "Bea", "Carlo", "Denise",
  "Miguel", "Sofia", "Rafael", "Trisha", "Nathan", "Clarisse", "Joshua", "Isabel", "Kevin",
  "Andrea", "Gabriel", "Camille", "Luis", "Janelle", "Adrian", "Patricia", "Enzo", "Hannah",
];
const LAST = [
  "Dela Cruz", "Santos", "Reyes", "Garcia", "Mendoza", "Bautista", "Villanueva", "Ramos",
  "Castillo", "Navarro", "Aquino", "Torres", "Flores", "Gonzales", "Lopez", "Rivera",
];
const COMPANIES = [
  "Northwind Solutions", "Bluepeak Digital", "Harbor Systems Inc.", "Lumen Data Corp.",
  "Summit Web Studio", "Pixelcraft Labs",
];
const COURSES = [
  "BS Information Technology", "BS Computer Science", "BS Information Systems",
  "BS Computer Engineering",
];
const REPORT_TITLES = [
  "Set up development environment", "Fixed UI bugs on client dashboard",
  "Built REST endpoint for inventory", "Wrote unit tests for login module",
  "Designed database tables for orders", "Attended sprint planning meeting",
  "Migrated legacy forms to Vue", "Documented API endpoints",
  "Assisted in network cabling", "Prepared weekly status presentation",
  "Optimized slow SQL queries", "Created responsive landing page",
];

const usedNames = new Set();
const uniqueName = () => {
  let name;
  do {
    name = `${pick(FIRST)} ${pick(LAST)}`;
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
};
const emailFor = (name) =>
  name.toLowerCase().replace(/[^a-z ]/g, "").replace(/ +/g, ".") + "@example.com";
const iso = (d) => d.toISOString().slice(0, 10);
const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};
// Initials avatar as an inline SVG, so the demo needs no external image service.
const AVATAR_COLORS = ["#4f46e5", "#0891b2", "#16a34a", "#d97706", "#db2777", "#7c3aed"];
const avatar = (name) => {
  const initials = name.replace("Prof. ", "").split(" ").map((w) => w[0]).slice(0, 2).join("");
  const color = AVATAR_COLORS[name.length % AVATAR_COLORS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${color}"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Arial,sans-serif" font-size="40" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// ---------- Supervisors ----------
export const supervisors = COMPANIES.map((company, i) => {
  const name = uniqueName();
  return {
    supervisor_id: 100 + i,
    supervisor_name: name,
    email: emailFor(name),
    company,
    avatar_url: avatar(name),
  };
});

// ---------- Trainees ----------
const buildLogs = (count) => {
  const logs = [];
  let day = 1;
  for (let i = 0; i < count; i++) {
    const d = daysAgo(day);
    if (d.getDay() === 0 || d.getDay() === 6) {
      day++;
      i--;
      continue;
    }
    const inMin = int(0, 25);
    const outMin = int(0, 40);
    logs.push({
      created_at: fmtDate(d),
      time_in: `08:${String(inMin).padStart(2, "0")} AM`,
      time_out: `05:${String(outMin).padStart(2, "0")} PM`,
    });
    day++;
  }
  return logs;
};

const buildReports = (weeks) => {
  const out = [];
  for (let w = 0; w < weeks; w++) {
    const start = daysAgo(7 * (w + 1));
    const end = daysAgo(7 * (w + 1) - 4);
    const reports = Array.from({ length: int(2, 4) }, (_, r) => ({
      title: pick(REPORT_TITLES),
      description: "Worked with the team on assigned tasks and logged progress for supervisor review.",
      date: fmtDate(daysAgo(7 * (w + 1) - r)),
    }));
    out.push({ week_range: `${fmtDate(start)} – ${fmtDate(end)}`, reports });
  }
  return out;
};

export const trainees = Array.from({ length: 32 }, (_, i) => {
  const name = uniqueName();
  const required = pick([300, 486, 500, 600]);
  // Mix of finished, in-progress and just-started trainees.
  const pct = i < 7 ? 100 : i < 27 ? int(18, 95) : 0;
  const worked = Math.round((required * pct) / 100);
  const unassigned = i >= 27;
  const sup = unassigned ? null : supervisors[i % supervisors.length];
  const presentDays = Math.round(worked / 8);
  return {
    trainee_id: 1000 + i,
    trainee_name: name,
    email: emailFor(name),
    course: pick(COURSES),
    company: sup ? sup.company : "Not yet assigned",
    supervisor_id: sup?.supervisor_id ?? null,
    supervisor_name: sup?.supervisor_name ?? "Unassigned",
    ojt_required_hours: required,
    ojt_completion_percentage: pct,
    started_at: iso(daysAgo(Math.max(presentDays + int(5, 20), 3) * 1.4)),
    birthdate: iso(new Date(2002 + int(0, 3), int(0, 11), int(1, 28))),
    avatar_url: avatar(name),
    attendance: {
      present: presentDays,
      absent: int(0, 6),
      work_hours: `${worked}h ${int(0, 59)}m 0s`,
    },
    reports: buildReports(Math.min(Math.ceil(presentDays / 5), 6)),
    attendance_logs: buildLogs(Math.min(presentDays, 12)),
  };
});

// ---------- Teachers (OJT coordinators) ----------
export const teachers = Array.from({ length: 6 }, (_, i) => {
  const name = `Prof. ${uniqueName()}`;
  const created = daysAgo(int(60, 300));
  return {
    teacher_id: 500 + i,
    teacher_name: name,
    username: emailFor(name.replace("Prof. ", "")),
    email: emailFor(name.replace("Prof. ", "")),
    birthdate: iso(new Date(1975 + int(0, 15), int(0, 11), int(1, 28))),
    status: i === 5 ? "0" : "1",
    avatar_url: avatar(name),
    created: created.toISOString(),
    modified: daysAgo(int(1, 50)).toISOString(),
  };
});

// ---------- Report requests ----------
const REQUEST_TYPES = ["Weekly Report", "Monthly Report", "DTR Correction"];
const REASONS = [
  "Need a signed copy for school submission.",
  "Missed a time-out scan because the QR scanner was offline.",
  "Coordinator requested the monthly summary.",
  "Required for OJT portfolio compilation.",
];
export const reportRequests = trainees.slice(7, 16).map((t, i) => {
  const start = daysAgo(7 * (i + 1));
  const end = daysAgo(7 * (i + 1) - 4);
  return {
    id: 9000 + i,
    user_id: t.trainee_id,
    name: t.trainee_name,
    request_type: REQUEST_TYPES[i % REQUEST_TYPES.length],
    period: `${fmtDate(start)} – ${fmtDate(end)}`,
    reason: REASONS[i % REASONS.length],
    status: "pending",
    created_at: daysAgo(i).toISOString(),
  };
});

// ---------- Evaluations ----------
const REMARKS = ["Excellent", "Very good", "Good", "Satisfactory", "Needs improvement"];
const buildEvaluation = () => {
  const evaluations = {};
  for (const cat of [1, 2, 3]) {
    evaluations[cat] = {};
    for (const letter of ["a", "b", "c", "d"]) {
      const points = int(3, 5);
      evaluations[cat][`${cat}${letter}`] = { points, remarks: REMARKS[5 - points] };
    }
  }
  return evaluations;
};
export const evaluations = trainees
  .filter((t) => t.supervisor_id && t.ojt_completion_percentage >= 60)
  .map((t) => ({
    trainee_id: t.trainee_id,
    trainee_name: t.trainee_name,
    supervisor_name: t.supervisor_name,
    evaluations: buildEvaluation(),
  }));

export const recentEvaluations = evaluations.slice(0, 6).map((e, i) => {
  let total = 0;
  Object.values(e.evaluations).forEach((cat) =>
    Object.values(cat).forEach((c) => (total += c.points))
  );
  return {
    supervisor_name: e.supervisor_name,
    trainee_name: e.trainee_name,
    evaluation_type: i % 2 ? "Final Evaluation" : "Midterm Evaluation",
    score: `${Math.round((total / 60) * 100)}%`,
    date: daysAgo(i * 3 + 1).toISOString(),
  };
});

// ---------- Attendance chart ----------
export const attendanceByYear = (year) => {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const lastMonth = year < now.getFullYear() ? 11 : year > now.getFullYear() ? -1 : now.getMonth();
  const scale = year === now.getFullYear() ? 1 : Math.max(0.2, 1 - (now.getFullYear() - year) * 0.3);
  // Busier months follow the typical Jan–May and Jun–Aug OJT terms.
  const base = [260, 300, 330, 310, 240, 180, 290, 320, 280, 250, 230, 120];
  const present = labels.map((_, m) => (m <= lastMonth ? Math.round(base[m] * scale + int(-20, 20)) : 0));
  const absent = labels.map((_, m) => (m <= lastMonth ? Math.round(present[m] * (0.04 + rand() * 0.06)) : 0));
  return { labels, present, absent };
};

// ---------- Demo login ----------
export const demoUser = {
  id: 1,
  username: "admin@demo.com",
  complete_name: "Demo Admin",
  email: "admin@demo.com",
  role: 0,
  status: 1,
  birthdate: "1990-01-01",
  avatar_url: null,
};
