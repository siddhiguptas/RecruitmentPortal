import { useEffect, useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Search,
  Loader2,
  AlertCircle,
  Filter,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { studentService } from "../services/studentService";
import { Job, Application } from "../types";
import { Button } from "../components/Button";

const StudentRecommendedJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "notApplied">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsData, appsData] = await Promise.all([
        studentService.getRecommendedJobs().catch(() => []),
        studentService.getMyApplications().catch(() => [])
      ]);
      setJobs(jobsData);
      setApplications(appsData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load recommended jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    try {
      await studentService.applyToJob(jobId);
      // Refresh applications
      const updatedApps = await studentService.getMyApplications();
      setApplications(updatedApps);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to apply for job");
    } finally {
      setApplyingJobId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied": return "bg-blue-50 text-blue-700 border-blue-100";
      case "shortlisted": return "bg-amber-50 text-amber-700 border-amber-100";
      case "interviewing": return "bg-purple-50 text-purple-700 border-purple-100";
      case "offered": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "rejected": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => 
      typeof app.job === 'string' ? app.job : app.job._id === jobId
    );
  };

  const filteredJobs = filter === "notApplied" 
    ? jobs.filter(job => !hasApplied(job._id))
    : jobs;

  const getMatchScoreColor = (score?: number) => {
    if (!score) return "bg-slate-100 text-slate-600";
    if (score >= 70) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading recommended jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Recommended Jobs</h1>
          <p className="mt-2 text-sm text-slate-600">
            Jobs matched to your profile and skills. Apply to positions that fit your experience.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filter:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setFilter("notApplied")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "notApplied"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Not Applied ({jobs.filter(j => !hasApplied(j._id)).length})
            </button>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="text-slate-400 w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900 text-lg">{job.title}</h3>
                        {hasApplied(job._id) && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(applications.find(a => (typeof a.job === 'string' ? a.job : a.job._id) === job._id)?.status || 'applied')}`}>
                            {applications.find(a => (typeof a.job === 'string' ? a.job : a.job._id) === job._id)?.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 font-medium">{job.company}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        {job.location && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={14} />
                            {job.location}
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <DollarSign size={14} />
                            {job.salary}
                          </div>
                        )}
                        {job.jobType && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock size={14} />
                            {job.jobType}
                          </div>
                        )}
                      </div>

                      {job.description && (
                        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skillsRequired.slice(0, 5).map((skill, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skillsRequired.length > 5 && (
                            <span className="px-2 py-1 text-slate-400 text-xs">
                              +{job.skillsRequired.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getMatchScoreColor(job.matchScore)}`}>
                      <TrendingUp size={14} />
                      {typeof job.matchScore === "number" ? `${job.matchScore}% Match` : "Match"}
                    </div>
                    
                    {hasApplied(job._id) ? (
                      <Button
                        size="sm"
                        disabled
                        className="bg-slate-100 text-slate-400 cursor-not-allowed"
                      >
                        Applied
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleApply(job._id)}
                        isLoading={applyingJobId === job._id}
                      >
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-300 w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {filter === "notApplied" ? "No jobs left to apply" : "No recommendations yet"}
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-6">
              {filter === "notApplied" 
                ? "You've applied to all available jobs. Check back later for new opportunities."
                : "Upload your resume or add skills to your profile to get personalized job recommendations."}
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/student/profile")}
              className="gap-2"
            >
              Update Profile <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRecommendedJobs;
