import React from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import PageLoader from "@/components/ui/PageLoader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useTheme } from "@/hooks/useTheme";
import { Rocket, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: dashboardService.getStats,
  });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to load dashboard stats.</div>;

  const kpis = [
    { label: "Total Hackathons", value: stats?.total_hackathons ?? 0, icon: "🏆", color: "bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/30" },
    { label: "Total Students", value: stats?.total_students ?? 0, icon: "🎓", color: "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30" },
    { label: "Total Teams", value: stats?.total_teams ?? 0, icon: "👥", color: "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30" },
    { label: "Total Submissions", value: stats?.submissions.total ?? 0, icon: "🚀", color: "bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30" },
  ];

  const isEmpty = stats?.total_hackathons === 0;

  const registrationData = [
    { name: "Pending", value: stats?.registrations.pending ?? 0, color: "#eab308" },
    { name: "Approved", value: stats?.registrations.approved ?? 0, color: "#22c55e" },
    { name: "Rejected", value: stats?.registrations.rejected ?? 0, color: "#ef4444" },
  ];

  const submissionData = [
    { name: "Accepted", value: stats?.submissions.accepted ?? 0, color: "#22c55e" },
    { name: "Rejected", value: stats?.submissions.rejected ?? 0, color: "#ef4444" },
    { name: "Pending", value: (stats?.submissions.total ?? 0) - ((stats?.submissions.accepted ?? 0) + (stats?.submissions.rejected ?? 0)), color: "#3b82f6" },
  ];

  const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid ' + (isDark ? '#334155' : '#f1f5f9'),
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Live statistics and metrics for all hackathons.</p>
        </div>
        <Link
          to="/admin/analytics"
          className="inline-flex items-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-xl transition-colors"
        >
          <BarChart className="w-4 h-4 mr-2" /> View Detailed Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl shadow-soft transition-transform hover:-translate-y-1 duration-300 flex items-center space-x-5">
            <div className={`p-4 rounded-xl text-white text-2xl shadow-lg ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{kpi.label}</p>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1 truncate">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div className="mt-12 text-center p-12 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-800/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mb-6 text-primary-500">
              <Rocket className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Ready to launch your first Hackathon?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto text-sm">
              There are currently no hackathons in the system. Create one now and start accepting registrations!
            </p>
            <Link
              to="/admin/hackathons/new"
              className="inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-2xl shadow-primary-500/25 shadow-lg text-white bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-200"
            >
              Create New Hackathon
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* Registrations Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Registrations by Status</h3>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={registrationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b' }} dx={-10} />
                    <RechartsTooltip cursor={{fill: isDark ? '#334155' : '#f1f5f9'}} contentStyle={tooltipStyle} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {registrationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Submissions Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Project Submissions</h3>
             <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={submissionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {submissionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={tooltipStyle} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', color: isDark ? '#cbd5e1' : '#475569' }} />
                  </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 lg:col-span-2 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top 5 Leaderboard (All Hackathons)</h3>
            {stats?.leaderboard && stats.leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/60">
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Team</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Problem</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {stats.leaderboard.map((item: any, idx: number) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          {idx === 0 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs"><Trophy className="w-3.5 h-3.5"/></span> :
                           idx === 1 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs"><Trophy className="w-3.5 h-3.5"/></span> :
                           idx === 2 ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs"><Trophy className="w-3.5 h-3.5"/></span> :
                           <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs">{idx + 1}</span>}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">{item.team_name}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{item.problem_code}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-right font-bold text-indigo-600 dark:text-indigo-400">{Number(item.score).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Trophy className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600 dark:text-slate-400 text-sm">No evaluated submissions yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
