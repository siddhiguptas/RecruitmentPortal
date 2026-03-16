import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface ApplicationItem {
  _id: string;
  studentName: string;
  email: string;
  college?: string;
  branch?: string;
  skills?: string[];
  resumeUrl?: string;
  jobTitle: string;
  appliedDate: string;
  status: 'applied' | 'shortlisted' | 'rejected';
  jobId: string;
}

const RecruiterApplications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [jobFilter, setJobFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'shortlisted' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.get('/recruiters/applications');
      setApplications(resp.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const changeStatus = async (id: string, status: string) => {
    try {
      await api.put(`/recruiters/applications/${id}/status`, { status });
      setApplications(applications.map((a) => (a._id === id ? { ...a, status: status as any } : a)));
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const filtered = applications.filter((a) => {
    if (jobFilter && a.jobTitle !== jobFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchTerm && !a.studentName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const uniqueJobs = Array.from(new Set(applications.map((a) => a.jobTitle))).map((title) => ({ title }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Applications</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div>
          <label className="mr-2">Job:</label>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            {uniqueJobs.map((j, idx) => (
              <option key={idx} value={j.title}>{j.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by student name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {loading && <div>Loading applications...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">Student</th>
              <th className="p-2">Email</th>
              <th className="p-2">College</th>
              <th className="p-2">Branch</th>
              <th className="p-2">Skills</th>
              <th className="p-2">Resume</th>
              <th className="p-2">Job</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a._id} className="border-t hover:bg-gray-50">
                <td className="p-2">{a.studentName}</td>
                <td className="p-2">{a.email}</td>
                <td className="p-2">{a.college || '-'}</td>
                <td className="p-2">{a.branch || '-'}</td>
                <td className="p-2">{a.skills?.join(', ') || '-'}</td>
                <td className="p-2">
                  {a.resumeUrl ? (
                    <a
                      href={a.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >View</a>
                  ) : '-'}
                </td>
                <td className="p-2">{a.jobTitle}</td>
                <td className="p-2">{new Date(a.appliedDate).toLocaleDateString()}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2 space-x-2">
                  {a.resumeUrl && (
                    <button
                      onClick={() => window.open(a.resumeUrl, '_blank')}
                      className="text-blue-600 hover:underline"
                    >View Resume</button>
                  )}
                  {a.status === 'applied' && (
                    <button
                      onClick={() => changeStatus(a._id, 'shortlisted')}
                      className="text-green-600 hover:underline"
                    >Shortlist</button>
                  )}
                  {a.status !== 'rejected' && (
                    <button
                      onClick={() => changeStatus(a._id, 'rejected')}
                      className="text-red-600 hover:underline"
                    >Reject</button>
                  )}
                  <button
                    onClick={() => alert('Schedule interview for ' + a.studentName)}
                    className="text-purple-600 hover:underline"
                  >Schedule</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecruiterApplications;
