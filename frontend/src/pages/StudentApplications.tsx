type ApplicationStatus = "Applied" | "Shortlisted" | "Rejected";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  appliedDate: string;
}

const DUMMY_APPLICATIONS: Application[] = [
  {
    id: "1",
    jobTitle: "Frontend Engineer",
    company: "Acme Corp",
    status: "Applied",
    appliedDate: "2026-03-01",
  },
  {
    id: "2",
    jobTitle: "UX Designer",
    company: "BrightWorks",
    status: "Shortlisted",
    appliedDate: "2026-02-18",
  },
  {
    id: "3",
    jobTitle: "Backend Developer",
    company: "Nimbus Labs",
    status: "Rejected",
    appliedDate: "2026-02-08",
  },
  {
    id: "4",
    jobTitle: "Product Manager",
    company: "Streamline Solutions",
    status: "Applied",
    appliedDate: "2026-01-29",
  },
];

const statusStyles: Record<ApplicationStatus, string> = {
  Applied: "bg-emerald-100 text-emerald-800",
  Shortlisted: "bg-amber-100 text-amber-800",
  Rejected: "bg-rose-100 text-rose-800",
};

export default function StudentApplications() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">My Applications</h1>
          <p className="text-sm text-slate-500">
            Track the status of the jobs you have applied for.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Applied Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {DUMMY_APPLICATIONS.map((application) => (
                <tr key={application.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {application.jobTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {application.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[application.status]
                      }`}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(application.appliedDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 text-xs text-slate-500">
            Showing {DUMMY_APPLICATIONS.length} applications.
          </div>
        </div>
      </div>
    </div>
  );
}
