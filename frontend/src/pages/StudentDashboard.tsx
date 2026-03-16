import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { studentService } from "../services/studentService";
import { Job, Application, StudentProfile } from "../types";
import { Button } from "../components/Button";
import { cn, formatDate } from "../utils";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [jobsData, appsData, profileData] = await Promise.all([
        studentService.getRecommendedJobs().catch(() => []),
        studentService.getMyApplications().catch(() => []),
        studentService.getProfile().catch(() => null)
      ]);
      setJobs(jobsData);
      setApplications(appsData);
      setProfile(profileData);
    } catch (err: any) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    setError("");
    try {
      const response = await studentService.uploadResume(formData);
      setProfile({
        ...response.profile,
        resumeUrl: response.profile.resumeUrl || response.profile.resumePath,
        resumePath: response.profile.resumePath || response.profile.resumeUrl,
      });
      // Refresh jobs as profile changed
      const updatedJobs = await studentService.getRecommendedJobs();
      setJobs(updatedJobs);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await studentService.applyToJob(jobId);
      // Refresh applications
      const updatedApps = await studentService.getMyApplications();
      setApplications(updatedApps);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to apply for job");
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your career and applications in one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
            className="gap-2"
          >
            <Upload size={18} />
            {(profile?.resumeUrl || profile?.resumePath) ? "Update Resume" : "Upload Resume"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recommended for You</h2>
            <button 
              onClick={() => navigate("/student/jobs")}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          {jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 transition-colors">
                        <Briefcase className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{job.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{job.company}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin size={14} />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <DollarSign size={14} />
                            {job.salary}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock size={14} />
                            {job.jobType}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                        <TrendingUp size={14} />
                        {typeof job.matchScore === "number" ? `${job.matchScore}% Match` : "Match"}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleApply(job._id)}
                        disabled={applications.some(app => (typeof app.job === 'string' ? app.job : app.job._id) === job._id)}
                      >
                        {applications.some(app => (typeof app.job === 'string' ? app.job : app.job._id) === job._id) ? "Applied" : "Apply Now"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300 w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No recommendations yet</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-6">Upload your resume to get personalized job recommendations based on your skills.</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Upload Resume
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar - Applications & Profile */}
        <div className="space-y-8">
          {/* Application Status */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">My Applications</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <div key={app._id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-slate-900 truncate pr-2">
                        {typeof app.job === 'string' ? 'Job Application' : app.job.title}
                      </p>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        getStatusColor(app.status)
                      )}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <p>{typeof app.job === 'string' ? '' : app.job.company}</p>
                      <p>{formatDate(app.createdAt)}</p>
                    </div>
                    
                    {/* Pipeline Visualization */}
                    <div className="mt-4 flex items-center gap-1">
                      {["applied", "shortlisted", "interviewing", "offered"].map((step, idx) => {
                        const steps = ["applied", "shortlisted", "interviewing", "offered"];
                        const currentIdx = steps.indexOf(app.status);
                        const isCompleted = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={step} className="flex-1 flex items-center gap-1">
                            <div 
                              className={cn(
                                "h-1.5 flex-1 rounded-full transition-all duration-500",
                                isCompleted ? "bg-emerald-500" : "bg-slate-100",
                                isCurrent && "animate-pulse"
                              )} 
                            />
                            {idx < 3 && <div className="w-1 h-1 rounded-full bg-slate-200" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-sm text-slate-400">No applications yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          {profile && (
            <div className="bg-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-emerald-200">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FileText size={18} />
                  Profile Strength
                </h3>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-bold">85%</span>
                  <span className="text-emerald-100 text-sm mb-1">Complete</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-300" />
                    <span>Resume Uploaded</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-300" />
                    <span>Skills Extracted</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm opacity-60">
                    <div className="w-4 h-4 rounded-full border border-white/40" />
                    <span>Complete Assessments</span>
                  </div>
                </div>
                <Button variant="secondary" className="w-full mt-6 bg-white text-emerald-600 hover:bg-emerald-50 border-none">
                  Complete Profile
                </Button>
              </div>
            </div>
          )}

          {/* Upcoming Tests */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Upcoming Tests</h3>
              <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">
                Live
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-bold text-slate-900 mb-1">Frontend Engineering Assessment</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  <span>30 Minutes</span>
                  <span>5 Questions</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => navigate("/student/test/test-1")}
                >
                  Start Test
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
