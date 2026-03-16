import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { recruiterService } from '../services/recruiterService';
import api from '../services/api';

const RecruiterJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recruiterService.getMyJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/recruiters/jobs/${id}`);
      setJobs(jobs.filter((j) => j._id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await api.put(`/recruiters/jobs/${id}`, { isActive: false });
      setJobs(jobs.map((j) => (j._id === id ? { ...j, isActive: false } : j)));
    } catch (err: any) {
      alert(err.message || 'Unable to close job');
    }
  };

  const handleEdit = (j: Job) => {
    // navigate to edit page or open modal
    // for now alert
    alert('Edit job: ' + j.title);
  };

  const handleViewApplicants = (j: Job) => {
    // route to applicants page
    window.location.href = `/recruiter/jobs/${j._id}/applicants`;
  };

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter === 'active' && j.isActive === false) return false;
    if (statusFilter === 'closed' && j.isActive !== false) return false;
    if (searchTerm && !j.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">My Jobs</h1>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div>
          <label className="mr-2">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {loading && <div>Loading jobs...</div>}
      {error && <div className="text-red-500">{error}</div>}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Location</th>
              <th className="p-2">Salary</th>
              <th className="p-2">Job Type</th>
              <th className="p-2">Applicants</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((j) => (
              <tr key={j._id} className="border-t hover:bg-gray-50">
                <td className="p-2">{j.title}</td>
                <td className="p-2">{j.location}</td>
                <td className="p-2">{j.salary || '-'}</td>
                <td className="p-2">{j.jobType}</td>
                <td className="p-2">{j.applicationsCount || 0}</td>
                <td className="p-2">{j.isActive === false ? 'Closed' : 'Active'}</td>
                <td className="p-2 space-x-1">
                  <button
                    onClick={() => handleEdit(j)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(j._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleViewApplicants(j)}
                    className="text-green-600 hover:underline"
                  >
                    Applicants
                  </button>
                  {j.isActive !== false && (
                    <button
                      onClick={() => handleClose(j._id)}
                      className="text-orange-600 hover:underline"
                    >
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredJobs.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecruiterJobs;
