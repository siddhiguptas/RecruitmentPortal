import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import { Job, Application } from "../types";

const JobCard: React.FC<{ job: Job; onAction: (action: string, id: string) => void }> = ({
  job,
  onAction,
}) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm mb-4 bg-white">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
          <p className="text-sm text-gray-600">{job.location}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded text-xs $ {
              job.isActive ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {job.isActive ? "Approved" : "Pending"}
          </span>
          <button
            onClick={() => onAction("details", job._id)}
            className="text-blue-500 text-sm"
          >
            Details
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap text-sm text-gray-700">
        <span className="mr-4">Type: {job.jobType}</span>
        <span className="mr-4">Salary: {job.salary || "N/A"}</span>
        <span className="mr-4">Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
        <span>Apps: {job.applicationsCount ?? 0}</span>
      </div>
      <div className="mt-3 flex space-x-2">
        {!job.isActive && (
          <button
            onClick={() => onAction("approve", job._id)}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
          >
            Approve
          </button>
        )}
        {job.isActive && (
          <button
            onClick={() => onAction("reject", job._id)}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
          >
            Reject
          </button>
        )}
        <button
          onClick={() => onAction("applications", job._id)}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Applications
        </button>
        <button
          onClick={() => onAction("delete", job._id)}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const ApplicationsModal: React.FC<{
  applications: Application[];
  onClose: () => void;
}> = ({ applications, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 p-6 rounded-lg overflow-auto max-h-full">
        <h2 className="text-xl font-semibold mb-4">Applications</h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        {applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const student = typeof app.student === "object" ? app.student : ({} as any);
              return (
                <div key={app._id} className="border p-3 rounded">
                  <p className="font-semibold">{student.name || "Unknown"}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                  <p className="text-sm">College: {(student as any).college || "-"}</p>
                  <p className="text-sm">Branch: {(student as any).branch || "-"}</p>
                  <p className="text-sm">Skills: {(student as any).skills?.join(", ") || "-"}</p>
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm underline"
                  >
                    View Resume
                  </a>
                  <p className="text-sm">Status: {app.status}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortNewest, setSortNewest] = useState<boolean>(true);

  const [modalApps, setModalApps] = useState<Application[] | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // statistics
  const totalJobs = filtered.length;
  const pendingJobs = filtered.filter((j) => !j.isActive).length;
  const approvedJobs = filtered.filter((j) => j.isActive).length;
  const totalApplications = filtered.reduce((acc, j) => acc + (j.applicationsCount || 0), 0);

  useEffect(() => {
    setLoading(true);
    adminService
      .getAllJobs()
      .then((data) => {
        setJobs(data);
        setFiltered(data);
      })
      .catch((e) => setError(e.message || "Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...jobs];

    if (statusFilter !== "all") {
      const isActive = statusFilter === "approved";
      list = list.filter((j) => !!j.isActive === isActive);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.company.toLowerCase().includes(term)
      );
    }
    if (sortNewest) {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    setFiltered(list);
  }, [jobs, statusFilter, searchTerm, sortNewest]);

  const handleAction = async (action: string, jobId: string) => {
    try {
      if (action === "approve") {
        await adminService.approveJob(jobId);
      } else if (action === "reject") {
        await adminService.rejectJob(jobId);
      } else if (action === "delete") {
        await adminService.deleteJob(jobId);
      } else if (action === "applications") {
        setModalLoading(true);
        setModalError(null);
        try {
          const apps = await adminService.getJobApplications(jobId);
          setModalApps(apps);
        } catch (e: any) {
          setModalError(e.message || "Failed to load applications");
        } finally {
          setModalLoading(false);
        }
        return;
      }
      // refresh job list
      const updated = await adminService.getAllJobs();
      setJobs(updated);
    } catch (e: any) {
      alert(e.message || "Action failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Jobs</h1>
      {loading && <p>Loading jobs...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-xl font-semibold">{totalJobs}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-xl font-semibold">{pendingJobs}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Approved Jobs</p>
          <p className="text-xl font-semibold">{approvedJobs}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Applications</p>
          <p className="text-xl font-semibold">{totalApplications}</p>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
        <input
          type="text"
          placeholder="Search by title or company"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1 mb-2 md:mb-0"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={sortNewest}
            onChange={(e) => setSortNewest(e.target.checked)}
          />
          <span className="text-sm">Newest first</span>
        </label>
      </div>

      {/* job list */}
      <div>
        {filtered.map((job) => (
          <JobCard key={job._id} job={job} onAction={handleAction} />
        ))}
      </div>

      {modalApps && (
        <ApplicationsModal
          applications={modalApps}
          onClose={() => setModalApps(null)}
        />
      )}
      {modalLoading && <p>Loading applications...</p>}
      {modalError && <p className="text-red-600">{modalError}</p>}
    </div>
  );
};

export default AdminJobs;
