import React, { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import { StudentProfile, Application } from "../types";

interface AdminStudent extends StudentProfile {
  _id: string;
  email?: string;
  jobsAppliedCount?: number;
  accountStatus?: "active" | "blocked";
  registeredAt?: string;
  cgpa?: number;
}

const ResumeModal: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 p-4 rounded-lg overflow-auto max-h-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Resume Preview</h2>
        <iframe
          src={url}
          title="Resume"
          className="w-full h-96 border"
        ></iframe>
      </div>
    </div>
  );
};

const DetailsModal: React.FC<{
  student: AdminStudent;
  applications: Application[];
  onClose: () => void;
}> = ({ student, applications, onClose }) => {
  const user = student.user as any;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 p-6 rounded-lg overflow-auto max-h-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Student Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <span className="font-semibold">Name:</span> {student.fullName || user?.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {user?.email || student.email}
            </p>
            <p>
              <span className="font-semibold">Phone:</span> {student.phone || "-"}
            </p>
            <p>
              <span className="font-semibold">College:</span> {student.college || "-"}
            </p>
            <p>
              <span className="font-semibold">Branch:</span> {student.branch || "-"}
            </p>
            <p>
              <span className="font-semibold">Graduation Year:</span> {student.graduationYear || "-"}
            </p>
            <p>
              <span className="font-semibold">CGPA:</span> {student.cgpa ?? "-"}
            </p>
            <p>
              <span className="font-semibold">Skills:</span> {student.skills?.join(", ") || "-"}
            </p>
            <p>
              <span className="font-semibold">Jobs Applied:</span> {student.jobsAppliedCount || 0}
            </p>
            <p>
              <span className="font-semibold">Account Status:</span> {student.accountStatus || "-"}
            </p>
            <p>
              <span className="font-semibold">Registered:</span>{" "}
              {student.registeredAt
                ? new Date(student.registeredAt).toLocaleDateString()
                : "-"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Resume</h3>
            {student.resumeUrl ? (
              <iframe
                src={student.resumeUrl}
                title="resume-preview"
                className="w-full h-64 border"
              ></iframe>
            ) : (
              <p>No resume uploaded.</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold">Applications</h3>
          {applications.length === 0 ? (
            <p>No applications found.</p>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Job</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Applied At</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a._id} className="border-b">
                    <td className="p-2">{(a.job as any)?.title || "-"}</td>
                    <td className="p-2 capitalize">{a.status}</td>
                    <td className="p-2">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const ConfirmModal: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-1/3 p-6 rounded-lg">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [filtered, setFiltered] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");

  const [detailStudent, setDetailStudent] = useState<AdminStudent | null>(null);
  const [detailApplications, setDetailApplications] = useState<Application[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  // statistics
  const totalStudents = filtered.length;
  const activeStudents = filtered.filter((s) => s.accountStatus === "active").length;
  const blockedStudents = filtered.filter((s) => s.accountStatus === "blocked").length;
  const totalApplications = filtered.reduce(
    (acc, s) => acc + (s.jobsAppliedCount || 0),
    0
  );

  useEffect(() => {
    setLoading(true);
    adminService
      .getAllStudents()
      .then((data) => {
        setStudents(data as any);
        setFiltered(data as any);
      })
      .catch((e) => setError(e.message || "Failed to load students"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = [...students];
    if (statusFilter !== "all") {
      list = list.filter((s) => s.accountStatus === statusFilter);
    }
    if (collegeFilter.trim()) {
      const term = collegeFilter.toLowerCase();
      list = list.filter((s) => s.college?.toLowerCase().includes(term));
    }
    if (branchFilter.trim()) {
      const term = branchFilter.toLowerCase();
      list = list.filter((s) => s.branch?.toLowerCase().includes(term));
    }
    if (yearFilter.trim()) {
      list = list.filter(
        (s) => s.graduationYear?.toString() === yearFilter.trim()
      );
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          (s.fullName || "").toLowerCase().includes(term) ||
          ((s.user as any)?.email || "").toLowerCase().includes(term)
      );
    }
    if (sortOption === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.registeredAt || "").getTime() -
          new Date(a.registeredAt || "").getTime()
      );
    } else if (sortOption === "jobs") {
      list.sort(
        (a, b) => (b.jobsAppliedCount || 0) - (a.jobsAppliedCount || 0)
      );
    } else if (sortOption === "year") {
      list.sort(
        (a, b) =>
          (a.graduationYear || 0) - (b.graduationYear || 0)
      );
    }
    setFiltered(list);
  }, [
    students,
    statusFilter,
    collegeFilter,
    branchFilter,
    yearFilter,
    searchTerm,
    sortOption,
  ]);

  const handleAction = async (action: string, id: string) => {
    try {
      if (action === "details") {
        setDetailLoading(true);
        setDetailError(null);
        try {
          const stud = students.find((s) => s._id === id);
          if (stud) setDetailStudent(stud);
          const apps = await adminService.getStudentApplications(id);
          setDetailApplications(apps);
        } catch (e: any) {
          setDetailError(e.message || "Failed to load details");
        } finally {
          setDetailLoading(false);
        }
        return;
      }
      if (action === "viewResume") {
        const stud = students.find((s) => s._id === id);
        if (stud?.resumeUrl) setResumeUrl(stud.resumeUrl);
        return;
      }
      if (action === "block") {
        setConfirmMessage("Are you sure you want to block this student?");
        setPendingActionId(id);
        return;
      }
      if (action === "unblock") {
        setConfirmMessage("Are you sure you want to unblock this student?");
        setPendingActionId(id);
        return;
      }
      if (action === "delete") {
        setConfirmMessage("This will permanently delete the student account. Continue?");
        setPendingActionId(id);
        return;
      }
      // after action: refresh
      const updated = await adminService.getAllStudents();
      setStudents(updated as any);
    } catch (e: any) {
      alert(e.message || "Action failed");
    }
  };

  const performPending = async () => {
    if (!pendingActionId || !confirmMessage) return;
    try {
      // figure out what action based on message text
      if (confirmMessage.includes("block")) {
        await adminService.blockStudent(pendingActionId);
      } else if (confirmMessage.includes("unblock")) {
        await adminService.unblockStudent(pendingActionId);
      } else if (confirmMessage.includes("delete")) {
        await adminService.deleteStudent(pendingActionId);
      }
      const updated = await adminService.getAllStudents();
      setStudents(updated as any);
    } catch (e: any) {
      alert(e.message || "Action failed");
    } finally {
      setPendingActionId(null);
      setConfirmMessage(null);
    }
  };

  const cancelPending = () => {
    setPendingActionId(null);
    setConfirmMessage(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Students</h1>
      {loading && <p>Loading students...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-xl font-semibold">{totalStudents}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Active Students</p>
          <p className="text-xl font-semibold">{activeStudents}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Blocked Students</p>
          <p className="text-xl font-semibold">{blockedStudents}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Applications</p>
          <p className="text-xl font-semibold">{totalApplications}</p>
        </div>
      </div>

      {/* filters + search */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1 mb-2 md:mb-0"
        />
        <input
          type="text"
          placeholder="College"
          value={collegeFilter}
          onChange={(e) => setCollegeFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        />
        <input
          type="text"
          placeholder="Branch"
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        />
        <input
          type="text"
          placeholder="Grad year"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded mb-2 md:mb-0"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="newest">Newest registrations</option>
          <option value="jobs">Jobs applied</option>
          <option value="year">Graduation year</option>
        </select>
      </div>

      {/* student table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">College</th>
              <th className="text-left p-2">Branch</th>
              <th className="text-left p-2">Grad Year</th>
              <th className="text-left p-2">Jobs</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const user = s.user as any;
              return (
                <tr key={s._id} className="border-b">
                  <td className="p-2">{s.fullName || user?.name}</td>
                  <td className="p-2">{user?.email || s.email}</td>
                  <td className="p-2">{s.college}</td>
                  <td className="p-2">{s.branch}</td>
                  <td className="p-2">{s.graduationYear || "-"}</td>
                  <td className="p-2">{s.jobsAppliedCount || 0}</td>
                  <td className="p-2 capitalize">{s.accountStatus || "-"}</td>
                  <td className="p-2 space-x-1">
                    <button
                      onClick={() => handleAction("details", s._id)}
                      className="text-blue-600 text-sm"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleAction("viewResume", s._id)}
                      className="text-purple-600 text-sm"
                    >
                      Resume
                    </button>
                    {s.accountStatus === "active" ? (
                      <button
                        onClick={() => handleAction("block", s._id)}
                        className="text-yellow-600 text-sm"
                      >
                        Block
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction("unblock", s._id)}
                        className="text-green-600 text-sm"
                      >
                        Unblock
                      </button>
                    )}
                    <button
                      onClick={() => handleAction("delete", s._id)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {detailStudent && (
        <DetailsModal
          student={detailStudent}
          applications={detailApplications}
          onClose={() => setDetailStudent(null)}
        />
      )}

      {detailLoading && <p>Loading details...</p>}
      {detailError && <p className="text-red-600">{detailError}</p>}

      {resumeUrl && (
        <ResumeModal url={resumeUrl} onClose={() => setResumeUrl(null)} />
      )}

      {confirmMessage && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={performPending}
          onCancel={cancelPending}
        />
      )}
    </div>
  );
};

export default AdminStudents;
