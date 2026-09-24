// Demo mode: serves every API call from in-browser sample data instead of the real backend.
// Enabled only when built with `npm run build:demo` (VITE_DEMO=true).
import axios from "axios";
import api from "@/api/api";
import * as db from "./data";

export const isDemo = import.meta.env.VITE_DEMO === "true";

const paginate = (items, body, defaultLimit = 10) => {
  const page = Number(body.page) || 1;
  const limit = Number(body.limit) || defaultLimit;
  const total = items.length;
  return {
    rows: items.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
};

const search = (items, body, field) => {
  const q = (body.search || "").toLowerCase().trim();
  return q ? items.filter((i) => String(i[field]).toLowerCase().includes(q)) : items;
};

const listRow = ({ reports, attendance_logs, attendance, ...row }) => row;

const readBody = (data) => {
  if (!data) return {};
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return Object.fromEntries(data.entries());
  }
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
};

const ok = (message) => ({ success: true, message });

const routes = {
  "user/login": () => ({ user: db.demoUser, token: "demo-token" }),
  "user/register": () => ({
    success: false,
    message: "Registration is turned off in the demo. Use the demo account to sign in.",
  }),
  "user/verifyEmailToken": () => ({ success: false, message: "Not available in the demo." }),

  "dashboard/getDashboardData": () => ({
    total_trainees: db.trainees.length,
    total_supervisors: db.supervisors.length,
    total_users: db.trainees.length + db.supervisors.length + db.teachers.length,
  }),
  "dashboard/getAttendanceByMonth": (b) => db.attendanceByYear(Number(b.year) || new Date().getFullYear()),
  "admin/getOjtHoursCompletionStats": () => {
    const completed = db.trainees.filter((t) => t.ojt_completion_percentage >= 100).length;
    const notStarted = db.trainees.filter((t) => t.ojt_completion_percentage === 0).length;
    return {
      success: true,
      data: { completed, not_started: notStarted, in_progress: db.trainees.length - completed - notStarted },
    };
  },
  "admin/getRecentEvaluations": () => ({ recent_evaluations: db.recentEvaluations }),

  "admin/getTraineeList": (b) => {
    const list = search(db.trainees.filter((t) => t.supervisor_id), b, "trainee_name");
    const { rows, pagination } = paginate(list, b);
    return { trainees: rows.map(listRow), pagination };
  },
  "admin/getTraineeDataById": (b) => {
    const t = db.trainees.find((x) => x.trainee_id === Number(b.trainee_id));
    return t ? { success: true, data: t } : { success: false, data: {} };
  },
  "admin/getCompletedOjtTrainees": (b) => {
    const list = search(db.trainees.filter((t) => t.ojt_completion_percentage >= 100), b, "trainee_name");
    const { rows, pagination } = paginate(list, b);
    return { data: rows.map(listRow), pagination };
  },
  "admin/generateTraineeDetails": () => ({
    success: false,
    message: "PDF export runs on the PHP server, so it's turned off in this demo.",
  }),

  "admin/getTraineeNoSupervisor": (b) => {
    const { rows, pagination } = paginate(db.trainees.filter((t) => !t.supervisor_id), b, 5);
    return { results: rows.map(listRow), pagination };
  },
  "admin/assignSupervisor": (b) => {
    const t = db.trainees.find((x) => x.trainee_id === Number(b.trainee_id));
    const s = db.supervisors.find((x) => x.supervisor_id === Number(b.supervisor_id));
    if (!t || !s) return { success: false, message: "Trainee or supervisor not found." };
    Object.assign(t, { supervisor_id: s.supervisor_id, supervisor_name: s.supervisor_name, company: s.company });
    return ok(`${t.trainee_name} is now assigned to ${s.supervisor_name}.`);
  },

  "admin/getSupervisorList": (b) => {
    const list = search(db.supervisors, b, "supervisor_name");
    if (!b.page) return { supervisors: list, pagination: { page: 1, total: list.length, totalPages: 1 } };
    const { rows, pagination } = paginate(list, b);
    return { supervisors: rows, pagination };
  },

  "admin/getReportRequest": (b) => {
    const { rows, pagination } = paginate(db.reportRequests.filter((r) => r.status === "pending"), b);
    return { data: rows, pagination };
  },
  "admin/updateReportRequestStatus": (b) => {
    const r = db.reportRequests.find((x) => x.id === Number(b.id));
    if (r) r.status = b.status;
    return ok(`Request ${b.status}.`);
  },

  "admin/getTeacherList": (b) => {
    const { rows, pagination } = paginate(db.teachers, b);
    return { teachers: rows, total: db.teachers.length, pagination };
  },
  "admin/addTeacherAccount": (b) => {
    const now = new Date().toISOString();
    db.teachers.unshift({
      teacher_id: Math.max(...db.teachers.map((t) => t.teacher_id), 499) + 1,
      teacher_name: b.teacher_name || "New Teacher",
      username: b.username || "",
      email: b.username || "",
      birthdate: "",
      status: "0",
      avatar_url: null,
      created: now,
      modified: now,
    });
    return ok("Teacher added.");
  },
  "admin/updateTeacherAccount": (b) => {
    const t = db.teachers.find((x) => x.teacher_id === Number(b.teacher_id));
    if (t) {
      if (b.teacher_name) t.teacher_name = b.teacher_name;
      if (b.username) t.username = t.email = b.username;
      t.modified = new Date().toISOString();
    }
    return ok("Teacher updated.");
  },
  "admin/deleteTeacherAccount": (b) => {
    const i = db.teachers.findIndex((x) => x.teacher_id === Number(b.teacher_id));
    if (i !== -1) db.teachers.splice(i, 1);
    return ok("Teacher deleted.");
  },
  "admin/verifyTeacherAccount": (b) => {
    const t = db.teachers.find((x) => x.teacher_id === Number(b.teacher_id));
    if (t) t.status = "1";
    return ok("Teacher verified.");
  },

  "admin/getEvaluationsTrainee": () => ({ success: true, data: db.evaluations }),
  "admin/getAllEvaluations": (b) => {
    // Same shape as the API: Midterm/Final rows with 4 criteria (max 20 points).
    const labels = ["Personality", "Punctuality", "Courtesy", "Attitude towards Work"];
    const comments = ["Hardworking and reliable.", "Shows initiative on tasks.", "Good attitude, keep improving.", "Very good at handling work papers."];
    let rows = db.evaluations.map((e, i) => {
      const points = labels.map((_, k) => Math.max(1, Math.min(5, e.evaluations[String(k % 3 + 1)][`${k % 3 + 1}${"abcd"[k]}`].points)));
      const date = new Date(Date.now() - (i * 3 + 1) * 86400000);
      return {
        id: "e" + e.trainee_id,
        trainee_name: e.trainee_name,
        supervisor_name: e.supervisor_name,
        comments: comments[i % comments.length],
        evaluation_type: i % 2 ? "Final" : "Midterm",
        evaluated_at: date.toISOString(),
        total_score: Math.round((points.reduce((a, p) => a + p, 0) / 20) * 100),
        criteria: labels.map((label, k) => ({ label, points: points[k], max: 5 })),
      };
    });
    if (b.evaluation_type) rows = rows.filter((r) => r.evaluation_type === b.evaluation_type);
    if (b.year) rows = rows.filter((r) => new Date(r.evaluated_at).getFullYear() === Number(b.year));
    return { status: "success", data: rows };
  },
};

const toRoute = (url = "") =>
  url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/?api\//, "").replace(/^\/+/, "").split("?")[0];

const demoAdapter = (config) =>
  new Promise((resolve) => {
    const route = toRoute(config.url);
    const handler = routes[route];
    const data = handler ? handler(readBody(config.data)) : { success: true, data: [] };
    if (!handler) console.info(`[demo] no mock for "${route}", returning empty data`);
    // Small delay so loading states show like they would against a real server.
    setTimeout(
      () => resolve({ data, status: 200, statusText: "OK", headers: {}, config, request: {} }),
      250
    );
  });

export function installDemo() {
  axios.defaults.adapter = demoAdapter;
  api.defaults.adapter = demoAdapter;
}

export const demoCredentials = { username: db.demoUser.username, password: "demo1234" };
