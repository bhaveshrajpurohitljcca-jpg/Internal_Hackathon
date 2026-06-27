import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import { ClipboardList, Trophy, Calendar, Bell, Rocket, Users, Medal } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["studentDashboardStats"],
    queryFn: dashboardService.getStudentStats,
  });

  if (isLoading) return <PageLoader />;
  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to load dashboard stats.</div>;

  const kpis = [
    { label: "Registered Hackathons", value: stats?.registered_hackathons ?? 0, icon: <Trophy className="w-8 h-8" />, color: "bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/30" },
    { label: "Submissions", value: stats?.submission_statuses.length ?? 0, icon: <ClipboardList className="w-8 h-8" />, color: "bg-gradient-to-br from-accent-500 to-accent-600 shadow-accent-500/30" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Student Dashboard</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Your hackathon overview and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl shadow-soft flex items-center space-x-5 transition-transform hover:-translate-y-1 duration-300">
            <div className={`p-4 rounded-xl text-white shadow-lg ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{kpi.label}</p>
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/student/teams" className="bg-white dark:bg-slate-800 border border-indigo-200/60 dark:border-indigo-700/60 p-6 rounded-2xl shadow-soft flex items-center space-x-5 transition-all hover:-translate-y-1 hover:shadow-md duration-300 group">
          <div className="p-4 rounded-xl text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 group-hover:bg-indigo-100 transition-colors">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-500 uppercase tracking-wide">Manage</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">My Team & Invites &rarr;</h3>
          </div>
        </Link>
        <div className="bg-white dark:bg-slate-800 border border-yellow-200/60 dark:border-yellow-700/60 p-6 rounded-2xl shadow-soft flex items-center space-x-5 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
          <div className="p-4 rounded-xl text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30">
            <Medal className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-yellow-500 uppercase tracking-wide">Achievements</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">0 Badges Won</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Registrations & Status */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Registrations</h3>
          </div>
          {stats?.recent_registrations && stats.recent_registrations.length > 0 ? (
            <div className="space-y-4 flex-1">
              {stats.recent_registrations.map((reg, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-sm transition-shadow">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{reg.team_name}</span>
                  <StatusBadge status={reg.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                <ClipboardList className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No active registrations.</p>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-orange-600 dark:text-orange-400">
            <Calendar className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h3>
          </div>
          {stats?.upcoming_deadlines && stats.upcoming_deadlines.length > 0 ? (
            <div className="space-y-4 flex-1">
              {stats.upcoming_deadlines.map((deadline, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-orange-200/60 dark:border-orange-500/20 bg-orange-50/50 dark:bg-orange-500/5 rounded-xl transition-colors hover:bg-orange-50 dark:hover:bg-orange-500/10">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{deadline.title}</span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap ml-4 bg-orange-100 dark:bg-orange-500/20 px-3 py-1 rounded-full">
                    {new Date(deadline.deadline).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                <Calendar className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No upcoming deadlines.</p>
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submission Status</h3>
          </div>
          {stats?.submission_statuses && stats.submission_statuses.length > 0 ? (
            <div className="space-y-4 flex-1">
              {stats.submission_statuses.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-sm transition-shadow">
                  <span className="text-sm font-mono font-medium text-slate-500 dark:text-slate-400">ID: {sub.id.slice(0, 8)}</span>
                  <StatusBadge status={sub.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                <ClipboardList className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No submissions yet.</p>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-primary-600 dark:text-primary-400">
            <Bell className="w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
          </div>
          {stats?.notifications && stats.notifications.length > 0 ? (
            <div className="space-y-4 flex-1">
              {stats.notifications.map((notif, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-primary-50/50 dark:bg-primary-900/20 rounded-xl border border-primary-100/50 dark:border-primary-800/30">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0 shadow-sm shadow-primary-500/50" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{notif.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                <Bell className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No new notifications.</p>
            </div>
          )}
        </div>

      </div>
      
      {stats?.registered_hackathons === 0 && (
        <div className="mt-8 text-center p-12 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-800/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mb-6 text-primary-500">
              <Rocket className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Ready for a challenge?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto text-sm">
              You are not participating in any active hackathons. Head over to the Hackathons page to find one and kickstart your journey!
            </p>
            <Link
              to="/student/hackathons"
              className="inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-2xl shadow-primary-500/25 shadow-lg text-white bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-200"
            >
              Explore Hackathons
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
