import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
// jsPDF has no types shipped in this workspace; ignore until types installed
// @ts-ignore
import jsPDF from 'jspdf';

// ----- data types -----
interface Stats {
  totalStudents: number;
  totalRecruiters: number;
  totalJobs: number;
  totalApplications: number;
  totalTests: number;
  totalPlacements: number;
  growthStudents?: number;
  growthRecruiters?: number;
  growthJobs?: number;
  growthApplications?: number;
  growthTests?: number;
  growthPlacements?: number;
}

interface TrendPoint {
  date: string;
  count: number;
}

interface NameCount {
  name: string;
  count: number;
}

interface SkillCount {
  skill: string;
  count: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface RecruiterStats {
  company: string;
  jobsPosted: number;
  applicationsReceived: number;
}

interface StudentStats {
  name: string;
  college: string;
  cgpa: number;
  testScore: number;
  applications: number;
  placed: boolean;
}

interface ActivityItem {
  type: string;
  description: string;
  date: string;
}

interface AnalyticsData {
  stats: Stats;
  studentGrowth: TrendPoint[];
  recruiterGrowth: TrendPoint[];
  jobsPosted: TrendPoint[];
  applicationsTrend: TrendPoint[];
  topColleges: NameCount[];
  topSkills: SkillCount[];
  jobCategories: CategoryCount[];
  testPerformance: { date: string; averageScore: number }[];
  placementSuccessRate: number;
  topRecruiters: RecruiterStats[];
  topStudents: StudentStats[];
  recentActivity: ActivityItem[];
}

// ----- reusable components -----

const AnalyticsCard: React.FC<{ title: string; value: number; growth?: number }> = ({
  title,
  value,
  growth,
}) => (
  <div className="bg-white shadow rounded p-4 flex flex-col">
    <span className="text-sm text-gray-500">{title}</span>
    <span className="text-2xl font-bold">{value}</span>
    {growth !== undefined && (
      <span
        className={`text-sm ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}
      >
        {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}%
      </span>
    )}
  </div>
);

const ChartContainer: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white shadow rounded p-4 mb-6 w-full">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <div className="h-64">{children}</div>
  </div>
);

const ActivityFeed: React.FC<{ items: ActivityItem[] }> = ({ items }) => (
  <div className="bg-white shadow rounded p-4">
    <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
    <ul className="space-y-2 text-sm text-gray-700">
      {items.map((itm, idx) => (
        <li key={idx} className="flex justify-between">
          <span>{itm.description}</span>
          <span className="text-gray-400">{new Date(itm.date).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ----- main page -----

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // filters
  const [timeRange, setTimeRange] = useState<string>('30');
  const [jobCategoryFilter, setJobCategoryFilter] = useState<string>('');
  const [collegeFilter, setCollegeFilter] = useState<string>('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('timeRange', timeRange);
      if (jobCategoryFilter) params.append('jobCategory', jobCategoryFilter);
      if (collegeFilter) params.append('college', collegeFilter);
      const resp = await api.get(`/admin/analytics?${params.toString()}`);
      setAnalytics(resp.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, jobCategoryFilter, collegeFilter]);

  const handleExportCSV = () => {
    if (!analytics) return;
    const rows: string[][] = [];
    rows.push(['Metric', 'Value']);
    const s = analytics.stats;
    rows.push(['Total Students', s.totalStudents.toString()]);
    rows.push(['Total Recruiters', s.totalRecruiters.toString()]);
    rows.push(['Total Jobs', s.totalJobs.toString()]);
    rows.push(['Total Applications', s.totalApplications.toString()]);
    rows.push(['Total Tests', s.totalTests.toString()]);
    rows.push(['Total Placements', s.totalPlacements.toString()]);
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!analytics) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Platform Analytics', 14, 22);
    doc.setFontSize(12);
    const s = analytics.stats;
    let y = 32;
    doc.text(`Total Students: ${s.totalStudents}`, 14, y);
    y += 6;
    doc.text(`Total Recruiters: ${s.totalRecruiters}`, 14, y);
    y += 6;
    doc.text(`Total Jobs: ${s.totalJobs}`, 14, y);
    y += 6;
    doc.text(`Total Applications: ${s.totalApplications}`, 14, y);
    y += 6;
    doc.text(`Total Tests: ${s.totalTests}`, 14, y);
    y += 6;
    doc.text(`Total Placements: ${s.totalPlacements}`, 14, y);
    doc.save('analytics.pdf');
  };

  const renderPieChart = (
    data: any[],
    dataKey: string,
    nameKey: string,
    colors: string[],
  ) => (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} outerRadius={80} label>
          {data.map((_, idx) => (
            <Cell key={idx} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Analytics</h1>

      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label>
          Time range:
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="ml-2 p-2 border rounded"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="180">Last 6 months</option>
            <option value="all">All time</option>
          </select>
        </label>
        <label>
          Job category:
          <input
            type="text"
            value={jobCategoryFilter}
            onChange={(e) => setJobCategoryFilter(e.target.value)}
            placeholder="e.g. Software"
            className="ml-2 p-2 border rounded"
          />
        </label>
        <label>
          College:
          <input
            type="text"
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            placeholder="e.g. IIT"
            className="ml-2 p-2 border rounded"
          />
        </label>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      {loading && <div>Loading analytics...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {analytics && (
        <>
          {/* summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <AnalyticsCard
              title="Students"
              value={analytics.stats.totalStudents}
              growth={analytics.stats.growthStudents}
            />
            <AnalyticsCard
              title="Recruiters"
              value={analytics.stats.totalRecruiters}
              growth={analytics.stats.growthRecruiters}
            />
            <AnalyticsCard
              title="Jobs"
              value={analytics.stats.totalJobs}
              growth={analytics.stats.growthJobs}
            />
            <AnalyticsCard
              title="Applications"
              value={analytics.stats.totalApplications}
              growth={analytics.stats.growthApplications}
            />
            <AnalyticsCard
              title="Tests"
              value={analytics.stats.totalTests}
              growth={analytics.stats.growthTests}
            />
            <AnalyticsCard
              title="Placements"
              value={analytics.stats.totalPlacements}
              growth={analytics.stats.growthPlacements}
            />
          </div>

          {/* charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Student Growth">
              <ResponsiveContainer>
                <LineChart data={analytics.studentGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Recruiter Growth">
              <ResponsiveContainer>
                <LineChart data={analytics.recruiterGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Jobs Posted Trend">
              <ResponsiveContainer>
                <BarChart data={analytics.jobsPosted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Applications Trend">
              <ResponsiveContainer>
                <LineChart data={analytics.applicationsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Top Colleges">
              {renderPieChart(
                analytics.topColleges,
                'count',
                'name',
                ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'],
              )}
            </ChartContainer>

            <ChartContainer title="Top Skills">
              {renderPieChart(
                analytics.topSkills,
                'count',
                'skill',
                ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
              )}
            </ChartContainer>

            <ChartContainer title="Job Categories">
              {renderPieChart(
                analytics.jobCategories,
                'count',
                'category',
                ['#d0ed57', '#a4de6c', '#8884d8', '#82ca9d'],
              )}
            </ChartContainer>

            <ChartContainer title="Test Performance">
              <ResponsiveContainer>
                <LineChart data={analytics.testPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="averageScore"
                    stroke="#ff7300"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* placement success */}
          <div className="my-6">
            <h3 className="text-lg font-semibold mb-2">Placement Success Rate</h3>
            <div className="w-full bg-white p-4 shadow rounded text-center">
              <span className="text-4xl font-bold">
                {analytics.placementSuccessRate}%
              </span>
            </div>
          </div>

          {/* top recruiters */}
          <div className="bg-white shadow rounded p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Top Recruiters</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="p-2">Company</th>
                  <th className="p-2">Jobs Posted</th>
                  <th className="p-2">Applications</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topRecruiters.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{r.company}</td>
                    <td className="p-2">{r.jobsPosted}</td>
                    <td className="p-2">{r.applicationsReceived}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* top students */}
          <div className="bg-white shadow rounded p-4 mb-6 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Top Performing Students</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">College</th>
                  <th className="p-2">CGPA</th>
                  <th className="p-2">Test Score</th>
                  <th className="p-2">Applications</th>
                  <th className="p-2">Placement</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topStudents.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.college}</td>
                    <td className="p-2">{s.cgpa}</td>
                    <td className="p-2">{s.testScore}</td>
                    <td className="p-2">{s.applications}</td>
                    <td className="p-2">
                      {s.placed ? (
                        <span className="text-green-600">Placed</span>
                      ) : (
                        <span className="text-red-600">Not placed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* recent activity */}
          <ActivityFeed items={analytics.recentActivity} />

        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
