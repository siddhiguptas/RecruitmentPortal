import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Loader2, Search, Clock } from 'lucide-react';
import { studentService } from '../services/studentService';
import { Job } from '../types';
import { Button } from '../components/Button';
import JobCard from '../components/JobCard';

const StudentRecommendedJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<string>('');

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getRecommendedJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load recommended jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJobType = !selectedJobType || job.jobType === selectedJobType;

    return matchesSearch && matchesJobType;
  });

  const jobTypes = [...new Set(jobs.map(job => job.jobType))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading recommended jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recommended Jobs</h1>
          <p className="text-slate-500 mt-1">Personalized job recommendations based on your profile.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchRecommendedJobs} variant="outline" className="gap-2">
            <Clock size={18} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, companies, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Job Types</option>
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length > 0 ? (
        <div className="grid gap-6">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <JobCard job={job} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-300 w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {jobs.length === 0 ? 'No recommendations yet' : 'No jobs match your filters'}
          </h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-6">
            {jobs.length === 0
              ? 'Upload your resume and complete your profile to get personalized job recommendations.'
              : 'Try adjusting your search criteria or filters.'
            }
          </p>
          {jobs.length === 0 ? (
            <Button onClick={() => window.location.href = '/student/profile'}>
              Complete Profile
            </Button>
          ) : (
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedJobType('');
            }} variant="outline">
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentRecommendedJobs;
