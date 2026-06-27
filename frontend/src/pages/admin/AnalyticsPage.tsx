import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import PageLoader from "@/components/ui/PageLoader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, FileText, UploadCloud, CheckCircle } from "lucide-react";

const COLORS = ["#4f46e5", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: analyticsService.getDashboardAnalytics,
  });

  if (isLoading) return <PageLoader />;

  if (!analytics) return <div>Failed to load analytics data</div>;

  const regData = Object.entries(analytics.registrations_by_hackathon || {}).map(([key, value]) => ({
    name: key,
    value,
  }));

  const subData = Object.entries(analytics.submissions_by_status || {}).map(([key, value]) => ({
    name: key,
    value,
  }));

  const deptData = Object.entries(analytics.department_participation || {}).map(([key, value]) => ({
    name: key,
    value,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Overview of platform statistics and metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 flex items-center">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Hackathons</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.total_hackathons}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 flex items-center">
          <div className="p-3 rounded-xl bg-green-50 text-green-600 mr-4">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Registrations</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.total_registrations}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 flex items-center">
          <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600 mr-4">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submissions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.total_submissions}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 flex items-center">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 mr-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Evaluations</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.total_evaluations}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Registrations by Hackathon</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Submissions by Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {subData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Department Participation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
