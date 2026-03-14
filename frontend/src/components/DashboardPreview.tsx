import React from "react";

type StatCard = {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
};

type ApplicationRow = {
  id: string;
  jobTitle: string;
  company: string;
  status: "Applied" | "Shortlisted" | "Rejected";
  date: string;
};

type RecommendedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
};

const stats: StatCard[] = [
  {
    title: "Jobs Applied",
    value: "18",
    icon: <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">J</div>,
    accent: "bg-emerald-500/10 text-emerald-700",
  },
  {
    title: "Interviews Scheduled",
    value: "3",
    icon: <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">I</div>,
    accent: "bg-emerald-500/10 text-emerald-700",
  },
  {
    title: "Tests Completed",
    value: "7",
    icon: <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">T</div>,
    accent: "bg-emerald-500/10 text-emerald-700",
  },
  {
    title: "Recommended Jobs",
    value: "5",
    icon: <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">R</div>,
    accent: "bg-emerald-500/10 text-emerald-700",
  },
];

const applications: ApplicationRow[] = [
  {
    id: "app-1",
    jobTitle: "Frontend Engineer",
    company: "Acme Corp",
    status: "Applied",
    date: "Mar 2, 2026",
  },
  {
    id: "app-2",
    jobTitle: "UI/UX Designer",
    company: "BrightWorks",
    status: "Shortlisted",
    date: "Feb 28, 2026",
  },
  {
    id: "app-3",
    jobTitle: "Backend Developer",
    company: "Nimbus Labs",
    status: "Rejected",
    date: "Feb 18, 2026",
  },
];

const recommendedJobs: RecommendedJob[] = [
  {
    id: "job-1",
    title: "Product Designer",
    company: "FutureWave",
    location: "Remote",
  },
  {
    id: "job-2",
    title: "Full Stack Developer",
    company: "QuantumSoft",
    location: "Bengaluru, India",
  },
  {
    id: "job-3",
    title: "Data Analyst",
    company: "Insightful Co.",
    location: "Hyderabad, India",
  },
];

const statusStyles: Record<ApplicationRow["status"], string> = {
  Applied: "bg-emerald-100 text-emerald-800",
  Shortlisted: "bg-amber-100 text-amber-800",
  Rejected: "bg-rose-100 text-rose-800",
};

export default function DashboardPreview() {
  return (
    <section className="bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Dashboard Preview</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Get a glimpse of your student dashboard with the key stats, recent applications, and recommended jobs—all in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-500">Responsive</span>
            <span className="h-1 w-24 rounded-full bg-emerald-500/20" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.accent}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-900">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 mt-1">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Applications table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Latest Applications</h3>
              <p className="text-sm text-slate-500 mt-1">Track your recent applications at a glance.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Job Title</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Company</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{app.jobTitle}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.company}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[app.status]}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{app.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 text-xs text-slate-500">
              Showing the most recent 3 applications.
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Recommended Jobs</h3>
              <p className="text-sm text-slate-500 mt-1">Based on your profile and interests.</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {recommendedJobs.map((job) => (
                  <div key={job.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{job.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{job.company} · {job.location}</div>
                    </div>
                    <button className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition">
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
