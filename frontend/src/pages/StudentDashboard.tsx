import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Upload,
  FileText,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  Loader2,
  ChevronRight,
  User,
  Calendar,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { studentService } from "../services/studentService";
import { StudentProfile } from "../types";
import { Button } from "../components/Button";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    recommendedJobs: 0,
    upcomingTests: 0,
    profileCompleteness: 0
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileData, jobsData, appsData] = await Promise.all([
        studentService.getProfile().catch(() => null),
        studentService.getRecommendedJobs().catch(() => []),
        studentService.getMyApplications().catch(() => [])
      ]);

      setProfile(profileData);
      setStats({
        totalApplications: appsData.length,
        recommendedJobs: jobsData.length,
        upcomingTests: 0, // TODO: Implement when tests are available
        profileCompleteness: calculateProfileCompleteness(profileData)
      });
    } catch (err: any) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompleteness = (profile: StudentProfile | null): number => {
    if (!profile) return 0;

    let completeness = 0;
    const fields = ['fullName', 'phone', 'college', 'branch', 'graduationYear'];
    const totalFields = fields.length + 1; // +1 for resume

    fields.forEach(field => {
      if (profile[field as keyof StudentProfile]) completeness++;
    });

    if (profile.resumePath) completeness++;

    return Math.round((completeness / totalFields) * 100);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    setError("");
    try {
      const response = await studentService.uploadResume(formData);
      setProfile(response.profile);
      setStats(prev => ({
        ...prev,
        profileCompleteness: calculateProfileCompleteness(response.profile)
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
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
          <p className="text-slate-500 mt-1">Welcome back! Here's your career overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf"
            id="resume-upload"
          />
          <Button
            onClick={() => document.getElementById('resume-upload')?.click()}
            isLoading={uploading}
            className="gap-2"
          >
            <Upload size={18} />
            {profile?.resumePath ? "Update Resume" : "Upload Resume"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Applications</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="text-blue-600 w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Recommended Jobs</p>
              <p className="text-3xl font-bold text-slate-900">{stats.recommendedJobs}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Briefcase className="text-emerald-600 w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Profile Complete</p>
              <p className="text-3xl font-bold text-slate-900">{stats.profileCompleteness}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <User className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Upcoming Tests</p>
              <p className="text-3xl font-bold text-slate-900">{stats.upcomingTests}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Calendar className="text-amber-600 w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl border border-slate-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Profile Status</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/student/profile')}
              className="gap-2"
            >
              <User size={16} />
              Complete Profile
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Resume</span>
              {profile?.resumePath ? (
                <CheckCircle2 className="text-emerald-600 w-5 h-5" />
              ) : (
                <AlertCircle className="text-amber-600 w-5 h-5" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Personal Info</span>
              {profile?.fullName && profile?.phone ? (
                <CheckCircle2 className="text-emerald-600 w-5 h-5" />
              ) : (
                <AlertCircle className="text-amber-600 w-5 h-5" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Education</span>
              {profile?.college && profile?.branch ? (
                <CheckCircle2 className="text-emerald-600 w-5 h-5" />
              ) : (
                <AlertCircle className="text-amber-600 w-5 h-5" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Skills</span>
              {profile?.skills && profile.skills.length > 0 ? (
                <CheckCircle2 className="text-emerald-600 w-5 h-5" />
              ) : (
                <AlertCircle className="text-amber-600 w-5 h-5" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl border border-slate-200"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => navigate('/student/jobs')}
            >
              <Briefcase size={18} />
              <div className="text-left">
                <div className="font-medium">Browse Jobs</div>
                <div className="text-xs text-slate-500">View recommended opportunities</div>
              </div>
              <ChevronRight size={16} className="ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => navigate('/student/applications')}
            >
              <FileText size={18} />
              <div className="text-left">
                <div className="font-medium">My Applications</div>
                <div className="text-xs text-slate-500">Track your application status</div>
              </div>
              <ChevronRight size={16} className="ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => navigate('/student/profile')}
            >
              <User size={18} />
              <div className="text-left">
                <div className="font-medium">Update Profile</div>
                <div className="text-xs text-slate-500">Keep your information current</div>
              </div>
              <ChevronRight size={16} className="ml-auto" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-2xl border border-slate-200"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {stats.totalApplications > 0 ? (
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <FileText className="text-blue-600 w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Application Submitted</p>
                <p className="text-sm text-slate-500">You have {stats.totalApplications} active applications</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/student/applications')}
              >
                View
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No recent activity</p>
              <p className="text-slate-400 text-sm">Start by uploading your resume and browsing jobs</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
