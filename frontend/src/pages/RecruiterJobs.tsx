import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { recruiterService } from '../services/recruiterService';
import { X } from 'lucide-react';

const RecruiterJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Job>>({});

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
      await recruiterService.deleteJob(id);
      setJobs(jobs.filter((j) => j._id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await recruiterService.updateJob(id, { isActive: false });
      setJobs(jobs.map((j) => (j._id === id ? { ...j, isActive: false } : j)));
    } catch (err: any) {
      alert(err.message || 'Unable to close job');
    }
  };

  const handleEdit = (j: Job) => {
    setEditingJob(j);
    setEditFormData({
      title: j.title,
      company: j.company,
      location: j.location,
      salary: j.salary,
      jobType: j.jobType,
      description: j.description,
      requirements: j.requirements,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      const updated = await recruiterService.updateJob(editingJob._id, editFormData);
      setJobs(jobs.map(j => j._id === updated._id ? { ...j, ...updated } : j));
      setEditingJob(null);
      setEditFormData({});
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const handleViewApplicants = () => {
    window.location.href = `/recruiter/applications`;
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
                    onClick={() => handleViewApplicants()}
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

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">Edit Job: {editingJob.title}</h2>
              <button
                onClick={() => setEditingJob(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Job Title</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.company || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    required
                    value={editFormData.location || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Salary</label>
                  <input
                    type="text"
                    required
                    value={editFormData.salary || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Job Type</label>
                  <select
                    value={editFormData.jobType || 'Full-time'}
                    onChange={(e) => setEditFormData({ ...editFormData, jobType: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Job Description</label>
                <textarea
                  required
                  rows={4}
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Requirements</label>
                <textarea
                  required
                  rows={3}
                  value={(editFormData.requirements || []).join('\n')}
                  onChange={(e) => setEditFormData({ ...editFormData, requirements: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-6 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;
