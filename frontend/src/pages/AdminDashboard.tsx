import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Briefcase, 
  FileCheck, 
  TrendingUp, 
  BarChart3, 
  Search, 
  Filter, 
  MoreVertical, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ChevronRight,
  BrainCircuit,
  Zap,
  Target
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area
} from "recharts";
import { adminService } from "../services/adminService";
import { Analytics, StudentProfile, Job } from "../types";
import { Button } from "../components/Button";
import { cn, formatDate } from "../utils";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [view, setView] = useState<"overview" | "students" | "recruiters" | "analytics" | "prediction">("overview");
  const [predictionData, setPredictionData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsData, studentsData, , jobsData] = await Promise.all([
        adminService.getAnalytics().catch(() => null),
        adminService.getAllStudents().catch(() => []),
        adminService.getAllRecruiters().catch(() => []),
        adminService.getAllJobs().catch(() => [])
      ]);
      setAnalytics(analyticsData);
      setStudents(studentsData);
      setJobs(jobsData);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (studentId: string) => {
    try {
      // Mocking student data for prediction if not fully available
      const data = await adminService.predictPlacement(studentId, {
        cgpa: 8.5,
        skills: ["React", "Node.js", "Python"],
        experience: "1 year internship"
      });
      setPredictionData(data);
      setView("prediction");
    } catch (err) {
      alert("Prediction failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading admin dashboard...</p>
      </div>
    );
  }

  // Mock data for charts
  const placementTrends = [
    { month: "Jan", placements: 45 },
    { month: "Feb", placements: 52 },
    { month: "Mar", placements: 48 },
    { month: "Apr", placements: 61 },
    { month: "May", placements: 55 },
    { month: "Jun", placements: 67 },
  ];

  const skillDemand = [
    { name: "React", value: 85 },
    { name: "Node.js", value: 72 },
    { name: "Python", value: 68 },
    { name: "AWS", value: 54 },
    { name: "SQL", value: 49 },
  ];

  const topCompanies = [
    { name: "Google", jobs: 12 },
    { name: "Microsoft", jobs: 15 },
    { name: "Amazon", jobs: 10 },
    { name: "Meta", jobs: 8 },
    { name: "Apple", jobs: 6 },
  ];

  const predictionPercent = predictionData
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            typeof predictionData.placement_percent === "number"
              ? predictionData.placement_percent
              : typeof predictionData.placement_probability === "number"
              ? predictionData.placement_probability * 100
              : 0
          )
        )
      )
    : 0;

  const predictionLabel =
    predictionPercent >= 75
      ? "High Chance"
      : predictionPercent >= 50
      ? "Moderate Chance"
      : "Low Chance";

  const predictionRecommendations =
    Array.isArray(predictionData?.recommendations) && predictionData.recommendations.length > 0
      ? predictionData.recommendations
      : [
          "Focus on System Design concepts for high-scale applications.",
          "Gain hands-on experience with AWS Lambda and S3.",
          "Participate in 2+ hackathons to improve collaborative coding skills.",
        ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform-wide overview and management.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
          {[
            { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
            { id: "students", label: "Students", icon: <Users size={16} /> },
            { id: "recruiters", label: "Recruiters", icon: <Briefcase size={16} /> },
            { id: "analytics", label: "Analytics", icon: <TrendingUp size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                view === tab.id 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view === "overview" && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Students", value: analytics?.totalStudents || 0, icon: <Users className="text-blue-600" />, color: "bg-blue-50", trend: "+12%", up: true },
              { label: "Recruiters", value: analytics?.totalRecruiters || 0, icon: <Briefcase className="text-emerald-600" />, color: "bg-emerald-50", trend: "+5%", up: true },
              { label: "Jobs Posted", value: analytics?.totalJobs || 0, icon: <FileCheck className="text-purple-600" />, color: "bg-purple-50", trend: "+18%", up: true },
              { label: "Applications", value: analytics?.totalApplications || 0, icon: <Zap className="text-amber-600" />, color: "bg-amber-50", trend: "+24%", up: true },
              { label: "Placements", value: analytics?.placedStudents || 0, icon: <Target className="text-rose-600" />, color: "bg-rose-50", trend: "+8%", up: true },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                    {stat.icon}
                  </div>
                  <div className={cn(
                    "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    stat.up ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                  )}>
                    {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Placement Trends</h3>
                <select className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-lg focus:ring-0">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={placementTrends}>
                    <defs>
                      <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                    />
                    <Area type="monotone" dataKey="placements" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPlacements)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Most In-Demand Skills</h3>
                <Button variant="ghost" size="sm" className="text-emerald-600">View Full Report</Button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillDemand} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#1e293b' }} width={80} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity / Tables */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Recent Job Postings</h3>
                <Button variant="ghost" size="sm" className="text-emerald-600">View All</Button>
              </div>
              <div className="divide-y divide-slate-50">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-500">{job.company} • {job.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">12 Applicants</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{formatDate(job.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-6">Top Recruiting Companies</h3>
              <div className="space-y-6">
                {topCompanies.map((company, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {company.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{company.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${(company.jobs / 15) * 100}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{company.jobs}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-8">Full Company Rankings</Button>
            </div>
          </div>
        </div>
      )}

      {view === "students" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search students by name, skills, or branch..." 
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Filter size={18} />
                Filters
              </Button>
              <Button variant="outline">Export CSV</Button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch/CGPA</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student) => (
                  <tr key={student.user as string} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                          {(student.user as any).name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{(student.user as any).name}</p>
                          <p className="text-xs text-slate-500">{(student.user as any).email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700">Computer Science</p>
                      <p className="text-xs text-slate-500 font-bold">CGPA: 8.8</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                            {skill}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400">+{student.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        student.eligibilityStatus === "eligible" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : student.eligibilityStatus === "ineligible"
                          ? "bg-rose-50 text-rose-700 border-rose-100"
                          : "bg-slate-50 text-slate-700 border-slate-100"
                      )}>
                        {student.eligibilityStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-emerald-600 gap-2"
                          onClick={() => handlePredict(student.user as string)}
                        >
                          <BrainCircuit size={16} />
                          Predict
                        </Button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "prediction" && predictionData && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView("students")} className="text-slate-500">
              <ChevronRight size={20} className="rotate-180 mr-2" />
              Back to Students
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Prediction Gauge */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-8">Placement Probability</h3>
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={552.92}
                    strokeDashoffset={552.92 * (1 - predictionPercent / 100)}
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-slate-900">{predictionPercent}%</span>
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">{predictionLabel}</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-8 leading-relaxed">
                Based on current CGPA, skill set, and available history, this is the predicted placement probability.
              </p>
            </div>

            {/* Skill Gap Analysis */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Skill Gap Analysis</h3>
              <div className="space-y-6">
                {[
                  { skill: "Data Structures & Algorithms", score: 90, target: 95 },
                  { skill: "System Design", score: 65, target: 85 },
                  { skill: "Cloud Computing (AWS/Azure)", score: 40, target: 75 },
                  { skill: "Frontend Frameworks", score: 85, target: 90 },
                  { skill: "Backend Development", score: 75, target: 85 },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-700">{item.skill}</span>
                      <span className="text-slate-500 font-medium">{item.score}% / {item.target}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${item.score}%` }} 
                      />
                      <div 
                        className="h-full bg-emerald-200 opacity-50" 
                        style={{ width: `${item.target - item.score}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-3">
                  <AlertCircle size={18} />
                  Recommended Improvements
                </h4>
                <ul className="space-y-2">
                  {predictionRecommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
