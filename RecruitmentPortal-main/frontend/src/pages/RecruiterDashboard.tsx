import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Plus, 
  Briefcase, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  Filter,
  Loader2,
  Calendar,
  ChevronRight,
  Trash2,
  Edit2
} from "lucide-react";
import { recruiterService } from "../services/recruiterService";
import { socketService } from "../services/socketService";
import { Job, Application } from "../types";
import { Button } from "../components/Button";
import { JobModal } from "../components/JobModal";
import { CandidatePipeline } from "../components/CandidatePipeline";
import { cn, formatDate } from "../utils";

const RecruiterDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [view, setView] = useState<"overview" | "job-details">("overview");

  useEffect(() => {
    fetchJobs();
    
    // Connect to socket for real-time updates
    const socket = socketService.connect();
    socket?.on("new_application", (data: any) => {
      // Refresh applicants if the current view is for that job
      if (selectedJob && selectedJob._id === data.jobId) {
        fetchApplicants(data.jobId);
      }
      // Optionally show a toast or notification
      console.log("New application received:", data);
    });

    return () => {
      socketService.disconnect();
    };
  }, [selectedJob]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await recruiterService.getMyJobs().catch(() => []);
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId: string) => {
    try {
      const data = await recruiterService.getApplicants(jobId);
      setApplicants(data);
    } catch (err) {
      console.error("Failed to load applicants", err);
    }
  };

  const handlePostJob = async (jobData: any) => {
    try {
      if (editingJob) {
        // Assuming there's an updateJob API, if not we'll just post new for now or handle accordingly
        // For this demo, we'll just post new if update isn't explicitly in service
        await recruiterService.postJob(jobData);
      } else {
        await recruiterService.postJob(jobData);
      }
      fetchJobs();
    } catch (err) {
      alert("Failed to save job");
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    fetchApplicants(job._id);
    setView("job-details");
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await recruiterService.updateApplicationStatus(applicationId, newStatus);
      if (selectedJob) fetchApplicants(selectedJob._id);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleRankCandidates = async () => {
    if (!selectedJob) return;
    try {
      await recruiterService.rankCandidates(selectedJob._id);
      fetchApplicants(selectedJob._id);
    } catch (err) {
      alert("Ranking failed");
    }
  };

  if (loading && view === "overview") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-1">
            {view === "job-details" && (
              <>
                <button onClick={() => setView("overview")} className="hover:text-emerald-600 transition-colors">Dashboard</button>
                <ChevronRight size={14} />
                <span className="text-slate-900">Job Details</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {view === "overview" ? "Recruiter Dashboard" : selectedJob?.title}
          </h1>
          <p className="text-slate-500 mt-1">
            {view === "overview" 
              ? "Manage your job postings and track applicant progress." 
              : `${selectedJob?.company} • ${selectedJob?.location}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {view === "overview" ? (
            <Button onClick={() => { setEditingJob(null); setIsJobModalOpen(true); }} className="gap-2">
              <Plus size={18} />
              Post New Job
            </Button>
          ) : (
            <>
              <Button variant="outline" className="gap-2" onClick={handleRankCandidates}>
                <TrendingUp size={18} />
                AI Rank Candidates
              </Button>
              <Button className="gap-2">
                <Calendar size={18} />
                Schedule Interview
              </Button>
            </>
          )}
        </div>
      </div>

      {view === "overview" ? (
        <div className="grid gap-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Jobs", value: jobs.length, icon: <Briefcase className="text-emerald-600" />, color: "bg-emerald-50" },
              { label: "Total Applicants", value: "124", icon: <Users className="text-blue-600" />, color: "bg-blue-50" },
              { label: "Interviews", value: "12", icon: <Calendar className="text-purple-600" />, color: "bg-purple-50" },
              { label: "Hired", value: "8", icon: <CheckCircle2 className="text-amber-600" />, color: "bg-amber-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Job List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Your Job Postings</h2>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search jobs..." 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all w-64"
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 transition-colors">
                        <Briefcase className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{job.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{job.location} • {job.jobType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden md:block text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Applicants</p>
                        <div className="flex items-center gap-2 justify-end">
                          <Users size={14} className="text-slate-400" />
                          <span className="font-bold text-slate-900">24</span>
                        </div>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Posted On</p>
                        <p className="font-medium text-slate-900">{formatDate(job.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-emerald-600">
                          <Edit2 size={18} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-rose-600">
                          <Trash2 size={18} />
                        </Button>
                        <ChevronRight className="text-slate-300 group-hover:text-emerald-600 transition-colors ml-2" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {jobs.length === 0 && (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="text-slate-300 w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No jobs posted yet</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mb-6">Start by creating your first job posting to attract top talent.</p>
                  <Button onClick={() => setIsJobModalOpen(true)}>Post New Job</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Job Details View */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
                  <p className="text-slate-600 leading-relaxed">{selectedJob?.description}</p>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Requirements</h2>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob?.requirements?.map((req: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:w-80 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Total Applicants</span>
                      <span className="font-bold text-slate-900">{applicants.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Shortlisted</span>
                      <span className="font-bold text-emerald-600">{applicants.filter(a => a.status === 'shortlisted').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Average Match</span>
                      <span className="font-bold text-blue-600">78%</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">Download All Resumes</Button>
              </div>
            </div>
          </div>

          {/* Applicant Pipeline */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Application Pipeline</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
                <select className="bg-transparent border-none text-xs font-bold text-emerald-600 focus:ring-0 cursor-pointer">
                  <option>Match Score</option>
                  <option>Date Applied</option>
                  <option>Name</option>
                </select>
              </div>
            </div>
            
            <CandidatePipeline 
              applications={applicants} 
              onStatusChange={handleStatusChange}
              onViewDetails={(app) => console.log("View details for", app)}
            />
          </div>
        </div>
      )}

      <JobModal 
        isOpen={isJobModalOpen} 
        onClose={() => setIsJobModalOpen(false)} 
        onSubmit={handlePostJob}
        initialData={editingJob}
      />
    </div>
  );
};

export default RecruiterDashboard;
