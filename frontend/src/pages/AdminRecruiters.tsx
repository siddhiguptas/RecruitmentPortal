import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import { Recruiter, Job } from "../types";

const DetailsModal: React.FC<{
  recruiter: Recruiter;
  jobs: Job[];
  onClose: () => void;
}> = ({ recruiter, jobs, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 p-6 rounded-lg overflow-auto max-h-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Recruiter Details</h2>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Name:</span> {recruiter.name}
          </p>
          <p>
            <span className="font-semibold">Company:</span> {recruiter.company}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {recruiter.email}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {recruiter.phone || "-"}
          </p>
          <p>
            <span className="font-semibold">Website:</span>{" "}
            {recruiter.website ? (
              <a
                href={recruiter.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {recruiter.website}
              </a>
            ) : (
              "-"
            )}
          </p>
          <p>
            <span className="font-semibold">Size:</span> {recruiter.companySize || "-"}
          </p>
          <p>
            <span className="font-semibold">Industry:</span> {recruiter.industry || "-"}
          </p>
          <p>
            <span className="font-semibold">Description:</span>
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {recruiter.companyDescription || "-"}
          </p>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold">Jobs Posted</h3>
          {jobs.length === 0 ? (
            <p>No jobs posted by this recruiter.</p>
          ) : (
            <ul className="list-disc list-inside">
              {jobs.map((j) => (
                <li key={j._id}>{j.title} ({j.company})</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminRecruiters: React.FC = () => {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [filtered, setFiltered] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortNewest, setSortNewest] = useState<boolean>(true);

  const [detailRecruiter, setDetailRecruiter] = useState<Recruiter | null>(null);
  const [detailJobs, setDetailJobs] = useState<Job[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // statistics
  const totalRecruiters = filtered.length;
  const pendingCount = filtered.filter((r) => r.verificationStatus === "pending").length;
  const approvedCount = filtered.filter((r) => r.verificationStatus === "approved").length;
  const totalJobsPosted = filtered.reduce((acc, r) => acc + (r.jobsPostedCount || 0), 0);

  useEffect(() => {
    setLoading(true);
    adminService
      .getAllRecruiters()
      .then((data) => {
        setRecruiters(data);
        setFiltered(data);
      })
      .catch((e) => setError(e.message || "Failed to load recruiters"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...recruiters];
    if (statusFilter !== "all") {
      list = list.filter((r) => r.verificationStatus === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.company.toLowerCase().includes(term)
      );
    }
    if (sortNewest) {
      list.sort((a, b) => {
        const timeA = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
        const timeB = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
        return timeB - timeA;
      });
    }
    setFiltered(list);
  }, [recruiters, statusFilter, searchTerm, sortNewest]);

  const handleAction = async (action: string, id: string) => {
    try {
      if (action === "approve") {
        await adminService.approveRecruiter(id);
      } else if (action === "reject") {
        await adminService.rejectRecruiter(id);
      } else if (action === "delete") {
        await adminService.deleteRecruiter(id);
      } else if (action === "details") {
        setDetailLoading(true);
        setDetailError(null);
        try {
          const rec = recruiters.find((r) => r._id === id);
          if (rec) setDetailRecruiter(rec);
          const jobs = await adminService.getRecruiterJobs(id);
          setDetailJobs(jobs);
        } catch (e: any) {
          setDetailError(e.message || "Failed to load details");
        } finally {
          setDetailLoading(false);
        }
        return;
      }
      const updated = await adminService.getAllRecruiters();
      setRecruiters(updated);
    } catch (e: any) {
      alert(e.message || "Action failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Recruiters</h1>
      {loading && <p>Loading recruiters...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Recruiters</p>
          <p className="text-xl font-semibold">{totalRecruiters}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Pending Approvals</p>
          <p className="text-xl font-semibold">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Approved Recruiters</p>
          <p className="text-xl font-semibold">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Jobs Posted</p>
          <p className="text-xl font-semibold">{totalJobsPosted}</p>
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
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Search by name or company"
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

      {/* recruiter table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Company</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Jobs</th>
              <th className="text-left p-2">Registered</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r._id} className="border-b">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.company}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2 capitalize">{r.verificationStatus}</td>
                <td className="p-2">{r.jobsPostedCount ?? 0}</td>
                <td className="p-2">
                  {r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : "-"}
                </td>
                <td className="p-2 space-x-1">
                  {r.verificationStatus === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction("approve", r._id)}
                        className="text-green-600 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction("reject", r._id)}
                        className="text-yellow-600 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleAction("details", r._id)}
                    className="text-blue-600 text-sm"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleAction("delete", r._id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailRecruiter && (
        <DetailsModal
          recruiter={detailRecruiter}
          jobs={detailJobs}
          onClose={() => setDetailRecruiter(null)}
        />
      )}

      {detailLoading && <p>Loading details...</p>}
      {detailError && <p className="text-red-600">{detailError}</p>}
    </div>
  );
};

export default AdminRecruiters;
